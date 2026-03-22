const express = require('express');
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(protect, restrictTo('ADMIN', 'ATENDENTE'), categoryController.createCategory);

router
  .route('/:id')
  .put(protect, restrictTo('ADMIN', 'ATENDENTE'), categoryController.updateCategory)
  .delete(protect, restrictTo('ADMIN', 'ATENDENTE'), categoryController.deleteCategory);

module.exports = router;
