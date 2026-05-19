import httpStatus from 'http-status';
import { IPayment } from './payment.interface';
import Payment from './payment.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { displayStatus, status } from '../product-requests/requests.constants';
import Requests from '../product-requests/requests.models';

const createPaymentInitIntoDB = async (payload: IPayment) => {
  const { productRequest } = payload;

  const isExists: any = await Requests.isRequestExists(productRequest as any);

  if (!isExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product Request not found');
  }

  if (isExists?.status === status.payment) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Already send initial payment request. Please wait for admin approval',
    );
  }

  const updateProductRequestData = {
    status: status.payment,
    displayStatus: displayStatus.payment_request,
  };
  const updateRequest = await Requests.findByIdAndUpdate(
    productRequest,
    updateProductRequestData,
    { new: true },
  );

  if (!updateRequest) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed receive payment request! Please try again',
    );
  }

  const result = await Payment.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create payment');
  }
  return result;
};

const getAllPayment = async (query: Record<string, any>) => {
  query['isDeleted'] = false;
  const paymentModel = new QueryBuilder(Payment.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await paymentModel.modelQuery;
  const meta = await paymentModel.countTotal();

  return {
    data,
    meta,
  };
};

const getPaymentById = async (id: string) => {
  const result = await Payment.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('Payment not found!');
  }
  return result;
};

const updatePayment = async (id: string, payload: Partial<IPayment>) => {
  const result = await Payment.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Payment');
  }
  return result;
};

const deletePayment = async (id: string) => {
  const result = await Payment.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete payment');
  }
  return result;
};

export const paymentService = {
  createPaymentInitIntoDB,
  getAllPayment,
  getPaymentById,
  updatePayment,
  deletePayment,
};
