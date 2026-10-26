export type PageModal = {
    pageSize: number
    pageNo: number
    total: number
}

export type ZealPagination = PageModal & {
    showSizePicker: boolean
    pageCount?: number
    pageSizes: number[]
    pageSlot?: number
    layout?: string
    onChange: () => void
    onPageSizeChange: () => void
    setTotalSize: (total: number) => void
}

export type ZealColumn<T extends Record<string, any> = Record<string, any>> = {
    label?: string
    prop?: keyof T & string
    key?: string
    width?: string | number
    minWidth?: string | number
    type?: 'default' | 'selection' | 'index' | 'expand'
    align?: 'left' | 'center' | 'right'
    fixed?: boolean | 'left' | 'right'
    sortable?: boolean | 'custom'
    showOverflowTooltip?: boolean
    resizable?: boolean
    render2?: (row: T, index: number) => import('vue').VNode | string | number | null
    slot?: string
    [key: string]: any
}

export type TableBtnType = {
    key: string
    title?: string
    onSelect?: (key: string) => void
    disabled?: boolean
    [key: string]: any
}

export type ZealColumnType = {
    tableHeight: import('vue').ComputedRef<number>
    isMobile: import('vue').ComputedRef<boolean>
}
