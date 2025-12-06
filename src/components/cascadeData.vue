<script>
import DynamicCascadeInput from "@/origin/DynamicCascadeInput";

export default {
  name: "cascadeData",
  components: {DynamicCascadeInput},
  data(){
    return {
      dyRef:null,
      obj: {
        a: {
          b: {
            c: {
              d: {
                e: "hello world"
              }
            }
          }
        },
        aa: [5, 2, 0],
        aaa: 1314
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
    <DynamicCascadeInput v-model="obj" ref="dyRef" is-controller/>
    <pre>{{JSON.stringify(obj,null,2)}}</pre>
    <button @click="setData">setData helloWorld</button>
    <button @click="getData">getData</button>
  </div>
</template>

<style scoped>

</style>