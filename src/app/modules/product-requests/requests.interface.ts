import { Model } from 'mongoose';

export interface AdditionalNotes {
  productIsFragile: boolean;
  requiresExtraCare: boolean;
  urgentDelivery: boolean;
}

export interface IRequests {
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
  isDeleted: boolean;
}

// export type IRequestModules = Model<IRequests, Record<string, unknown>>;
export interface RequestModel extends Model<IRequests> {
  isRequestsDeleted(id: string): Promise<boolean>;
}
