import { Model, ObjectId } from 'mongoose';
import { DISPLAY_STATUS, status } from './requests.constants';

export interface IArrivedImages {
  key: string;
  url: string;
}

export type DisplayStatus = (typeof DISPLAY_STATUS)[number];

export interface IRequests {
  user: ObjectId;
  image: string;
  productLink: string;
  title: string;
  price: number;
  totalPrice: number;
  couponCode?: string;
  size: string;
  color: string;
  quantity: number;
  needToPay: number;
  needToPayPercent: number;
  totalPaid: number;
  status: keyof typeof status;
  displayStatus: DisplayStatus;
  arrivedImages?: IArrivedImages[];
  isDeleted: boolean;
}

// export type IRequestModules = Model<IRequests, Record<string, unknown>>;
export interface RequestModel extends Model<IRequests> {
  isRequestsDeleted(id: string): Promise<boolean>;
  isRequestExists(id: string): Promise<boolean>;
}
