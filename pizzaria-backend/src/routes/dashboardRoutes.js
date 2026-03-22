const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN', 'ATENDENTE'));

router.get('/summary', dashboardController.getSummary);
router.get('/top-products', dashboardController.getTopProducts);

module.exports = router;
