# Especificación Completa de la API Python+MySQL

## 📋 Requisitos del Sistema

### Tecnologías Requeridas
- Python 3.8+
- Flask / FastAPI
- MySQL 8.0+
- XAMPP (para MySQL)

### Librerías Python Necesarias
```bash
pip install flask flask-cors flask-jwt-extended mysql-connector-python reportlab openpyxl
```

## 🗄️ Estructura de Base de Datos

### 3 Tablas Relacionadas (Mínimo)

```sql
-- Tabla 1: users (usuarios del sistema)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla 2: sensor_readings (lecturas del sensor)
CREATE TABLE sensor_readings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id VARCHAR(50) NOT NULL,
    distance DECIMAL(10, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_device_timestamp (device_id, timestamp),
    INDEX idx_timestamp (timestamp)
);

-- Tabla 3: led_states (estados de LEDs)
CREATE TABLE led_states (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id VARCHAR(50) NOT NULL,
    led_number INT NOT NULL CHECK (led_number BETWEEN 1 AND 3),
    state BOOLEAN NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_device_led (device_id, led_number)
);

-- Tabla 4: button_states (estados de pulsadores)
CREATE TABLE button_states (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id VARCHAR(50) NOT NULL,
    button_number INT NOT NULL CHECK (button_number BETWEEN 1 AND 3),
    state BOOLEAN NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_device_timestamp (device_id, timestamp)
);

-- Tabla 5: lcd_messages (mensajes del LCD)
CREATE TABLE lcd_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    device_id VARCHAR(50) NOT NULL,
    message VARCHAR(255) NOT NULL,
    line INT NOT NULL CHECK (line BETWEEN 1 AND 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_device_timestamp (device_id, timestamp)
);
```

## 🔌 Endpoints de la API

### 1. Autenticación

#### POST /api/auth/register
Registro de nuevos usuarios

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password123",
    "name": "Juan Pérez"
}
```

**Response:**
```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "Juan Pérez",
        "role": "user"
    }
}
```

#### POST /api/auth/login
Inicio de sesión

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "Juan Pérez",
        "role": "user"
    }
}
```

#### GET /api/auth/me
Obtener usuario actual (requiere JWT en header)

**Headers:**
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response:**
```json
{
    "id": 1,
    "email": "user@example.com",
    "name": "Juan Pérez",
    "role": "user"
}
```

### 2. Sensores

#### POST /api/sensor
Guardar lectura del sensor (público para ESP32)

**Request Body:**
```json
{
    "distance": 25.5,
    "device_id": "ESP32-001"
}
```

**Response:**
```json
{
    "success": true,
    "id": 123,
    "message": "Lectura guardada correctamente"
}
```

#### GET /api/sensor/history
Obtener historial de lecturas (requiere JWT)

**Query Parameters:**
- `limit` (opcional): número de registros (default: 50)
- `start_date` (opcional): fecha inicio (YYYY-MM-DD)
- `end_date` (opcional): fecha fin (YYYY-MM-DD)
- `device_id` (opcional): filtrar por dispositivo

**Response:**
```json
[
    {
        "id": 123,
        "device_id": "ESP32-001",
        "distance": 25.5,
        "timestamp": "2025-10-20T10:30:00"
    },
    {
        "id": 122,
        "device_id": "ESP32-001",
        "distance": 30.2,
        "timestamp": "2025-10-20T10:28:00"
    }
]
```

### 3. LEDs

#### GET /api/led-states
Obtener estados de LEDs (público para ESP32)

**Query Parameters:**
- `device_id`: identificador del dispositivo

**Response:**
```json
{
    "data": [
        {
            "id": 1,
            "led_number": 1,
            "state": true,
            "updated_at": "2025-10-20T10:30:00"
        },
        {
            "id": 2,
            "led_number": 2,
            "state": false,
            "updated_at": "2025-10-20T10:30:00"
        },
        {
            "id": 3,
            "led_number": 3,
            "state": false,
            "updated_at": "2025-10-20T10:30:00"
        }
    ]
}
```

#### POST /api/led/update
Actualizar estado de LED (requiere JWT)

**Request Body:**
```json
{
    "led_number": 1,
    "state": true,
    "device_id": "ESP32-001"
}
```

**Response:**
```json
{
    "success": true,
    "message": "LED actualizado correctamente",
    "led_number": 1,
    "state": true
}
```

#### GET /api/led/history
Historial de cambios de LEDs (requiere JWT)

**Query Parameters:**
- `limit` (opcional): número de registros (default: 5)
- `device_id` (opcional): filtrar por dispositivo

**Response:**
```json
[
    {
        "id": 45,
        "led_number": 1,
        "state": true,
        "updated_at": "2025-10-20T10:30:00"
    }
]
```

### 4. Pulsadores

#### POST /api/button
Registrar presión de pulsador (público para ESP32)

**Request Body:**
```json
{
    "button_number": 1,
    "state": true,
    "device_id": "ESP32-001"
}
```

**Response:**
```json
{
    "success": true,
    "id": 78,
    "message": "Estado de botón registrado"
}
```

