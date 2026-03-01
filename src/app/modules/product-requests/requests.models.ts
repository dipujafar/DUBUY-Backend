import { model, Schema } from 'mongoose';
import { IRequests, AdditionalNotes, RequestModel } from './requests.interface';

const additionalNotesSchema = new Schema<AdditionalNotes>({
  productIsFragile: { type: 'boolean', required: false },
  requiresExtraCare: { type: 'boolean', required: false },
  urgentDelivery: { type: 'boolean', required: false },
});

const requestsSchema = new Schema<IRequests>(
  {
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
        values: ['pending', 'accepted', 'rejected', 'delivered'],
        message:
          '{VALUE} is not a valid status. Accepted values: pending, accepted, rejected, delivered',
      },
      required: true,
      default: 'pending',
    },
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
