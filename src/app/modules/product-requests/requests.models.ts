import { model, Schema } from 'mongoose';
import { IRequests, RequestModel, IArrivedImages } from './requests.interface';
import {
  DISPLAY_STATUS,
  displayStatus,
  status,
  statusEnum,
} from './requests.constants';

const arrivedSchema = new Schema<IArrivedImages>({
  key: { type: 'string', required: [true, 'Image key is required'] },
  url: {
    type: 'string',
    required: [true, 'Image URL is required'],
    match: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
  }, // URL validation
});

const requestsSchema = new Schema<IRequests>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: 'string', default: null },
    productLink: { type: 'string', required: true },
    title: { type: 'string', default: null },
    price: { type: 'number', default: null },
    couponCode: { type: 'string', default: null },
    size: { type: 'string', default: null },
    color: { type: 'string', default: null },
    quantity: { type: 'number', default: null },
    totalPrice: { type: 'number', default: null },
    needToPay: { type: 'number', default: null },
    status: {
      type: 'string',
      enum: {
        values: statusEnum,
        message: `{VALUE} is not a valid status. Accepted values: ${statusEnum.join(', ')}`,
      },
      required: true,
      default: status.request,
    },

    displayStatus: {
      type: String,
      enum: {
        values: DISPLAY_STATUS,
        message: `{VALUE} is not a valid status. Accepted values: ${DISPLAY_STATUS.join(', ')}`,
      },
      default: displayStatus.requested,
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

requestsSchema.statics.isRequestExists = async function (id: string) {
  return await Requests.findById(id);
};

const Requests = model<IRequests, RequestModel>('Requests', requestsSchema);
export default Requests;
