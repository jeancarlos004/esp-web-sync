# Código ESP32 con Teclado Matricial para API Python+MySQL

## 📋 Componentes del Circuito

### Hardware Necesario
- ESP32
- Sensor Ultrasónico HC-SR05
- 3 LEDs con resistencias 220Ω
- 3 Pulsadores con resistencias pull-down 10kΩ
- Display LCD 16x2 I2C
- Teclado Matricial 4x4
- Cables y protoboard

## 🔌 Conexiones del Hardware

### Sensor HC-SR05
```
VCC  → 5V
GND  → GND
TRIG → GPIO 5
ECHO → GPIO 18
```

### LEDs (con resistencias 220Ω)
```
LED 1 → GPIO 13
LED 2 → GPIO 12
LED 3 → GPIO 14
```

### Pulsadores (con pull-down 10kΩ)
```
Pulsador 1 → GPIO 25
Pulsador 2 → GPIO 26
Pulsador 3 → GPIO 27
```

### LCD 16x2 I2C
```
VCC → 5V
GND → GND
SDA → GPIO 21
SCL → GPIO 22
```

### Teclado Matricial 4x4
```
Fila 1 → GPIO 32
Fila 2 → GPIO 33
Fila 3 → GPIO 34
Fila 4 → GPIO 35

Columna 1 → GPIO 15
Columna 2 → GPIO 2
Columna 3 → GPIO 4
Columna 4 → GPIO 16
```

## 📚 Librerías Necesarias

Instalar en Arduino IDE:
1. **WiFi** (incluida)
2. **HTTPClient** (incluida)
3. **ArduinoJson** (buscar en Library Manager)
4. **LiquidCrystal_I2C** (buscar en Library Manager)
5. **Keypad** (buscar en Library Manager)

## 💻 Código Completo ESP32

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>
#include <Keypad.h>

// ===== CONFIGURACIÓN WIFI =====
const char* ssid = "TU_WIFI_SSID";
const char* password = "TU_WIFI_PASSWORD";

// ===== CONFIGURACIÓN API =====
// Cambiar por la URL de tu API Python
const char* apiBase = "http://localhost:5000/api";  
const char* deviceId = "ESP32-001";

// ===== PINES SENSOR HC-SR05 =====
const int trigPin = 5;
const int echoPin = 18;

// ===== PINES LEDs =====
const int led1Pin = 13;
const int led2Pin = 12;
const int led3Pin = 14;

// ===== PINES PULSADORES =====
const int btn1Pin = 25;
const int btn2Pin = 26;
const int btn3Pin = 27;

// ===== LCD =====
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ===== TECLADO MATRICIAL =====
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};
byte rowPins[ROWS] = {32, 33, 34, 35};
byte colPins[COLS] = {15, 2, 4, 16};
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// ===== VARIABLES GLOBALES =====
unsigned long lastSensorRead = 0;
unsigned long lastLedCheck = 0;
const unsigned long sensorInterval = 2000;
const unsigned long ledCheckInterval = 1000;

bool lastBtn1State = LOW;
bool lastBtn2State = LOW;
bool lastBtn3State = LOW;

bool led1State = false;
bool led2State = false;
bool led3State = false;

int menuState = 0; // 0: Menu principal, 1: LED control, 2: Sensor control, 3: BD status

void setup() {
  Serial.begin(115200);
  
  // Configurar pines
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(led1Pin, OUTPUT);
  pinMode(led2Pin, OUTPUT);
  pinMode(led3Pin, OUTPUT);
  pinMode(btn1Pin, INPUT);
  pinMode(btn2Pin, INPUT);
  pinMode(btn3Pin, INPUT);
  
  // Inicializar LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Sistema IoT");
  lcd.setCursor(0, 1);
  lcd.print("Iniciando...");
  
  // Conectar WiFi
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
  lcd.print("WiFi OK");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());
  
  delay(2000);
  showMainMenu();
}

