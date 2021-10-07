<template>
  <div>
    <h3>{{ balance }}HACK</h3>
  </div>
</template>

<script>
import Vue from 'vue';
import Web3Contoller from "web3";
import Fortmatic from "fortmatic";

import ABI from "~/assets/abi.json"
import Settings from "~/assets/settings.json"
import Private from "~/assets/private.json"

const fm = new Fortmatic(Private.fortmaticKey, Settings.network);
let web3 = new Web3Contoller(fm.getProvider());

export default {
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
}
</script>
