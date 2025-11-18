import express from 'express';
import cors from 'cors';
import { apiReference } from '@scalar/express-api-reference';
import sensorRoutes from './routes/sensor.routes';
import readingsRoutes from './routes/readings.routes';
import { swaggerSpec } from './config/swagger';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Documentation with Scalar
app.use(
  '/api-docs',
  apiReference({
    theme: 'purple',
    layout: 'modern',
    spec: {
      content: swaggerSpec,
    },
  })
);

// OpenAPI JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/sensors', sensorRoutes);
app.use('/api/readings', readingsRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check del servidor
 *     tags: [Health]
 *     description: Verifica que el servidor esté funcionando correctamente
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;

