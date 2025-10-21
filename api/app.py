from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_conn
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta

load_dotenv()

app = Flask(__name__)

# Configuración de CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# JWT configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=int(os.getenv("JWT_EXPIRES_SECONDS", "86400")))
jwt = JWTManager(app)

@app.get("/api/health")
def health():
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.fetchone()
        cur.close()
        conn.close()
        return jsonify({"status": "ok", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "error", "database": str(e)}), 500


# ===================== AUTH =====================
@app.post("/api/auth/register")
def auth_register():
    data = request.get_json(force=True) or {}
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")

    if not email or not password or not name:
        return jsonify({"message": "email, password y name son requeridos"}), 400

    password_hash = generate_password_hash(password)

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (email, password_hash, name, role) VALUES (%s, %s, %s, %s)",
            (email, password_hash, name, "user"),
        )
        conn.commit()
        user_id = cur.lastrowid
    except Exception as e:
        # Email duplicado u otro error
        conn.rollback()
        return jsonify({"message": "No se pudo registrar", "error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

    token = create_access_token(identity={"id": user_id, "email": email, "name": name, "role": "user"})
    return jsonify({
        "token": token,
        "user": {"id": user_id, "email": email, "name": name, "role": "user"}
    }), 201


@app.post("/api/auth/login")
def auth_login():
    data = request.get_json(force=True) or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"message": "email y password son requeridos"}), 400

    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT id, email, name, role, password_hash FROM users WHERE email=%s", (email,))
        row = cur.fetchone()
    finally:
        cur.close()
        conn.close()

    if not row or not check_password_hash(row["password_hash"], password):
        return jsonify({"message": "Credenciales inválidas"}), 401

    identity = {"id": row["id"], "email": row["email"], "name": row["name"], "role": row["role"]}
    token = create_access_token(identity=identity)
    return jsonify({"token": token, "user": identity}), 200


@app.get("/api/auth/me")
@jwt_required()
def auth_me():
    current = get_jwt_identity()
    return jsonify(current), 200

@app.post("/api/sensor")
def create_sensor_reading():
    data = request.get_json(force=True) or {}
    device_id = data.get("device_id")
    distance = data.get("distance")
    if device_id is None or distance is None:
        return jsonify({"success": False, "message": "device_id y distance son requeridos"}), 400

    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO sensor_readings (device_id, distance) VALUES (%s, %s)",
            (device_id, distance),
        )
        conn.commit()
        new_id = cur.lastrowid
        return jsonify({"success": True, "id": new_id, "message": "Lectura guardada correctamente"}), 201
    finally:
        cur.close()
        conn.close()

@app.get("/api/led-states")
def get_led_states():
    device_id = request.args.get("device_id", "ESP32-001")
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(
            "SELECT id, led_number, state, updated_at FROM led_states WHERE device_id=%s ORDER BY led_number",
            (device_id,),
        )
        rows = cur.fetchall()
        return jsonify({"data": rows}), 200
    finally:
        cur.close()
        conn.close()

@app.post("/api/led/update")
def update_led():
    data = request.get_json(force=True) or {}
    device_id = data.get("device_id", "ESP32-001")
    led_number = data.get("led_number")
    state = data.get("state")
    if led_number is None or state is None:
        return jsonify({"success": False, "message": "led_number y state son requeridos"}), 400

    conn = get_conn()
    cur = conn.cursor()
    try:
        # Actualizar el estado del LED
        cur.execute(
            """
            INSERT INTO led_states (device_id, led_number, state)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE state=VALUES(state)
            """,
            (device_id, int(led_number), int(bool(state))),
        )
        
        # Actualizar el mensaje en la pantalla LCD
        lcd_message = f"LED {led_number} {'ON' if state else 'OFF'}"
        cur.execute(
            """
            INSERT INTO lcd_messages (device_id, line1, line2)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE line1=VALUES(line1), updated_at=NOW()
            """,
            (device_id, lcd_message, f"Control: Pulsador {led_number}" if state else "")
        )
        
        conn.commit()
        return jsonify({
            "success": True,
            "message": "LED actualizado correctamente",
            "led_number": led_number,
            "state": bool(state)
        }), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para manejar los pulsadores
