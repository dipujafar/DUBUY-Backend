import httpStatus from 'http-status';
import { IRequests } from './requests.interface';
import Requests from './requests.models';
import AppError from '../../error/AppError';
import QueryBuilder from '../../class/builder/QueryBuilder';
import { displayStatus, status } from './requests.constants';
import { User } from '../user/user.models';
import { Types } from 'mongoose';
import { sendNotificationMessage } from '../notification/notification.utils';
import { validateProductLink } from './requests.utils';

const createRequests = async (payload: IRequests) => {
  const isSpam = await validateProductLink(payload.productLink);

  const result = await Requests.create({ ...payload, isSpam });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create requests');
  }

  const admin = await User.GetAdminUser();
  const notificationPayload = {
    message: `A new product request received`,
    description: `A new product request has been received from customer. Please check the details in product requests page or spam folder.`,
    userId: admin?._id?.toString() || '',
    fcmToken: admin.fcmToken,

  };

  await sendNotificationMessage(notificationPayload);

  return result;
};

// ------------------------------------------ update the product for resend quotation ------------------------------------------
const updateRequestsForResendQuotation = async (
  id: string,
  payload: IRequests,
) => {
  const isExists = await Requests.isRequestExists(id);
  if (!isExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product Request not found');
  }

  // @ts-ignore
  if (isExists?.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product Request is deleted');
  }

  payload['status'] = status.quotation;
  payload['displayStatus'] = displayStatus.received_quotation;
  const totalPrice = payload['price'] * payload['quantity'];
  const needToPay = totalPrice * 0.25;
  payload['totalPrice'] = totalPrice;
  payload['needToPay'] = needToPay;
  payload['needToPayPercent'] = 25;

  const result = await Requests.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Requests');
  }

  const user = await User.findById(result?.user);
  const notificationPayload = {
    message: `You have received Quotation`,
    description: `You have received Quotation for product request. Please check the order details page.`,
    userId: user?._id?.toString() || '',
    fcmToken: user?.fcmToken,

  };

  await sendNotificationMessage(notificationPayload);

  return result;
};

// ------------------------------------------ get all requests ------------------------------------------
const getAllRequests = async (query: Record<string, any>) => {
  let userIds: Types.ObjectId[] = [];

  if (query.searchTerm) {
    const matchingUsers = await User.find({
      $or: [
        { name: { $regex: query.searchTerm, $options: 'i' } },
        { email: { $regex: query.searchTerm, $options: 'i' } },
        { phoneNumber: { $regex: query.searchTerm, $options: 'i' } },
        { location: { $regex: query.searchTerm, $options: 'i' } },
      ],
    }).select('_id');

    userIds = matchingUsers.map(u => u._id);
  }

  const requestsModel = new QueryBuilder(
    Requests.find({ isSpam: { $ne: true } }).populate('user'),
    query,
  )
    .searchWithRef(
      ['title', 'productLink'],
      [{ ids: userIds, field: 'user' }],
    )
    .filter()
    .paginate()
    .sort()
    .fields();

  const [data, meta, stats] = await Promise.all([
    requestsModel.modelQuery,
    requestsModel.countTotal(),
    Requests.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const statsMap = stats.reduce(
    (acc, item) => {
      acc[item._id] = item.count;
      return acc;
    },
    {} as Record<string, number>,
  );

  const stateDate = {
    totalRequest: (Object.values(statsMap) as number[]).reduce(
      (a, b) => a + b,
      0,
    ),
    order: statsMap[status.accepted] || 0,
    sendQuotation: statsMap[status.quotation] || 0,
    rejected: statsMap[status.rejected] || 0,
  };

  return {
    stateDate,
    data,
    meta,
  };
};
const getAllSpamRequests = async (query: Record<string, any>) => {
  const results = new QueryBuilder(Requests.find({ isSpam: true }).populate('user'), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await results.modelQuery;
  const meta = await results.countTotal();
  return {
    data,
    meta,
  };

}
// ------------------------------------------ get requests by id ------------------------------------------
const getRequestsById = async (id: string) => {
  const result = await Requests.findById(id);
  if (!result || result?.isDeleted) {
    throw new Error('Requests not found!');
  }
  return result;
};

// ------------------------------------------ get my product requests ------------------------------------------
const getMyProductRequests = async (
  query: Record<string, any>,
  userId: string,
) => {
  query['user'] = userId;
  query['fields'] =
    query['fields'] || 'productLink,displayStatus,createdAt,updatedAt';

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

// ------------------------------------------ get quotation received ------------------------------------------
const getMyReceivedQuotation = async (
  query: Record<string, any>,
  userId: string,
) => {
  query['user'] = userId;
  query['status'] = status.quotation;
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

// ------------------------------------------ update requests ------------------------------------------
const updateRequest = async (id: string, payload: Partial<IRequests>) => {
  const result = await Requests.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new Error('Failed to update Requests');
  }
  return result;
};

// ------------------------------------------ reject requests ------------------------------------------
const rejectRequests = async (id: string) => {
  const isExists = (await Requests.isRequestExists(id)) as any;
  if (!isExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Product Request not found');
  }

  if (isExists?.status !== status.request) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not reject this request in this stage',
    );
  }
  const result = await Requests.findByIdAndUpdate(
    id,
    { status: status.rejected, displayStatus: displayStatus.rejected },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to reject requests');
  }



  const user = await User.findById(result?.user);
  const notificationPayload = {
    message: `Your product request has been rejected`,
    description: `Your product request has been rejected. Please check the details in product requests page.`,
    userId: user?._id?.toString() || '',
    fcmToken: user?.fcmToken,

  };
  await sendNotificationMessage(notificationPayload);


  return result;
};

// ------------------------------------------ verify spam requests ------------------------------------------
const verifySpamRequests = async (id: string) => {
  const result = await Requests.findByIdAndUpdate(
    id,
    { isSpam: false },
    { new: true },
  );
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to verify spam requests');
  }
  return result;
}

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
  getMyReceivedQuotation,
  getMyProductRequests,
  getAllRequests,
  getAllSpamRequests,
  getRequestsById,
  updateRequest,
  rejectRequests,
  deleteRequests,
  verifySpamRequests
};
