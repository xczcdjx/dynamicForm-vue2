import Vue, {PropType, VNode, CreateElement} from 'vue'
import type {LoadedScrollSlots} from '../types/loadedScroll'

const loadedScrollProps = {
    loading: {
        type: Boolean,
        default: false
    },
    isError: {
        type: Boolean,
        default: false
    },
    loadData: {
        type: Function as PropType<() => Promise<void>>,
        required: true
    },
    scrollNode: {
        type: String,
        required: true
    },
    loadingTxt: {
        type: String,
        default: 'loading...'
    },
    finishedTxt: {
        type: String,
        default: 'no more data'
    },
    errorTxt: {
        type: String,
        default: 'fetch error , click again'
    },
    finished: {
        type: Boolean,
        default: false
    },
    offset: {
        type: Number,
        default: 20
    },
    memoryScroll: {
        type: Boolean,
        default: false
    },
    pullRefresh: {
        type: Boolean,
        default: false
    },
    refreshData: {
        type: Function as PropType<() => Promise<void>>,
    },
    pullDistance: {
        type: Number,
        default: 70
    },
    pullTxt: {
        type: String,
        default: 'pull to refresh'
    },
    releaseTxt: {
        type: String,
        default: 'release to refresh'
    },
    refreshingTxt: {
        type: String,
        default: 'refreshing...'
    },
    supportMode: {
        type: String as PropType<'pc' | 'mobile' | 'all'>,
        default: 'mobile'
    },
    refreshLoading: {
        type: Boolean,
        default: true
    },
    stackStatus: {
        // true 时常驻展示结束/错误提示，false 时仅在滚动底部展示
        type: Boolean,
        default: true
    },
}