void loop() {
  unsigned long currentTime = millis();
  
  // Leer teclado
  char key = keypad.getKey();
  if (key) {
    handleKeyPress(key);
  }
  
  // Leer sensor (solo si no estamos en un menú)
  if (menuState == 0 && currentTime - lastSensorRead >= sensorInterval) {
    lastSensorRead = currentTime;
    float distance = readDistance();
    
    if (distance > 0 && distance < 400) {
      sendSensorData(distance);
    }
  }
  
  // Verificar LEDs desde API
  if (currentTime - lastLedCheck >= ledCheckInterval) {
    lastLedCheck = currentTime;
    updateLedsFromAPI();
  }
  
  // Verificar pulsadores
  checkButtons();
  
  delay(50);
}

void handleKeyPress(char key) {
  Serial.print("Tecla presionada: ");
  Serial.println(key);
  
  if (menuState == 0) { // Menú principal
    if (key == '1') {
      menuState = 1;
      showLedMenu();
    } else if (key == '2') {
      menuState = 2;
      showSensorMenu();
    } else if (key == '3') {
      menuState = 3;
      showBDStatus();
    }
  } 
  else if (menuState == 1) { // Menú de LEDs
    if (key == '1') {
      toggleLED(1);
    } else if (key == '2') {
      toggleLED(2);
    } else if (key == '3') {
      toggleLED(3);
    } else if (key == '4') {
      showLEDStatus();
    } else if (key == '*') {
      menuState = 0;
      showMainMenu();
    }
  }
  else if (menuState == 2) { // Menú de Sensor
    if (key == '1') {
      manualReadSensor();
    } else if (key == '2') {
      showSensorStatus();
    } else if (key == '*') {
      menuState = 0;
      showMainMenu();
    }
  }
  else if (menuState == 3) { // Estado BD
    if (key == '*') {
      menuState = 0;
      showMainMenu();
    }
  }
}

void showMainMenu() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("1.LED 2.Sensor");
  lcd.setCursor(0, 1);
  lcd.print("3.Estado BD");
}

void showLedMenu() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("1-3:Toggle LED");
  lcd.setCursor(0, 1);
  lcd.print("4:Est *:Volver");
}

void showSensorMenu() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("1:Leer Sensor");
  lcd.setCursor(0, 1);
  lcd.print("2:Est *:Volver");
}

void toggleLED(int ledNum) {
  bool* state;
  int pin;
  
  switch(ledNum) {
    case 1:
      state = &led1State;
      pin = led1Pin;
      break;
    case 2:
      state = &led2State;
      pin = led2Pin;
      break;
    case 3:
      state = &led3State;
      pin = led3Pin;
      break;
    default:
      return;
  }
  
  // Toggle local
  *state = !(*state);
  digitalWrite(pin, *state ? HIGH : LOW);
  
  // Actualizar en BD
  updateLEDInAPI(ledNum, *state);
  
  // Mostrar en LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("LED ");
  lcd.print(ledNum);
  lcd.print(" ");
  lcd.print(*state ? "ON" : "OFF");
  lcd.setCursor(0, 1);
  lcd.print("Actualizado!");
  
  delay(1500);
  showLedMenu();
}

void showLEDStatus() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("L1:");
  lcd.print(led1State ? "ON " : "OFF");
  lcd.print("L2:");
  lcd.print(led2State ? "ON " : "OFF");
  lcd.setCursor(0, 1);
  lcd.print("L3:");
  lcd.print(led3State ? "ON " : "OFF");
  
  delay(3000);
  showLedMenu();
}

void manualReadSensor() {
  float distance = readDistance();
  
  if (distance > 0 && distance < 400) {
    sendSensorData(distance);
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Distancia:");
    lcd.setCursor(0, 1);
    lcd.print(distance);
    lcd.print(" cm");
    
    delay(2000);
  }
  
  showSensorMenu();
}

void showSensorStatus() {
  float distance = readDistance();
  
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Ultimo: ");
  lcd.print(distance);
  lcd.print("cm");
  lcd.setCursor(0, 1);
  lcd.print("Presione *");
  
  delay(3000);
  showSensorMenu();
}

