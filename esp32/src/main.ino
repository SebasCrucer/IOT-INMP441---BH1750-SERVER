#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <driver/i2s.h>
#include <SD.h>
#include <SPI.h>
#include <ArduinoJson.h>
#include <SimpleKalmanFilter.h>

// ============================================
// CONFIGURACIÓN - CAMBIAR SEGÚN NECESARIO
// ============================================
const char* ssid = "AP-ESP32";
const char* password = "12345678";
const char* serverURL = "https://wcwk44kgw80kw80cskkckokk.crucerlabs.com/api/sensors";

// ============================================
// CONFIGURACIÓN DE PINES
// ============================================
// BH1750 (I2C)
#define BH1750_SDA 21
#define BH1750_SCL 22
#define BH1750_ADDRESS 0x23

// INMP441 (I2S)
#define I2S_WS 15
#define I2S_SCK 14
#define I2S_SD 32

// Micro SD (SPI)
#define SD_CS 5
#define SD_MOSI 23
#define SD_MISO 19
#define SD_SCK 18

// ============================================
// PARÁMETROS DE CONFIGURACIÓN
// ============================================
#define INMP441_SAMPLE_COUNT 512  // Número de muestras por lectura
#define READING_INTERVAL 500     // Intervalo entre lecturas (ms)
#define I2S_SAMPLE_RATE 16000     // Frecuencia de muestreo I2S (Hz)

// Parámetros de calidad de datos
#define INMP441_MEDIAN_WINDOW 5      // Tamaño de ventana para filtro de mediana

// ============================================
// VARIABLES GLOBALES
// ============================================
const i2s_port_t I2S_PORT = I2S_NUM_0;
File sdFile;
unsigned long lastReadingTime = 0;

// Variables para calidad de datos BH1750
SimpleKalmanFilter bh1750KalmanFilter(2.0, 2.0, 0.05); // (error_measure, error_estimate, q)

// ============================================
// FUNCIONES DE INICIALIZACIÓN
// ============================================

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n=== Inicializando Sistema IoT ESP32 ===");
  
  // Inicializar WiFi
  initWiFi();
  
  // Inicializar SD Card
  initSD();
  
  // Inicializar BH1750
  initBH1750();
  
  // Inicializar INMP441
  initINMP441();
  
  Serial.println("=== Sistema inicializado correctamente ===\n");
}

void initWiFi() {
  Serial.print("Conectando a WiFi: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nERROR: No se pudo conectar a WiFi");
    Serial.println("El sistema continuará pero no podrá enviar datos al servidor");
  }
}

void initSD() {
  Serial.print("Inicializando tarjeta SD... ");
  
  // Inicializar SPI con los pines personalizados
  SPI.begin(SD_SCK, SD_MISO, SD_MOSI, SD_CS);
  
  // Pasar el objeto SPI para que use la configuración personalizada
  if (!SD.begin(SD_CS, SPI)) {
    Serial.println("ERROR: Fallo al inicializar tarjeta SD");
    Serial.println("Verifica que la tarjeta esté insertada correctamente");
    return;
  }
  
  Serial.println("OK");
  
  // Crear directorio de datos si no existe
  if (!SD.exists("/data")) {
    SD.mkdir("/data");
    Serial.println("Directorio /data creado");
  }
}

void initBH1750() {
  Serial.print("Inicializando sensor BH1750... ");
  
  Wire.begin(BH1750_SDA, BH1750_SCL);
  Wire.beginTransmission(BH1750_ADDRESS);
  
  // Modo de medición continua de alta resolución (1 lux)
  byte error = Wire.endTransmission();
  
  if (error == 0) {
    // Enviar comando de inicio de medición
    Wire.beginTransmission(BH1750_ADDRESS);
    Wire.write(0x10); // Modo continuo, resolución alta
    Wire.endTransmission();
    delay(120); // Tiempo de medición inicial
    
    Serial.println("OK");
  } else {
    Serial.print("ERROR: No se pudo comunicar con BH1750 (código: ");
    Serial.print(error);
    Serial.println(")");
  }
}

