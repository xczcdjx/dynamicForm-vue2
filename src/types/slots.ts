import type { VNode } from 'vue'

export type SizeObjType = { isMobile: boolean; width: number; height: number }
export type ZealCardSlots = {
    searchForm?: (size: SizeObjType) => VNode[]
    searchBtn?: (size: SizeObjType) => VNode[]
    controlBtn?: (size: SizeObjType) => VNode[]
    toolBtn?: (size: SizeObjType) => VNode[]
    default?: (size: SizeObjType & { tableHeight: number }) => VNode[]
    rest?: (size: SizeObjType) => VNode[]
    footer?: (size: SizeObjType) => VNode[]
    header?: (size: SizeObjType) => VNode[]
}
export type ZealTableSearchSlots = {
    title?: () => VNode[]
    searchBtn?: (scope: { onSearch: () => void; onReset: () => void }) => VNode[]
    drawerBtn?: (scope: { openDrawer: () => void }) => VNode[]
}
