const express = require('express');
const router = express.Router();
const { auth } = require('../controllers/userController');
const { createDeposit, getDepositHistory } = require('../controllers/depositController');

router.post('/', auth, createDeposit);
router.get('/history', auth, getDepositHistory);

module.exports = router;
