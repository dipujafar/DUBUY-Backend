import httpStatus from 'http-status';
import { IRequests } from './requests.interface';
import Requests from './requests.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createRequests = async (payload: IRequests) => {
  const result = await Requests.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create requests');
  }
  return result;
};

// ------------------------------------------ update the product for resend quotation ------------------------------------------
const updateRequestsForResendQuotation = async (
  id: string,
  payload: Partial<IRequests>,
) => {
  console.log(payload);
  const result = await Requests.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Requests');
  }
  return result;
};

// ------------------------------------------ get all requests ------------------------------------------
const getAllRequests = async (query: Record<string, any>) => {
  query['isDeleted'] = false;
  const requestsModel = new QueryBuilder(Requests.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await requestsModel.modelQuery;
  const meta = await requestsModel.countTotal();

  return {
    data,
    meta,
  };
};

// ------------------------------------------ get requests by id ------------------------------------------
const getRequestsById = async (id: string) => {
  const result = await Requests.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('Requests not found!');
  }
  return result;
};

// ------------------------------------------ get my order requests ------------------------------------------
const getMyOrderRequests = async (
  query: Record<string, any>,
  userId: string,
) => {
  query['isDeleted'] = false;
  query['user'] = userId;
  const requestsModel = new QueryBuilder(
    Requests.find().populate('user'),
    query,
  )
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await requestsModel.modelQuery;
  const meta = await requestsModel.countTotal();

  return {
    data,
    meta,
  };
};

// ------------------------------------------ update requests ------------------------------------------
const updateRequests = async (id: string, payload: Partial<IRequests>) => {
  const result = await Requests.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Requests');
  }
  return result;
};

// ------------------------------------------ delete requests ------------------------------------------
const deleteRequests = async (id: string) => {
  const isDeleted = await Requests.isRequestsDeleted(id);
  if (isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Requests already deleted');
  }
  const result = await Requests.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete requests');
  }
  return result;
};

export const requestsService = {
  createRequests,
  updateRequestsForResendQuotation,
  getMyOrderRequests,
  getAllRequests,
  getRequestsById,
  updateRequests,
  deleteRequests,
};
