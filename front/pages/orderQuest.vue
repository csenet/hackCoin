<template>
  <div class="container pt-5">
    <h1 class="display-6">QUEST 依頼</h1>
    <hr>
    <div class="pt-3">
      <b-container>
        以下のフォームに入力することでQUESTを依頼することができます。<br>
        なお，依頼時に設定するトークンはQUEST完了時にそれ以上を保持している必要があります。
        <b-jumbotron class="pt-3">
          <b-form>
            Quest名:
            <b-input v-model="title"></b-input>
            内容:
            <b-input v-model="description"></b-input>
            コイン:
            <b-input v-model="coin"></b-input>
            依頼者名:
            <b-input v-model="clientName"></b-input>
            <b-button class="my-1" @click="orderQuest">Order</b-button>
          </b-form>
        </b-jumbotron>
      </b-container>
    </div>
  </div>
</template>

<script>
import Web3 from "web3";
import Fortmatic from "fortmatic";

import Private from "assets/private.json";
import Settings from "assets/settings.json";

const fm = new Fortmatic(Private.fortmaticKey, Settings.network);
let web3 = new Web3(fm.getProvider());

export default {
  name: "OrderQuest",
  data() {
    return {
      title: "",
      description: "",
      coin: "",
      clientName: ""
    }
  },
  methods: {
    async orderQuest() {
      const orderData = {
        title: this.title,
        description: this.description,
        coin: this.coin,
        clientName: this.clientName,
        clientAddress: await web3.eth.getCoinbase(),
        status: "recruiting"
      };
      const newKey = this.$fire.database.ref().child('request').push().key;
      let update = {};
      update['/request/' + newKey] = orderData;
      await this.$fire.database.ref().update(update);
      alert("追加しました")
    }
  }
}
</script>

<style scoped>

</style>
