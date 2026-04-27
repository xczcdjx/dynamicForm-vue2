import {VNode} from "vue";

export type DyCFormItem = {
    rId: string;
    key: string;
    value: string;
    isArray?: boolean;
    isNumber?: boolean;
};
export type DyCasFormItem = {
    rId: string;
    key: string;
    value: string | DyCasFormItem[];
    isArray?: boolean
    isNumber?: boolean
};
export type FSize = "small" | "large" | "default"
export type DyBtnConfig = Record<'resetTxt' | 'newTxt' | 'mergeTxt', string>
export type DyConfig = {
    // 隐藏重置按钮 (默认false)
    hideReset?: boolean;
    // 输入栏最大高度 (默认300px)
    maxHeight?: string;
    // 新增项超过高度时是否自动滚动 (默认true)
    autoScroll?: boolean;
    // 允许输入过滤  (默认true)
    allowFilter?: boolean;
    // ...
}
export type DyCasConfig = {
    showBorder?: boolean
    retractLen?: number
    borderColors?: string[]
    showPad?: boolean
} & Omit<DyConfig, 'autoScroll'>
export type DyListConfig = {
    // 分隔符
    arraySplitSymbol: string
    // ...
}
export type ScopeType = {
    row: {
        rId: string
        key: string
        value: string
        isArray?: boolean | undefined
        isNumber?: boolean | undefined
    }
    index: number
    isLast: boolean
    addItem: () => void
    removeItem: () => void
    toggleArray: () => boolean
    toggleNumber: () => boolean
}
export type CasScopeType = ScopeType & { addChild: () => void }

export interface DynamicInputSlots {
    newBtn?: ({newItem}: { newItem: () => void }) => VNode[]
    resetBtn?: ({reset}: { reset: () => void }) => VNode[]
    mergeBtn?: ({merge}: { merge: () => void }) => VNode[]
    typeTools?: (row: ScopeType) => VNode[]
    rowActions?: (row: ScopeType) => VNode[]
}

export interface DynamicCasInputSlots extends Omit<DynamicInputSlots, 'rowActions' | 'typeTools'> {
    typeTools?: (row: CasScopeType) => VNode[]
    rowActions?: (row: CasScopeType) => VNode[]
    newChild?: (row: CasScopeType) => VNode[]
}

export type ValueType = Record<string, any>
// 内部新建键值对id
export type DyRandomFun = (id?: number | string) => string
export type ExposeType = {
    onSet?: (obj?: object) => void
    getResult?: (t: 'res' | 'ori') => DyCFormItem[] | object
}
