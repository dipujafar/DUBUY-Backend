import httpStatus from 'http-status';
import { IOrders } from './orders.interface';
import Orders from './orders.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { orderStatus } from './orders.constants';

const createOrders = async (payload: IOrders) => {
  const result = await Orders.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create orders');
  }
  return result;
};

const getAllOrders = async (query: Record<string, any>) => {
  const ordersModel = new QueryBuilder(
    Orders.find()
      .populate('product')
      .populate('user')
      .populate({
        path: 'payment',
        populate: {
          path: 'moneyTransferCompany',
        },
      }),
    query,
  )
    .search([])
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
                $in: [
                  orderStatus.on_progress,
                  orderStatus.payment_request,
                  orderStatus.reject_payment_request,
                ],
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

export const ordersService = {
  createOrders,
  getAllOrders,
  getMyOrdersFromDB,
  getOrdersById,
  updateOrders,
  deleteOrders,
};
