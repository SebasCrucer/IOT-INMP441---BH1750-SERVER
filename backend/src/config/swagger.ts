import swaggerJsdoc from 'swagger-jsdoc';

// Obtener URL del servidor desde variables de entorno
// Prioridad: VITE_API_URL > SERVICE_URL_BACKEND > localhost
const serverUrl = 
  process.env.VITE_API_URL || 
  process.env.SERVICE_URL_BACKEND || 
  'http://localhost:3000';

const serverDescription = 
  process.env.VITE_API_URL 
    ? 'Servidor (VITE_API_URL)' 
    : process.env.SERVICE_URL_BACKEND 
    ? 'Servidor de producción (SERVICE_URL_BACKEND)' 
    : 'Servidor de desarrollo';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IoT Dashboard API - ESP32',
      version: '1.0.0',
      description: 'API REST para recibir y consultar datos de sensores desde ESP32. Incluye sensores BH1750 (luminosidad) e INMP441 (audio).',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: serverUrl,
        description: serverDescription,
      },
    ],
    tags: [
      {
        name: 'Sensors',
        description: 'Endpoints para recibir datos de sensores desde ESP32',
      },
      {
        name: 'Readings',
        description: 'Endpoints para consultar datos históricos de sensores',
      },
      {
        name: 'Health',
        description: 'Endpoints de salud del sistema',
      },
    ],
    components: {
      schemas: {
        BH1750Reading: {
          type: 'object',
          required: ['id', 'timestamp', 'lux'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del registro',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de la lectura',
              example: '2024-01-15T10:30:00.000Z',
            },
            lux: {
              type: 'number',
              format: 'float',
              description: 'Valor de luminosidad en lux',
              example: 123.45,
              minimum: 0,
            },
          },
        },
        INMP441Reading: {
          type: 'object',
          required: ['id', 'timestamp', 'samples'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'ID único del registro',
              example: '123e4567-e89b-12d3-a456-426614174001',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha y hora de la lectura',
              example: '2024-01-15T10:30:00.000Z',
            },
            samples: {
              type: 'array',
              items: {
                type: 'number',
              },
              description: 'Array de valores de amplitud de audio',
              example: [100, 200, 150, 300, 250],
              minItems: 1,
              maxItems: 10000,
            },
          },
        },
        BH1750ReadingInput: {
          type: 'object',
          required: ['lux'],
          properties: {
            lux: {
              type: 'number',
              format: 'float',
              description: 'Valor de luminosidad en lux',
              example: 123.45,
              minimum: 0,
            },
          },
        },
        INMP441ReadingInput: {
          type: 'object',
          required: ['samples'],
          properties: {
            samples: {
              type: 'array',
              items: {
                type: 'number',
              },
              description: 'Array de valores de amplitud de audio',
              example: [100, 200, 150, 300, 250],
              minItems: 1,
              maxItems: 10000,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensaje de error',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

