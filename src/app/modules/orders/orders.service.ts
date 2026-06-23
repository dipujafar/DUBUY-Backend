import httpStatus from 'http-status';
import { IOrders } from './orders.interface';
import Orders from './orders.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import {
  orderDisplayStatus,
  orderStatus,
  shippingSteps,
} from './orders.constants';
import Requests from '../product-requests/requests.models';
import { uploadManyToS3 } from '../../utils/s3';
import { displayStatus, status } from '../product-requests/requests.constants';
import { Types } from 'mongoose';
import { User } from '../user/user.models';
import MoneyTransferCompany from '../moneyTransferCompany/moneyTransferCompany.models';
import Payment from '../payment/payment.models';
import { sendNotificationMessage } from '../notification/notification.utils';

interface UploadedFiles {
  arrivedImages?: Express.Multer.File[];
}

const createOrders = async (payload: IOrders) => {
  const result = await Orders.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create orders');
  }
  return result;
};

const getAllOrders = async (query: Record<string, any>) => {
  let userIds: Types.ObjectId[] = [];
  let productIds: Types.ObjectId[] = [];
  let paymentIds: Types.ObjectId[] = [];

  if (query.searchTerm) {
    const [matchingUsers, matchingProducts, matchingPayments] =
      await Promise.all([
        User.find({
          $or: [
            { name: { $regex: query.searchTerm, $options: 'i' } },
            { email: { $regex: query.searchTerm, $options: 'i' } },
            { phoneNumber: { $regex: query.searchTerm, $options: 'i' } },
            { location: { $regex: query.searchTerm, $options: 'i' } },
          ],
        }).select('_id'),

        Requests.find({
          $or: [
            { productLink: { $regex: query.searchTerm, $options: 'i' } },
            { title: { $regex: query.searchTerm, $options: 'i' } },
            { color: { $regex: query.searchTerm, $options: 'i' } },
            { size: { $regex: query.searchTerm, $options: 'i' } },
            ...(!isNaN(Number(query.searchTerm)) && query.searchTerm !== ''
              ? [{ price: Number(query.searchTerm) }]
              : []),
          ],
        }).select('_id'),

        // Step 1: find matching moneyTransferCompanies
        MoneyTransferCompany.find({
          $or: [
            { name: { $regex: query.searchTerm, $options: 'i' } },
            { address: { $regex: query.searchTerm, $options: 'i' } },
            { officeNumber: { $regex: query.searchTerm, $options: 'i' } },
          ],
        }).select('_id'),
      ]);

    userIds = matchingUsers.map(u => u._id);
    productIds = matchingProducts.map(p => p._id);

    // Step 2: find Payment docs that reference those companies
    const matchingCompanyIds = matchingPayments.map(c => c._id);
    if (matchingCompanyIds.length > 0) {
      const matchingPaymentDocs = await Payment.find({
        moneyTransferCompany: { $in: matchingCompanyIds },
      }).select('_id');
      paymentIds = matchingPaymentDocs.map(p => p._id);
    }
  }
  const ordersModel = new QueryBuilder(
    Orders.find()
      .populate('product')
      .populate('user')
      .populate({
        path: 'payment',
        populate: { path: 'moneyTransferCompany' },
      }),
    query,
  )
    .searchWithRef(
      ['displayStatus'], // local fields on Orders
      [
        { ids: userIds, field: 'user' }, // user ref
        { ids: productIds, field: 'product' }, // product ref
        { ids: paymentIds, field: 'payment' },
      ],
    )
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await ordersModel.modelQuery;
  const meta = await ordersModel.countTotal();

  // ─── Statistics via aggregation pipeline ────────────────────────────
  const stats = await Orders.aggregate([
    { $match: { isDeleted: false } },
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
            },
          },
        ],

        ongoing: [
          {
            $match: {
              status: {
                $in: [orderStatus.on_progress],
              },
            },
          },
          {
            $group: {
              _id: null,
              ongoingCount: { $sum: 1 },
            },
          },
        ],

        completed: [
          { $match: { status: orderStatus.completed } },
          {
            $group: {
              _id: null,
              completedCount: { $sum: 1 },
            },
          },
        ],

        rejected: [
          { $match: { status: orderStatus.canceled } },
          {
            $group: {
              _id: null,
              rejectedCount: { $sum: 1 },
            },
          },
        ],
      },
    },
    {
      $project: {
        overview: { $ifNull: [{ $arrayElemAt: ['$overview', 0] }, {}] },
        ongoing: { $ifNull: [{ $arrayElemAt: ['$ongoing', 0] }, {}] },
        completed: { $ifNull: [{ $arrayElemAt: ['$completed', 0] }, {}] },
        rejected: { $ifNull: [{ $arrayElemAt: ['$rejected', 0] }, {}] },
      },
    },
  ]);

  const s = stats[0] ?? {};

  const statistics = {
    totalOrders: s.overview?.totalOrders ?? 0,
    ongoingOrders: s.ongoing?.ongoingCount ?? 0,
    completedOrders: s.completed?.completedCount ?? 0,
    rejectedOrders: s.rejected?.rejectedCount ?? 0,
  };

  return {
    data,
    meta,
    statistics,
  };
};
const getMyOrdersFromDB = async (
  query: Record<string, any>,
  userId: string,
) => {
  query['isDeleted'] = false;
  query['user'] = userId;
  const ordersModel = new QueryBuilder(Orders.find().populate('product'), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await ordersModel.modelQuery;
  const meta = await ordersModel.countTotal();

  return {
    data,
    meta,
  };
};

const getOrdersById = async (id: string) => {
  const result = await Orders.findById(id).populate('product');
  if (!result || result?.isDeleted) {
    throw new Error('Orders not found!');
  }
  return result;
};

const updateOrders = async (id: string, payload: Partial<IOrders>) => {
  const result = await Orders.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Orders');
  }
  return result;
};

