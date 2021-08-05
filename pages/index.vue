<template>
  <b-container class="p-3">
    <b-form>
      Your Address:
      <b-input type="text" v-model="walletAddress"></b-input>
      <b-button v-on:click="getBalance()">Check</b-button>
    </b-form>
    <h3>{{ balance }}HACK</h3>
  </b-container>
</template>

<script>
import Vue from 'vue';
import Web3 from "web3";
import Fortmatic from "fortmatic";

import ABI from "~/assets/abi.json"
import Settings from "~/assets/settings.json"
import Private from "~/assets/private.json"

const fm = new Fortmatic(Private.fortmaticKey, Settings.network);
let web3 = new Web3(fm.getProvider());

export default Vue.extend({
  data() {
    return {
      tokenAddress: Settings.tokenContractAddress,
      walletAddress: "",
      contract: null,
      balance: 0,
    }
  },
  async mounted() {
    this.contract = new web3.eth.Contract(ABI, this.tokenAddress);
    this.walletAddress = await web3.eth.getCoinbase();
    this.getBalance();
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
