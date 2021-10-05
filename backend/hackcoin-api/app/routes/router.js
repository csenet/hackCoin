const express = require('express');
const router = express.Router();

// Controller
const bot = require('../controllers/botController')

router.post('/webhook', bot.webhook)

router.get('/users', (req, res) => {
  res.json([{name: 'Taro'}, {name: 'Hanako'}]);
});

module.exports = router;
