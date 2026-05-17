import { model, Schema } from 'mongoose';
import {
  IRequests,
  RequestModel,
  IArrivedImages,
  IShippingStep,
} from './requests.interface';
import { SHIPPING_STEPS, statusEnum } from './requests.constants';

const arrivedSchema = new Schema<IArrivedImages>({
  key: { type: 'string', required: [true, 'Image key is required'] },
  url: {
    type: 'string',
    required: [true, 'Image URL is required'],
    match: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
  }, // URL validation
});

const shippingStepSchema = new Schema<IShippingStep>({
  status: {
    type: String,
    enum: SHIPPING_STEPS,
    required: true,
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
  },
});

const requestsSchema = new Schema<IRequests>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: 'string', required: true, default: null },
    productLink: { type: 'string', required: true },
    title: { type: 'string', required: true, default: null },
    price: { type: 'number', required: true, default: null },
    couponCode: { type: 'string', required: false, default: null },
    size: { type: 'string', required: true, default: null },
    color: { type: 'string', required: true, default: null },
    quantity: { type: 'number', required: true, default: null },
    address: { type: 'string', required: true, default: null },
    status: {
      type: 'string',
      enum: {
        values: statusEnum,
        message:
          '{VALUE} is not a valid status. Accepted values: pending, accepted, rejected, delivered',
      },
      required: true,
      default: 'request',
    },
    shippingStatus: {
      type: [shippingStepSchema],
      required: true,
      default: () =>
        SHIPPING_STEPS.map(step => ({
          status: step,
          isComplete: step === 'pending',
          updatedAt: step === 'pending' ? new Date() : undefined,
        })),
    },

    displayStatus: {
      type: String,
      enum: SHIPPING_STEPS,
      default: 'pending',
      required: true,
    },
    arrivedImages: [arrivedSchema],
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  },
);

requestsSchema.pre('find', function (next) {
  this.where({ isDeleted: false });
  next();
});

requestsSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: false } });
  next();
});

requestsSchema.statics.isRequestsDeleted = async function (id: string) {
  const result = await Requests.findById(id);
  return result?.isDeleted;
};

const Requests = model<IRequests, RequestModel>('Requests', requestsSchema);
export default Requests;
