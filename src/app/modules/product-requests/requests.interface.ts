import { Model } from 'mongoose';

export interface AdditionalNotes {
  productIsFragile: boolean;
  requiresExtraCare: boolean;
  urgentDelivery: boolean;
}

export interface IArrivedImages {
  key: string;
  url: string;
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
  shippingStatus:
    | 'pending'
    | 'payment_receive'
    | 'purchased_in_UAE'
    | 'in_warehouse'
    | 'shipped_to_libya'
    | 'in_warehouse'
    | 'arrived_item_image'
    | 'ready_to_collect'
    | 'delivered';
  arrivedImages?: IArrivedImages[];
  isDeleted: boolean;
}

// export type IRequestModules = Model<IRequests, Record<string, unknown>>;
export interface RequestModel extends Model<IRequests> {
  isRequestsDeleted(id: string): Promise<boolean>;
}
