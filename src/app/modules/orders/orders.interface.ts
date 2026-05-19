import { ObjectId } from 'mongoose';
import { Model } from 'mongoose';
import { DISPLAY_STATUS, SHIPPING_STEPS } from './orders.constants';

export type ShippingStatusType = (typeof SHIPPING_STEPS)[number];
export type DisplayStatus = (typeof DISPLAY_STATUS)[number];

export interface IShippingStep {
  status: ShippingStatusType;
  isComplete: boolean;
  updatedAt?: Date;
}

export interface IOrders {
  productRequest: ObjectId;
  payment: ObjectId;
  paymentPercent: number;
  shippingStatus: IShippingStep[];
  displayStatus: DisplayStatus;
  isDeleted: boolean;
}

export type IOrdersModules = Model<IOrders, Record<string, unknown>>;
