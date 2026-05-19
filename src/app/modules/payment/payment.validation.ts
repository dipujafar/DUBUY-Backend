import { z } from 'zod';
import { Types } from 'mongoose';

const createPaymentValidationSchema = z.object({
  body: z.object({
    amount: z
      .number({
        required_error: 'Amount is required',
      })
      .positive('Amount must be greater than 0'),

    paymentPercent: z
      .number({
        required_error: 'Payment percent is required',
      })
      .min(0, 'Payment percent cannot be negative')
      .max(100, 'Payment percent cannot exceed 100'),

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

export const paymentValidation = {
  createPaymentValidationSchema,
};
