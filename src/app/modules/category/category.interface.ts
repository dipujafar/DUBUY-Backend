import { Model } from 'mongoose';

export interface IWebsiteLink {
  title: string;
  subTitle: string;
  link: string;
  _id?: string;
}
export interface ICategory {
  _id: string;
  image: string;
  icon?: string;
  name: string;
  description: string;
  websiteLinks: IWebsiteLink[];
  isDeleted: boolean;
}

export interface ICategoryModel
  extends Model<ICategory, Record<string, unknown>> {
  isExistByName(name: string): Promise<ICategory>;
}
