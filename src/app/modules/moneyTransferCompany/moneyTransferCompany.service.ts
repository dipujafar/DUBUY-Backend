import httpStatus from 'http-status';
import { IMoneyTransferCompany } from './moneyTransferCompany.interface';
import MoneyTransferCompany from './moneyTransferCompany.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';

const createMoneyTransferCompany = async (payload: IMoneyTransferCompany) => {
  const result = await MoneyTransferCompany.create(payload);
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to create moneyTransferCompany',
    );
  }
  return result;
};

const getAllMoneyTransferCompany = async (query: Record<string, any>) => {
  query['isDeleted'] = false;
  const { lat, lng, ...restQuery } = query;

  if (lat && lng) {
    // Extract pagination params from restQuery
    const page = parseInt(restQuery.page) || 1;
    const limit = parseInt(restQuery.limit) || 10;
    const skip = (page - 1) * limit;

    const aggregationPipeline: any[] = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: 'distance', // adds distance (in meters) to each result
          spherical: true,
          query: { isDeleted: false }, // filter inside $geoNear
        },
      },
      { $skip: skip },
      { $limit: limit },
    ];

    const data = await MoneyTransferCompany.aggregate(aggregationPipeline);

    // Count total for meta
    const countPipeline: any[] = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: 'distance',
          spherical: true,
          query: { isDeleted: false },
        },
      },
      { $count: 'total' },
    ];
    const countResult = await MoneyTransferCompany.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    const meta = {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    };

    return { data, meta };
  }

  // Normal flow without geo sorting
  const baseQuery = MoneyTransferCompany.find();
  const moneyTransferCompanyModel = new QueryBuilder(baseQuery, restQuery)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await moneyTransferCompanyModel.modelQuery;
  const meta = await moneyTransferCompanyModel.countTotal();
  return { data, meta };
};

const getMoneyTransferCompanyById = async (id: string) => {
  const result = await MoneyTransferCompany.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('MoneyTransferCompany not found!');
  }
  return result;
};

const updateMoneyTransferCompany = async (
  id: string,
  payload: Partial<IMoneyTransferCompany>,
) => {
  const result = await MoneyTransferCompany.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new Error('Failed to update MoneyTransferCompany');
  }
  return result;
};

const deleteMoneyTransferCompany = async (id: string) => {
  const result = await MoneyTransferCompany.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  if (!result) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Failed to delete moneyTransferCompany',
    );
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
