import express from 'express';

import {
  createProduct,
  getProducts,
  getProductItem,
  updateProduct,
  deleteProduct
} from '../controllers/productController.mjs';
import auth from '../middleware/auth.mjs';  // Assuming you want to protect some routes
import upload from '../middleware/upload.mjs';

const router = express.Router();

router.post('/', upload.single('image'), createProduct);

router.get('/', getProducts);

router.get('/:id', getProductItem);

router.delete('/:id', deleteProduct)

router.put('/:id', auth, updateProduct);

export default router;