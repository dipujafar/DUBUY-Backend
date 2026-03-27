import { model, Schema } from 'mongoose';
import {
  IRequests,
  AdditionalNotes,
  RequestModel,
  IArrivedImages,
  IShippingStep,
} from './requests.interface';
import { SHIPPING_STEPS, statusEnum } from './requests.constants';

const additionalNotesSchema = new Schema<AdditionalNotes>({
  productIsFragile: { type: 'boolean', required: false },
  requiresExtraCare: { type: 'boolean', required: false },
  urgentDelivery: { type: 'boolean', required: false },
});

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
    image: { type: 'string', required: true },
    link: { type: 'string', required: true },
    title: { type: 'string', required: true },
    price: { type: 'number', required: true },
    couponCode: { type: 'string', required: false },
    size: { type: 'string', required: true },
    color: { type: 'string', required: true },
    quantity: { type: 'number', required: true },
    additionalNotes: additionalNotesSchema,
    address: { type: 'string', required: true },
    status: {
      type: 'string',
      enum: {
        values: statusEnum,
        message:
          '{VALUE} is not a valid status. Accepted values: pending, accepted, rejected, delivered',
      },
      required: true,
      default: 'pending',
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

//requestsSchema.pre('find', function (next) {
//  //@ts-ignore
//  this.find({ isDeleted: { $ne: true } });
//  next();
//});

//requestsSchema.pre('findOne', function (next) {
//@ts-ignore
//this.find({ isDeleted: { $ne: true } });
// next();
//});

requestsSchema.statics.isRequestsDeleted = async function (id: string) {
  const result = await Requests.findById(id);
  return result?.isDeleted;
};

requestsSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const Requests = model<IRequests, RequestModel>('Requests', requestsSchema);
export default Requests;
