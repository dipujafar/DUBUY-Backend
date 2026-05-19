/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { ICategory } from './category.interface';
import Category from './category.models';
import QueryBuilder from '../../class/builder/QueryBuilder';
import AppError from '../../error/AppError';

const createCategory = async (payload: ICategory) => {
  const category = await Category.isExistByName(payload?.name);
  if (category && !category?.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Category already exist');
  }

  const result = await Category.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create category');
  }
  return result;
};

const getAllCategories = async (query: Record<string, any>) => {
  const categoriesModel = new QueryBuilder(Category.find(), query)
    .search(['name'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await categoriesModel.modelQuery;
  const meta = await categoriesModel.countTotal();

  return {
    data: data,
    meta,
  };
};

const getCategoryById = async (id: string) => {
  const result = await Category.findById(id);
  if (!result) {
    throw new Error('Category not found');
  }
  return result;
};

const updateCategory = async (id: string, payload: Partial<ICategory>) => {
  const result = await Category.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update category');
  }
  return result;
};

// const updateCategory = async (id: string, payload: Partial<ICategory>) => {
//   const { websiteLinks, ...remainingData } = payload;

//   const modifiedUpdatedData: Record<string, unknown> = {};

//   // 🔥 Primitive fields (including image & icon)
//   Object.assign(modifiedUpdatedData, remainingData);

//   // 🔥 If updating ONE websiteLinks item
//   if (websiteLinks && websiteLinks._id) {
//     const { _id, ...linkData } = websiteLinks;

//     for (const [key, value] of Object.entries(linkData)) {
//       modifiedUpdatedData[`websiteLinks.$.${key}`] = value;
//     }

//     const result = await Category.findOneAndUpdate(
//       { _id: id, 'websiteLinks._id': websiteLinks._id },
//       { $set: modifiedUpdatedData },
//       { new: true, runValidators: true },
//     );

//     return result;
//   }

//   // 🔥 If no websiteLinks update
//   const result = await Category.findByIdAndUpdate(
//     id,
//     { $set: modifiedUpdatedData },
//     { new: true, runValidators: true },
//   );

//   return result;
// };

const deleteCategory = async (id: string) => {
  const result = await Category.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus?.BAD_REQUEST, 'Failed to delete category');
  }

  return result;
};

export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
