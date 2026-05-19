import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { paymentService } from './payment.service';
import sendResponse from '../../utils/sendResponse';

const createPaymentInit = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createPaymentInitIntoDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payment created successfully',
    data: result,
  });
});


const getAllPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getAllPayment(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All payment fetched successfully',
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getPaymentById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment fetched successfully',
    data: result,
  });
});
const updatePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.updatePayment(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment updated successfully',
    data: result,
  });
});

const deletePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.deletePayment(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment deleted successfully',
    data: result,
  });
});

export const paymentController = {
  createPaymentInit,
  getAllPayment,
  getPaymentById,
  updatePayment,
  deletePayment,
};
