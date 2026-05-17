
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';  
import { ordersService } from './orders.service';
import sendResponse from '../../utils/sendResponse';
import { storeFile } from '../../utils/fileHelper';
import { uploadToS3 } from '../../utils/s3';

const createOrders = catchAsync(async (req: Request, res: Response) => {
 const result = await ordersService.createOrders(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Orders created successfully',
    data: result,
  });

});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {

 const result = await ordersService.getAllOrders(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All orders fetched successfully',
    data: result,
  });

});

const getOrdersById = catchAsync(async (req: Request, res: Response) => {
 const result = await ordersService.getOrdersById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Orders fetched successfully',
    data: result,
  });

});
const updateOrders = catchAsync(async (req: Request, res: Response) => {
const result = await ordersService.updateOrders(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Orders updated successfully',
    data: result,
  });

});


const deleteOrders = catchAsync(async (req: Request, res: Response) => {
 const result = await ordersService.deleteOrders(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Orders deleted successfully',
    data: result,
  });

});

export const ordersController = {
  createOrders,
  getAllOrders,
  getOrdersById,
  updateOrders,
  deleteOrders,
};