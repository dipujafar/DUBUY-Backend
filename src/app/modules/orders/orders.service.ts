import httpStatus from 'http-status';
import { IOrders } from './orders.interface';
import Orders from './orders.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createOrders = async (payload: IOrders) => {
  const result = await Orders.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create orders');
  }
  return result;
};

const getAllOrders = async (query: Record<string, any>) => {
  query['isDeleted'] = false;
  const ordersModel = new QueryBuilder(Orders.find(), query)
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
const getMyOrdersFromDB = async (
  query: Record<string, any>,
  userId: string,
) => {
  query['isDeleted'] = false;
  query['user'] = userId;
  const ordersModel = new QueryBuilder(
    Orders.find().populate('product'),
    query,
  )
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
