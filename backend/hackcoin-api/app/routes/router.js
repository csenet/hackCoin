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

router.post('/webhook', bot.webhook)

router.get('/users', (req, res) => {
  res.json([{name: 'Taro'}, {name: 'Hanako'}]);
});

router.get('/work', async (req, res) => {
  const job = queue.createJob({to: "0x523255e13aDB9F02B148B5C79F9C77A5f02494E8", value: 30});
  await job.save()
  res.json("OK")
})

router.get('/test',async (req, res) => {
  res.json(await Web3.sendToken("0x523255e13aDB9F02B148B5C79F9C77A5f02494E8", 30))
})

router.get('/getBalance/:address', async (req, res) => {
  const address = req.params.address;
  const balance = await Web3.getBalance(address);
  res.json({balance: balance})
})

module.exports = router;
