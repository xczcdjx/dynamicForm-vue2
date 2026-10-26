// src/lib/index.ts
import Vue, { PluginObject } from 'vue'
import LoadedScroll from "./origin/LoadedScroll";
export type {LoadedScrollProps, LoadedScrollSlots, LoadedScrollListeners} from "./types/loadedScroll";
import DynamicInput from "./origin/DynamicInput";
import DynamicCascadeInput from "./origin/DynamicCascadeInput";
import './index.less'
export {DynamicInput,DynamicCascadeInput,LoadedScroll}
export * from './hooks/useDyForm'
export * from './hooks/zealForm'
export * from './hooks/useTool'
export * from './utils/tools'
// 可选：支持 Vue.use() 全局注册
const DynamicInputPlugin: PluginObject<any> = {
    install(v: typeof Vue) {
        v.component('LoadedScroll', LoadedScroll)
        v.component('DynamicInput', DynamicInput)
        v.component('DynamicCascadeInput', DynamicCascadeInput)
    },
}

export default DynamicInputPlugin
