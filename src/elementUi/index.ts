import Vue, { PluginObject } from 'vue'
import EleDynamicForm from './EleDynamicForm'
import EleDynamicInput from './EleDynamicInput'
import ElePopupModal from './ElePopupModal'
import EleZealCard from './EleZealCard'
import {
    EleZealTableSearch, EleZealTablePaginationControl, EleZealTable, EleZealTableBtnControl
} from './EleZealTableTool'

export {
    EleDynamicForm, EleDynamicInput, ElePopupModal, EleZealCard,
    EleZealTableSearch, EleZealTablePaginationControl, EleZealTable, EleZealTableBtnControl
}
export * from './formTypes'
export * from './hooks/renderForm'
export * from './hooks/useZealTool'
export { useDecorateForm } from './hooks/decorateForm'
export { useReactiveForm, useDyForm } from '../hooks/useDyForm'
export { usePagination } from '../hooks/zealForm'
export { useWindowSize, useObserverSize } from '../hooks/useTool'
export type { DyFormItemLike } from '../hooks/useDyForm'
export type { ZealColumn, ZealPagination, PageModal, TableBtnType, ZealColumnType } from '../types/form'

export type eleDynamicInputRef = InstanceType<typeof EleDynamicInput>
export type eleDynamicFormRef = InstanceType<typeof EleDynamicForm>
export type elePopupModalRef = InstanceType<typeof ElePopupModal>
export type eleZealCardRef = InstanceType<typeof EleZealCard>
export type eleZealTableSearchRef = InstanceType<typeof EleZealTableSearch>

const EleDynamicFormPlugin: PluginObject<any> = {
    install(v: typeof Vue) {
        v.component('EleDynamicForm', EleDynamicForm)
        v.component('EleDynamicInput', EleDynamicInput)
        v.component('ElePopupModal', ElePopupModal)
        v.component('EleZealCard', EleZealCard)
        v.component('EleZealTableSearch', EleZealTableSearch)
        v.component('EleZealTablePaginationControl', EleZealTablePaginationControl)
        v.component('EleZealTable', EleZealTable)
        v.component('EleZealTableBtnControl', EleZealTableBtnControl)
    }
}

export default EleDynamicFormPlugin
