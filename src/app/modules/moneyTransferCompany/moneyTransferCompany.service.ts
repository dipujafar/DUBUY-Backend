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

  const { lat, lng, maxDistance = 10, ...restQuery } = query; // maxDistance in km

  let baseQuery;

  if (lat && lng) {
    const radiusInRadians = parseFloat(maxDistance) / 6378.1; // convert km → radians

    baseQuery = MoneyTransferCompany.find({
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng), parseFloat(lat)], // [longitude, latitude]
            radiusInRadians,
          ],
        },
      },
    });
  } else {
    baseQuery = MoneyTransferCompany.find();
  }

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