@app.post("/api/button/press")
def handle_button_press():
    data = request.get_json(force=True) or {}
    device_id = data.get("device_id", "ESP32-001")
    button_number = data.get("button_number")
    
    if button_number is None:
        return jsonify({"success": False, "message": "button_number es requerido"}), 400
    
    # Mapeo de botones a LEDs (si es necesario ajustar la correspondencia)
    button_to_led = {
        1: 1,  # Botón 1 controla LED 1
        2: 2,  # Botón 2 controla LED 2
        3: 3   # Botón 3 controla LED 3
    }
    
    led_number = button_to_led.get(button_number, button_number)
    
    conn = get_conn()
    cur = conn.cursor()
    try:
        # Registrar el evento del botón
        cur.execute(
            """
            INSERT INTO button_events (device_id, button_number, event_type)
            VALUES (%s, %s, 'press')
            """,
            (device_id, int(button_number))
        )
        
        # Obtener el estado actual del LED
        cur.execute(
            "SELECT state FROM led_states WHERE device_id = %s AND led_number = %s",
            (device_id, led_number)
        )
        result = cur.fetchone()
        
        # Cambiar el estado del LED (toggle)
        new_state = not bool(result[0]) if result else True
        
        # Actualizar el estado del LED
        cur.execute(
            """
            INSERT INTO led_states (device_id, led_number, state)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE state=VALUES(state)
            """,
            (device_id, led_number, int(new_state))
        )
        
        # Actualizar la pantalla LCD
        lcd_message = f"Pulsador {button_number} - LED {led_number} {'ON' if new_state else 'OFF'}"
        cur.execute(
            """
            INSERT INTO lcd_messages (device_id, line1, line2)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE line1=VALUES(line1), line2=VALUES(line2), updated_at=NOW()
            """,
            (device_id, lcd_message, f"Estado: {'Encendido' if new_state else 'Apagado'}")
        )
        
        conn.commit()
        return jsonify({
            "success": True,
            "message": "Pulsador procesado correctamente",
            "button_number": button_number,
            "led_number": led_number,
            "led_state": new_state
        }), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

# Endpoint para obtener el estado actual de los LEDs
@app.get("/api/led/status")
def get_led_status():
    device_id = request.args.get("device_id", "ESP32-001")
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(
            "SELECT led_number, state FROM led_states WHERE device_id = %s",
            (device_id,)
        )
        leds = {str(led['led_number']): bool(led['state']) for led in cur.fetchall()}
        return jsonify({"success": True, "leds": leds}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

# ===================== LCD ENDPOINTS =====================

@app.get("/api/lcd/current")
def get_lcd_messages():
    device_id = request.args.get("device_id", "ESP32-001")
    conn = get_conn()
    cur = conn.cursor(dictionary=True)
    try:
        # Obtener mensajes del LCD
        cur.execute(
            """
            SELECT * FROM lcd_messages 
            WHERE device_id = %s 
            ORDER BY updated_at DESC 
            LIMIT 1
            """,
            (device_id,)
        )
        message = cur.fetchone()
        
        if message:
            # Si hay mensaje, devolverlo en formato de líneas
            return jsonify([{
                "line": 1,
                "message": message.get("line1", ""),
                "timestamp": message.get("updated_at")
            }, {
                "line": 2,
                "message": message.get("line2", ""),
                "timestamp": message.get("updated_at")
            }]), 200
        else:
            # Si no hay mensajes, devolver valores por defecto
            return jsonify([{
                "line": 1,
                "message": "Bienvenido",
                "timestamp": datetime.now().isoformat()
            }, {
                "line": 2,
                "message": "Sistema listo",
                "timestamp": datetime.now().isoformat()
            }]), 200
            
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    # Cambia a host="0.0.0.0" si quieres exponer en tu red local
    app.run(host="127.0.0.1", port=5000, debug=True)
