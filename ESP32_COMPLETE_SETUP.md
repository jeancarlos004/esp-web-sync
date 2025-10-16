# Configuración Completa del ESP32 - Sistema IoT

## 📡 Descripción del Sistema

Sistema IoT completo que incluye:
- ✅ Sensor ultrasónico HC-SR05 para medición de distancia
- ✅ 3 LEDs controlables desde la app web
- ✅ 3 Pulsadores que envían estado a la app web
- ✅ Display LCD 16x2 que muestra información
- ✅ Comunicación bidireccional vía WiFi
- ✅ Autenticación JWT para seguridad

## 🔌 Conexiones del Hardware

### Sensor HC-SR05 → ESP32
```
VCC  → 5V
GND  → GND
TRIG → GPIO 5
ECHO → GPIO 18
```

### LEDs → ESP32
```
LED 1 → GPIO 13 (con resistencia de 220Ω)
LED 2 → GPIO 12 (con resistencia de 220Ω)
LED 3 → GPIO 14 (con resistencia de 220Ω)
```

### Pulsadores → ESP32
```
Pulsador 1 → GPIO 25 (con pull-down de 10kΩ)
Pulsador 2 → GPIO 26 (con pull-down de 10kΩ)
Pulsador 3 → GPIO 27 (con pull-down de 10kΩ)
```

### LCD 16x2 I2C → ESP32
```
VCC → 5V
GND → GND
SDA → GPIO 21
SCL → GPIO 22
```

## 📚 Librerías Necesarias

En el Arduino IDE, instala:
1. **WiFi** (incluida)
2. **HTTPClient** (incluida)
3. **ArduinoJson** (desde el gestor de librerías)
4. **LiquidCrystal_I2C** (desde el gestor de librerías)

## 💻 Código Completo para ESP32

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>

// ===== CONFIGURACIÓN WIFI =====
const char* ssid = "TU_WIFI_SSID";          // Cambia esto
const char* password = "TU_WIFI_PASSWORD";  // Cambia esto

// ===== CONFIGURACIÓN API =====
const char* apiBase = "https://yhmmhnsigttiioquvzqi.supabase.co/functions/v1/sensor-api";
const char* deviceId = "ESP32-001";

// ===== PINES =====
// Sensor HC-SR05
const int trigPin = 5;
const int echoPin = 18;

// LEDs
const int led1Pin = 13;
const int led2Pin = 12;
const int led3Pin = 14;

// Pulsadores
const int btn1Pin = 25;
const int btn2Pin = 26;
const int btn3Pin = 27;

// ===== LCD =====
LiquidCrystal_I2C lcd(0x27, 16, 2); // Dirección I2C 0x27, 16 columnas, 2 filas

// ===== VARIABLES =====
unsigned long lastSensorRead = 0;
unsigned long lastLedCheck = 0;
const unsigned long sensorInterval = 2000;  // Leer sensor cada 2 segundos
const unsigned long ledCheckInterval = 1000; // Verificar LEDs cada 1 segundo

// Estados anteriores de los pulsadores
bool lastBtn1State = LOW;
bool lastBtn2State = LOW;
bool lastBtn3State = LOW;

void setup() {
  Serial.begin(115200);
  
  // Configurar pines del sensor
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  // Configurar pines de LEDs
  pinMode(led1Pin, OUTPUT);
  pinMode(led2Pin, OUTPUT);
  pinMode(led3Pin, OUTPUT);
  
  // Configurar pines de pulsadores
  pinMode(btn1Pin, INPUT);
  pinMode(btn2Pin, INPUT);
  pinMode(btn3Pin, INPUT);
  
  // Inicializar LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Iniciando...");
  
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
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Conectado");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());
  
  // Enviar mensaje inicial al LCD en la API
  sendLcdMessage("Sistema Listo", 1);
  sendLcdMessage("Esperando...", 2);
  
  delay(2000);
}

void loop() {
  unsigned long currentTime = millis();
  
  // Leer y enviar distancia del sensor
  if (currentTime - lastSensorRead >= sensorInterval) {
    lastSensorRead = currentTime;
    float distance = readDistance();
    
    if (distance > 0 && distance < 400) {
      sendSensorData(distance);
      
      // Actualizar LCD con la distancia
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Distancia:");
      lcd.setCursor(0, 1);
      lcd.print(distance);
      lcd.print(" cm");
    }
  }
  
  // Verificar estado de LEDs desde la API
  if (currentTime - lastLedCheck >= ledCheckInterval) {
    lastLedCheck = currentTime;
    updateLedsFromAPI();
  }
  
  // Verificar pulsadores y enviar cambios
  checkButtons();
  
  delay(50);
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
  long duration = pulseIn(echoPin, HIGH, 30000);
  
  if (duration == 0) {
    return -1;
  }
  
  // Calcular distancia en cm
  float distance = duration * 0.034 / 2;
  
  Serial.print("Distancia: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  return distance;
}

void sendSensorData(float distance) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    String url = String(apiBase) + "/sensor";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["distance"] = distance;
    doc["device_id"] = deviceId;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.println("Sensor data sent successfully");
    } else {
      Serial.print("Error sending sensor data: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  }
}

void updateLedsFromAPI() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    String url = String(apiBase) + "/led-states?device_id=" + String(deviceId);
    http.begin(url);
    
    int httpResponseCode = http.GET();
    
    if (httpResponseCode == 200) {
      String payload = http.getString();
      
      StaticJsonDocument<1024> doc;
      DeserializationError error = deserializeJson(doc, payload);
      
      if (!error) {
        JsonArray data = doc["data"];
        
        for (JsonObject led : data) {
          int ledNumber = led["led_number"];
          bool state = led["state"];
          
          // Actualizar estado del LED correspondiente
          switch (ledNumber) {
            case 1:
              digitalWrite(led1Pin, state ? HIGH : LOW);
              break;
            case 2:
              digitalWrite(led2Pin, state ? HIGH : LOW);
              break;
            case 3:
              digitalWrite(led3Pin, state ? HIGH : LOW);
              break;
          }
        }
      }
    }
    
    http.end();
  }
}

