
import httpStatus from 'http-status';
import { ICategories } from './categories.interface';
import Categories from './categories.models';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';

const createCategories = async (payload: ICategories) => {
  const result = await Categories.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create categories');
  }
  return result;
};

const getAllCategories = async (query: Record<string, any>) => {
query["isDeleted"] = false;
  const categoriesModel = new QueryBuilder(Categories.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await categoriesModel.modelQuery;
  const meta = await categoriesModel.countTotal();

  return {
    data,
    meta,
  };
};

const getCategoriesById = async (id: string) => {
  const result = await Categories.findById(id);
  if (!result && result?.isDeleted) {
    throw new Error('Categories not found!');
  }
  return result;
};

const updateCategories = async (id: string, payload: Partial<ICategories>) => {
  const result = await Categories.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Categories');
  }
  return result;
};

const deleteCategories = async (id: string) => {
  const result = await Categories.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete categories');
  }
  return result;
};

export const categoriesService = {
  createCategories,
  getAllCategories,
  getCategoriesById,
  updateCategories,
  deleteCategories,
};