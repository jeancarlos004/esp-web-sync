from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_conn
import os
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

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
        cur.execute(
            """
            INSERT INTO led_states (device_id, led_number, state)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE state=VALUES(state)
            """,
            (device_id, int(led_number), int(bool(state))),
        )
        conn.commit()
        return jsonify({
            "success": True,
            "message": "LED actualizado correctamente",
            "led_number": led_number,
            "state": bool(state)
        }), 200
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    # Cambia a host="0.0.0.0" si quieres exponer en tu red local
    app.run(host="127.0.0.1", port=5000, debug=True)
