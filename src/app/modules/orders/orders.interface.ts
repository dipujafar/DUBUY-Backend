
import { Model } from 'mongoose';

export interface IOrders {}

export type IOrdersModules = Model<IOrders, Record<string, unknown>>;