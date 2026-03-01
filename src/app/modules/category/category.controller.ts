import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { categoryService } from './category.service';
import sendResponse from '../../utils/sendResponse';
import { uploadToS3 } from '../../utils/s3';

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as {
    image?: Express.Multer.File[];
    icon?: Express.Multer.File[];
  };

  if (files?.image?.[0]) {
    req.body.image = await uploadToS3({
      file: files.image[0],
      fileName: `category/image/${Math.floor(100000 + Math.random() * 900000)}`,
    });
  }

  if (files?.icon?.[0]) {
    req.body.icon = await uploadToS3({
      file: files.icon[0],
      fileName: `category/icon/${Math.floor(100000 + Math.random() * 900000)}`,
    });
  }

  const result = await categoryService.createCategory(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Category created successfully',
    data: result,
  });
});

const getAllCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.getAllCategories(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All categories fetched successfully',
    data: result,
  });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.getCategoryById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category fetched successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as {
    image?: Express.Multer.File[];
    icon?: Express.Multer.File[];
  };

  if (files?.image?.[0]) {
    req.body.image = await uploadToS3({
      file: files.image[0],
      fileName: `category/image/${Math.floor(100000 + Math.random() * 900000)}`,
    });
  }

  if (files?.icon?.[0]) {
    req.body.icon = await uploadToS3({
      file: files.icon[0],
      fileName: `category/icon/${Math.floor(100000 + Math.random() * 900000)}`,
    });
  }
  const result = await categoryService.updateCategory(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category updated successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.deleteCategory(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category deleted successfully',
    data: result,
  });
});

export const categoryController = {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
