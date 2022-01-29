const settings = require("./settings.json")
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "remember naive stairs dose six decorate catalog banner gaze tiny into lady";
const host = settings.ropsten;
const provider = new HDWalletProvider(mnemonic, host, 0, 100);
const Web3 = require('web3');

const web3 = new Web3(provider);

let accounts = []

exports.initialize = async function() {
  await web3.eth.getAccounts().then((data) => {
    accounts = data;
    provider.engine.stop();
  })
}

exports.getAccountByIndex = function (index) {
  return accounts[index]
}
