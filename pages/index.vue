<template>
  <b-container>

    Enter Your Address:
    <b-input type="text" v-model="walletAddress"></b-input>
    <b-button v-on:click="getBalance()">Check</b-button>
    <span>{{ balance }}</span>
  </b-container>
</template>

<script>
import Vue from 'vue';
import Web3 from "web3";
import Fortmatic from "fortmatic";

const fm = new Fortmatic('pk_test_872A749ADE8F3958', 'ropsten');
let web3 = new Web3(fm.getProvider());

const ABI = [
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs":
      [
        {
          "name": "",
          "type": "uint8"
        }
      ],
    "type": "function"
  },
];

export default Vue.extend({
  data() {
    return {
      tokenAddress: "0x1fc5a5f5fef160cd9bf81653f4a139055d281ec7",
      walletAddress: "",
      contract: new web3.eth.Contract(ABI, this.tokenAddress),
      balance: 0,
    }
  },
  mounted() {
    this.contract = new web3.eth.Contract(ABI, this.tokenAddress);
    web3.eth.getCoinbase().then((coinbase) => {
      this.walletAddress = coinbase;
    });
  },
  methods: {
    getBalance: async function () {
      let balance = parseFloat(await this.contract.methods.balanceOf(this.walletAddress).call())
      let decimals = parseFloat(await this.contract.methods.decimals().call())
      balance /= 10 ** decimals
      this.balance = balance;
    }
  }
})
</script>
