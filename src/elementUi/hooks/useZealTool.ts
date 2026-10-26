import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { ZealColumn, ZealColumnType } from '../../types/form'

type CardMetrics = { isMobile: boolean; tableHeight: number }

export function useZealColumnTool<T extends Record<string, any>>(
    createColumn: (state: ZealColumnType) => ZealColumn<T>[],
    config?: ZealColumn<T>
): { eleZealCardRef: Ref<CardMetrics | null>; tableColumns: ComputedRef<ZealColumn<T>[]> } {
    const eleZealCardRef = ref<CardMetrics | null>(null)
    const isMobile = computed(() => eleZealCardRef.value?.isMobile ?? false)
    const tableHeight = computed(() => eleZealCardRef.value?.tableHeight ?? 0)
    const tableColumns = computed(() => createColumn({ isMobile, tableHeight }).map(item => ({ ...config, ...item })))
    return { eleZealCardRef, tableColumns }
}
