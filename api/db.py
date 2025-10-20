import os
from mysql.connector import pooling
import mysql.connector
from dotenv import load_dotenv

# Cargar variables desde .env si existe
load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "esp_user"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "esp_web_sync"),
    "port": int(os.getenv("DB_PORT", "3306")),
}

# Pool de conexiones para eficiencia y estabilidad
pool = pooling.MySQLConnectionPool(
    pool_name="esp_pool",
    pool_size=5,
    pool_reset_session=True,
    **DB_CONFIG,
)

def get_conn():
    """Obtiene una conexión del pool."""
    return pool.get_connection()
