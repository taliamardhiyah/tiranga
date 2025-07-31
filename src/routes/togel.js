// routes/togel.js
const express = require('express');
const router = express.Router();
const togelController = require('../controllers/togelController');

router.get('/login', togelController.loginPage);
router.post('/login', togelController.login);
router.get('/togel', togelController.togelPage);
router.post('/togel/bet', togelController.bet);

module.exports = router;