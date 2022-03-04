const express = require('express');
const router = express.Router();

const Queue = require('bee-queue');
const queue = new Queue('transfer', {
  redis: {
    host: 'redis',
  },
  isWorker: false
});

// Controller
const bot = require('../controllers/botController')
const Web3 = require('../controllers/web3Contoller')
const {showRanking} = require("../services/cronWorker");
const settings = require("../controllers/settings.json")
const Token = require('../controllers/tokenController')

router.post('/webhook', bot.webhook)

router.get('/ping', (req, res) => {
  res.send("OK!")
});

router.get('/work', async (req, res) => {
  const job = queue.createJob({to: "0x523255e13aDB9F02B148B5C79F9C77A5f02494E8", value: 30});
  await job.save()
  res.json("OK")
})

router.get('/test', async (req, res) => {
  res.json(await Web3.sendToken(settings.address, "0xEF0Dd4aeE97cEBd8A1651D0bd964EfE1E1aA596c", 10))
})

router.get('/getBalance/:address', async (req, res) => {
  const address = req.params.address;
  const balance = await Web3.getBalance(address);
  res.json({balance: balance})
})

router.get('/cron/ranking/:dev', async (req, res) => {
  const isDev = req.params.dev === "dev" ? true : false;
  const apiKey = req.headers['x-api-key']
  if (apiKey != 'a9eb03b0-0d3a-4a40-9d09-0bdc6b560a14') {
    res.status(401).json({message: "Un authorised"})
    return
  }
  showRanking(isDev)
  res.json({message: isDev})
})

router.post('/token/send', Token.sendToken)

module.exports = router;
