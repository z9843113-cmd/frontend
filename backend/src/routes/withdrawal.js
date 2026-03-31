const express = require('express');
const router = express.Router();
const { auth } = require('../controllers/userController');
const { createWithdrawal, getWithdrawalHistory } = require('../controllers/withdrawalController');

router.post('/', auth, createWithdrawal);
router.get('/history', auth, getWithdrawalHistory);

module.exports = router;
