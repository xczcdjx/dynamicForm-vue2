import Vue from 'vue'
import type { ZealPagination } from '../types/form'

export function usePagination(callback?: () => void, options: Partial<ZealPagination> = {}): ZealPagination {
    const pagination = Vue.observable<ZealPagination>({
        pageNo: 1,
        pageSize: 25,
        total: 0,
        showSizePicker: true,
        pageSizes: [25, 50, 100, 200],
        pageSlot: 5,
        layout: 'total, prev, pager, next, sizes, jumper',
        onChange: () => callback?.(),
        onPageSizeChange: () => callback?.(),
        setTotalSize(total: number) { pagination.total = total },
        ...options
    })
    return pagination
}
