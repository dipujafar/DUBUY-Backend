
import { Model } from 'mongoose';

export interface ICategories {}

export type ICategoriesModules = Model<ICategories, Record<string, unknown>>;