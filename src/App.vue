<template>
  <div id="app">
    <Test/>
    <Test2/>
    <TestCls/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Test from "@/test/Test";
import Test2 from "@/test/Test2";
import TestCls from "@/test/TestCls";

@Component({
  components: {
    TestCls,
    Test2,
    Test
    // HelloWorld,
  },
})
export default class App extends Vue {}
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
