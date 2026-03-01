
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';  
import { categoriesService } from './categories.service';
import sendResponse from '../../utils/sendResponse';
import { storeFile } from '../../utils/fileHelper';
import { uploadToS3 } from '../../utils/s3';

const createCategories = catchAsync(async (req: Request, res: Response) => {
 const result = await categoriesService.createCategories(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Categories created successfully',
    data: result,
  });

});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {

 const result = await categoriesService.getAllCategories(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All categories fetched successfully',
    data: result,
  });

});

const getCategoriesById = catchAsync(async (req: Request, res: Response) => {
 const result = await categoriesService.getCategoriesById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Categories fetched successfully',
    data: result,
  });

});
const updateCategories = catchAsync(async (req: Request, res: Response) => {
const result = await categoriesService.updateCategories(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Categories updated successfully',
    data: result,
  });

});


const deleteCategories = catchAsync(async (req: Request, res: Response) => {
 const result = await categoriesService.deleteCategories(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Categories deleted successfully',
    data: result,
  });

});

export const categoriesController = {
  createCategories,
  getAllCategories,
  getCategoriesById,
  updateCategories,
  deleteCategories,
};