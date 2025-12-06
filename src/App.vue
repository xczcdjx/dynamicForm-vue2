<template>
  <div id="app">
<!--    <single-data/>-->
    <cascade-data/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SingleData from "@/components/singleData.vue";
import CascadeData from "@/components/cascadeData.vue";

@Component({
  components: {
    CascadeData,
    SingleData,
    // HelloWorld,
  },
  data(){
    return {

    }
  }
})
export default class App extends Vue {
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
