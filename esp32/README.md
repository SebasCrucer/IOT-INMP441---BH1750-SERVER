# Sistema IoT ESP32 - Sensores BH1750 e INMP441

Sistema completo para lectura, procesamiento y transmisión de datos desde sensores BH1750 (luminosidad) e INMP441 (audio) usando ESP32. Los datos se procesan con técnicas de calidad de datos, se guardan en tarjeta micro SD y se envían a un servidor backend mediante HTTP POST.

## 📋 Características

- ✅ Lectura de sensor **BH1750** (luminosidad) vía I2C
- ✅ Lectura de sensor **INMP441** (audio) vía I2S
- ✅ **Filtro de Kalman** para suavizado de datos del BH1750
- ✅ **Filtro de Mediana** para eliminación de ruido en INMP441
- ✅ Almacenamiento local en **tarjeta micro SD** (formato JSON)
- ✅ Transmisión de datos al servidor mediante **HTTP POST**
- ✅ Reconexión automática de WiFi
- ✅ Manejo robusto de errores

## 🔧 Hardware Requerido

- **ESP32** (cualquier variante)
- **Sensor BH1750** (sensor de luminosidad digital)
- **Sensor INMP441** (micrófono MEMS I2S)
- **Tarjeta micro SD** (formato FAT32)
- **Resistencias pull-up** para I2C (4.7kΩ recomendadas)
- **Cables de conexión**

## 📌 Conexiones de Pines

### BH1750 (I2C)
| BH1750 | ESP32 | Descripción |
|--------|-------|-------------|
| VCC    | 3.3V  | Alimentación |
| GND    | GND   | Tierra |
| SDA    | GPIO 21 | Datos I2C |
| SCL    | GPIO 22 | Reloj I2C |

**Nota:** Conectar resistencias pull-up de 4.7kΩ entre SDA/SCL y 3.3V.

### INMP441 (I2S)
| INMP441 | ESP32 | Descripción |
|---------|-------|-------------|
| VDD     | 3.3V  | Alimentación |
| GND     | GND   | Tierra |
| WS      | GPIO 15 | Word Select (LRCLK) |
| SCK     | GPIO 14 | Serial Clock (BCLK) |
| SD      | GPIO 32 | Serial Data |

### Micro SD (SPI)
| Micro SD | ESP32 | Descripción |
|----------|-------|-------------|
| VCC      | 3.3V  | Alimentación |
| GND      | GND   | Tierra |
| CS       | GPIO 5  | Chip Select |
| MOSI     | GPIO 23 | Master Out Slave In |
| MISO     | GPIO 19 | Master In Slave Out |
| SCK      | GPIO 18 | Serial Clock |

## 📚 Librerías Requeridas

### Arduino IDE
Instalar las siguientes librerías desde el Library Manager:

1. **WiFi** (incluida en ESP32)
2. **HTTPClient** (incluida en ESP32)
3. **Wire** (incluida en ESP32)
4. **SD** (incluida en ESP32)
5. **SPI** (incluida en ESP32)
6. **ArduinoJson** - por Benoit Blanchon
   - Buscar: "ArduinoJson"
   - Versión: 6.x o superior
7. **SimpleKalmanFilter** - por Denys Sene
   - Buscar: "SimpleKalmanFilter"
   - Versión: 1.1.1 o superior

### PlatformIO
Agregar al archivo `platformio.ini`:

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
lib_deps = 
    bblanchon/ArduinoJson@^6.21.3
    denyssene/SimpleKalmanFilter@^1.1.1
```

## ⚙️ Configuración

Antes de subir el código, edita las siguientes variables en `main.ino`:

```cpp
// Líneas 13-15
const char* ssid = "TU_SSID_WIFI";              // Nombre de tu red WiFi
const char* password = "TU_PASSWORD_WIFI";      // Contraseña WiFi
const char* serverURL = "http://TU_IP_SERVIDOR:3000/api/sensors";  // URL del servidor backend
```

### Parámetros Ajustables

```cpp
// Líneas 39-41
#define INMP441_SAMPLE_COUNT 512    // Número de muestras de audio por lectura
#define READING_INTERVAL 2000        // Intervalo entre lecturas (milisegundos)
#define I2S_SAMPLE_RATE 16000       // Frecuencia de muestreo I2S (Hz)

