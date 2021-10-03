<template>
  <div>
    <div class="jumbotron pt-5">
      <h1 class="display-3">Hack Shere</h1>
      <p class="lead">Hack Coinを使ってQUESTを依頼できるサービス</p>
      <hr class="my-4">
      <p>初めに画面に表示される案内に従ってFortmaticに登録してください</p>
      <a class="btn btn-primary" href="/getToken" role="button">初期トークンを入手</a>
    </div>
    <h1 class="pt-5">クエスト一覧</h1>
    <QuestList></QuestList>
  </div>
</template>

<script>
import QuestList from "@/components/QuestList";

export default {
  name: "index",
  components: {QuestList}
}
</script>

<style scoped>

</style>
