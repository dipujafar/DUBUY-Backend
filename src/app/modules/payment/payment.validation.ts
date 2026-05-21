import { z } from 'zod';
import { Types } from 'mongoose';

const createInitPaymentValidationSchema = z.object({
  body: z.object({
    productRequest: z
      .string({
        required_error: 'Product request id is required',
      })
      .refine(id => Types.ObjectId.isValid(id), {
        message: 'Invalid productRequest ObjectId',
      }),

    moneyTransferCompany: z
      .string({
        required_error: 'Money transfer company id is required',
      })
      .refine(id => Types.ObjectId.isValid(id), {
        message: 'Invalid moneyTransferCompany ObjectId',
      }),
  }),
});

const createSecondPaymentValidationSchema = z.object({
  body: z.object({
    order: z
      .string({
        required_error: 'order is required',
      })
      .refine(id => Types.ObjectId.isValid(id), {
        message: 'Invalid order ObjectId',
      }),

    moneyTransferCompany: z
      .string({
        required_error: 'Money transfer company id is required',
      })
      .refine(id => Types.ObjectId.isValid(id), {
        message: 'Invalid moneyTransferCompany ObjectId',
      }),
  }),
});

export const paymentValidation = {
  createSecondPaymentValidationSchema,
  createInitPaymentValidationSchema,
};
