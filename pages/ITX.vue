<template>
  <b-container class="p-3">
    <h1>ITX Transaction</h1>
    <b-jumbotron>
      <ul>
        <li>
          Your Address：<b>{{ walletAddress }}</b>
        </li>
        <li>
          Your ITX Deposit：<b>{{ depositBalance }}ETH</b>
        </li>
      </ul>
      {{ nowStatus }}
      <b-form>
        <b-button @click="deposit()">Deposit 1 ETH</b-button>
        <b-button @click="getDeposit()">Check Deposit</b-button>
      </b-form>
    </b-jumbotron>
    <hr>
    <h1>Send Token</h1>
    <b-jumbotron>
      <b-form>
        Amount:
        <b-input v-model="amount"></b-input>
        To:
        <b-input v-model="toAddress"></b-input>
        <b-button @click="sendToken()">Send</b-button>
      </b-form>
    </b-jumbotron>
  </b-container>
</template>

<script>
import Vue from 'vue';
import Web3 from "web3";
import Fortmatic from "fortmatic";

import ABI from "~/assets/abi.json";
import Settings from "~/assets/settings.json"
import Private from "~/assets/private.json"

const {ethers} = require('ethers')

const itx = new ethers.providers.InfuraProvider(
  Settings.network,
  Private.infuraKey
)

const fm = new Fortmatic(Private.fortmaticKey, Settings.network);
let web3 = new Web3(fm.getProvider());

const signer = new ethers.Wallet(Private.privateKey, itx);

const wait = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export default Vue.extend({
  data() {
    return {
      tokenAddress: Settings.tokenContractAddress,
      walletAddress: "",
      contract: "",
      depositBalance: 0,
      nowStatus: "",
      amount: 0,
      toAddress: ""
    }
  },
  async created() {
    this.contract = new web3.eth.Contract(ABI, Settings.tokenContractAddress);
    this.nowSatus = "Walletとの接続をしています";
    this.walletAddress = await web3.eth.getCoinbase();
    this.nowSatus = "Walletと接続しました";
    this.getDeposit();
  },
  methods: {
    getDeposit: async function () {
      this.nowStatus = "ITX Depositの残高を取得しています";
      const response = await itx.send('relay_getBalance', [signer.address]);
      this.nowStatus = "ITX Depositの残高を取得しました";
      this.depositBalance = response.balance / 10 ** 18;
    },
    deposit: async function () {
      // BoolにDepositする
      const tx = await signer.sendTransaction({
        to: Settings.tokenContractAddress,
        value: ethers.utils.parseUnits('1.0', 'ether')
      })
      this.nowStatus = "マイニングされるのを待機しています"
      await tx.wait()
      this.nowStatus = "正常に追加されました"
    },
    getBalance: async function () {
      let balance = parseFloat(await this.contract.methods.balanceOf(this.walletAddress).call())
      let decimals = parseFloat(await this.contract.methods.decimals().call())
      balance /= 10 ** decimals
      return balance
    },
    sendToken: async function () {
      console.log(this.amount);
      const sendAmount = parseFloat(this.amount);
      const encodedData = this.contract.methods.transfer(this.toAddress, sendAmount).encodeABI();

      console.log("Before Balance:" + await this.getBalance());
      const tx = {
        to: Settings.tokenContractAddress,
        data: encodedData,
        gas: '50000',
        schedule: 'fast'
      }

      //TxにSignerが署名をする
      const signature = await this.signRequest(tx);
      console.log(signature)
      const relayTransactionHash = await itx.send('relay_sendTransaction', [
        tx,
        signature
      ])

      const receipt = await this.waitTx(relayTransactionHash)

    },
    signRequest: async function (tx) {
      const relayTransactionHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['address', 'bytes', 'uint', 'uint', 'string'],
          [tx.to, tx.data, tx.gas, 3, tx.schedule] // Ropsten chainId is 3
        )
      )
      return await signer.signMessage(ethers.utils.arrayify(relayTransactionHash))
    },
    waitTx: async function (relayTransactionHash) {
      let mined = false
      while (mined) {
        const statusResponse = await itx.send('relay_getTransactionStatus', [
          relayTransactionHash
        ])
        if (statusResponse.broadcasts) {
          for (let i = 0; i < statusResponse.broadcasts.length(); i++) {
            const bc = statusResponse.broadcasts[i];
            const receipt = await itx.getTransaction(bc.ethTxHash)
            if (receipt && receipt.confirmations && receipt.confirmations > 1) {
              mined = true
              return receipt
            }
          }
        }
        await wait(1000)
      }
    }
  }
})
</script>
