const Web3 = require("web3");
const {KmsProvider} = require("aws-kms-provider");

const region = "ap-northeast-1";
const keyId = "d95482c7-f798-4f73-840e-0350a09a67eb";
const endpoint = 'https://ropsten.infura.io/v3/b6f868b8813a4d5c95b85e61b4f445d8';

const to = "0x9193ab3DCadc8F0B1A0ed19CB0395247f387222c"

async function sendETH(res, postId) {
  const provider = new KmsProvider(endpoint, {region, keyIds: [keyId]});

  const web3 = new Web3(provider);

  const accounts = await web3.eth.getAccounts();
  console.log(accounts[0])

  const gas = await web3.eth.getGasPrice() * 2 // GASの中央値を取得

  return web3.eth.sendTransaction({
    from: accounts[0],
    to,
    value: web3.utils.toWei("0.0000001", "ether"),
    gasPrice: gas
  }).on('transactionHash', (hash) => {
    res.json({"message": hash, "replyTo": postId})
  })
}

module.exports = sendETH
