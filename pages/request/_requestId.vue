<template>
  <div class="container pt-5">
    <h1 class="display-6">{{ this.QuestData.title }}</h1>
    <hr>
    <b>Status: {{ this.QuestData.status }}</b>
    <span class="text-muted" style="float:right;">Requested By：{{ this.QuestData.clientName }}</span>
    <div class="pt-3">
      <b-container>
        {{ this.QuestData.description }}
      </b-container>
    </div>
    <hr>
    <span class="text-muted">Reward</span>
    <h3 class="px-2">{{ this.QuestData.coin }} HACK</h3>
    <b-button variant="outline-dark" @click="receiveQuest"
              v-if='(this.QuestData.status=="recruiting")&&(this.QuestData.clientAddress!==this.walletAddress)'
    >Receive Quest
    </b-button>
    <b-button variant="outline-dark" @click="finishQuest"
              v-if='(this.QuestData.status=="onprogress")&&(this.QuestData.clientAddress!==this.walletAddress)'
    >Mark as Finished
    </b-button>
    <b-button variant="outline-dark" @click="getReward"
              v-if='(this.QuestData.status=="waitingPayment")&&(this.QuestData.clientAddress===this.walletAddress)'
    >Pay Reward
    </b-button>
    <p>{{ this.nowStatus }}</p>
  </div>
</template>

<script>

import Web3 from "web3";
import Fortmatic from "fortmatic";

import ABI from "~/assets/abi.json"
import Settings from "~/assets/settings.json"
import Private from "~/assets/private.json"

const {ethers} = require('ethers')

const itx = new ethers.providers.InfuraProvider(
  Settings.network,
  Private.infuraKey
)

const signer = new ethers.Wallet(Private.privateKey, itx);

const fm = new Fortmatic(Private.fortmaticKey, Settings.network);
let web3 = new Web3(fm.getProvider());

const wait = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export default {
  name: "request",
  async asyncData({params}) {
    const id = params.requestId
    return {id}
  },
  data() {
    return {
      QuestData: {},
      tokenAddress: Settings.tokenContractAddress,
      walletAddress: "",
      contract: "",
      depositBalance: 0,
      nowStatus: "",
      amount: 0,
      toAddress: ""
    }
  },
  async mounted() {
    this.contract = new web3.eth.Contract(ABI, Settings.tokenContractAddress);
    this.walletAddress = await web3.eth.getCoinbase();
    const Ref = this.$fire.database.ref('request/' + this.id + '/');
    Ref.on('value', (res) => {
      const data = res.val();
      this.QuestData = data;
    });
  },
  methods: {
    async receiveQuest() {
      let data = this.QuestData;
      data.recipientAddress = this.walletAddress;
      data.status = "onprogress";
      const updates = {};
      updates['/request/' + this.id] = data;
      await this.$fire.database.ref().update(updates);
    },
    async finishQuest() {
      let data = this.QuestData;
      data.status = "waitingPayment";
      const updates = {};
      updates['/request/' + this.id] = data;
      await this.$fire.database.ref().update(updates);
    },
    async paymentDone(){
      let data = this.QuestData;
      data.status = "finished";
      const updates = {};
      updates['/request/' + this.id] = data;
      await this.$fire.database.ref().update(updates);
    },
    async getReward() {
      this.toAddress = this.QuestData.recipientAddress;
      this.amount = this.QuestData.coin;
      await this.sendToken();
    },
    getBalance: async function () {
      let balance = parseFloat(await this.contract.methods.balanceOf(this.walletAddress).call())
      let decimals = parseFloat(await this.contract.methods.decimals().call())
      balance /= 10 ** decimals
      return balance
    },
    createPayload() {
      return {
        types: {
          EIP712Domain: [
            {name: "name", type: "string"},
            {name: "version", type: "string"},
            {name: "chainId", type: "uint256"},
            {name: "verifyingContract", type: "address"},
          ],
          TransferWithAuthorization: [
            {name: "from", type: "address"},
            {name: "to", type: "address"},
            {name: "value", type: "uint256"},
            {name: "validAfter", type: "uint256"},
            {name: "validBefore", type: "uint256"},
            {name: "nonce", type: "bytes32"},
          ],
        },
        domain: {
          name: "HackToken",
          version: "1.0",
          chainId: 3,
          verifyingContract: Settings.tokenContractAddress,
        },
        primaryType: "TransferWithAuthorization",
        message: {
          from: this.walletAddress,
          to: this.toAddress,
          value: this.amount.toString(10),
          validAfter: 0,
          validBefore: Math.floor(Date.now() / 1000) + 3600, // Valid for an hour
          nonce: web3.utils.randomHex(32),
        }
      }
    },
    sendToken: async function () {
      const payload = this.createPayload();
      const from = this.walletAddress;
      console.log(from);
      const params = [from, payload];
      const method = 'eth_signTypedData_v4';
      web3.currentProvider.sendAsync({
        id: 3,
        method,
        params,
        from
      }, async (error, result) => {
        if (error) throw error;
        console.log(result);
        await this.sendWithITX(result, payload)
      });
    },
    sendWithITX: async function (result, payload) {
      const userSignature = result.result;
      console.log(userSignature)
      const v = "0x" + userSignature.slice(130, 132);
      const r = userSignature.slice(0, 66);
      const s = "0x" + userSignature.slice(66, 130);
      console.log("v:", v, "r:", r, "s:", s);
      const iface = new ethers.utils.Interface(ABI);
      const encodedData = iface.encodeFunctionData('transferWithAuthorization',
        [this.walletAddress,
          this.toAddress,
          this.amount,
          payload.message.validAfter,
          payload.message.validBefore,
          payload.message.nonce,
          v, r, s])

      console.log(encodedData)

      console.log("Before Balance:" + await this.getBalance())

      const tx = {
        to: Settings.tokenContractAddress,
        data: encodedData,
        gas: '100000',
        schedule: 'fast'
      }

      //TxにSignerが署名をする
      const signature = await this.signRequest(tx)
      console.log(signature)

      const relayTransactionHash = await itx.send('relay_sendTransaction', [
        tx,
        signature
      ])
      this.nowStatus = relayTransactionHash.relayTransactionHash;
      const receipt = await this.waitTx(relayTransactionHash.relayTransactionHash)
      this.nowStatus = `マイニングされました。at Block${receipt.blockNumber}`
      await this.paymentDone()
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
      while (!mined) {
        const statusResponse = await itx.send('relay_getTransactionStatus', [
          relayTransactionHash
        ])
        if (statusResponse.broadcasts) {
          for (let i = 0; i < statusResponse.broadcasts.length; i++) {
            const bc = statusResponse.broadcasts[i];
            const receipt = await itx.getTransaction(bc.ethTxHash)
            this.nowStatus = `マイニングされるのを待機しています...${receipt.confirmations}`;
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
}
</script>

<style scoped>

</style>