void initINMP441() {
  Serial.print("Inicializando sensor INMP441... ");
  
  i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = I2S_SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 8,
    .dma_buf_len = 64,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };
  
  i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_SD
  };
  
  esp_err_t err = i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
  if (err != ESP_OK) {
    Serial.print("ERROR: Fallo al instalar driver I2S (código: ");
    Serial.print(err);
    Serial.println(")");
    return;
  }
  
  err = i2s_set_pin(I2S_PORT, &pin_config);
  if (err != ESP_OK) {
    Serial.print("ERROR: Fallo al configurar pines I2S (código: ");
    Serial.print(err);
    Serial.println(")");
    return;
  }
  
  Serial.println("OK");
}

// ============================================
// FUNCIONES DE LECTURA DE SENSORES
// ============================================

float readBH1750() {
  Wire.beginTransmission(BH1750_ADDRESS);
  Wire.write(0x10); // Modo continuo, resolución alta
  Wire.endTransmission();
  delay(120); // Tiempo de medición
  
  Wire.beginTransmission(BH1750_ADDRESS);
  Wire.endTransmission();
  Wire.requestFrom(BH1750_ADDRESS, 2);
  
  if (Wire.available() >= 2) {
    uint16_t rawValue = (Wire.read() << 8) | Wire.read();
    float lux = rawValue / 1.2; // Conversión a lux
    return lux;
  }
  
  return -1.0; // Error en la lectura
}

bool readINMP441(int16_t* samples, int count) {
  size_t bytes_read;
  int32_t* buffer = new int32_t[count];
  
  // Leer muestras desde I2S
  esp_err_t err = i2s_read(I2S_PORT, buffer, count * sizeof(int32_t), &bytes_read, portMAX_DELAY);
  
  if (err != ESP_OK || bytes_read != count * sizeof(int32_t)) {
    delete[] buffer;
    return false; // Error al leer
  }
  
  // Convertir a valores absolutos (amplitud)
  for (int i = 0; i < count; i++) {
    // INMP441 envía datos en formato I2S, los 18 bits superiores contienen el dato
    samples[i] = abs((int16_t)(buffer[i] >> 16));
  }
  
  delete[] buffer;
  return true;
}

// ============================================
// FUNCIONES DE ALMACENAMIENTO
// ============================================

String generateFilename(const char* sensorType) {
  // Formato: /data/SENSOR_YYYYMMDD_HHMMSS.json
  unsigned long timestamp = millis();
  char filename[50];
  snprintf(filename, sizeof(filename), "/data/%s_%lu.json", sensorType, timestamp);
  return String(filename);
}

bool saveToSD(const char* sensorType, JsonDocument& doc) {
  String filename = generateFilename(sensorType);
  
  sdFile = SD.open(filename, FILE_WRITE);
  if (!sdFile) {
    Serial.print("ERROR: No se pudo abrir archivo para escritura: ");
    Serial.println(filename);
    return false;
  }
  
  serializeJson(doc, sdFile);
  sdFile.close();
  
  Serial.print("Datos guardados en SD: ");
  Serial.println(filename);
  return true;
}

// ============================================
// FUNCIONES DE COMUNICACIÓN
// ============================================

