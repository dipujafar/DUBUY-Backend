import { Model, ObjectId } from 'mongoose';
import { DISPLAY_STATUS, SHIPPING_STEPS, status } from './requests.constants';

export interface IArrivedImages {
  key: string;
  url: string;
}

export type ShippingStatusType = (typeof SHIPPING_STEPS)[number];
export type DisplayStatus = (typeof DISPLAY_STATUS)[number];

export interface IShippingStep {
  status: ShippingStatusType;
  isComplete: boolean;
  updatedAt?: Date;
}

export interface IRequests {
  user: ObjectId;
  image: string;
  productLink: string;
  title: string;
  price: number;
  couponCode?: string;
  size: string;
  color: string;
  quantity: number;
  status: keyof typeof status;
  shippingStatus: IShippingStep[];
  displayStatus: DisplayStatus;
  arrivedImages?: IArrivedImages[];
  isDeleted: boolean;
}

// export type IRequestModules = Model<IRequests, Record<string, unknown>>;
export interface RequestModel extends Model<IRequests> {
  isRequestsDeleted(id: string): Promise<boolean>;
}
