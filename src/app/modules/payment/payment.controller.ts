import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { paymentService } from './payment.service';
import sendResponse from '../../utils/sendResponse';

const createPaymentInit = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createInitialPaymentIntoDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payment created successfully',
    data: result,
  });
});

const createSecondPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createSecondPaymentInitIntoDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Payment created successfully',
    data: result,
  });
});

// --------------------------------------------- accept payment ------------------------------------------------
const acceptPayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await paymentService.acceptPaymentIntoDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment accepted successfully and order created',
    data: result,
  });
});

// --------------------------------------------- reject payment ------------------------------------------------
const rejectPayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await paymentService.rejectPaymentIntoDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment rejected successfully',
    data: result,
  });
});

// --------------------------------------------- get all payment ------------------------------------------------

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
  createSecondPayment,
  acceptPayment,
  rejectPayment,
  getAllPayment,
  getPaymentById,
  updatePayment,
  deletePayment,
};