// Línea 44
#define INMP441_MEDIAN_WINDOW 5     // Tamaño de ventana para filtro de mediana

// Línea 54 - Parámetros del filtro Kalman
SimpleKalmanFilter bh1750KalmanFilter(2.0, 2.0, 0.05);
// Parámetros: (error_measure, error_estimate, q)
// - error_measure: Incertidumbre de la medición (1-10)
// - error_estimate: Incertidumbre inicial (1-10)
// - q: Ruido del proceso (0.01-0.1, más bajo = más suavizado)
```

## 🚀 Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   cd esp32
   ```

2. **Instalar librerías** (ver sección anterior)

3. **Configurar variables** (SSID, password, serverURL)

4. **Conectar hardware** según el diagrama de pines

5. **Subir código al ESP32**
   - Seleccionar placa: **ESP32 Dev Module**
   - Puerto COM correcto
   - Velocidad: 115200 baud

6. **Abrir Serial Monitor** (115200 baud) para ver logs

## 📊 Funcionalidades

### Lectura de Sensores

#### BH1750 (Luminosidad)
- **Protocolo:** I2C (dirección 0x23)
- **Rango:** 0 - 65,535 lux (teórico)
- **Resolución:** 1 lux
- **Filtrado:** Filtro de Kalman para suavizado adaptativo
- **Frecuencia:** Cada 2 segundos (configurable)

#### INMP441 (Audio)
- **Protocolo:** I2S
- **Frecuencia de muestreo:** 16 kHz
- **Resolución:** 16 bits
- **Muestras por lectura:** 512 (configurable)
- **Filtrado:** Filtro de mediana para eliminar picos de ruido

### Técnicas de Calidad de Datos

#### BH1750 - Filtro de Kalman
El filtro de Kalman predice y suaviza los valores de luminosidad basándose en un modelo del sensor. Ventajas:
- Mejor suavizado que promedio móvil
- Adaptación automática a cambios graduales
- Menor uso de memoria
- Predicción de valores futuros

**Parámetros ajustables:**
- `error_measure`: Incertidumbre de la medición (default: 2.0)
- `error_estimate`: Incertidumbre inicial (default: 2.0)
- `q`: Ruido del proceso (default: 0.05)
  - Valores más bajos (0.01-0.03): Más suavizado, respuesta más lenta
  - Valores más altos (0.1-0.5): Menos suavizado, respuesta más rápida

#### INMP441 - Filtro de Mediana
El filtro de mediana elimina picos de ruido sin distorsionar la señal de audio. Ventajas:
- Preserva bordes y transiciones
- Efectivo contra ruido impulsivo
- No introduce retraso de fase
- Ideal para señales de audio

**Ventana configurable:** 5 muestras (default)

### Almacenamiento en SD

- **Formato:** JSON
- **Ubicación:** `/data/` en la tarjeta SD
- **Nomenclatura:** `SENSOR_timestamp.json`
- **Contenido:**
  - BH1750: `lux`, `rawLux`, `id`, `timestamp` (del servidor)
  - INMP441: `samples[]`, `id`, `timestamp` (del servidor)
- **Frecuencia:** Cada lectura se guarda después de recibir respuesta del servidor

### Comunicación con Servidor

- **Protocolo:** HTTP POST
- **Endpoints:**
  - `POST /api/sensors/bh1750` - Envía datos de luminosidad
  - `POST /api/sensors/inmp441` - Envía muestras de audio
- **Formato:** JSON
- **Reintentos:** Automáticos si WiFi se desconecta
- **Timeout:** Manejo de errores de conexión

## 📁 Estructura del Código

```
main.ino
├── Configuración
│   ├── Credenciales WiFi
│   ├── URL del servidor
│   └── Pines de hardware
├── Inicialización
│   ├── initWiFi()
│   ├── initSD()
│   ├── initBH1750()
│   └── initINMP441()
├── Lectura de Sensores
│   ├── readBH1750()
│   └── readINMP441()
├── Calidad de Datos
│   ├── filterBH1750Kalman()
│   └── filterINMP441Median()
├── Almacenamiento
│   ├── generateFilename()
│   └── saveToSD()
├── Comunicación
│   └── sendToServer()
└── Procesamiento Principal
    ├── processBH1750Reading()
    ├── processINMP441Reading()
    └── loop()
```

