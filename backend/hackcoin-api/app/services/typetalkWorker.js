const WebSocket = require('ws'),
  request = require('request');

const db = require('../controllers/dbController');

const Queue = require('bee-queue');
const Web3 = require("../controllers/web3Contoller");
const queue = new Queue('transfer', {
  redis: {
    host: 'redis',
  },
  isWorker: false
});


const client_id = process.env.TYPETALK_CLIENT_ID
const client_secret = process.env.TYPETALK_CLIENT_SECRET

if (!(client_id && client_secret)) {
  console.log("You should set environments with TYPETALK_CLIENT_ID and TYPETALK_CLIENT_SECRET")
  process.exit(1);
}

function issue_access_token(callback) {
  const options = {
    url: "https://typetalk.com/oauth2/access_token",
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
      'client_id': client_id,
      'client_secret': client_secret,
      'grant_type': 'client_credentials'
    }
  }

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(error, JSON.parse(body)['access_token']);
    } else {
      callback(error);
    }
  });
}

function connect(access_token) {
  const ws = new WebSocket("wss://message.typetalk.com/api/v1/streaming", {
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  });

  ws.on('open', function () {
    // console.log('connected streaming server');
  }).on('close', function () {
    // console.log('disconnected streaming server');
    connect(access_token);
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
        console.log(senderAddress)
        const job = queue.createJob({to: senderAddress, value: process.env.VALANCE});
        await job.save();
      }
      const receiverAddress = await db.getUserAddress(receiver.id);
      if (receiverAddress) {
        // いいねをした人
        // アドレスが登録されている場合にTokenを送金
        console.log(receiverAddress)
        const job = queue.createJob({to: receiverAddress, value: process.env.VALANCE});
        await job.save();
      }
    }
  });
}

issue_access_token(function (error, token) {
  if (error) {
    console.log('Failed to get an access token.');
    console.log(error);
    process.exit(1);
  }

  connect(token);
});
