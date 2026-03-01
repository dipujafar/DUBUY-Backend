
import { model, Schema } from 'mongoose';
import { ICategories, ICategoriesModules } from './categories.interface';

const categoriesSchema = new Schema<ICategories>(
  {
    isDeleted: { type: 'boolean', default: false },
  },
  {
    timestamps: true,
  }
);

//categoriesSchema.pre('find', function (next) {
//  //@ts-ignore
//  this.find({ isDeleted: { $ne: true } });
//  next();
//});

//categoriesSchema.pre('findOne', function (next) {
  //@ts-ignore
  //this.find({ isDeleted: { $ne: true } });
 // next();
//});

categoriesSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const Categories = model<ICategories, ICategoriesModules>(
  'Categories',
  categoriesSchema
);
export default Categories;