## 🔍 Monitoreo y Debugging

### Serial Monitor

El código incluye logs detallados en Serial Monitor (115200 baud):

```
=== Inicializando Sistema IoT ESP32 ===
Conectando a WiFi: TU_SSID_WIFI
WiFi conectado!
IP address: 192.168.1.100
Inicializando tarjeta SD... OK
Directorio /data creado
Inicializando sensor BH1750... OK
Inicializando sensor INMP441... OK
=== Sistema inicializado correctamente ===

--- Nueva lectura de sensores ---
BH1750 - Lectura cruda: 123.45 lux
BH1750 - Luminosidad filtrada: 122.30 lux
Enviando a http://192.168.1.50:3000/api/sensors/bh1750: {"lux":122.30}
Respuesta del servidor: 201
Respuesta: {"id":"...","timestamp":"2024-01-15T10:30:00.000Z","lux":122.30}
Datos guardados en SD con timestamp del servidor

INMP441 - Muestras capturadas: 512
  Filtro de mediana aplicado
  Promedio: 1250, Max: 3500, Min: 200
Enviando a http://192.168.1.50:3000/api/sensors/inmp441: {"samples":[...]}
Respuesta del servidor: 201
Datos guardados en SD con timestamp del servidor
--- Lectura completada ---
```

## 🐛 Troubleshooting

### WiFi no se conecta
- Verificar SSID y contraseña
- Verificar que la red esté en 2.4 GHz (ESP32 no soporta 5 GHz)
- Verificar señal WiFi
- Revisar logs en Serial Monitor

### Sensor BH1750 no responde
- Verificar conexiones I2C (SDA/SCL)
- Verificar resistencias pull-up (4.7kΩ)
- Verificar alimentación (3.3V)
- Verificar dirección I2C (0x23)

### Sensor INMP441 no funciona
- Verificar conexiones I2S (WS, SCK, SD)
- Verificar alimentación (3.3V)
- Verificar frecuencia de muestreo (16 kHz)
- Revisar logs de inicialización

### Tarjeta SD no se detecta
- Verificar formato (debe ser FAT32)
- Verificar conexiones SPI
- Verificar que la tarjeta esté insertada correctamente
- Probar con otra tarjeta SD

### Datos no se envían al servidor
- Verificar URL del servidor
- Verificar que el servidor esté corriendo
- Verificar conectividad de red
- Revisar logs HTTP en Serial Monitor
- Verificar que el endpoint sea correcto (`/api/sensors/bh1750` o `/api/sensors/inmp441`)

### Filtro Kalman muy suavizado/responsivo
- Ajustar parámetro `q` en línea 54:
  - Más suavizado: `q = 0.01-0.03`
  - Más responsivo: `q = 0.1-0.5`

## 📝 Formato de Datos

### BH1750 - JSON en SD
```json
{
  "lux": 123.45,
  "rawLux": 125.30,
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### BH1750 - JSON al servidor
```json
{
  "lux": 123.45
}
```

### INMP441 - JSON en SD
```json
{
  "samples": [100, 200, 150, 300, 250, ...],
  "id": "123e4567-e89b-12d3-a456-426614174001",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### INMP441 - JSON al servidor
```json
{
  "samples": [100, 200, 150, 300, 250, ...]
}
```

## 🔄 Flujo de Datos

1. **Lectura** → Sensor lee valor crudo
2. **Filtrado** → Aplicación de técnicas de calidad de datos
3. **Transmisión** → Envío al servidor (HTTP POST)
4. **Almacenamiento** → Guardado en SD con timestamp del servidor (formato JSON)
5. **Espera** → Intervalo configurado (default: 2 segundos)
6. **Repetición** → Vuelve al paso 1

## 📈 Optimizaciones

- **Memoria:** Uso eficiente de buffers dinámicos
- **Energía:** Intervalos configurables para reducir consumo
- **Red:** Reintentos automáticos de WiFi
- **Almacenamiento:** Archivos JSON compactos
- **Procesamiento:** Filtros optimizados para ESP32
