import { Router } from 'express';
import { readingsController } from '../controllers/readings.controller';
import { validate } from '../middleware/validation.middleware';
import { readingFiltersSchema } from '../validators/sensor.validators';

const router = Router();

/**
 * @swagger
 * /api/readings/bh1750:
 *   get:
 *     summary: Obtener lecturas históricas del sensor BH1750
 *     tags: [Readings]
 *     description: Consulta las lecturas de luminosidad con filtros opcionales por fecha y límite
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio para filtrar lecturas (ISO 8601)
 *         example: "2024-01-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin para filtrar lecturas (ISO 8601)
 *         example: "2024-01-31T23:59:59Z"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10000
 *         description: Número máximo de registros a retornar
 *         example: 100
 *     responses:
 *       200:
 *         description: Lista de lecturas de BH1750
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BH1750Reading'
 *             example:
 *               - id: "123e4567-e89b-12d3-a456-426614174000"
 *                 timestamp: "2024-01-15T10:30:00.000Z"
 *                 lux: 123.45
 *               - id: "123e4567-e89b-12d3-a456-426614174002"
 *                 timestamp: "2024-01-15T10:28:00.000Z"
 *                 lux: 115.20
 *       400:
 *         description: Error de validación en los parámetros
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/bh1750',
  validate(readingFiltersSchema),
  readingsController.getBH1750Readings
);

/**
 * @swagger
 * /api/readings/inmp441:
 *   get:
 *     summary: Obtener lecturas históricas del sensor INMP441
 *     tags: [Readings]
 *     description: Consulta las lecturas de audio con filtros opcionales por fecha y límite
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio para filtrar lecturas (ISO 8601)
 *         example: "2024-01-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin para filtrar lecturas (ISO 8601)
 *         example: "2024-01-31T23:59:59Z"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10000
 *         description: Número máximo de registros a retornar
 *         example: 50
 *     responses:
 *       200:
 *         description: Lista de lecturas de INMP441
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/INMP441Reading'
 *             example:
 *               - id: "123e4567-e89b-12d3-a456-426614174001"
 *                 timestamp: "2024-01-15T10:30:00.000Z"
 *                 samples: [100, 200, 150, 300, 250]
 *               - id: "123e4567-e89b-12d3-a456-426614174003"
 *                 timestamp: "2024-01-15T10:28:00.000Z"
 *                 samples: [120, 180, 160, 280, 240]
 *       400:
 *         description: Error de validación en los parámetros
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 */
router.get(
  '/inmp441',
  validate(readingFiltersSchema),
  readingsController.getINMP441Readings
);

export default router;
