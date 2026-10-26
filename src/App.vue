<template>
  <div id="app">
<!--<final-test/>-->
    <table-scroll/>
  </div>
</template>

<script>
import FinalTest from "@/components/final/finalTest.vue";
import TableScroll from "@/components/tableScroll.vue";

export default {
  components: {TableScroll, FinalTest}

}
</script>

<style lang="less">
body {
  margin: 0;
}

#app {
  box-sizing: border-box;
  padding: 20px;
}
</style>