void checkButtons() {
  bool btn1State = digitalRead(btn1Pin);
  bool btn2State = digitalRead(btn2Pin);
  bool btn3State = digitalRead(btn3Pin);
  
  // Verificar cambios en pulsador 1
  if (btn1State != lastBtn1State) {
    sendButtonState(1, btn1State);
    lastBtn1State = btn1State;
    
    if (btn1State) {
      sendLcdMessage("Boton 1 ON", 2);
    }
  }
  
  // Verificar cambios en pulsador 2
  if (btn2State != lastBtn2State) {
    sendButtonState(2, btn2State);
    lastBtn2State = btn2State;
    
    if (btn2State) {
      sendLcdMessage("Boton 2 ON", 2);
    }
  }
  
  // Verificar cambios en pulsador 3
  if (btn3State != lastBtn3State) {
    sendButtonState(3, btn3State);
    lastBtn3State = btn3State;
    
    if (btn3State) {
      sendLcdMessage("Boton 3 ON", 2);
    }
  }
}

void sendButtonState(int buttonNumber, bool state) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    String url = String(apiBase) + "/button";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["button_number"] = buttonNumber;
    doc["state"] = state;
    doc["device_id"] = deviceId;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.print("Button ");
      Serial.print(buttonNumber);
      Serial.print(" state sent: ");
      Serial.println(state ? "PRESSED" : "RELEASED");
    }
    
    http.end();
  }
}

void sendLcdMessage(String message, int line) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    String url = String(apiBase) + "/lcd";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["message"] = message;
    doc["line"] = line;
    doc["device_id"] = deviceId;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    http.POST(jsonString);
    http.end();
  }
}
```

## 🚀 Pasos de Configuración

1. **Instala las librerías necesarias** en Arduino IDE
2. **Conecta el hardware** según el diagrama de conexiones
3. **Modifica el código**:
   - Cambia `TU_WIFI_SSID` por el nombre de tu red WiFi
   - Cambia `TU_WIFI_PASSWORD` por la contraseña de tu WiFi
4. **Sube el código** al ESP32
5. **Abre el Monitor Serie** (115200 baudios)
6. **Regístrate/Inicia sesión** en la app web
7. **¡Disfruta del control total!**

## 🎮 Funcionalidades

### Desde la App Web:
- ✅ Controla 3 LEDs individualmente
- ✅ Ve el estado de los 3 pulsadores en tiempo real
- ✅ Lee mensajes del LCD
- ✅ Monitorea distancia del sensor HC-SR05
- ✅ Ve historial de lecturas

### Desde el ESP32:
- ✅ Envía distancia medida cada 2 segundos
- ✅ Consulta estado de LEDs cada 1 segundo
- ✅ Envía estado de pulsadores al presionarlos
- ✅ Muestra información en el LCD
- ✅ Actualiza LEDs según comandos de la app

## 🔒 Seguridad

- Autenticación JWT requerida para acceder a la app web
- Los endpoints del ESP32 son públicos para permitir comunicación
- Protección CORS habilitada

## 🔧 Personalización

- Cambia `deviceId` para tener múltiples ESP32
- Ajusta `sensorInterval` para cambiar frecuencia de lectura
- Modifica `ledCheckInterval` para actualizar LEDs más/menos frecuente
- Personaliza mensajes del LCD según tu aplicación

## 📊 Endpoints de la API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/sensor` | POST | Enviar lectura del sensor |
| `/led-states` | GET | Obtener estado de todos los LEDs |
| `/update-led` | POST | Actualizar estado de un LED |
| `/button` | POST | Registrar presión de pulsador |
| `/lcd` | POST | Enviar mensaje al LCD |

## 🎯 Características del Sistema

✅ Comunicación bidireccional en tiempo real  
✅ Interfaz web responsive y moderna  
✅ Control de LEDs desde la web  
✅ Visualización de pulsadores  
✅ Display LCD simulado en la web  
✅ Historial de lecturas del sensor  
✅ Autenticación segura  
✅ Actualizaciones en tiempo real sin recargar
