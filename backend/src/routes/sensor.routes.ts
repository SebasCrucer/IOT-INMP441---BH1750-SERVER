import { Router } from 'express';
import { sensorController } from '../controllers/sensor.controller';
import { validate } from '../middleware/validation.middleware';
import {
  bh1750ReadingSchema,
  inmp441ReadingSchema,
} from '../validators/sensor.validators';

const router = Router();

/**
 * @swagger
 * /api/sensors/bh1750:
 *   post:
 *     summary: Recibir datos del sensor BH1750 (luminosidad)
 *     tags: [Sensors]
 *     description: Endpoint para recibir lecturas de luminosidad desde el ESP32
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BH1750ReadingInput'
 *           example:
 *             lux: 123.45
 *     responses:
 *       201:
 *         description: Lectura creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BH1750Reading'
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *               lux: 123.45
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Validation error"
 *               details:
 *                 - path: "body.lux"
 *                   message: "lux must be a positive number"
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/bh1750',
  validate(bh1750ReadingSchema),
  sensorController.createBH1750Reading
);

/**
 * @swagger
 * /api/sensors/inmp441:
 *   post:
 *     summary: Recibir datos del sensor INMP441 (audio)
 *     tags: [Sensors]
 *     description: Endpoint para recibir muestras de audio desde el ESP32
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/INMP441ReadingInput'
 *           example:
 *             samples: [100, 200, 150, 300, 250, 180, 220]
 *     responses:
 *       201:
 *         description: Lectura creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/INMP441Reading'
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174001"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *               samples: [100, 200, 150, 300, 250, 180, 220]
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Validation error"
 *               details:
 *                 - path: "body.samples"
 *                   message: "samples must be an array of numbers"
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/inmp441',
  validate(inmp441ReadingSchema),
  sensorController.createINMP441Reading
);

export default router;
