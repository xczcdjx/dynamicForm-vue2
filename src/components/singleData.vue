<script>
import DynamicInput from "@/origin/DynamicInput";

export default {
  name: 'SingleData',
  components: {DynamicInput},
  data(){
    return {
      dyRef:null,
      obj: {
        a: 'Hello world',
        b: 1314,
        c: [5, 2, 0]
      },
    }
  },
  methods: {
    setData(){
      this.$refs.dyRef?.onSet({test: "helloWorld"})
    },
    getData(){
      console.log(this.$refs.dyRef?.getResult('ori'))
      console.log(this.$refs.dyRef?.getResult())
    }
  }
}
</script>

<template>
<div>
  <DynamicInput v-model="obj" size="small" ref="dyRef"/>
  <pre>{{JSON.stringify(obj,null,2)}}</pre>
  <button @click="setData">setData helloWorld</button>
  <button @click="getData">getData</button>
</div>
</template>

<style scoped>

</style>