#### GET /api/button/history
Historial de pulsadores (requiere JWT)

**Query Parameters:**
- `limit` (opcional): número de registros
- `device_id` (opcional): filtrar por dispositivo

**Response:**
```json
[
    {
        "id": 78,
        "button_number": 1,
        "state": true,
        "timestamp": "2025-10-20T10:30:00",
        "device_id": "ESP32-001"
    }
]
```

### 5. LCD

#### POST /api/lcd
Enviar mensaje al LCD (público para ESP32 y requiere JWT para web)

**Request Body:**
```json
{
    "message": "Hola Mundo",
    "line": 1,
    "device_id": "ESP32-001"
}
```

**Response:**
```json
{
    "success": true,
    "id": 56,
    "message": "Mensaje LCD guardado"
}
```

#### GET /api/lcd/current
Obtener mensajes actuales del LCD (requiere JWT)

**Query Parameters:**
- `device_id`: identificador del dispositivo

**Response:**
```json
[
    {
        "message": "Sistema Activo",
        "line": 1,
        "timestamp": "2025-10-20T10:30:00"
    },
    {
        "message": "Distancia: 25cm",
        "line": 2,
        "timestamp": "2025-10-20T10:30:00"
    }
]
```

### 6. Usuarios

#### POST /api/user/login-notification
Notificar login para mostrar en LCD (requiere JWT)

**Request Body:**
```json
{
    "username": "Juan Pérez"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Notificación enviada"
}
```

### 7. Reportes

#### GET /api/reports/sensor
Datos para reporte (requiere JWT)

**Query Parameters:**
- `start_date`: fecha inicio (YYYY-MM-DD)
- `end_date`: fecha fin (YYYY-MM-DD)
- `device_id` (opcional): filtrar por dispositivo

**Response:**
```json
{
    "sensor_readings": [...],
    "led_history": [...],
    "button_history": [...],
    "stats": {
        "total_readings": 150,
        "average_distance": 28.5,
        "min_distance": 5.2,
        "max_distance": 380.0
    }
}
```

#### GET /api/reports/export/pdf
Exportar reporte en PDF (requiere JWT)

**Query Parameters:**
- `start_date`: fecha inicio
- `end_date`: fecha fin
- `device_id` (opcional): filtrar por dispositivo

**Response:**
Archivo PDF descargable

#### GET /api/reports/export/excel
Exportar reporte en Excel (requiere JWT)

**Query Parameters:**
- `start_date`: fecha inicio
- `end_date`: fecha fin
- `device_id` (opcional): filtrar por dispositivo

**Response:**
Archivo Excel (.xlsx) descargable

### 8. Dashboard

#### GET /api/dashboard/stats
Estadísticas generales (requiere JWT)

**Query Parameters:**
- `device_id` (opcional): filtrar por dispositivo

**Response:**
```json
{
    "totalReadings": 150,
    "averageDistance": 28.5,
    "minDistance": 5.2,
    "maxDistance": 380.0,
    "ledOnCount": 45,
    "ledOffCount": 105,
    "buttonPresses": 78,
    "lastUpdate": "2025-10-20T10:30:00"
}
```

### 9. Health Check

#### GET /api/health
Verificar estado de la API (público)

**Response:**
```json
{
    "status": "ok",
    "database": "connected",
    "timestamp": "2025-10-20T10:30:00"
}
```

## 🔐 Configuración CORS

La API debe permitir peticiones desde:
- Frontend web
- ESP32

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["*"],  # En producción, especificar orígenes exactos
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

## 🔑 Configuración JWT

```python
from flask_jwt_extended import JWTManager

app.config['JWT_SECRET_KEY'] = 'tu-clave-secreta-super-segura'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)
```

## 🚀 Ejecución de la API

```bash
# Iniciar XAMPP y activar MySQL
# Crear base de datos
# Ejecutar scripts SQL para crear tablas

# Ejecutar API
python app.py
```

La API debe estar disponible en:
- Local: `http://localhost:5000/api`
- Red local: `http://192.168.x.x:5000/api`

## 📊 Notas de Implementación

1. **Hash de contraseñas**: Usar `werkzeug.security` para hash seguro
2. **Validación de datos**: Validar todos los inputs antes de guardar en BD
3. **Manejo de errores**: Retornar códigos HTTP apropiados
4. **Logs**: Implementar logging para debugging
5. **Transacciones**: Usar transacciones para operaciones críticas
6. **Índices**: Ya incluidos en las tablas para mejor performance

## ✅ Checklist de Desarrollo

- [ ] Configurar MySQL en XAMPP
- [ ] Crear base de datos y tablas
- [ ] Implementar endpoints de autenticación
- [ ] Implementar endpoints de sensores
- [ ] Implementar endpoints de LEDs
- [ ] Implementar endpoints de pulsadores
- [ ] Implementar endpoints de LCD
- [ ] Implementar endpoints de reportes
- [ ] Implementar endpoints de dashboard
- [ ] Configurar CORS
- [ ] Configurar JWT
- [ ] Probar todos los endpoints
- [ ] Documentar API
- [ ] Conectar ESP32
- [ ] Conectar Frontend
