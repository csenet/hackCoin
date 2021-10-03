<template>
  <b-container>
    <div class="card my-2" v-for="(Quest,key) in QuestList" v-if='Quest.status=="recruiting"'>
      <div class="card-header">
        {{ Quest.clientName }}
      </div>
      <div class="card-body">
        <blockquote class="blockquote mb-0">
          <p>{{ Quest.title }}</p>
          <footer class="blockquote-footer">{{ Quest.coin }} HACK</footer>
          <a :href='"request/"+key' class="btn btn-primary">Receive</a>
        </blockquote>
      </div>
    </div>
  </b-container>
</template>

<script>
export default {
  name: "QuestList",
  data() {
    return {
      QuestList: []
    }
  },
  mounted() {
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
