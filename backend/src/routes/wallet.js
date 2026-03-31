const express = require('express');
const router = express.Router();
const { auth } = require('../controllers/userController');
const { getWallet, trade, withdrawReferralEarnings } = require('../controllers/walletController');

router.get('/', auth, getWallet);
router.post('/trade', auth, trade);
router.post('/withdraw-referral', auth, withdrawReferralEarnings);

module.exports = router;
