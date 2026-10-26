import Vue, { PropType, VNode } from 'vue'
import { Button, Card } from 'element-ui'
import type { SizeObjType } from '../types/slots'

export default Vue.extend({
    name: 'EleZealCard',
    props: {
        title: String,
        zealHeight: { type: String, default: '100vh' },
        outPadding: { type: Number, default: 20 },
        searchBtnTxt: { type: Array as PropType<string[]>, default: () => ['Reset', 'Search'] },
        checkWindowSize: { type: Array as PropType<number[]>, default: () => [756, 500] },
        observeDelay: { type: Number, default: 100 }
    },
    data() {
        return {
            tableHeight: 0,
            windowWidth: typeof window === 'undefined' ? 0 : window.innerWidth,
            windowHeight: typeof window === 'undefined' ? 0 : window.innerHeight,
            observer: null as ResizeObserver | null,
            resizeTimer: null as ReturnType<typeof setTimeout> | null
        }
    },
    computed: {
        isMobile(): boolean { return this.windowWidth <= (this.checkWindowSize[0] || 756) }
    },
    mounted() {
        window.addEventListener('resize', this.onResize)
        this.$nextTick(() => {
            this.observeSize()
            this.measure()
        })
    },
    updated() { this.scheduleMeasure() },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize)
        this.observer?.disconnect()
        if (this.resizeTimer) clearTimeout(this.resizeTimer)
    },
    methods: {
        onResize() {
            this.windowWidth = window.innerWidth
            this.windowHeight = window.innerHeight
            this.scheduleMeasure()
        },
        scheduleMeasure() {
            if (this.resizeTimer) clearTimeout(this.resizeTimer)
            this.resizeTimer = setTimeout(this.measure, this.observeDelay)
        },
        observeSize() {
            if (typeof ResizeObserver === 'undefined') return
            this.observer = new ResizeObserver(this.scheduleMeasure)
            const wrap = this.$refs.wrap as HTMLElement | undefined
            const card = (this.$refs.card as Vue | undefined)?.$el as HTMLElement | undefined
            const rest = this.$refs.rest as HTMLElement | undefined
            const header = card?.querySelector('.el-card__header')
            const body = card?.querySelector('.el-card__body')
            ;[wrap, card, rest, header, body].forEach(el => { if (el) this.observer?.observe(el) })
        },
        measure() {
            const wrap = this.$refs.wrap as HTMLElement | undefined
            const card = (this.$refs.card as Vue | undefined)?.$el as HTMLElement | undefined
            const rest = this.$refs.rest as HTMLElement | undefined
            const footer = this.$refs.footer as HTMLElement | undefined
            if (!wrap || !card) return
            const header = card.querySelector('.el-card__header') as HTMLElement | null
            const body = card.querySelector('.el-card__body') as HTMLElement | null
            const style = body ? getComputedStyle(body) : null
            const pad = style ? parseFloat(style.paddingTop || '0') + parseFloat(style.paddingBottom || '0') : 0
            const next = Math.max(0, wrap.clientHeight - (rest?.offsetHeight || 0) - (header?.offsetHeight || 0) - (footer?.offsetHeight || 0) - pad)
            if (next !== this.tableHeight) this.tableHeight = next
        },
        slot(name: string, scope: object): VNode[] | undefined {
            return this.$scopedSlots[name]?.(scope) || this.$slots[name]
        }
    },
    render(h): VNode {
        const size: SizeObjType = { isMobile: this.isMobile, width: this.windowWidth, height: this.windowHeight }
        const searchForm = this.slot('searchForm', size)
        const headerContent = this.slot('header', size) || [
            h('div', { class: 'title' }, [this.title || '']),
            h('div', { class: 'search' }, [
                searchForm,
                this.slot('searchBtn', size) || (searchForm && h('div', { class: 'searchBtn' }, [
                    h(Button, { props: { size: 'small' } }, [this.searchBtnTxt[0]]),
                    h(Button, { props: { type: 'info', size: 'small' } }, [this.searchBtnTxt[1]])
                ]))
            ])
        ]
        const header = h('div', { slot: 'header', class: 'header' }, [
            headerContent,
            h('div', { class: 'controlBtn' }, [
                h('div', this.slot('controlBtn', size)), this.slot('toolBtn', size)
            ])
        ])
        const footer = this.slot('footer', size)
        return h('div', { ref: 'wrap', class: 'zealCard', style: { height: `calc(${this.zealHeight} - ${this.outPadding * 2}px)` } }, [
            h(Card, { ref: 'card', class: 'zealCardInner' }, [
                header,
                this.slot('default', { ...size, tableHeight: this.tableHeight }),
                footer && h('div', { ref: 'footer', class: 'footer' }, footer)
            ]),
            h('div', { ref: 'rest' }, this.slot('rest', size))
        ])
    }
})
