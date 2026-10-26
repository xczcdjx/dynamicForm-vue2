<template>
  <div>
    <EleDynamicForm ref="form" :items="items" preset="grid" :rules="rules" :form-config="{ labelWidth: '90px' }">
      <template #header><h2>Element UI 动态表单</h2></template>
      <template #footer>
        <el-button type="primary" @click="submit">校验并获取数据</el-button>
        <el-button @click="reset">重置</el-button>
        <el-button @click="setDis">{{ !dis ? '禁' : '启' }}用</el-button>
        <el-button @click="setObj">setData</el-button>
      </template>
    </EleDynamicForm>
    <pre>{{ result }}</pre>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  EleDynamicForm,
  EleDynamicFormRef,
  renderInput,
  renderSelect,
  useReactiveForm,
  useDyForm
} from '@/elementUi'

type FormRow = {
  name: string | null
  role: string | null
  enabled: boolean
  age: number
}
export default Vue.extend({
  components: {EleDynamicForm},
  name: 'base',
  data() {
    const items = useReactiveForm<FormRow>([
      {
        key: 'name', label: '姓名', value: '', required: true, span: 12,
        placeholder: '请输入姓名',
        render2: item => renderInput(item.value, {}, item)
      },
      {
        key: 'role', label: '角色', value: null, renderType: 'renderSelect', span: 12, sort: 1,
        options: [{label: '管理员', value: 'admin'}, {label: '访客', value: 'guest'}],
        render2: item => renderSelect(item.value, item.options || [], {}, item)
      },
      {key: 'enabled', label: '启用', value: false, renderType: 'renderSwitch', span: 12},
      {key: 'age', label: '年龄', value: 18, renderType: 'renderInputNumber', span: 12}
    ])
    return {
      dis: false,
      items,
      useForm: useDyForm<FormRow>(items),
      rules: {},
      result: ''
    }
  },
  methods: {
    async submit() {
      try {
        const value = await (this.$refs.form as EleDynamicFormRef).validator()
        this.result = JSON.stringify(value, null, 2)
      } catch (fields) {
        this.result = JSON.stringify(fields, null, 2)
      }
    },
    reset() {
      (this.$refs.form as EleDynamicFormRef).reset()
      this.result = ''
    },
    setDis() {
      // (this.$refs.form as EleDynamicFormRef).()
      this.dis = !this.dis
      this.useForm.setDisabled(this.dis)
    },
    setObj() {
      /*this.useForm.setItems([
        ['name', {value: 'xczcdjx'}],
        ['role', {value: 'admin'}],
      ])*/
      this.useForm.setValues({
        name: 'xczcdjx',
        role: 'admin',
      })
    }
  }
})
</script>

<style>
* {
  box-sizing: border-box;
}

#app {
  max-width: 760px;
  margin: 48px auto;
  padding: 24px;
}

pre {
  margin-top: 20px;
}
</style>
