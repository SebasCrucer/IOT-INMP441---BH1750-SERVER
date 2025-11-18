import { Request, Response } from 'express';
import { readingsService } from '../services/readings.service';

export const readingsController = {
  async getBH1750Readings(req: Request, res: Response) {
    try {
      const { startDate, endDate, limit } = req.query;

      const filters = {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        limit: limit as number | undefined,
      };

      const readings = await readingsService.getBH1750Readings(filters);
      res.json(readings);
    } catch (error) {
      console.error('Error fetching BH1750 readings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getINMP441Readings(req: Request, res: Response) {
    try {
      const { startDate, endDate, limit } = req.query;

      const filters = {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        limit: limit as number | undefined,
      };

      const readings = await readingsService.getINMP441Readings(filters);
      res.json(readings);
    } catch (error) {
      console.error('Error fetching INMP441 readings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