const deleteOrders = async (id: string) => {
  const result = await Orders.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete orders');
  }
  return result;
};

//  ------------------------------------------- update orders shipping -------------------------------------------

const updateShippingStatus = async (
  orderId: string,
  shippingStatusId: string,
  files: any,
) => {
  let notificationMessage: string = '';
  let notificationDescription: string = '';

  // ── 1. Find the order ──────────────────────────────────────────
  const order = await Orders.findById(orderId);
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, 'Order not found');
  }

  // ── 2. Find the shipping step inside the order ─────────────────
  const stepIndex = order.shippingStatus.findIndex(
    (s: any) => s._id.toString() === shippingStatusId,
  );

  if (stepIndex === -1) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shipping step not found');
  }

  const step = order.shippingStatus[stepIndex];

  // ── 3. Guard: Payment 75% Received cannot be set manually ──────
  if (step.status === shippingSteps.payment_75_received) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This step is updated automatically once payment is received and accepted. You cannot change it manually.',
    );
  }

  // ── 4. Already complete? ───────────────────────────────────────
  if (step.isComplete) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This shipping step is already marked as complete',
    );
  }

  // ── 5. Handle each step ────────────────────────────────────────
  switch (step.status) {
    // ── Purchased in UAE ────────────────────────────────────────
    case shippingSteps.purchased_in_UAE: {
      order.shippingStatus[stepIndex].isComplete = true;
      order.shippingStatus[stepIndex].updatedAt = new Date();
      order.displayStatus = orderDisplayStatus.in_uae_warehouse;
      notificationMessage = 'Item has been purchased in UAE';
      notificationDescription = 'Your order item has been purchased in UAE, please check your order details.';
      break;
    }

    // ── In Warehouse (Dubai) ────────────────────────────────────
    case shippingSteps.in_dubai_warehouse: {
      order.shippingStatus[stepIndex].isComplete = true;
      order.shippingStatus[stepIndex].updatedAt = new Date();
      order.displayStatus = orderDisplayStatus.in_warehouse;

      notificationMessage = 'Item has been shipped to dubai warehouse';
      notificationDescription = 'Your order item has been shipped to dubai warehouse, please check your order details.';
      break;
    }

    // ── Shipped to Libya ────────────────────────────────────────
    case shippingSteps.shipped_to_libya: {
      order.shippingStatus[stepIndex].isComplete = true;
      order.shippingStatus[stepIndex].updatedAt = new Date();
      order.displayStatus = orderDisplayStatus.in_transit;

      notificationMessage = 'Item has been shipped to Libya';
      notificationDescription = 'Your order item has been shipped to Libya, please check your order details.';
      break;
    }

    // ── In Libya Warehouse ──────────────────────────────────────
    case shippingSteps.in_libya_warehouse: {
      order.shippingStatus[stepIndex].isComplete = true;
      order.shippingStatus[stepIndex].updatedAt = new Date();
      order.displayStatus = orderDisplayStatus.in_warehouse;

      notificationMessage = 'Item has been shipped to Libya warehouse';
      notificationDescription = 'Your order item has been shipped to Libya warehouse, please check your order details.';
      break;
    }

    // ── Arrived Item Image ──────────────────────────────────────
    case shippingSteps.arrived_item_image: {
      const uploadedFiles = files as UploadedFiles;

      if (uploadedFiles?.arrivedImages?.length) {
        // Find the linked product request
        const productRequest = await Requests.findById(order.product);
        if (!productRequest) {
          throw new AppError(
            httpStatus.NOT_FOUND,
            'Linked product request not found',
          );
        }

        // Upload images to S3
        const imgsArray = uploadedFiles.arrivedImages.map(file => ({
          file,
          path: `images/arrived`,
        }));

        const uploadedImages = await uploadManyToS3(imgsArray);

        // Push into arrivedImages on the product request
        await Requests.findByIdAndUpdate(productRequest._id, {
          $push: { arrivedImages: { $each: uploadedImages } },
        });

        notificationMessage = 'Received the arrived item images';
        notificationDescription = `You received the arrived item images, please check order details.`;
      } else {
        notificationMessage = ' ';
        notificationDescription = ' ';
      }

      order.shippingStatus[stepIndex].isComplete = true;
      order.shippingStatus[stepIndex].updatedAt = new Date();
      break;
    }

    // ── Ready To Collect ────────────────────────────────────────
    case shippingSteps.ready_to_collect: {
      order.shippingStatus[stepIndex].isComplete = true;
      order.shippingStatus[stepIndex].updatedAt = new Date();
      order.displayStatus = orderDisplayStatus.ready_to_collect;
      notificationMessage = 'Item is ready to collect';
      notificationDescription = `Your order is ready to collect, please contact with business team.`;
      break;
    }

    // ── Completed ───────────────────────────────────────────────
    case shippingSteps.completed: {
      order.shippingStatus[stepIndex].isComplete = true;
      order.shippingStatus[stepIndex].updatedAt = new Date();

      // Mark order as completed
      order.status = orderStatus.completed as any;
      order.displayStatus = orderDisplayStatus.completed;
      notificationMessage = 'Order completed';
      notificationDescription = `Your order is completed successfully. Thank you for your order.`;

      // Mark the linked product request as completed
      const productRequest = await Requests.findById(order.product);
      if (!productRequest) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Linked product request not found',
        );
      }

      await Requests.findByIdAndUpdate(productRequest._id, {
        displayStatus: displayStatus.completed,
        status: status.completed,
        // If your requests schema has a `status` field with a completed value,
        // update it here too — e.g.: status: status.completed
      });

      break;
    }

    // ── Fallback (unknown / unhandled step) ─────────────────────
    default: {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `No handler defined for shipping step: ${step.status}`,
      );
    }
  }

  // ── 6. Persist the order ───────────────────────────────────────
  const updatedOrder = await order.save();

  const user = await User.findById(order?.user)

  const notificationPayload = {
    message: notificationMessage,
    description: notificationDescription,
    userId: user?._id?.toString()!,
    fcmToken: user?.fcmToken
  };

  await sendNotificationMessage(notificationPayload);

  return updatedOrder;
};

export const ordersService = {
  createOrders,
  getAllOrders,
  getMyOrdersFromDB,
  getOrdersById,
  updateOrders,
  deleteOrders,
  updateShippingStatus,
};
