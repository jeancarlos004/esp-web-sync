# Configuración del ESP32 para Sensor HC-SR04

## 📡 Información de la API

Tu aplicación web ya está lista y corriendo. Ahora necesitas configurar el ESP32 para enviar los datos.

### Endpoint de la API
```
URL: https://yhmmhnsigttiioquvzqi.supabase.co/functions/v1/sensor-api
Método: POST
Content-Type: application/json
```

### Formato de los datos
```json
{
  "distance": 25.5,
  "device_id": "ESP32-001"
}
```

## 🔧 Código para el ESP32

### Instalación de Librerías
En el Arduino IDE, instala las siguientes librerías:
- WiFi (incluida)
- HTTPClient (incluida)
- ArduinoJson (instalar desde el gestor de librerías)

### Código Completo

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===== CONFIGURACIÓN WIFI =====
const char* ssid = "TU_WIFI_SSID";          // Cambia esto
const char* password = "TU_WIFI_PASSWORD";  // Cambia esto

// ===== CONFIGURACIÓN API =====
const char* serverUrl = "https://yhmmhnsigttiioquvzqi.supabase.co/functions/v1/sensor-api";
const char* deviceId = "ESP32-001";  // Puedes cambiar esto para identificar tu dispositivo

// ===== CONFIGURACIÓN SENSOR HC-SR04 =====
const int trigPin = 5;  // Pin TRIG del sensor
const int echoPin = 18; // Pin ECHO del sensor

// Variables
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 2000; // Enviar cada 2 segundos

void setup() {
  Serial.begin(115200);
  
  // Configurar pines del sensor
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  // Conectar a WiFi
  Serial.println("\nConectando a WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n¡WiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long currentTime = millis();
  
  // Enviar datos cada 2 segundos
  if (currentTime - lastSendTime >= sendInterval) {
    lastSendTime = currentTime;
    
    // Leer distancia del sensor
    float distance = readDistance();
    
    if (distance > 0 && distance < 400) {
      // Enviar datos a la API
      sendToAPI(distance);
    } else {
      Serial.println("Lectura fuera de rango");
    }
  }
  
  delay(100);
}

float readDistance() {
  // Limpiar el trigger
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  
  // Enviar pulso de 10 microsegundos
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Leer el tiempo del eco
  long duration = pulseIn(echoPin, HIGH, 30000); // Timeout de 30ms
  
  if (duration == 0) {
    return -1; // Error en la lectura
  }
  
  // Calcular distancia en cm
  float distance = duration * 0.034 / 2;
  
  Serial.print("Distancia: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  return distance;
}

void sendToAPI(float distance) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Crear JSON
    StaticJsonDocument<200> doc;
    doc["distance"] = distance;
    doc["device_id"] = deviceId;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // Enviar POST
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Respuesta del servidor: ");
      Serial.println(response);
    } else {
      Serial.print("Error en la petición: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi desconectado");
  }
}
```

## 🔌 Conexiones del Hardware

### Sensor HC-SR04 → ESP32
```
VCC  → 5V
GND  → GND
TRIG → GPIO 5
ECHO → GPIO 18
```

⚠️ **IMPORTANTE**: El sensor HC-SR04 funciona con 5V, pero el pin ECHO devuelve 5V. Si quieres proteger tu ESP32, usa un divisor de voltaje (resistencias de 1kΩ y 2kΩ) en el pin ECHO.

## 📝 Pasos de Configuración

1. **Modifica el código**:
   - Cambia `TU_WIFI_SSID` por el nombre de tu red WiFi
   - Cambia `TU_WIFI_PASSWORD` por la contraseña de tu WiFi
   - Opcionalmente cambia `deviceId` si tienes varios dispositivos

2. **Conecta el hardware** según el diagrama de conexiones

3. **Carga el código** al ESP32 usando Arduino IDE

4. **Abre el Monitor Serie** (115200 baudios) para ver los logs

5. **Abre tu dashboard web** y verás las lecturas en tiempo real

## 🔍 Resolución de Problemas

### El ESP32 no se conecta al WiFi
- Verifica que el SSID y contraseña sean correctos
- Asegúrate de que el ESP32 esté cerca del router
- Verifica que tu red sea de 2.4GHz (el ESP32 no soporta 5GHz)

### Las lecturas no aparecen en el dashboard
- Verifica en el Monitor Serie que las peticiones HTTP sean exitosas
- Comprueba que el ESP32 tenga acceso a internet
- Revisa que la URL de la API sea correcta

### Lecturas del sensor inconsistentes
- Verifica las conexiones del sensor
- Asegúrate de que no haya objetos interfiriendo
- El sensor funciona mejor con objetos grandes y planos
- Rango efectivo: 2cm - 400cm

## 📊 Visualización

Una vez que el ESP32 esté enviando datos:
1. Abre tu navegador
2. Ve a la URL de tu aplicación
3. Verás las lecturas en tiempo real
4. El historial se guarda automáticamente

## 🎯 Características Implementadas

✅ Envío automático cada 2 segundos  
✅ Validación de lecturas (2-400 cm)  
✅ Reconexión automática de WiFi  
✅ Logs detallados en Serial  
✅ Identificación de dispositivo  
✅ Manejo de errores  
✅ Actualización en tiempo real en el dashboard

## 🚀 Mejoras Opcionales

- Ajusta `sendInterval` para cambiar la frecuencia de envío
- Modifica `deviceId` para identificar múltiples sensores
- Añade un LED para indicar el estado de conexión
- Implementa modo deep sleep para ahorrar batería
