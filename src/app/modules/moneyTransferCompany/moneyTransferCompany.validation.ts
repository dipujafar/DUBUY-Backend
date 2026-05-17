import { z } from 'zod';

/* =========================
   LOCATION SCHEMA
========================= */

const locationSchema = z.object({
  type: z.literal('Point'),

  coordinates: z
    .array(z.number())
    .length(2, 'Coordinates must contain [longitude, latitude]'),
});

/* =========================
   CREATE VALIDATION
   (ALL REQUIRED)
========================= */

const createMoneyTransferCompanyValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required'),

    officeNumber: z.string().trim().min(1, 'Office number is required'),

    address: z.string().trim().min(1, 'Address is required'),

    location: locationSchema,
  }),
});

/* =========================
   UPDATE VALIDATION
   (ALL OPTIONAL)
========================= */
const updateMoneyTransferCompanyValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),

    officeNumber: z.string().trim().min(1).optional(),

    address: z.string().trim().min(1).optional(),

    location: locationSchema.optional(),
  }),
});

export const MoneyTransferCompanyValidation = {
  createMoneyTransferCompanyValidationSchema,
  updateMoneyTransferCompanyValidationSchema,
};
