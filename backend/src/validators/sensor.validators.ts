import { z } from 'zod';

export const bh1750ReadingSchema = z.object({
  body: z.object({
    lux: z
      .number({
        required_error: 'lux is required',
        invalid_type_error: 'lux must be a number',
      })
      .positive('lux must be a positive number')
      .finite('lux must be a finite number'),
  }),
});

export const inmp441ReadingSchema = z.object({
  body: z.object({
    samples: z
      .array(
        z.number({
          invalid_type_error: 'samples must be an array of numbers',
        })
      )
      .min(1, 'samples array must contain at least one element')
      .max(10000, 'samples array cannot exceed 10000 elements'),
  }),
});

export const readingFiltersSchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .refine(
        (val: string) => {
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        { message: 'startDate must be a valid date string' }
      )
      .optional(),
    endDate: z
      .string()
      .refine(
        (val: string) => {
          const date = new Date(val);
          return !isNaN(date.getTime());
        },
        { message: 'endDate must be a valid date string' }
      )
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'limit must be a positive integer')
      .transform((val: string) => parseInt(val, 10))
      .refine((val: number) => val > 0 && val <= 10000, {
        message: 'limit must be between 1 and 10000',
      })
      .optional(),
  }),
});

export type BH1750ReadingInput = z.infer<typeof bh1750ReadingSchema>['body'];
export type INMP441ReadingInput = z.infer<typeof inmp441ReadingSchema>['body'];
export type ReadingFiltersInput = z.infer<typeof readingFiltersSchema>['query'];