String sendToServer(const char* endpoint, JsonDocument& doc) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi no conectado, no se puede enviar al servidor");
    return "";
  }
  
  HTTPClient http;
  String url = String(serverURL) + endpoint;
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.print("Enviando a ");
  Serial.print(url);
  Serial.print(": ");
  Serial.println(jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("Respuesta del servidor: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode == 201) {
      String response = http.getString();
      Serial.print("Respuesta: ");
      Serial.println(response);
      http.end();
      return response; // Devolver la respuesta JSON del servidor
    }
  } else {
    Serial.print("ERROR al enviar: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
  return ""; // Devolver string vacío si falla
}

// ============================================
// TÉCNICAS DE CALIDAD DE DATOS - BH1750
// ============================================

/**
 * Filtro de Kalman para BH1750
 * Filtro adaptativo que predice y suaviza valores basándose en el modelo del sensor
 * @param rawValue Valor crudo leído del sensor
 * @return Valor filtrado (Kalman)
 */
float filterBH1750Kalman(float rawValue) {
  return bh1750KalmanFilter.updateEstimate(rawValue);
}


// ============================================
// TÉCNICAS DE CALIDAD DE DATOS - INMP441
// ============================================

/**
 * Función auxiliar para ordenar array y obtener mediana
 * @param arr Array a ordenar
 * @param n Tamaño del array
 */
void sortArray(int16_t* arr, int n) {
  for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        int16_t temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
}

/**
 * Filtro de Mediana para INMP441
 * Aplica filtro de mediana a cada muestra usando una ventana deslizante
 * Elimina picos de ruido sin distorsionar la señal de audio
 * @param samples Array de muestras a filtrar
 * @param count Número de muestras
 */
void filterINMP441Median(int16_t* samples, int count) {
  int16_t window[INMP441_MEDIAN_WINDOW];
  int halfWindow = INMP441_MEDIAN_WINDOW / 2;
  
  // Crear copia del array original para no modificar durante el procesamiento
  int16_t* filtered = new int16_t[count];
  
  for (int i = 0; i < count; i++) {
    // Recopilar ventana de muestras
    int windowSize = 0;
    for (int j = -halfWindow; j <= halfWindow; j++) {
      int idx = i + j;
      if (idx >= 0 && idx < count) {
        window[windowSize++] = samples[idx];
      }
    }
    
    // Ordenar ventana y obtener mediana
    sortArray(window, windowSize);
    filtered[i] = window[windowSize / 2];
  }
  
  // Copiar valores filtrados de vuelta
  for (int i = 0; i < count; i++) {
    samples[i] = filtered[i];
  }
  
  delete[] filtered;
}


// ============================================
// FUNCIONES DE PROCESAMIENTO
// ============================================

void processBH1750Reading() {
  // Leer valor crudo del sensor
  float rawLux = readBH1750();
  
  if (rawLux < 0) {
    Serial.println("ERROR: No se pudo leer el sensor BH1750");
    return;
  }
  
  Serial.print("BH1750 - Lectura cruda: ");
  Serial.print(rawLux);
  Serial.println(" lux");
  
  // Aplicar filtro de Kalman
  float filteredLux = filterBH1750Kalman(rawLux);
  Serial.print("BH1750 - Luminosidad filtrada: ");
  Serial.print(filteredLux);
  Serial.println(" lux");
  
  // Crear documento JSON para servidor (solo lux, como espera el backend)
  StaticJsonDocument<100> docServer;
  docServer["lux"] = filteredLux;
  
  // Enviar al servidor (sin timestamp, el backend lo genera)
  String serverResponse = sendToServer("/bh1750", docServer);
  
  if (serverResponse.length() > 0) {
    // Parsear respuesta del servidor para obtener timestamp
    StaticJsonDocument<300> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, serverResponse);
    
    if (!error) {
      // Crear documento JSON para SD con timestamp del servidor
      StaticJsonDocument<300> docSD;
      docSD["lux"] = filteredLux;
      docSD["rawLux"] = rawLux; // Guardar también el valor crudo para análisis
      docSD["id"] = responseDoc["id"].as<String>();
      docSD["timestamp"] = responseDoc["timestamp"].as<String>(); // Timestamp del servidor
      
      // Guardar en SD (con timestamp del servidor)
      saveToSD("BH1750", docSD);
      Serial.println("Datos guardados en SD con timestamp del servidor");
    } else {
      Serial.print("ERROR al parsear respuesta del servidor: ");
      Serial.println(error.c_str());
    }
  } else {
    Serial.println("No se pudo obtener respuesta del servidor, no se guardará en SD");
  }
}

