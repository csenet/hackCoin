const Web3 = require("web3");
const provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/b6f868b8813a4d5c95b85e61b4f445d8');
web3 = new Web3(provider);

const tokenContractAddress = "";

const abi = require('./abi.json')

async function getBalance(address) {
  // ETH 残高を取得
  const balance = await web3.eth.getBalance(address);
  return balance
}

function createAccount() {
  // アカウントを新規作成する
  const account = web3.eth.accounts.create()
  /* 秘密鍵はAWS Secret Token Managerに保存 */
  const privateKey = account.privateKey
}

function sendToken(to, from, amount) {
  const contract = web3.eth.Contract(abi, tokenContractAddress, {from: from, gasPrice: 100000})
}
