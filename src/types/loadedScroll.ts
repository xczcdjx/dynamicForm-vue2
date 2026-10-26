import type {VNode} from 'vue'

/** 与 Vue3 版 LoadedScroll 同名属性及默认值保持一致。 */
export interface LoadedScrollProps {
    loadData: () => Promise<void>
    scrollNode: string
    loading?: boolean
    isError?: boolean
    finished?: boolean
    offset?: number
    memoryScroll?: boolean
    stackStatus?: boolean
    pullRefresh?: boolean
    refreshData?: () => Promise<void>
    pullDistance?: number
    supportMode?: 'pc' | 'mobile' | 'all'
    refreshLoading?: boolean
    loadingTxt?: string
    finishedTxt?: string
    errorTxt?: string
    pullTxt?: string
    releaseTxt?: string
    refreshingTxt?: string
}

type HintSlot = () => VNode | VNode[] | undefined
export interface LoadedScrollSlots {
    default?: (scope: {hintHeight: number}) => VNode | VNode[] | undefined
    bottomHint?: HintSlot
    loadingTxt?: HintSlot
    finishedTxt?: HintSlot
    errorTxt?: HintSlot
    pullTxt?: HintSlot
    releaseTxt?: HintSlot
    refreshingTxt?: HintSlot
}

export interface LoadedScrollListeners {
    'update:loading'?: (value: boolean) => void
    'update:isError'?: (value: boolean) => void
}
