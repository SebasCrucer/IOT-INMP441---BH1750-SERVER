# Sistema IoT Dashboard para ESP32

Sistema completo para recibir y visualizar datos de sensores desde un ESP32. Incluye un backend REST API con Express y TypeScript, un frontend React con TypeScript, y una base de datos PostgreSQL con Prisma ORM. Todo dockerizado.

## Sensores Soportados

- **BH1750**: Sensor de luminosidad (lux)
- **INMP441**: Sensor de audio (muestras de amplitud)

## Estructura del Proyecto

```
Practica3/
├── backend/          # API REST con Express + TypeScript + Prisma
├── frontend/         # Dashboard React + TypeScript
├── docker-compose.yml
└── README.md
```

## Requisitos Previos

- Docker y Docker Compose instalados
- Node.js 20+ (para desarrollo local, opcional)

## Instalación y Uso

### 1. Clonar y preparar el proyecto

```bash
cd Practica3
```

### 2. Configurar variables de entorno

Crear archivo `.env` en el directorio `backend/`:

```env
DATABASE_URL="postgresql://iot_user:iot_password@postgres:5432/iot_db?schema=public"
PORT=3000
```

### 3. Levantar los servicios con Docker

```bash
docker-compose up --build
```

Esto iniciará:
- PostgreSQL en el puerto 5432
- Backend API en el puerto 3000
- Frontend Dashboard en el puerto 5173
- Documentación API en `http://localhost:3000/api-docs`

### 4. Ejecutar migraciones de Prisma

Si es la primera vez, ejecutar las migraciones:

```bash
docker-compose exec backend npx prisma migrate dev
```

O si ya está corriendo:

```bash
docker-compose exec backend npx prisma migrate deploy
```

## Documentación de la API

La documentación interactiva de la API está disponible usando **Scalar** y **OpenAPI 3.0**:

- **Documentación interactiva**: `http://localhost:3000/api-docs`
- **Especificación OpenAPI (JSON)**: `http://localhost:3000/api-docs.json`

La documentación incluye:
- Descripción completa de todos los endpoints
- Esquemas de datos (schemas)
- Ejemplos de requests y responses
- Validaciones y restricciones
- Posibilidad de probar los endpoints directamente desde la interfaz

## API Endpoints

### Enviar datos desde ESP32

**POST /api/sensors/bh1750**
```json
{
  "lux": 123.45
}
```

**POST /api/sensors/inmp441**
```json
{
  "samples": [100, 200, 150, 300, 250, ...]
}
```

### Consultar datos históricos

**GET /api/readings/bh1750**
- Query params: `startDate?`, `endDate?`, `limit?`
- Ejemplo: `/api/readings/bh1750?startDate=2024-01-01T00:00:00Z&limit=100`

**GET /api/readings/inmp441**
- Query params: `startDate?`, `endDate?`, `limit?`
- Ejemplo: `/api/readings/inmp441?endDate=2024-01-02T00:00:00Z&limit=50`

## Estructura de Datos

### BH1750Reading
- `id`: UUID
- `timestamp`: DateTime (automático)
- `lux`: Float (luminosidad en lux)

### INMP441Reading
- `id`: UUID
- `timestamp`: DateTime (automático)
- `samples`: JSON (array de valores de amplitud)

## Dashboard

El dashboard está disponible en `http://localhost:5173` y muestra:

1. **Gráfico BH1750**: Visualización en tiempo real de la luminosidad
2. **Gráfico INMP441**: 
   - Estadísticas históricas (promedio, máximo, mínimo)
   - Forma de onda de la última lectura
3. **Filtros**: Permite filtrar por rango de fechas y límite de registros

Los datos se actualizan automáticamente en tiempo real usando **Socket.IO** (WebSockets).

## Desarrollo Local (sin Docker)

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Ejemplo de código ESP32

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "TU_SSID";
const char* password = "TU_PASSWORD";
const char* serverURL = "http://TU_IP:3000/api/sensors";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Conectado a WiFi");
}

void loop() {
  // Ejemplo BH1750
  float lux = leerBH1750(); // Tu función de lectura
  enviarDatosBH1750(lux);
  
  // Ejemplo INMP441
  int samples[100];
  leerINMP441(samples, 100); // Tu función de lectura
  enviarDatosINMP441(samples, 100);
  
  delay(2000); // Enviar cada 2 segundos
}

void enviarDatosBH1750(float lux) {
  HTTPClient http;
  http.begin(serverURL + String("/bh1750"));
  http.addHeader("Content-Type", "application/json");
  
  String json = "{\"lux\":" + String(lux) + "}";
  int httpResponseCode = http.POST(json);
  
  if (httpResponseCode > 0) {
    Serial.println("BH1750 enviado: " + String(httpResponseCode));
  }
  http.end();
}

void enviarDatosINMP441(int* samples, int count) {
  HTTPClient http;
  http.begin(serverURL + String("/inmp441"));
  http.addHeader("Content-Type", "application/json");
  
  String json = "{\"samples\":[";
  for (int i = 0; i < count; i++) {
    json += String(samples[i]);
    if (i < count - 1) json += ",";
  }
  json += "]}";
  
  int httpResponseCode = http.POST(json);
  
  if (httpResponseCode > 0) {
    Serial.println("INMP441 enviado: " + String(httpResponseCode));
  }
  http.end();
}
```

## Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Acceder a Prisma Studio
docker-compose exec backend npx prisma studio
```

## Tecnologías Utilizadas

- **Backend**: Express, TypeScript, Prisma ORM, Socket.IO
- **Frontend**: React, TypeScript, Vite, Recharts, Socket.IO Client
- **Base de Datos**: PostgreSQL
- **Documentación API**: Scalar, OpenAPI 3.0, Swagger JSDoc
- **Validación**: Zod
- **Containerización**: Docker, Docker Compose

