import { defineComponent, PropType, VNode } from 'vue'
import { Button, Card } from 'element-ui'
import type { SizeObjType } from '../types/slots'
import {useWindowSize, useObserverSize} from '../hooks/useTool'

export default defineComponent({
    name: 'EleZealCard',
    props: {
        title: String,
        zealHeight: { type: String, default: '100vh' },
        outPadding: { type: Number, default: 20 },
        searchBtnTxt: { type: Array as PropType<string[]>, default: () => ['Reset', 'Search'] },
        checkWindowSize: { type: Array as PropType<number[]>, default: () => [756, 500] },
        observeDelay: { type: Number, default: 100 }
    },
    setup(props) {
        const {width, height, isMobile} = useWindowSize(
            () => props.checkWindowSize[0] ?? 756,
            () => props.checkWindowSize[1] ?? 500
        )
        const observer = useObserverSize(() => props.observeDelay)
        return {...observer, windowWidth: width, windowHeight: height, isMobile}
    },
    methods: {
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
        return h('div', { ref: 'wrapRef', class: 'zealCard', style: { height: `calc(${this.zealHeight} - ${this.outPadding * 2}px)` } }, [
            h(Card, { ref: 'cardRef', class: 'zealCardInner' }, [
                header,
                this.slot('default', { ...size, tableHeight: this.tableHeight }),
                footer && h('div', { ref: 'footerRef', class: 'footer' }, footer)
            ]),
            h('div', { ref: 'restRef' }, this.slot('rest', size))
        ])
    }
})
