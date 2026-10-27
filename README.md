# dynamicformdjx-vue2

基于 **Vue2** 的动态表单输入组件。

Vue3 版本 [Document](https://xczcdjx.github.io/dynamicFormDoc/)

React 版本 [Document](https://www.npmjs.com/package/dynamicformdjx-react)

## Vue 版本要求

- 最低支持 Vue **2.7.0**，包中声明 `peerDependencies.vue: "^2.7.0"`。
- 开发与示例固定使用 **2.7.16**，vue-template-compiler 也固定为 **2.7.16**；使用模板编译器时必须与 Vue 版本一致。
- 主入口使用 toRaw，公共 Hooks 和 Element UI 组件使用 Vue 2.7 内置 Composition API，因此 Vue 2.6 及以下不能直接使用当前构建。
- 仅使用主入口不要求安装 Element UI；使用 /elementUi 时安装 element-ui@^2.15.14（可选 peer dependency）。

```bash
npm install vue@2.7.16 dynamicformdjx-vue2
# 使用 Element UI 组件时再安装
npm install element-ui@^2.15.14
# 需要编译 Vue2 单文件组件的项目
npm install -D vue-template-compiler@2.7.16
```

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
### Element UI 动态表单

安装 `element-ui`，在应用入口加载它的样式和插件：

```js
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'dynamicformdjx-vue2/style.css'
Vue.use(ElementUI)
```

```vue
<template>
  <EleDynamicForm ref="form" :items="items" preset="grid" :form-config="{ labelWidth: '80px' }" />
</template>

<script>
import { EleDynamicForm, renderInput, renderSelect } from 'dynamicformdjx-vue2/elementUi'

export default {
  components: { EleDynamicForm },
  data() {
    return {
      items: [
        { key: 'name', label: '姓名', value: '', required: true, span: 12,
          render2: item => renderInput(item.value, {}, item) },
        { key: 'role', label: '角色', value: null, span: 12,
          options: [{ label: '管理员', value: 'admin' }, { label: '访客', value: 'guest' }],
          render2: item => renderSelect(item.value, item.options, {}, item) }
      ]
    }
  },
  methods: {
    async submit() {
      const values = await this.$refs.form.validator()
      console.log(values)
    }
  }
}
</script>
```

渲染函数从 `dynamicformdjx-vue2/elementUi` 导入，调用形式与 Vue 3 版相同：`renderInput(item.value, props, item)`；带选项的函数为 `renderSelect(item.value, options, props, item)`。Vue 2 的 `value` 是普通响应式属性，渲染函数会更新它并触发 `onChange`。也可以只设置 `renderType`、`renderProps` 和 `options`，或用 `useDecorateForm(items)` 自动生成 `render2`。完全自定义的控件仍可使用 `render2(item, setValue)`，值变化时调用 `setValue`。

支持 `renderInput`、`renderSelect`、`renderPopSelect`、`renderTreeSelect`、`renderRadioGroup`、`renderRadioButtonGroup`、`renderCheckboxGroup`、`renderSwitch`、`renderDatePicker`、`renderTimePicker`、`renderCheckbox`、`renderDynamicTags`、`renderSlider` 和 `renderInputNumber`。其中 `renderPopSelect` 在 Element UI 中使用 Select，`renderTreeSelect` 使用 Cascader。组件实例提供 `getResult('res' | 'ori')`、`validator()` 和 `reset(value)`。

### 表单操作 Hook

Vue 2 版也提供 `useReactiveForm` 和 `useDyForm`。从组件外创建表单项时，可用 `useReactiveForm` 将表单项转为 Vue 2 响应式对象；如果表单项已在组件的 `data()` 中，则可以直接传给 `useDyForm`。

```js
import { useReactiveForm, useDyForm } from 'dynamicformdjx-vue2/elementUi'

const items = useReactiveForm([
  { key: 'name', label: '姓名', value: '' },
  { key: 'age', label: '年龄', value: 18 }
])
const form = useDyForm(items)

form.setValue('name', '张三')
form.setValues({ name: '李四', age: 20 })
form.setDisabled(true, ['age'])
form.setHidden(true, ['age'])
form.setItem('name', { label: '用户名' })
form.setItems([['age', { label: '实际年龄' }]])
console.log(form.getValue('name'), form.getValues(), form.getItem('age'))
form.onReset()
```

另有 `updateKeys([[oldKey, newKey]])` 用于修改字段 key。`useDyForm` 操作的是原始表单项对象；同一组 `items` 传给 `EleDynamicForm` 即可更新页面。`useDecorateForm(items)` 也会默认创建响应式表单项。

### 其他 Element UI 组件

`dynamicformdjx-vue2/elementUi` 还导出 `EleDynamicInput`、`ElePopupModal`、`EleZealCard`、`EleZealTableSearch`、`EleZealTable`、`EleZealTableBtnControl`、`EleZealTablePaginationControl`。级联输入和下拉加载组件暂未加入这个入口。

```vue
<template>
  <div>
    <EleDynamicInput v-model="fields" is-controller />
    <el-button @click="$refs.modal.toggle(true)">打开弹窗</el-button>
    <ElePopupModal ref="modal" title="编辑" :on-submit="save">
      弹窗内容
    </ElePopupModal>

    <EleZealCard title="列表" zeal-height="600px">
      <template slot="header" slot-scope="scope">
        <EleZealTableSearch :is-mobile="scope.isMobile" :search-items="searchItems"
                            @onSearch="search" />
      </template>
      <template slot-scope="scope">
        <EleZealTable :data="rows" :columns="columns" :max-height="scope.tableHeight" />
        <EleZealTableBtnControl :is-mobile="scope.isMobile" :btn-items="actions"
                                @onSelect="onAction" />
        <EleZealTablePaginationControl :is-mobile="scope.isMobile" :pagination="pagination" />
      </template>
    </EleZealCard>
  </div>
</template>

<script>
import {
  EleDynamicInput, ElePopupModal, EleZealCard, EleZealTableSearch,
  EleZealTable, EleZealTableBtnControl, EleZealTablePaginationControl,
  useReactiveForm, usePagination
} from 'dynamicformdjx-vue2/elementUi'

export default {
  components: { EleDynamicInput, ElePopupModal, EleZealCard, EleZealTableSearch,
    EleZealTable, EleZealTableBtnControl, EleZealTablePaginationControl },
  data() {
    return {
      fields: { name: '张三' },
      searchItems: useReactiveForm([{ key: 'query', label: '关键词', value: '' }]),
      pagination: usePagination(),
      rows: [{ id: 1, title: '示例' }],
      columns: [{ prop: 'id', label: 'ID' }, { prop: 'title', label: '标题' }],
      actions: [{ key: 'edit', title: '编辑' }]
    }
  },
  methods: {
    save() { return true },
    search(values) { console.log(values) },
    onAction(key) { console.log(key) }
  }
}
</script>
```

`ElePopupModal` 实例提供 `toggle(true | false)`；`onSubmit`、`onCancel` 返回 `false` 时保持弹窗打开。`EleZealTable` 的列支持 `render2(row, index)` 或 `slot`，例如列设置 `slot: 'cell-title'` 后可通过同名作用域插槽读取 `row`。`EleZealCard` 的默认插槽可读取 `tableHeight`、`isMobile`、`width`、`height`。同时导出 `useZealColumnTool`、`useWindowSize`、`useObserverSize` 和 `usePagination`，供组合式组件使用。


## 构建产物

`npm run build`、`npm run build-v2` 和 `npm run build:all` 使用同一套 Rollup 多入口构建，先清空 dist，再生成主入口和 Element UI 子入口：

```text
dist/
├── index.mjs
├── index.cjs
├── index.d.ts
├── index.css
├── elementUi/
│   ├── index.mjs
│   ├── index.cjs
│   ├── index.d.ts
│   ├── EleDynamicForm.d.ts
│   ├── formTypes.d.ts
│   └── hooks/
├── chunks/              # 两个入口共享的运行时代码
├── hooks/
├── origin/
├── types/
└── utils/
```

`npm run build:elementUi` 可单独构建 Element UI 入口，输出到 `dist/elementUi/`，不清空其他入口。共享代码和样式仍由 Rollup 输出到 dist 中；发布前请执行完整构建。`npm run build:dts` 仅生成类型声明，目录与 JS 入口保持一致。

```js
import { DynamicInput } from 'dynamicformdjx-vue2'
import { EleDynamicForm } from 'dynamicformdjx-vue2/elementUi'
import 'dynamicformdjx-vue2/style.css'
```

Vue 和 Element UI 作为外部依赖保留，由使用方安装，不会打进组件库产物。现有 Webpack 项目仍可使用包根目录的 elementUi.js 兼容入口。
