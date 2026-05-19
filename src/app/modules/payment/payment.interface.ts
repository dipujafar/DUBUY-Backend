import { Model, ObjectId } from 'mongoose';
import { paymentStatus } from './payment.constants';

export interface IPayment {
  amount: number;
  paymentPercent: number;
  productRequest: ObjectId;
  moneyTransferCompany: ObjectId;
  status: keyof typeof paymentStatus;
  isDeleted: boolean;
}

export type IPaymentModules = Model<IPayment, Record<string, unknown>>;
