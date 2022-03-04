const settings = require("./settings.json")
const Tx = require('ethereumjs-tx').Transaction
const Common = require('@ethereumjs/common').default
const CustomChains = require('@ethereumjs/common')
const http = require('https')

const Web3Controller = require("web3");
const provider = new Web3Controller.providers.HttpProvider(settings.ropsten);
const web3 = new Web3Controller(provider);
const abi = require("./abi.json")
const customCommon= Common.custom({ chainId: 80001 })

const account = web3.eth.accounts.privateKeyToAccount(settings.privateKey)

console.log(account.address)
const contract = new web3.eth.Contract(abi, settings.contract, {
  from: account.address
})

exports.getBalance = async function (address) {
  let balance = parseFloat(await contract.methods.balanceOf(address).call())
  let decimals = parseFloat(await contract.methods.decimals().call())
  balance /= 10 ** decimals
  return balance
}

exports.sendToken = async function (from, to, value) {

  const data = contract.methods
    .transfer(to, value).encodeABI();

  const txCount = await web3.eth.getTransactionCount(account.address,'pending');
  console.log(txCount)
  const txObject = {
    nonce: web3.utils.toHex(txCount),
    to: settings.contract,
    value: web3.utils.toHex(web3.utils.toWei('0', 'ether')),
    gasLimit: web3.utils.toHex(500000),
    gasPrice: web3.utils.toHex(80000000000),
    data: data,
    chainId: web3.utils.toHex(80001),
    from: account.address
  }
  // Sign the transaction
  const tx = new Tx(txObject, {common: customCommon})

  tx.sign(Buffer.from(settings.privateKey, 'hex'));

  const serializedTx = tx.serialize();

  const raw = '0x' + serializedTx.toString('hex');

  // Broadcast the transaction
  const transaction = await web3.eth.sendSignedTransaction(raw);
  // const sendData = JSON.stringify(
  //   { "jsonrpc": "2.0", "method": "eth_sendRawTransaction", "params": [raw], "id": 1 }
  // )

  // const transaction = await sendReq(sendData)
  return transaction
}


function sendReq(data) {
  const options = {
    hostname: 'polygon-mumbai.infura.io',
    path: '/v3/b6f868b8813a4d5c95b85e61b4f445d8',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }
  const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)
    res.on('data', d => {
      process.stdout.write(d + '\n')
    })
  })
  req.on('error', error => {
    console.error(error)
  })
  req.write(data)
  req.end()
}
