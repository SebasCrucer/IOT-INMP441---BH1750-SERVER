import { Request, Response } from 'express';
import { readingsService } from '../services/readings.service';
import { emitBH1750Reading, emitINMP441Reading } from '../socket/socket.io';

export const sensorController = {
  async createBH1750Reading(req: Request, res: Response) {
    try {
      const { lux } = req.body;
      const reading = await readingsService.createBH1750Reading({ lux });
      
      // Emitir evento Socket.IO
      emitBH1750Reading(reading);
      
      res.status(201).json(reading);
    } catch (error) {
      console.error('Error creating BH1750 reading:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async createINMP441Reading(req: Request, res: Response) {
    try {
      const { samples } = req.body;
      const reading = await readingsService.createINMP441Reading({ samples });
      
      // Emitir evento Socket.IO
      emitINMP441Reading(reading);
      
      res.status(201).json(reading);
    } catch (error) {
      console.error('Error creating INMP441 reading:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};

