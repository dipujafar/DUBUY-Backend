import { Model, ObjectId } from 'mongoose';
import { paymentStatus } from './payment.constants';

export interface IPayment {
  amount: number;
  order: ObjectId;
  paymentPercent: number;
  productRequest: ObjectId;
  moneyTransferCompany: ObjectId;
  user: ObjectId;
  status: keyof typeof paymentStatus;
  isDeleted: boolean;
}

// export type IPaymentModules = Model<IPayment, Record<string, unknown>>;

export interface IPaymentModules extends Model<IPayment> {
  isPaymentExists(id: string): Promise<boolean>;
}
