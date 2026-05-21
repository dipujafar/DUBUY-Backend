import { model, Schema } from 'mongoose';
import { IOrders, IOrdersModules, IShippingStep } from './orders.interface';
import {
  ORDER_DISPLAY_STATUS,
  orderDisplayStatus,
  SHIPPING_STEPS,
  shippingSteps,
} from './orders.constants';

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
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Requests',
      required: true,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shippingStatus: {
      type: [shippingStepSchema],
      required: true,
      default: () =>
        SHIPPING_STEPS.map(step => ({
          status: step,
          isComplete: step === shippingSteps.payment_receive,
          updatedAt:
            step === shippingSteps.payment_receive ? new Date() : undefined,
        })),
    },
    displayStatus: {
      type: String,
      enum: {
        values: ORDER_DISPLAY_STATUS,
        message: `{VALUE} is not a valid status. Accepted values: ${ORDER_DISPLAY_STATUS.join(', ')}`,
      },
      default: orderDisplayStatus.on_progress,
      required: true,
    },

    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// --------------------------- set virtuals to pass  payment related information in order data ---------------------------
ordersSchema.virtual('needToPay').get(function () {
  if (
    this.product &&
    typeof this.product === 'object' &&
    'needToPay' in this.product
  ) {
    return this.product.needToPay;
  }

  return null;
});

ordersSchema.virtual('needToPayPercent').get(function () {
  if (
    this.product &&
    typeof this.product === 'object' &&
    'needToPayPercent' in this.product
  ) {
    return this.product.needToPayPercent;
  }

  return null;
});

ordersSchema.virtual('totalPaid').get(function () {
  if (
    this.product &&
    typeof this.product === 'object' &&
    'needToPay' in this.product
  ) {
    return this.product.totalPaid;
  }

  return null;
});

ordersSchema.pre('find', function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

ordersSchema.pre('findOne', function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

ordersSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

ordersSchema.statics.isOrderExists = async function (id: string) {
  const order = await this.findById(id);
  return order;
};

const Orders = model<IOrders, IOrdersModules>('Orders', ordersSchema);
export default Orders;
