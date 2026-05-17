
import httpStatus from 'http-status';
import { IMoneyTransferCompany } from './moneyTransferCompany.interface';
import MoneyTransferCompany from './moneyTransferCompany.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createMoneyTransferCompany = async (payload: IMoneyTransferCompany) => {
  const result = await MoneyTransferCompany.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create moneyTransferCompany');
  }
  return result;
};

const getAllMoneyTransferCompany = async (query: Record<string, any>) => {
query["isDeleted"] = false;
  const moneyTransferCompanyModel = new QueryBuilder(MoneyTransferCompany.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await moneyTransferCompanyModel.modelQuery;
  const meta = await moneyTransferCompanyModel.countTotal();

  return {
    data,
    meta,
  };
};

const getMoneyTransferCompanyById = async (id: string) => {
  const result = await MoneyTransferCompany.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('MoneyTransferCompany not found!');
  }
  return result;
};

const updateMoneyTransferCompany = async (id: string, payload: Partial<IMoneyTransferCompany>) => {
  const result = await MoneyTransferCompany.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update MoneyTransferCompany');
  }
  return result;
};

const deleteMoneyTransferCompany = async (id: string) => {
  const result = await MoneyTransferCompany.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete moneyTransferCompany');
  }
  return result;
};

export const moneyTransferCompanyService = {
  createMoneyTransferCompany,
  getAllMoneyTransferCompany,
  getMoneyTransferCompanyById,
  updateMoneyTransferCompany,
  deleteMoneyTransferCompany,
};