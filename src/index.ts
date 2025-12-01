// src/lib/index.ts
import Vue, { PluginObject } from 'vue'
import DynamicInput from "./origin/DynamicInput";
import './index.less'
export {DynamicInput}
// 可选：支持 Vue.use() 全局注册
const DynamicFormPlugin: PluginObject<any> = {
    install(v: typeof Vue) {
        v.component('DynamicInput', DynamicInput)
    },
}

export default DynamicFormPlugin
