const Queue = require('bee-queue');
const queue = new Queue('transfer', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  },
  isWorker: true
})
const settings = require('../controllers/settings.json')

const Web3 = require('../controllers/web3Contoller')

queue.process(async function (job, done) {
  console.log(`Processing job ${job.id}`)
  const txHash = await Web3.sendToken(settings.address, job.data.to, job.data.value)
  console.log(`Job finished ${job.id}`)
  console.log(txHash.transactionHash)
  return done(null, txHash.transactionHash)
});


