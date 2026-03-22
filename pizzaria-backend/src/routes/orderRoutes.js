const express = require('express');
const orderController = require('../controllers/orderController');
const printController = require('../controllers/printController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

// Both customers and attendants might create orders, for simplicity we allow if protected
router.use(protect);

router
  .route('/')
  .get(orderController.getAllOrders)
  .post(orderController.createOrder);

router
  .route('/:id')
  .get(orderController.getOrder);

router.patch('/:id/status', restrictTo('ADMIN', 'ATENDENTE', 'COZINHA'), orderController.updateOrderStatus);
router.patch('/:id/assign-driver', restrictTo('ADMIN', 'ATENDENTE'), orderController.assignDriver);
router.patch('/:id/cancel', restrictTo('ADMIN', 'ATENDENTE'), orderController.cancelOrder);

// The print endpoint will be handled next
router.get('/:id/print', restrictTo('ADMIN', 'ATENDENTE'), printController.printOrder);

module.exports = router;
