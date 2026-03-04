import { z } from 'zod';
import { shippingStatus, statusEnum } from './requests.constants';

export const additionalNotesSchema = z.object({
  productIsFragile: z.boolean().optional(),
  requiresExtraCare: z.boolean().optional(),
  urgentDelivery: z.boolean().optional(),
});

export const requestSchema = z.object({
  body: z.object({
    link: z
      .string({ required_error: 'Product link is required' })
      .url('Product link must be a valid URL'),

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

    additionalNotes: additionalNotesSchema,

    address: z
      .string({ required_error: 'Delivery address is required' })
      .min(1, 'Delivery address is required'),

    status: z.enum([...statusEnum] as [string, ...string[]]).default('pending'),

    shippingStatus: z
      .enum([...shippingStatus] as [string, ...string[]])
      .default('pending'),
  }),
});

export const updateRequestSchema = z.object({
  body: z
    .object({
      link: z.string().url('Product link must be a valid URL').optional(),
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
      address: z.string().min(1, 'Delivery address is required').optional(),
      status: z
        .enum([...statusEnum] as [string, ...string[]])
        .default('pending')
        .optional(),

      shippingStatus: z
        .enum([...shippingStatus] as [string, ...string[]])
        .default('pending')
        .optional(),

      // make nested object optional AND its fields optional
      additionalNotes: additionalNotesSchema.partial().optional(),
    })
    .partial(),
});

export const requestValidation = {
  requestSchema,
  updateRequestSchema,
};
