import httpStatus from 'http-status';
import { IPayment } from './payment.interface';
import Payment from './payment.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { displayStatus, status } from '../product-requests/requests.constants';
import Requests from '../product-requests/requests.models';
import { paymentStatus } from './payment.constants';
import Orders from '../orders/orders.models';
import mongoose from 'mongoose';
import { orderDisplayStatus, shippingSteps } from '../orders/orders.constants';

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
        'Already sent 75% payment request. Please wait for admin approval',
      );
    }

    const updateRequest = await Orders.findByIdAndUpdate(
      order,
      {
        displayStatus: orderDisplayStatus.payment_request,
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

    const isOrderExists: any = await Orders.isOrderExists(
      payment.order as string,
    );

    if (!isRequestExists && !isOrderExists) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to accept payment');
    }

    if (isRequestExists) {
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
    }

    if (isOrderExists && !isRequestExists) {
      // Mark "Payment 75% Received" shipping step as complete
      await Orders.findByIdAndUpdate(
        payment.order,
        {
          displayStatus: orderDisplayStatus.in_warehouse,
          $set: {
            'shippingStatus.$[step].isComplete': true,
            'shippingStatus.$[step].updatedAt': new Date(),
          },
        },
        {
          arrayFilters: [{ 'step.status': shippingSteps.payment_75_received }],
          new: true,
          session,
        },
      );

      const productRequest: any = await Requests.isRequestExists(
        isOrderExists?.product,
      );

      const getNeedToPay = productRequest?.totalPrice;
      const currentPay = getNeedToPay - productRequest?.needToPay;

      const updateRequestData = {
        needToPay: currentPay,
        needToPayPercent: 100,
        totalPaid: productRequest?.totalPrice * 0.75,
      };

      // update request
      const updateProductRequest = await Requests.findByIdAndUpdate(
        productRequest._id,
        updateRequestData,
        {
          new: true,
          session,
        },
      );

      if (!updateProductRequest) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Failed to update product data',
        );
      }
      const result = await Payment.findByIdAndUpdate(
        id,
        {
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
    }

    await session.commitTransaction();
    await session.endSession();
    return payment;
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

    if (payment.productRequest) {
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
    }
    if (!payment.productRequest && payment.order) {
      // update order
      const updateOrder = await Orders.findByIdAndUpdate(
        payment.order,
        {
          displayStatus: orderDisplayStatus.reject_payment_request,
        },
        {
          new: true,
          session,
        },
      );

      if (!updateOrder) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update order');
      }
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
// payment.service.ts

const getAllPayment = async (query: Record<string, any>) => {
  query['isDeleted'] = false;

  const paymentModel = new QueryBuilder(
    Payment.find()
      .populate({
        path: 'order',
        populate: {
          path: 'product',
        },
      })
      .populate({
        path: 'order',
        populate: {
          path: 'user',
        },
      })
      .populate('productRequest')
      .populate({
        path: 'productRequest',
        populate: {
          path: 'user',
        },
      })
      .populate('moneyTransferCompany'),
    query,
  )
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await paymentModel.modelQuery;
  const meta = await paymentModel.countTotal();

  // ─── Statistics via aggregation pipeline ────────────────────────────
  const stats = await Payment.aggregate([
    { $match: { isDeleted: false } },
    {
      $facet: {
        // Overall totals
        overview: [
          {
            $group: {
              _id: null,
              totalRequests: { $sum: 1 },
              totalAmount: { $sum: '$amount' },
            },
          },
        ],

        // Accepted payments → "revenue" + "funding"
        accepted: [
          { $match: { status: 'accepted' } },
          {
            $group: {
              _id: null,
              acceptedCount: { $sum: 1 },
              totalRevenue: { $sum: '$amount' },
              totalFunding: { $sum: '$amount' }, // same pool; rename if semantics differ
            },
          },
        ],

        // Pending / request payments
        pending: [
          { $match: { status: 'request' } },
          {
            $group: {
              _id: null,
              pendingCount: { $sum: 1 },
              pendingAmount: { $sum: '$amount' },
            },
          },
        ],

        // Rejected payments
        rejected: [
          { $match: { status: 'rejected' } },
          {
            $group: {
              _id: null,
              rejectedCount: { $sum: 1 },
              rejectedAmount: { $sum: '$amount' },
            },
          },
        ],
      },
    },

    // Flatten each facet array to a single object (or sensible default)
    {
      $project: {
        overview: { $ifNull: [{ $arrayElemAt: ['$overview', 0] }, {}] },
        accepted: { $ifNull: [{ $arrayElemAt: ['$accepted', 0] }, {}] },
        pending: { $ifNull: [{ $arrayElemAt: ['$pending', 0] }, {}] },
        rejected: { $ifNull: [{ $arrayElemAt: ['$rejected', 0] }, {}] },
      },
    },
  ]);

  const s = stats[0] ?? {};

  const statistics = {
    totalRequests: {
      count: s.overview?.totalRequests ?? 0,
      amount: s.overview?.totalAmount ?? 0,
    },

    totalRevenue: {
      // accepted
      count: s.accepted?.acceptedCount ?? 0,
      amount: s.accepted?.totalRevenue ?? 0,
    },

    totalFundingMoney: {
      // request (pending)
      count: s.pending?.pendingCount ?? 0,
      amount: s.pending?.pendingAmount ?? 0,
    },

    rejected: {
      count: s.rejected?.rejectedCount ?? 0,
      amount: s.rejected?.rejectedAmount ?? 0,
    },
  };

  return {
    data,
    meta,
    statistics,
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
