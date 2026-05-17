
import { model, Schema } from 'mongoose';
import { IOrders, IOrdersModules } from './orders.interface';

const ordersSchema = new Schema<IOrders>(
  {
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  }
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

const Orders = model<IOrders, IOrdersModules>(
  'Orders',
  ordersSchema
);
export default Orders;