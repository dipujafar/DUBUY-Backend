import { model, Schema } from 'mongoose';
import {
  ILocation,
  IMoneyTransferCompany,
  IMoneyTransferCompanyModules,
} from './moneyTransferCompany.interface';

const LocationSchema = new Schema<ILocation>(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },

    coordinates: {
      type: [Number],
      required: true,

      validate: {
        validator: function (value: number[]) {
          return value.length === 2;
        },
        message: 'Coordinates must contain [longitude, latitude]',
      },
    },
  },
  {
    _id: false,
  },
);

const moneyTransferCompanySchema = new Schema<IMoneyTransferCompany>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    officeNumber: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: LocationSchema,
      required: true,
    },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  },
);

moneyTransferCompanySchema.pre('find', function (next) {
  this.where({ isDeleted: false });
  next();
});

moneyTransferCompanySchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: false } });
  next();
});

const MoneyTransferCompany = model<
  IMoneyTransferCompany,
  IMoneyTransferCompanyModules
>('MoneyTransferCompany', moneyTransferCompanySchema);
export default MoneyTransferCompany;
