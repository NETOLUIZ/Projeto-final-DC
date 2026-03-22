const express = require('express');
const tableController = require('../controllers/tableController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN', 'ATENDENTE'));

router
  .route('/')
  .get(tableController.getAllTables)
  .post(tableController.openTable);

router
  .route('/:id/close')
  .post(tableController.closeTable);

router
  .route('/:id')
  .delete(restrictTo('ADMIN'), tableController.deleteTable);

module.exports = router;
