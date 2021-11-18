const WebSocket = require('ws')

const db = require('../controllers/dbController');

const Queue = require('bee-queue');
const axios = require("axios");

const queue = new Queue('transfer', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  },
  isWorker: false
});

const client_id = process.env.TYPETALK_CLIENT_ID
const client_secret = process.env.TYPETALK_CLIENT_SECRET

if (!(client_id && client_secret)) {
  console.log("You should set environments with TYPETALK_CLIENT_ID and TYPETALK_CLIENT_SECRET")
  process.exit(1);
}


async function connect() {
  let access_token = await issue_access_token()
  let ws = new WebSocket("wss://message.typetalk.com/api/v1/streaming", {
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  });
  ws.on('open', function () {
    console.log('connected streaming server');
  }).on('close', async function () {
    console.log('disconnected streaming server');
    await connect();
  }).on('message', async function (data, flags) {
    data = JSON.parse(data)
    if (data.type == "likeMessage") {
      const topic = data.data.topic.name;
      const sender = data.data.like.account;
      const receiver = data.data.post.account;
      console.log(`New Like! topic:${topic} from:${sender.fullName} to:${receiver.fullName}`)
      const senderAddress = await db.getUserAddress(sender.id);
      if (senderAddress) {
        // いいねを送った人
        // アドレスが登録されている場合にTokenを送金
        console.log(`senderAddress:${senderAddress}`)
        const job = queue.createJob({ to: senderAddress, value: process.env.VALANCE });
        await job.save();
      }
      const receiverAddress = await db.getUserAddress(receiver.id);
      if (receiverAddress) {
        // いいねをした人
        // アドレスが登録されている場合にTokenを送金
        console.log(`receiverAddress:${receiverAddress}`)
        const job = queue.createJob({ to: receiverAddress, value: process.env.VALANCE });
        await job.save();
      }
    }
  })
}

async function issue_access_token() {
  const options = {
    url: "https://typetalk.com/oauth2/access_token",
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: {
      'client_id': client_id,
      'client_secret': client_secret,
      'grant_type': 'client_credentials'
    }
  }
  const response = await axios(options)
  if (response.status == 200) {
    const data = response.data
    return data.access_token
  }
}

connect().then((r) => {
})
