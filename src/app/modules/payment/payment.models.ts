import { model, Schema } from 'mongoose';
import { IPayment, IPaymentModules } from './payment.interface';
import { paymentStatus, paymentStatusEnum } from './payment.constants';

const paymentSchema = new Schema<IPayment>(
  {
    amount: { type: 'number', required: true },
    paymentPercent: { type: 'number', required: true },
    productRequest: {
      type: Schema.Types.ObjectId,
      ref: 'Requests',
      required: true,
    },
    moneyTransferCompany: {
      type: Schema.Types.ObjectId,
      ref: 'MoneyTransferCompany',
      required: true,
    },
    status: {
      type: 'string',
      enum: {
        values: paymentStatusEnum,
        message: `{VALUE} is not a valid status. Accepted values: ${paymentStatusEnum.join(
          ', ',
        )}`,
      },
      required: true,
      default: paymentStatus.request as 'request',
    },
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  },
);

//paymentSchema.pre('find', function (next) {
//  //@ts-ignore
//  this.find({ isDeleted: { $ne: true } });
//  next();
//});

//paymentSchema.pre('findOne', function (next) {
//@ts-ignore
//this.find({ isDeleted: { $ne: true } });
// next();
//});

paymentSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const Payment = model<IPayment, IPaymentModules>('Payment', paymentSchema);
export default Payment;