void processINMP441Reading() {
  int16_t samples[INMP441_SAMPLE_COUNT];
  
  if (!readINMP441(samples, INMP441_SAMPLE_COUNT)) {
    Serial.println("ERROR: No se pudo leer el sensor INMP441");
    return;
  }
  
  Serial.print("INMP441 - Muestras capturadas: ");
  Serial.println(INMP441_SAMPLE_COUNT);
  
  // Aplicar filtro de mediana para eliminar picos de ruido
  filterINMP441Median(samples, INMP441_SAMPLE_COUNT);
  Serial.println("  Filtro de mediana aplicado");
  
  // Calcular estadísticas después del filtrado
  long sum = 0;
  int16_t maxVal = 0;
  int16_t minVal = 32767;
  
  for (int i = 0; i < INMP441_SAMPLE_COUNT; i++) {
    sum += samples[i];
    if (samples[i] > maxVal) maxVal = samples[i];
    if (samples[i] < minVal) minVal = samples[i];
  }
  
  float avg = (float)sum / INMP441_SAMPLE_COUNT;
  Serial.print("  Promedio: ");
  Serial.print(avg);
  Serial.print(", Max: ");
  Serial.print(maxVal);
  Serial.print(", Min: ");
  Serial.println(minVal);
  
  // Crear documento JSON para servidor (solo samples, como espera el backend)
  const size_t capacityServer = JSON_ARRAY_SIZE(INMP441_SAMPLE_COUNT) + (INMP441_SAMPLE_COUNT * 6) + 100;
  DynamicJsonDocument docServer(capacityServer);
  
  JsonArray samplesArrayServer = docServer.createNestedArray("samples");
  for (int i = 0; i < INMP441_SAMPLE_COUNT; i++) {
    samplesArrayServer.add(samples[i]);
  }
  
  // Enviar al servidor (sin timestamp, el backend lo genera)
  String serverResponse = sendToServer("/inmp441", docServer);
  
  if (serverResponse.length() > 0) {
    // Parsear respuesta del servidor para obtener timestamp
    const size_t capacityResponse = JSON_ARRAY_SIZE(INMP441_SAMPLE_COUNT) + (INMP441_SAMPLE_COUNT * 6) + 500;
    DynamicJsonDocument responseDoc(capacityResponse);
    DeserializationError error = deserializeJson(responseDoc, serverResponse);
    
    if (!error) {
      // Crear documento JSON para SD con timestamp del servidor
      // Calcular tamaño necesario: samples array (512 números, ~6 chars cada uno) + metadata
      // Cada número puede ser hasta 5 dígitos + comas/espacios = ~6 bytes por número
      // 512 * 6 = 3072 bytes + overhead del JSON (~500 bytes) = ~3600 bytes
      const size_t capacitySD = JSON_ARRAY_SIZE(INMP441_SAMPLE_COUNT) + (INMP441_SAMPLE_COUNT * 6) + 500;
      DynamicJsonDocument docSD(capacitySD);
      
      // Copiar samples de la respuesta del servidor (o usar los originales)
      JsonArray samplesArraySD = docSD.createNestedArray("samples");
      for (int i = 0; i < INMP441_SAMPLE_COUNT; i++) {
        samplesArraySD.add(samples[i]);
      }
      docSD["id"] = responseDoc["id"].as<String>();
      docSD["timestamp"] = responseDoc["timestamp"].as<String>(); // Timestamp del servidor
      
      // Guardar en SD (con timestamp del servidor)
      saveToSD("INMP441", docSD);
      Serial.println("Datos guardados en SD con timestamp del servidor");
    } else {
      Serial.print("ERROR al parsear respuesta del servidor: ");
      Serial.println(error.c_str());
    }
  } else {
    Serial.println("No se pudo obtener respuesta del servidor, no se guardará en SD");
  }
}

// ============================================
// LOOP PRINCIPAL
// ============================================

void loop() {
  unsigned long currentTime = millis();
  
  // Verificar conexión WiFi periódicamente
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Reintentando conexión WiFi...");
    WiFi.disconnect();
    WiFi.reconnect();
    delay(2000);
  }
  
  // Ejecutar lecturas cada READING_INTERVAL ms
  if (currentTime - lastReadingTime >= READING_INTERVAL) {
    Serial.println("\n--- Nueva lectura de sensores ---");
    
    // Leer BH1750
    processBH1750Reading();
    
    // Leer INMP441
    processINMP441Reading();
    
    lastReadingTime = currentTime;
    Serial.println("--- Lectura completada ---\n");
  }
  
  delay(100); // Pequeño delay para evitar saturación del loop
}

