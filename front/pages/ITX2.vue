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
      <p>{{ balance }}</p>
    </b-jumbotron>
  </b-container>
</template>

<script>
import Web3Contoller from "web3";
import Fortmatic from "fortmatic";
import Vue from "vue";

import ABI from "~/assets/abi.json";
import Settings from "~/assets/settings.json"
import Private from "~/assets/private.json"

const {ethers} = require('ethers')

let web3;
if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  web3 = new Web3Contoller(window.ethereum)
  window.ethereum.enable().catch(error => {
    // User denied account access
    console.log(error)
  })
} else if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
  web3 = new Web3Contoller(window.web3.currentProvider)
} else {
  const httpEndpoint = 'http://localhost:8545'
  web3 = new Web3Contoller(new Web3Contoller.providers.HttpProvider(httpEndpoint))
}


const wait = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export default Vue.extend({
  layout: 'simple',
  data() {
    return {
      tokenAddress: "0xfde77337D08e2b04Dab7B161B650E16065e30779",
      walletAddress: "",
      contract: "",
      depositBalance: 0,
      nowStatus: "",
      amount: 1,
      toAddress: "0x9193ab3DCadc8F0B1A0ed19CB0395247f387222c",
      tokenName: "",
      tokenSymbol: "",
      chainId: 0,
      version: "",
      balance: 0
    }
  },
  async mounted() {
    this.contract = new web3.eth.Contract(ABI, "0xfde77337D08e2b04Dab7B161B650E16065e30779");
    this.nowStatus = "Walletとの接続をしています";
    this.walletAddress = (await web3.eth.getAccounts())[0];
    console.log(await web3.eth.getAccounts())
    this.nowStatus = "Walletと接続しました";
    this.tokenName = await this.contract.methods.name().call();
    this.tokenSymbol = await this.contract.methods.symbol().call();
    this.chainId = 1337;
    this.version = await this.contract.methods.version().call();
    this.balance = await this.getBalance()
    console.log(this.balance)
  },
  methods: {
    getBalance: async function () {
      let balance = parseFloat(await this.contract.methods.balanceOf(this.walletAddress).call())
      let decimals = parseFloat(await this.contract.methods.decimals().call())
      balance /= 10 ** decimals
      return balance
    },
    async createPayload() {
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
  name: 'TestToken',
  version: '1',
  chainId: 3,
  verifyingContract: '0xfde77337D08e2b04Dab7B161B650E16065e30779'
},
        primaryType: "TransferWithAuthorization",
        message: {
  from: '0x579384a72870FDe2dD712adDeD2e6b4159edA875',
  to: '0xD034E7A0470238DEb98D40D9C353B72676d0858a',
  value: '10',
  validAfter: 0,
  validBefore: 1642701792,
  nonce: '0x645dd0d07631bd511807ca9b4cd75589397de0cd821a0e14177d8e9274230bcc'
}
      }
    },
    sendToken: async function () {
      const payload = await this.createPayload();
      console.log(payload);
      const from = this.walletAddress;
      console.log(from);
      const params = [from, JSON.stringify(payload)];
      console.log(from.address);
      const method = 'eth_signTypedData_v4';
      web3.currentProvider.sendAsync({
        id: this.chainId,
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
      const sig = result.result;
      const v = '0x' + sig.slice(130, 132);
      const r = sig.slice(0, 66);
      const s = '0x' + sig.slice(66, 130);
      console.log("v:", v, "r:", r, "s:", s);
      console.log(payload)

      await this.contract.methods.transferWithAuthorization(
        payload.message.from,
        payload.message.to,
        payload.message.value,
        payload.message.validAfter,
        payload.message.validBefore,
        payload.message.nonce,
        v, r, s).send({
        from: this.walletAddress,
        to: Settings.tokenContractAddress,
        value: 0.0,
        gasPrice: '20000000000'
      })
    },
    signRequest: async function (tx) {
      const relayTransactionHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['address', 'bytes', 'uint', 'uint', 'string'],
          [tx.to, tx.data, tx.gas, 1337, tx.schedule] // Ropsten chainId is 3
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
