const express = require('express');
const driverController = require('../controllers/driverController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(driverController.getAllDrivers)
  .post(restrictTo('ADMIN', 'ATENDENTE'), driverController.createDriver);

router
  .route('/:id')
  .put(restrictTo('ADMIN', 'ATENDENTE'), driverController.updateDriver)
  .delete(restrictTo('ADMIN'), driverController.deleteDriver);

module.exports = router;
