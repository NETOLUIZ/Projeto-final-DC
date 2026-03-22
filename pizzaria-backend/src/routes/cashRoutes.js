const express = require('express');
const cashController = require('../controllers/cashController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN', 'ATENDENTE'));

router.get('/current', cashController.getCurrentCash);
router.get('/history', cashController.getCashHistory);
router.post('/open', cashController.openCash);
router.post('/close', cashController.closeCash);
router.post('/entry', cashController.addEntry);
router.post('/exit', cashController.addExit);

module.exports = router;
