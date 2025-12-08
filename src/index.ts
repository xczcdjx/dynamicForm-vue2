// src/lib/index.ts
import Vue, { PluginObject } from 'vue'
import DynamicInput from "./origin/DynamicInput";
import DynamicCascadeInput from "./origin/DynamicCascadeInput";
import './index.less'
export {DynamicInput,DynamicCascadeInput}
// 可选：支持 Vue.use() 全局注册
const DynamicFormPlugin: PluginObject<any> = {
    install(v: typeof Vue) {
        v.component('DynamicInput', DynamicInput)
        v.component('DynamicCascadeInput', DynamicCascadeInput)
    },
}

export default DynamicFormPlugin
