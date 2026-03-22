const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Only ADMIN can manage users
router.use(restrictTo('ADMIN'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