void showBDStatus() {
  // Consultar últimos 5 registros (esto debería hacerse con una API call)
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Consultando BD");
  lcd.setCursor(0, 1);
  lcd.print("Ultimos 5 reg");
  
  // Aquí deberías implementar una llamada a la API
  // para obtener los últimos 5 registros y mostrarlos
  
  delay(3000);
  showMainMenu();
}

float readDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duration = pulseIn(echoPin, HIGH, 30000);
  
  if (duration == 0) return -1;
  
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
          
          switch (ledNumber) {
            case 1:
              led1State = state;
              digitalWrite(led1Pin, state ? HIGH : LOW);
              break;
            case 2:
              led2State = state;
              digitalWrite(led2Pin, state ? HIGH : LOW);
              break;
            case 3:
              led3State = state;
              digitalWrite(led3Pin, state ? HIGH : LOW);
              break;
          }
        }
      }
    }
    
    http.end();
  }
}

void updateLEDInAPI(int ledNumber, bool state) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    
    String url = String(apiBase) + "/led/update";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["led_number"] = ledNumber;
    doc["state"] = state;
    doc["device_id"] = deviceId;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    http.POST(jsonString);
    http.end();
  }
}

void checkButtons() {
  bool btn1State = digitalRead(btn1Pin);
  bool btn2State = digitalRead(btn2Pin);
  bool btn3State = digitalRead(btn3Pin);
  
  if (btn1State != lastBtn1State) {
    sendButtonState(1, btn1State);
    lastBtn1State = btn1State;
  }
  
  if (btn2State != lastBtn2State) {
    sendButtonState(2, btn2State);
    lastBtn2State = btn2State;
  }
  
  if (btn3State != lastBtn3State) {
    sendButtonState(3, btn3State);
    lastBtn3State = btn3State;
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
    
    http.POST(jsonString);
    http.end();
    
    Serial.print("Button ");
    Serial.print(buttonNumber);
    Serial.print(" ");
    Serial.println(state ? "PRESSED" : "RELEASED");
  }
}
```

## ⚙️ Configuración

1. **Instala las librerías** necesarias en Arduino IDE
2. **Conecta el hardware** según el diagrama
3. **Modifica el código**:
   - Cambia `TU_WIFI_SSID` y `TU_WIFI_PASSWORD`
   - Cambia `apiBase` por la URL de tu API Python (ej: `http://192.168.1.100:5000/api`)
4. **Sube el código** al ESP32
5. **Prueba el sistema**:
   - Presiona '1' en el teclado para entrar al menú de LEDs
   - Presiona '2' para el menú del sensor
   - Presiona '3' para ver estado de BD
   - Presiona '*' para volver al menú principal

## 📱 Funcionalidad del Teclado Matricial

### Menú Principal
- **1** → Control de LEDs
- **2** → Control de Sensor
- **3** → Estado de Base de Datos

### Submenú LEDs (Opción 1)
- **1** → Toggle LED 1
- **2** → Toggle LED 2
- **3** → Toggle LED 3
- **4** → Ver estado de todos los LEDs
- **\*** → Volver al menú principal

### Submenú Sensor (Opción 2)
- **1** → Lectura manual del sensor
- **2** → Ver última lectura
- **\*** → Volver al menú principal

### Estado BD (Opción 3)
- Muestra los últimos 5 registros
- **\*** → Volver al menú principal

## 🔄 Funcionamiento

1. El ESP32 se conecta a WiFi al iniciar
2. Muestra menú principal en LCD
3. Lee el teclado matricial constantemente
4. Según la tecla presionada, ejecuta acciones
5. Envía/recibe datos de la API Python
6. Actualiza LEDs y LCD según respuestas
7. Los pulsadores físicos también envían estados a la API

## 🎯 Notas Importantes

- La dirección I2C del LCD puede variar (0x27 o 0x3F), prueba ambas
- Asegúrate de que tu API Python esté corriendo antes de probar
- La URL de la API debe ser accesible desde el ESP32 (misma red)
- Verifica las conexiones del teclado matricial, son muchos cables
- El menú de BD debe implementarse según los endpoints de tu API
