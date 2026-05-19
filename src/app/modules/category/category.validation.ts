import { z } from 'zod';

export const WebsiteLinkSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),

  subTitle: z
    .string()
    .min(1, 'SubTitle is required')
    .max(150, 'SubTitle must be less than 150 characters'),

  link: z.string().url('Website link must be a valid URL'),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters'),

    description: z
      .string()
      .min(1, 'Description is required')
      .max(500, 'Description must be less than 500 characters'),

    websiteLinks: z
      .array(WebsiteLinkSchema)
      .min(1, 'At least one website link is required'),
  }),
});

export const updateCategorySchema = z.object({
  body: createCategorySchema.shape.body.deepPartial(),
});

export const categoryValidation = {
  createCategorySchema,
  updateCategorySchema,
};
