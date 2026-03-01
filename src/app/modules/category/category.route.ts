import { Router } from 'express';
import { categoryController } from './category.controller';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constants';
import parseData from '../../middleware/parseData';
import multer, { memoryStorage } from 'multer';
import validateRequest from '../../middleware/validateRequest';
import { categoryValidation } from './category.validation';
// import fileUpload from '../../middleware/fileUpload';
// const upload = fileUpload('./public/uploads/categories');

const router = Router();
const storage = memoryStorage();
const upload = multer({ storage });

router.post(
  '/',
  auth(USER_ROLE.admin),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
  ]),
  parseData(),
  validateRequest(categoryValidation.createCategorySchema),
  categoryController.createCategory,
);

router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 },
  ]),
  parseData(),
  categoryController.updateCategory,
);

router.delete('/:id', auth(USER_ROLE.admin), categoryController.deleteCategory);

router.get('/:id', categoryController.getCategoryById);
router.get('/', categoryController.getAllCategory);

export const categoryRoutes = router;
