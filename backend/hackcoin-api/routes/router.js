const express = require('express');
const router = express.Router();

// Service
const bot = require('../services/bot');
const send = require('../services/web3/test')

router.post('/webhook', (req, res) => {
  const replay = bot(req.body, res);
});

router.get('/users', (req, res) => {
  res.json([{name: 'Taro'}, {name: 'Hanako'}]);
});

router.get('/test', async (req, res) => {
  const receipt = await send(res);
})

module.exports = router;
