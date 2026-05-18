import { z } from 'zod';
import { status, statusEnum } from './requests.constants';

export const requestSchema = z.object({
  body: z.object({
    productLink: z
      .string({ required_error: 'Product link is required' })
      .url('Product link must be a valid URL'),
  }),
});

export const reSendQuotationSchema = z.object({
  body: z.object({
    productLink: z.string().url('Product link must be a valid URL').optional(),

    title: z
      .string({ required_error: 'Product title is required' })
      .min(1, 'Product title is required'),

    price: z
      .number({
        required_error: 'Product price is required',
        invalid_type_error: 'Product price must be a number',
      })
      .positive('Product price must be greater than 0'),

    couponCode: z.string().optional(),

    size: z
      .string({ required_error: 'Size is required' })
      .min(1, 'Size is required'),

    color: z
      .string({ required_error: 'Color is required' })
      .min(1, 'Color is required'),

    quantity: z
      .number({
        required_error: 'Quantity is required',
        invalid_type_error: 'Quantity must be a number',
      })
      .int('Quantity must be an integer')
      .positive('Quantity must be greater than 0'),
  }),
});

export const updateRequestSchema = z.object({
  body: z
    .object({
      productLink: z
        .string()
        .url('Product link must be a valid URL')
        .optional(),
      title: z.string().min(1, 'Product title is required').optional(),
      price: z
        .number()
        .positive('Product price must be greater than 0')
        .optional(),
      couponCode: z.string().optional(),
      size: z.string().min(1, 'Size is required').optional(),
      color: z.string().min(1, 'Color is required').optional(),
      quantity: z
        .number()
        .int()
        .positive('Quantity must be greater than 0')
        .optional(),
    })
    .partial(),
});

export const requestValidation = {
  requestSchema,
  updateRequestSchema,
  reSendQuotationSchema,
};
