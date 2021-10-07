const web3 = require('web3')

const db = require('./dbController')
const web3Controller = require('./web3Contoller')

exports.webhook = async (req, res) => {
  const data = req.body
  const postId = data.post.id;
  const command = data.post.message;

  let message = "";

  if (command.match(/^hello/)) {
    // 挨拶を返します
    message = echoBot(data)
  } else if (command.match(/^register .*/)) {
    // 新しくWallet Addressを登録します
    message = await register(data)
  } else if (command.match(/^check/)) {
    // 現在の残高を確認します
    message = await getMyBalance(data)
  }

  const reply = message ? {"message": message, "replyTo": postId} : {}
  res.json(reply)
}

function echoBot(data) {
  const userName = data.post.account.fullName;
  return `Hello! ${userName}`
}

async function register(data) {
  const token = data.post.message.split(' ')
  if (token.length != 2) {
    return "Error: Invalid Command"
  }
  const address = token[1];
  const account = data.post.account;
  // 正しいアドレスか検証
  if (!web3.utils.isAddress(address)) {
    return "Error: Invalid Address"
  }
  const id = account.id;
  await db.updateAddress(id, address, account)
  return `Successfully registered!\n address: ${address}`
}

async function getMyBalance(data) {
  const id = data.post.account.id;
  const address = await db.getUserAddress(id)
  if (!address) {
    return "Addressが登録されていません"
  }
  const balance = await web3Controller.getBalance(address);
  return `あなたのHack Coinの残高は...\n${balance} HACK!`
}
