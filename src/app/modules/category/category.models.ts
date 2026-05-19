import { model, Schema } from 'mongoose';
import { ICategory, ICategoryModel, IWebsiteLink } from './category.interface';

const websiteLinkSchema = new Schema<IWebsiteLink>({
  title: {
    type: String,
  },
  subTitle: {
    type: String,
  },
  link: {
    type: String,
  },
});

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    icon: {
      type: String,
      required: false,
    },
    description: {
      type: String,
    },
    websiteLinks: {
      type: [websiteLinkSchema],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.statics.isExistByName = async function (name: string) {
  return await Category.findOne({ name });
};

categorySchema.pre('find', function (next) {
  this.where({ isDeleted: false });
  next();
});

categorySchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: false } });
  next();
});

const Category = model<ICategory, ICategoryModel>('Categories', categorySchema);
export default Category;