export default Vue.extend({
    name: 'LoadedScroll',
    props: loadedScrollProps,
    model: {prop: 'loading', event: 'update:loading'},
    data() {
        return {
            hintHeight: 0,
            isAtBottom: false,
            pullY: 0,
            touching: false,
            refreshing: false,
            pending: false,
            ready: false,
            disposed: false,
            scrollEl: null as HTMLElement | null,
            hintObserver: null as ResizeObserver | null,
            gesture: null as {id: number; y: number; pointer: boolean} | null,
        }
    },
    computed: {
        showBottomStatus(): boolean {
            return this.stackStatus || this.isAtBottom
        },
    },
    watch: {
        loading: 'syncAfterRender',
        finished: 'syncAfterRender',
        isError: 'syncAfterRender',
        scrollNode: 'syncAfterRender',
    },
    async mounted() {
        this.hintObserver = new ResizeObserver(this.syncLayout)
        this.hintObserver.observe(this.$refs.bottomHint as HTMLElement)
        const wrap = this.$el
        wrap.addEventListener('pointerdown', this.handleStart as EventListener)
        wrap.addEventListener('touchstart', this.handleStart as EventListener, {passive: true})
        window.addEventListener('pointermove', this.handleMove)
        window.addEventListener('touchmove', this.handleMove, {passive: false})
        window.addEventListener('pointerup', this.handleEnd)
        window.addEventListener('pointercancel', this.handleEnd)
        window.addEventListener('touchend', this.handleEnd)
        window.addEventListener('touchcancel', this.handleEnd)
        this.syncLayout()
        await this.fetchData()
        if (!this.disposed) {
            await this.bindScroll()
            this.ready = true
        }
    },
    updated() {
        this.syncLayout()
    },
    beforeDestroy() {
        this.disposed = true
        this.hintObserver?.disconnect()
        this.scrollEl?.removeEventListener('scroll', this.handleScroll)
        this.$el.removeEventListener('pointerdown', this.handleStart as EventListener)
        this.$el.removeEventListener('touchstart', this.handleStart as EventListener)
        window.removeEventListener('pointermove', this.handleMove)
        window.removeEventListener('touchmove', this.handleMove)
        window.removeEventListener('pointerup', this.handleEnd)
        window.removeEventListener('pointercancel', this.handleEnd)
        window.removeEventListener('touchend', this.handleEnd)
        window.removeEventListener('touchcancel', this.handleEnd)
    },
    methods: {
        async syncAfterRender() {
            await this.$nextTick()
            if (!this.disposed) this.syncLayout()
        },
        syncLayout() {
            if (this.disposed) return
            const node = this.$el.querySelector<HTMLElement>(this.scrollNode)
            if (node !== this.scrollEl) {
                this.scrollEl?.removeEventListener('scroll', this.handleScroll)
                this.scrollEl = node
                if (node) {
                    if (!this.memoryScroll) node.scrollTop = 0
                    node.addEventListener('scroll', this.handleScroll)
                }
            }
            this.hintHeight = (this.$refs.bottomHint as HTMLElement)?.getBoundingClientRect().height ?? 0
            this.updateBottomStatus()
        },
        async bindScroll() {
            await this.$nextTick()
            if (this.disposed) return
            this.syncLayout()
            if (this.scrollEl && !this.memoryScroll) this.scrollEl.scrollTop = 0
            this.updateBottomStatus()
        },
        updateBottomStatus(): boolean {
            if (!this.scrollEl) {
                this.isAtBottom = false
                return false
            }
            const {scrollTop, clientHeight, scrollHeight} = this.scrollEl
            // 补回提示占位，避免表格高度改变导致提示反复显隐。
            this.isAtBottom = scrollTop + clientHeight + this.hintHeight >= scrollHeight - this.offset
            return scrollTop + clientHeight >= scrollHeight - this.offset
        },
        handleScroll() {
            const bottom = this.updateBottomStatus()
            if (!this.ready || this.pending || this.loading || this.finished || this.isError || !bottom) return
            void this.fetchData()
        },
        async fetchData(refresh = false) {
            if (this.pending || this.disposed) return
            this.pending = true
            const showLoading = !refresh || this.refreshLoading
            if (showLoading) this.$emit('update:loading', true)
            this.$emit('update:isError', false)
            if (refresh) {
                this.refreshing = true
                this.pullY = this.pullDistance
            }
            try {
                if (refresh) await this.refreshData?.()
                else await this.loadData()
            } catch {
                if (!this.disposed) this.$emit('update:isError', true)
            } finally {
                if (!this.disposed) {
                    if (showLoading) this.$emit('update:loading', false)
                    if (refresh) await this.bindScroll()
                    await this.$nextTick()
                    if (!this.disposed) {
                        this.pending = false
                        this.refreshing = false
                        if (refresh) this.pullY = 0
                        this.syncLayout()
                    }
                }
            }
        },
        eventPoint(event: PointerEvent | TouchEvent): {id: number; y: number} | null {
            if ('pointerId' in event) return {id: event.pointerId, y: event.clientY}
            const touch = Array.from(event.changedTouches).find(t => !this.gesture || t.identifier === this.gesture.id)
            return touch ? {id: touch.identifier, y: touch.clientY} : null
        },
        handleStart(event: PointerEvent | TouchEvent) {
            const pointer = 'pointerId' in event
            // all 模式下触屏只处理 touch，避免一次手势触发两次。
            if (pointer && (this.supportMode === 'mobile' || event.pointerType === 'touch' || event.button !== 0)) return
            if (!pointer && this.supportMode === 'pc') return
            if (this.gesture || !this.pullRefresh || !this.refreshData || this.pending || this.loading || (this.scrollEl?.scrollTop ?? 0) > 2) return
            if (event.target instanceof Element && event.target.closest('[data-no-pull]')) return
            const pos = this.eventPoint(event)
            if (!pos) return
            this.gesture = {...pos, pointer}
            this.touching = true
        },
        handleMove(event: PointerEvent | TouchEvent) {
            if (!this.gesture || this.gesture.pointer !== ('pointerId' in event)) return
            const pos = this.eventPoint(event)
            if (!pos || pos.id !== this.gesture.id || (this.scrollEl?.scrollTop ?? 0) > 2) return
            this.pullY = Math.min(Math.max(0, pos.y - this.gesture.y) * 0.45, this.pullDistance + 30)
            if (this.pullY > 0 && event.cancelable) event.preventDefault()
        },
        handleEnd(event: PointerEvent | TouchEvent) {
            if (!this.gesture || this.gesture.pointer !== ('pointerId' in event)) return
            const pos = this.eventPoint(event)
            if (!pos || pos.id !== this.gesture.id) return
            this.gesture = null
            this.touching = false
            if (!event.type.endsWith('cancel') && this.pullY >= this.pullDistance) void this.fetchData(true)
            else this.pullY = 0
        },
    },
    render(h: CreateElement): VNode {
        const slots = this.$scopedSlots as LoadedScrollSlots
        const content = (name: keyof Omit<LoadedScrollSlots, 'default'>, fallback?: string) => {
            const value = slots[name]?.() ?? this.$slots[name] ?? fallback
            return value && typeof value !== 'string' && !Array.isArray(value) ? [value] : value
        }
        const hints: VNode[] = []
        if (this.loading) hints.push(h('div', {key: 'loading', class: 'hintText'}, content('loadingTxt', this.loadingTxt)))
        if (this.showBottomStatus && this.finished) hints.push(h('div', {key: 'finished', class: 'hintText'}, content('finishedTxt', this.finishedTxt)))
        if (this.showBottomStatus && this.isError && !this.loading) hints.push(h('div', {
            key: 'error', class: 'hintText errorTxt',
            attrs: {'data-no-pull': '', role: 'button', tabindex: 0},
            on: {
                click: () => this.fetchData(),
                keydown: (event: KeyboardEvent) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        void this.fetchData()
                    }
                },
            },
        }, content('errorTxt', this.errorTxt)))
        const pullName = this.refreshing ? 'refreshingTxt' : this.pullY >= this.pullDistance ? 'releaseTxt' : 'pullTxt'
        return h('div', {class: 'loadedScroll'}, [
            this.pullRefresh ? h('div', {class: 'pullRefreshHint', style: {
                height: `${this.pullY}px`, lineHeight: `${this.pullY}px`,
                transition: this.touching ? 'none' : 'height .25s', overflow: 'hidden', textAlign: 'center',
            }}, content(pullName, this[pullName])) : null,
            slots.default?.({hintHeight: this.hintHeight}) ?? this.$slots.default,
            h('div', {ref: 'bottomHint', style: {display: 'flow-root'}},
                content('bottomHint') ?? hints),
        ])
    },
})
