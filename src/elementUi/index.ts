// src/lib/index.ts
import Vue, {PluginObject} from 'vue'
import EleDynamicForm from "./EleDynamicForm";

export {EleDynamicForm}
// 可选：支持 Vue.use() 全局注册
const DynamicFormPlugin: PluginObject<any> = {
    install(v: typeof Vue) {
        v.component('EleDynamicForm', EleDynamicForm)
    },
}

export default DynamicFormPlugin
