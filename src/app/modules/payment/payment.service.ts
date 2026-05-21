import httpStatus from 'http-status';
import { IPayment } from './payment.interface';
import Payment from './payment.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { displayStatus, status } from '../product-requests/requests.constants';
import Requests from '../product-requests/requests.models';
import { paymentStatus } from './payment.constants';
import Orders from '../orders/orders.models';
import mongoose, { get } from 'mongoose';
import { orderDisplayStatus, orderStatus } from '../orders/orders.constants';

const createInitialPaymentIntoDB = async (payload: IPayment) => {
  const { productRequest } = payload;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const isExists = await Requests.findById(productRequest).session(session);

    if (!isExists) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Product Request not found');
    }

    if (isExists?.displayStatus === displayStatus.payment_request) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Already sent initial payment request. Please wait for admin approval',
      );
    }

    const updateRequest = await Requests.findByIdAndUpdate(
      productRequest,
      { displayStatus: displayStatus.payment_request },
      { new: true, session },
    );

    if (!updateRequest) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to receive payment request! Please try again',
      );
    }

    payload['amount'] = isExists?.needToPay;
    payload['paymentPercent'] = isExists?.needToPayPercent;

    const [result] = await Payment.create([payload], { session });

    if (!result) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to create payment request',
      );
    }

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const createSecondPaymentInitIntoDB = async (payload: IPayment) => {
  const { order } = payload;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const isOrderExists = await Orders.findById(order).session(session);

    if (!isOrderExists) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Order not found');
    }

    if (isOrderExists?.displayStatus === orderDisplayStatus.payment_request) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Already sent initial payment request. Please wait for admin approval',
      );
    }

    const updateRequest = await Orders.findByIdAndUpdate(
      order,
      {
        displayStatus: orderDisplayStatus.payment_request,
        status: orderStatus.payment_request,
      },
      { new: true, session },
    );

    if (!updateRequest) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to receive payment request! Please try again',
      );
    }

    const isRequestExists = await Requests.findById(
      isOrderExists?.product,
    ).session(session);

    if (!isRequestExists) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Product Request not found');
    }

    payload['amount'] = isRequestExists?.needToPay;
    payload['paymentPercent'] = isRequestExists?.needToPayPercent;

    const [result] = await Payment.create([payload], { session });

    if (!result) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to create payment request',
      );
    }

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ------------------------------------------ accept payment ------------------------------------------
const acceptPaymentIntoDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const payment = (await Payment.isPaymentExists(id)) as any;

    // statistics validation
    if (!payment || payment?.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
    }

    // already accepted check
    if (payment.status === paymentStatus.accepted) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Payment already accepted');
    }

    const isRequestExists: any = await Requests.isRequestExists(
      payment.productRequest as string,
    );

    const getNeedToPay = isRequestExists?.totalPrice * 0.75;
    const currentPay = getNeedToPay - isRequestExists?.needToPay;

    const updateRequestData = {
      status: status.accepted,
      displayStatus: displayStatus.on_progress,
      needToPay: currentPay,
      needToPayPercent: 75,
      totalPaid: isRequestExists?.needToPay,
    };

    // update request
    const updateProductRequest = await Requests.findByIdAndUpdate(
      payment.productRequest,
      updateRequestData,
      {
        new: true,
        session,
      },
    );

    if (!updateProductRequest) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to update product request',
      );
    }

    // create order
    const order = await Orders.create(
      [
        {
          product: payment.productRequest,
          payment: payment._id,
          user: updateProductRequest.user,
        },
      ],
      { session },
    );

    // update payment
    const result = await Payment.findByIdAndUpdate(
      id,
      {
        order: order[0]._id,
        status: paymentStatus.accepted,
      },
      {
        new: true,
        session,
      },
    );

    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to accept payment');
    }

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    throw error;
  }
};

// ------------------------------------------ reject payment ------------------------------------------
const rejectPaymentIntoDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const payment = (await Payment.isPaymentExists(id)) as any;

    if (!payment || payment?.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
    }

    if (payment.status === paymentStatus.rejected) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Payment already rejected');
    }

    // update request
    const updateRequest = await Requests.findByIdAndUpdate(
      payment.productRequest,
      {
        displayStatus: displayStatus.reject_payment_request,
      },
      {
        new: true,
        session,
      },
    );

    if (!updateRequest) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to update request status',
      );
    }

    // update payment
    const result = await Payment.findByIdAndUpdate(
      id,
      {
        status: paymentStatus.rejected,
      },
      {
        new: true,
        session,
      },
    );

    if (!result) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to reject payment');
    }

    await session.commitTransaction();
    await session.endSession();

    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    throw error;
  }
};

// ------------------------------------------ get all payment ------------------------------------------
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
  createInitialPaymentIntoDB,
  createSecondPaymentInitIntoDB,
  acceptPaymentIntoDB,
  rejectPaymentIntoDB,
  getAllPayment,
  getPaymentById,
  updatePayment,
  deletePayment,
};
