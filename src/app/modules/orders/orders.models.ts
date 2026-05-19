import { model, Schema } from 'mongoose';
import { IOrders, IOrdersModules, IShippingStep } from './orders.interface';
import { SHIPPING_STEPS, shippingSteps } from './orders.constants';

const shippingStepSchema = new Schema<IShippingStep>({
  status: {
    type: String,
    enum: {
      values: SHIPPING_STEPS,
      message: `{VALUE} is not a valid status. Accepted values: ${SHIPPING_STEPS.join(
        ', ',
      )}`,
    },
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

const ordersSchema = new Schema<IOrders>(
  {
    productRequest: {
      type: Schema.Types.ObjectId,
      ref: 'Requests',
      required: true,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    paymentPercent: {
      type: 'number',
      required: true,
      default: 0,
    },
    shippingStatus: {
      type: [shippingStepSchema],
      required: true,
      default: () =>
        SHIPPING_STEPS.map(step => ({
          status: step,
          isComplete: step === shippingSteps.pending,
          updatedAt: step === shippingSteps.pending ? new Date() : undefined,
        })),
    },

    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  },
);

//ordersSchema.pre('find', function (next) {
//  //@ts-ignore
//  this.find({ isDeleted: { $ne: true } });
//  next();
//});

//ordersSchema.pre('findOne', function (next) {
//@ts-ignore
//this.find({ isDeleted: { $ne: true } });
// next();
//});

ordersSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const Orders = model<IOrders, IOrdersModules>('Orders', ordersSchema);
export default Orders;
