import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface BH1750Reading {
  id: string;
  timestamp: string;
  lux: number;
}

export interface INMP441Reading {
  id: string;
  timestamp: string;
  samples: number[];
}

export interface ReadingFilters {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const apiService = {
  async getBH1750Readings(filters?: ReadingFilters): Promise<BH1750Reading[]> {
    try {
      const response = await api.get('/api/readings/bh1750', { params: filters });
      return response.data || [];
    } catch (error: any) {
      // Si es un 404 o array vacío, retornar array vacío en lugar de error
      if (error.response?.status === 404 || error.response?.data?.length === 0) {
        return [];
      }
      throw error;
    }
  },

  async getINMP441Readings(filters?: ReadingFilters): Promise<INMP441Reading[]> {
    try {
      const response = await api.get('/api/readings/inmp441', { params: filters });
      return response.data || [];
    } catch (error: any) {
      // Si es un 404 o array vacío, retornar array vacío en lugar de error
      if (error.response?.status === 404 || error.response?.data?.length === 0) {
        return [];
      }
      throw error;
    }
  },

  async createBH1750Reading(lux: number): Promise<BH1750Reading> {
    const response = await api.post('/api/sensors/bh1750', { lux });
    return response.data;
  },

  async createINMP441Reading(samples: number[]): Promise<INMP441Reading> {
    const response = await api.post('/api/sensors/inmp441', { samples });
    return response.data;
  },
};

