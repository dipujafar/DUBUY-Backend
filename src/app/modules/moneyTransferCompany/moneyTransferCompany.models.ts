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

moneyTransferCompanySchema.index({ location: '2dsphere' });

moneyTransferCompanySchema.pre('find', function (next) {
  this.where({ isDeleted: false });
  next();
});

moneyTransferCompanySchema.pre('findOne', function (next) {
  this.where({ isDeleted: false });
  next();
});

// moneyTransferCompanySchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { isDeleted: false } });
//   next();
// });

// In your schema/plugin file
moneyTransferCompanySchema.pre('aggregate', function () {
  const pipeline = this.pipeline();

  // ✅ Don't inject $match if $geoNear is already the first stage
  // @ts-ignore
  if (pipeline.length > 0 && pipeline[0].$geoNear) return;

  pipeline.unshift({ $match: { isDeleted: false } });
});

const MoneyTransferCompany = model<
  IMoneyTransferCompany,
  IMoneyTransferCompanyModules
>('MoneyTransferCompany', moneyTransferCompanySchema);
export default MoneyTransferCompany;
