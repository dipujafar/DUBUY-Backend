import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { requestsService } from './requests.service';
import sendResponse from '../../utils/sendResponse';
import { uploadToS3 } from '../../utils/s3';

const createRequests = catchAsync(async (req: Request, res: Response) => {
  req.body.user = req.user.userId;
  if (req.file) {
    req.body.image = await uploadToS3({
      file: req.file,
      fileName: `product/image/${Math.floor(100000 + Math.random() * 900000)}`,
    });
  }

  const result = await requestsService.createRequests(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Requests sent successfully',
    data: result,
  });
});

const getAllRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await requestsService.getAllRequests(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All product requests fetched successfully',
    data: result,
  });
});

const getRequestsById = catchAsync(async (req: Request, res: Response) => {
  const result = await requestsService.getRequestsById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: ' Requests fetched successfully',
    data: result,
  });
});

const getMyOderRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await requestsService.getMyOrderRequests(
    req.query,
    req.user.userId,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My product order requests fetched successfully',
    data: result,
  });
});

const updateRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await requestsService.updateRequests(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Requests updated successfully',
    data: result,
  });
});

const deleteRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await requestsService.deleteRequests(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Requests deleted successfully',
    data: result,
  });
});

export const requestsController = {
  createRequests,
  getAllRequests,
  getRequestsById,
  getMyOderRequests,
  updateRequests,
  deleteRequests,
};
