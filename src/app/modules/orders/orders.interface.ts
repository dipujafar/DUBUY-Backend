import { ObjectId, Types } from 'mongoose';
import { Model } from 'mongoose';
import { IRequests } from '../product-requests/requests.interface';
import {
  ORDER_DISPLAY_STATUS,
  orderStatus,
  SHIPPING_STEPS,
} from './orders.constants';

export type ShippingStatusType = (typeof SHIPPING_STEPS)[number];
export type DisplayStatus = (typeof ORDER_DISPLAY_STATUS)[number];

export interface IShippingStep {
  status: ShippingStatusType;
  isComplete: boolean;
  updatedAt?: Date;
}

export interface IOrders {
  product: Types.ObjectId | IRequests;
  payment: ObjectId;
  user: ObjectId;
  shippingStatus: IShippingStep[];
  status: keyof typeof orderStatus;
  displayStatus: DisplayStatus;
  isDeleted: boolean;
}

export interface IOrdersModules extends Model<IOrders> {
  isOrderExist(id: string): Promise<IOrders | null>;
}
