const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getTeam } = require('../controllers/referralController');

router.get('/', auth, getTeam);

module.exports = router;
