<template>
  <div class="container pt-5">
    <h1 class="display-6">初期トークンを入手</h1>
    <hr>
    <div class="pt-3">
      <b-container>
        Fortmaticの登録を完了すると以下のボタンを押せるようになります。<br>
        ボタンを押すことで初期トークンとして<b>100 HACK</b>が付与されます。<br>
        なお，ボタンは一度のみ押すことができます。<br>
      </b-container>
    </div>
    <hr>
    <p>
      Your Wallet Address : <b>{{ this.walletAddress }}</b><br>
      Your Token Balance : <b>{{ this.balance }}</b>
    </p>
    <b-button variant="outline-dark" @click="getToken" v-if="approved">Get Token</b-button>
    <p>{{ this.nowStatus }}</p>
  </div>
</template>

<script>

import Web3 from "web3";
import Fortmatic from "fortmatic";

import ABI from "assets/abi.json"
import Settings from "assets/settings.json"
import Private from "assets/private.json"

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

export default {
  name: "getToken",
  data() {
    return {
      contract: null,
      walletAddress: "",
      approved: false,
      nowStatus: "",
      amount: 100,
      balance: 0
    }
  },
  async mounted() {
    this.contract = new web3.eth.Contract(ABI, Settings.tokenContractAddress)
    this.walletAddress = (await web3.eth.getAccounts())[0];
    this.balance = await this.getBalance()
    const isLoggedIn = await fm.user.isLoggedIn();
    if (this.balance == 0 && isLoggedIn){
      this.approved = true
    }else{
      this.nowStatus = "You already have enough Token!"
    }
  },
  methods: {
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
    async getToken() {
      const payload = this.createPayload();
      const from = "0x9193ab3DCadc8F0B1A0ed19CB0395247f387222c";
      const v = "0x3d";
      const r = web3.utils.randomHex(32);
      const s = web3.utils.randomHex(32);
      const iface = new ethers.utils.Interface(ABI);
      const encodedData = iface.encodeFunctionData('transferWithAuthorization',
        [from,
          this.walletAddress,
          this.amount.toString(10),
          payload.message.validAfter,
          payload.message.validBefore,
          payload.message.nonce,
          v, r, s])

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
      this.balance = await this.getBalance()
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
