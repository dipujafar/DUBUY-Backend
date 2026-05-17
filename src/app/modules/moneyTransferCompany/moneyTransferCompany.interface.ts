import { Model } from 'mongoose';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface IMoneyTransferCompany {
  name: string;
  officeNumber: string;
  address: string;
  location: ILocation;
  isDeleted: boolean;
}

export type IMoneyTransferCompanyModules = Model<
  IMoneyTransferCompany,
  Record<string, unknown>
>;
