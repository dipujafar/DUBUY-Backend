import { Model, ObjectId } from 'mongoose';
import { SHIPPING_STEPS } from './requests.constants';

export interface AdditionalNotes {
  productIsFragile: boolean;
  requiresExtraCare: boolean;
  urgentDelivery: boolean;
}

export interface IArrivedImages {
  key: string;
  url: string;
}

export type ShippingStatusType = (typeof SHIPPING_STEPS)[number];

export interface IShippingStep {
  status: ShippingStatusType;
  isComplete: boolean;
  updatedAt?: Date;
}

export interface IRequests {
  user: ObjectId;
  image: string;
  link: string;
  title: string;
  price: number;
  couponCode?: string;
  size: string;
  color: string;
  quantity: number;
  additionalNotes: AdditionalNotes;
  address: string;
  status: 'pending' | 'accepted' | 'rejected' | 'delivered';
  shippingStatus: IShippingStep[];
  displayStatus: ShippingStatusType;
  arrivedImages?: IArrivedImages[];
  isDeleted: boolean;
}

// export type IRequestModules = Model<IRequests, Record<string, unknown>>;
export interface RequestModel extends Model<IRequests> {
  isRequestsDeleted(id: string): Promise<boolean>;
}
