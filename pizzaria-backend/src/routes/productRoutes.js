const express = require('express');
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(productController.getAllProducts)
  .post(protect, restrictTo('ADMIN', 'ATENDENTE'), productController.createProduct);

router
  .route('/:id')
  .get(productController.getProduct)
  .put(protect, restrictTo('ADMIN', 'ATENDENTE'), productController.updateProduct)
  .delete(protect, restrictTo('ADMIN', 'ATENDENTE'), productController.deleteProduct);

module.exports = router;
