import {computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref} from 'vue'
import type {ComputedRef, Ref} from 'vue'

type NumberSource = number | (() => number)
const readNumber = (value: NumberSource) => typeof value === 'function' ? value() : value

/** 在 setup 中调用；参数支持 getter，以响应组件 props 的变化。 */
export function useWindowSize(mobileWidth: NumberSource = 756, delay: NumberSource = 500): {
    width: Ref<number>; height: Ref<number>; isMobile: ComputedRef<boolean>
} {
    const width = ref(typeof window === 'undefined' ? 0 : window.innerWidth)
    const height = ref(typeof window === 'undefined' ? 0 : window.innerHeight)
    let timer: ReturnType<typeof setTimeout> | undefined
    const onResize = () => {
        clearTimeout(timer)
        timer = setTimeout(() => {
            width.value = window.innerWidth
            height.value = window.innerHeight
        }, readNumber(delay))
    }
    onMounted(() => window.addEventListener('resize', onResize))
    onBeforeUnmount(() => {
        window.removeEventListener('resize', onResize)
        clearTimeout(timer)
    })
    return {width, height, isMobile: computed(() => width.value <= readNumber(mobileWidth))}
}

/** 返回的 refs 绑定到容器、Card、外部内容和可选页脚。 */
export function useObserverSize(delay: NumberSource = 100): {
    wrapRef: Ref<HTMLElement | null>
    cardRef: Ref<{ $el: Element } | HTMLElement | null>
    restRef: Ref<HTMLElement | null>
    footerRef: Ref<HTMLElement | null>
    tableHeight: Ref<number>
    measure: () => void
} {
    const wrapRef = ref<HTMLElement | null>(null)
    const cardRef = ref(null) as Ref<{ $el: Element } | HTMLElement | null>
    const restRef = ref<HTMLElement | null>(null)
    const footerRef = ref<HTMLElement | null>(null)
    const tableHeight = ref(0)
    let observer: ResizeObserver | null = null
    let timer: ReturnType<typeof setTimeout> | undefined
    let disposed = false
    let observed: Element[] = []
    const getNodes = () => {
        const candidate = cardRef.value
        const card = candidate && ('$el' in candidate ? candidate.$el : candidate)
        return {
            wrap: wrapRef.value,
            card,
            rest: restRef.value,
            header: card?.querySelector<HTMLElement>('.el-card__header'),
            body: card?.querySelector<HTMLElement>('.el-card__body'),
            footer: footerRef.value ?? card?.querySelector<HTMLElement>('.footer'),
        }
    }
    const paddingY = (node: Element | null | undefined) => {
        if (!node) return 0
        const style = getComputedStyle(node)
        return (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0)
    }
    const measure = () => {
        if (disposed) return
        const {wrap, card, rest, header, body, footer} = getNodes()
        if (!wrap || !card) return
        tableHeight.value = Math.max(0, wrap.clientHeight - paddingY(wrap) -
            (rest?.offsetHeight || 0) - (header?.offsetHeight || 0) -
            (footer?.offsetHeight || 0) - paddingY(body))
    }
    const schedule = () => {
        clearTimeout(timer)
        timer = setTimeout(measure, readNumber(delay))
    }
    const observe = () => {
        const nodes = Object.values(getNodes()).filter((node): node is HTMLElement => !!node)
        if (nodes.length === observed.length && nodes.every((node, i) => node === observed[i])) return
        observer?.disconnect()
        nodes.forEach(node => observer?.observe(node))
        observed = nodes
    }
    onMounted(async () => {
        await nextTick()
        if (disposed) return
        if (typeof ResizeObserver !== 'undefined') observer = new ResizeObserver(schedule)
        observe()
        measure()
        window.addEventListener('resize', schedule)
    })
    onUpdated(() => {
        if (disposed) return
        // 插槽可动态增删页头/页脚，节点变化后重新订阅。
        observe()
        schedule()
    })
    onBeforeUnmount(() => {
        disposed = true
        observer?.disconnect()
        window.removeEventListener('resize', schedule)
        clearTimeout(timer)
    })
    return {wrapRef, cardRef, restRef, footerRef, tableHeight, measure}
}
