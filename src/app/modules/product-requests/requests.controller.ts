import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { requestsService } from './requests.service';
import sendResponse from '../../utils/sendResponse';
import { uploadToS3 } from '../../utils/s3';

// --------------------------------------------- create product request ------------------------------------------------
const createRequests = catchAsync(async (req: Request, res: Response) => {
  req.body.user = req.user.userId;
  const result = await requestsService.createRequests(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Requests sent successfully',
    data: {
      _id: result?._id,
      productLink: result?.productLink,
    },
  });
});

// --------------------------------------------- update product request for resend quotation ------------------------------------------------

const updateRequestForResendQuotation = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (req.file) {
      req.body.image = await uploadToS3({
        file: req.file,
        fileName: `product/image/${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }

    const result = await requestsService.updateRequestsForResendQuotation(
      id,
      req.body,
    );
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Send quotation successfully for this request',
      data: result,
    });
  },
);

// --------------------------------------------- get all product requests ------------------------------------------------
const getAllRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await requestsService.getAllRequests(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All product requests fetched successfully',
    data: result,
  });
});

const getAllSpamRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await requestsService.getAllSpamRequests(req.query);
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

// --------------------------------------------- get my product requests ------------------------------------------------
const getMyProductRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await requestsService.getMyProductRequests(
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
// --------------------------------------------- get my received quotations ------------------------------------------------
const getMyReceivedQuotations = catchAsync(
  async (req: Request, res: Response) => {
    const result = await requestsService.getMyReceivedQuotation(
      req.query,
      req.user.userId,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'My product order requests fetched successfully',
      data: result,
    });
  },
);

// --------------------------------------------- update product request ------------------------------------------------
const updateRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await requestsService.updateRequest(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Requests updated successfully',
    data: result,
  });
});

// --------------------------------------------- reject product request ------------------------------------------------
const rejectRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await requestsService.rejectRequests(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Requests rejected successfully',
    data: result,
  });
});

// --------------------------------------------- verify spam product request ------------------------------------------------
const verifySpamRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await requestsService.verifySpamRequests(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Requests verified successfully',
    data: result,
  });
});

// --------------------------------------------- delete product request ------------------------------------------------
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
  updateRequestForResendQuotation,
  getMyReceivedQuotations,
  getAllRequests,
  getAllSpamRequests,
  verifySpamRequests,
  getRequestsById,
  getMyProductRequests,
  updateRequests,
  rejectRequests,
  deleteRequests,
};
