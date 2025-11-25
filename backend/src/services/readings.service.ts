import prisma from '../config/database';

export interface BH1750ReadingInput {
  lux: number;
}

export interface INMP441ReadingInput {
  samples: number[];
}

export interface ReadingFilters {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const readingsService = {
  async createBH1750Reading(data: BH1750ReadingInput) {
    return await prisma.bH1750Reading.create({
      data: {
        lux: data.lux,
      },
    });
  },

  async createINMP441Reading(data: INMP441ReadingInput) {
    return await prisma.iNMP441Reading.create({
      data: {
        samples: data.samples,
      },
    });
  },

  async getBH1750Readings(filters: ReadingFilters = {}) {
    const { startDate, endDate, limit } = filters;

    const where: any = {};

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    const queryOptions: any = {
      where,
      orderBy: {
        timestamp: 'desc' as const,
      },
    };

    if (limit) {
      queryOptions.take = parseInt(limit.toString());
    }

    return await prisma.bH1750Reading.findMany(queryOptions);
  },

  async getINMP441Readings(filters: ReadingFilters = {}) {
    const { startDate, endDate, limit } = filters;

    const where: any = {};

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    const queryOptions: any = {
      where,
      orderBy: {
        timestamp: 'desc' as const,
      },
    };

    if (limit) {
      queryOptions.take = parseInt(limit.toString());
    }

    return await prisma.iNMP441Reading.findMany(queryOptions);
  },
};

