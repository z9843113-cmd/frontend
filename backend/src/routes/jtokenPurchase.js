const express = require('express');
const router = express.Router();
const { auth } = require('../controllers/userController');
const {
  createJTokenPurchase,
  getMyJTokenPurchases,
  startJTokenPayment,
  submitJTokenPayment,
  cancelJTokenPurchase
} = require('../controllers/jtokenPurchaseController');

router.get('/', auth, getMyJTokenPurchases);
router.post('/', auth, createJTokenPurchase);
router.post('/:requestId/start-pay', auth, startJTokenPayment);
router.post('/:requestId/submit-payment', auth, submitJTokenPayment);
router.post('/:requestId/cancel', auth, cancelJTokenPurchase);

module.exports = router;
