# dynamicformdjx-vue2

基于 **Vue2** 的动态表单输入组件。

Vue3 版本 [Document](https://xczcdjx.github.io/dynamicFormDoc/)

React 版本 [Document](https://www.npmjs.com/package/dynamicformdjx-react)

## 安装

```bash
# 任意一种
npm install dynamicformdjx-vue2
# or
yarn add dynamicformdjx-vue2
# or
pnpm add dynamicformdjx-vue2
```

### 基本使用

```vue
<script>
  import {DynamicInput} from "dynamicformdjx-vue2";

  export default {
    name: 'App',
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
        this.$refs.dyRef.onSet({test: "helloWorld"})
      }
    }
  }
</script>

<template>
  <div>
    <DynamicInput v-model="obj" ref="dyRef" is-controller/>
    <pre>{{JSON.stringify(obj,null,2)}}</pre>
    <button @click="setData">setData helloWorld</button>
  </div>
</template>
```
### 级联基本使用
```vue
<script>
import {DynamicCascadeInput} from "dynamicformdjx-vue2";

export default {
  name: "App",
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
      this.$refs.dyRef.onSet({test: "helloWorld"})
    }
  }
}
</script>

<template>
  <div>
    <DynamicCascadeInput v-model="obj" ref="dyRef" is-controller/>
    <pre>{{JSON.stringify(obj,null,2)}}</pre>
    <button @click="setData">setData helloWorld</button>
  </div>
</template>
```