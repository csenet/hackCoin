<template>
  <div class="container pt-5">
    <h1 class="display-6">My QUEST</h1>
    <b-container>
      <div class="card my-2" v-for="(Quest,key) in QuestList"
           v-if='(Quest.clientAddress==walletAddress)||(Quest.recipientAddress==walletAddress)'>
        <div class="card-header">
          {{ Quest.clientName }}
        </div>
        <div class="card-body">
          <blockquote class="blockquote mb-0">
            <p>{{ Quest.title }}</p>
            <footer class="blockquote-footer">{{ Quest.coin }} HACK</footer>
            <p>{{ Quest.status }}</p>
            <a :href='"request/"+key' class="btn btn-primary">Detail</a>
          </blockquote>
        </div>
      </div>
    </b-container>
  </div>
</template>

<script>
import Web3Contoller from "web3";
import Fortmatic from "fortmatic";

import Private from "assets/private.json";
import Settings from "assets/settings.json";

const fm = new Fortmatic(Private.fortmaticKey, Settings.network);
let web3 = new Web3Contoller(fm.getProvider());


export default {
  name: "QuestList",
  data() {
    return {
      QuestList: [],
      walletAddress: ""
    }
  },
  async mounted() {
    this.walletAddress = await web3.eth.getCoinbase();
    const Ref = this.$fire.database.ref('request/');
    Ref.on('value', (res) => {
      const data = res.val();
      this.QuestList = data;
      for (let key in data) {
        console.log(key)
      }
    });
  }
}
</script>

<style scoped>

</style>
