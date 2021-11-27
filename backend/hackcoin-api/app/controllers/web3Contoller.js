const settings = require("./settings.json")
const Tx = require('ethereumjs-tx').Transaction
const Web3Controller = require("web3");
const provider = new Web3Controller.providers.HttpProvider(settings.ropsten);
web3 = new Web3Controller(provider);
const abi = require("./abi.json")

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

  const txCount = await web3.eth.getTransactionCount(account.address);
  console.log(txCount)
  const txObject = {
    nonce: web3.utils.toHex(txCount),
    to: settings.contract,
    value: web3.utils.toHex(web3.utils.toWei('0', 'ether')),
    gasLimit: web3.utils.toHex(2100000),
    gasPrice: web3.utils.toHex(web3.utils.toWei('6', 'gwei')),
    data: data
  }
  // Sign the transaction
  const tx = new Tx(txObject, { 'chain': 'ropsten' });
  tx.sign(Buffer.from(settings.privateKey, 'hex'));

  const serializedTx = tx.serialize();
  const raw = '0x' + serializedTx.toString('hex');

  // Broadcast the transaction
  const transaction = await web3.eth.sendSignedTransaction(raw);
  return transaction
}
