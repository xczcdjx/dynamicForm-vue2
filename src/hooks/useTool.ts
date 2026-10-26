import Vue, { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

export function useWindowSize(mobileWidth = 756, delay = 500): {
    width: Ref<number>; height: Ref<number>; isMobile: ComputedRef<boolean>
} {
    const width = ref(typeof window === 'undefined' ? 0 : window.innerWidth)
    const height = ref(typeof window === 'undefined' ? 0 : window.innerHeight)
    let timer: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            width.value = window.innerWidth
            height.value = window.innerHeight
        }, delay)
    }
    onMounted(() => window.addEventListener('resize', onResize))
    onBeforeUnmount(() => {
        window.removeEventListener('resize', onResize)
        if (timer) clearTimeout(timer)
    })
    return { width, height, isMobile: computed(() => width.value <= mobileWidth) }
}

export function useObserverSize(delay = 100): {
    wrapRef: Ref<HTMLElement | null>
    cardRef: Ref<{ $el: Element } | HTMLElement | null>
    restRef: Ref<HTMLElement | null>
    tableHeight: Ref<number>
} {
    const wrapRef = ref<HTMLElement | null>(null)
    const cardRef = ref(null) as Ref<{ $el: Element } | HTMLElement | null>
    const restRef = ref<HTMLElement | null>(null)
    const tableHeight = ref(0)
    let observer: ResizeObserver | null = null
    let timer: ReturnType<typeof setTimeout> | undefined
    const measure = () => {
        const wrap = wrapRef.value
        const card = cardRef.value instanceof HTMLElement ? cardRef.value : cardRef.value?.$el as HTMLElement | undefined
        if (!wrap || !card) return
        const header = card.querySelector('.el-card__header') as HTMLElement | null
        const body = card.querySelector('.el-card__body') as HTMLElement | null
        const footer = card.querySelector('.footer') as HTMLElement | null
        const bodyStyle = body && getComputedStyle(body)
        const wrapStyle = getComputedStyle(wrap)
        const padding = bodyStyle ? parseFloat(bodyStyle.paddingTop) + parseFloat(bodyStyle.paddingBottom) : 0
        const wrapPadding = parseFloat(wrapStyle.paddingTop) + parseFloat(wrapStyle.paddingBottom)
        tableHeight.value = Math.max(0, wrap.clientHeight - wrapPadding -
            (restRef.value?.offsetHeight || 0) - (header?.offsetHeight || 0) -
            (footer?.offsetHeight || 0) - padding)
    }
    const schedule = () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(measure, delay)
    }
    onMounted(() => {
        Vue.nextTick(() => {
            measure()
            if (typeof ResizeObserver === 'undefined') {
                window.addEventListener('resize', schedule)
                return
            }
            observer = new ResizeObserver(schedule)
            const card = cardRef.value instanceof HTMLElement ? cardRef.value : cardRef.value?.$el as HTMLElement | undefined
            ;[wrapRef.value, restRef.value, card, card?.querySelector('.el-card__header'),
                card?.querySelector('.el-card__body')].forEach(el => { if (el) observer?.observe(el) })
        })
    })
    onBeforeUnmount(() => {
        observer?.disconnect()
        window.removeEventListener('resize', schedule)
        if (timer) clearTimeout(timer)
    })
    return { wrapRef, cardRef, restRef, tableHeight }
}
