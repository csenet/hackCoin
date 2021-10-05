const express = require('express');
const router = express.Router();

// Service
const bot = require('../services/bot');

router.post('/webhook', (req, res) => {
  const replay = bot(req.body, res);
});

router.get('/users', (req, res) => {
  res.json([{name: 'Taro'}, {name: 'Hanako'}]);
});

module.exports = router;
