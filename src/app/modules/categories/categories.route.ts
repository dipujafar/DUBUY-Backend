
import { Router } from 'express';
import { categoriesController } from './categories.controller';

const router = Router();

router.post('/', categoriesController.createCategories);
router.patch('/:id', categoriesController.updateCategories);
router.delete('/:id', categoriesController.deleteCategories);
router.get('/:id', categoriesController.getCategoriesById);
router.get('/', categoriesController.getAllCategories);

export const categoriesRoutes = router;