const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addFavorite,
  removeFavorite,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post(
  '/',
  protect,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
  ],
  validate,
  createProduct
);

router.put(
  '/:id',
  protect,
  [
    body('title').optional().not().isEmpty().withMessage('Title is required'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
  ],
  validate,
  updateProduct
);

router.delete('/:id', protect, deleteProduct);

router.post('/:id/favorite', protect, addFavorite);
router.delete('/:id/favorite', protect, removeFavorite);

module.exports = router;