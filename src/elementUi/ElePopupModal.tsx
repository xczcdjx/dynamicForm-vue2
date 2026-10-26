import Vue, { PropType, VNode } from 'vue'
import { Button, Dialog } from 'element-ui'

export default Vue.extend({
    name: 'ElePopupModal',
    props: {
        title: String,
        modalProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
        to: { type: [String, Object] as PropType<string | HTMLElement> },
        showClose: { type: Boolean, default: true },
        closeOnMask: { type: Boolean, default: true },
        width: { type: String, default: 'min(1080px,90%)' },
        onCancel: { type: Function as PropType<() => boolean | void | Promise<boolean | void>>, default: () => true },
        onSubmit: { type: Function as PropType<() => boolean | void | Promise<boolean | void>>, default: () => true },
        footerTxt: { type: Array as PropType<string[]>, default: () => ['Cancel', 'Submit'] }
    },
    data() {
        return { show: false, cancelLoading: false, submitLoading: false }
    },
    methods: {
        toggle(value?: boolean): void {
            this.show = value === undefined ? !this.show : value
            if (this.show) this.$nextTick(this.syncTarget)
        },
        syncTarget(): void {
            if (!this.to) return
            const target = typeof this.to === 'string' ? document.querySelector(this.to) : this.to
            const el = (this.$refs.dialog as Vue | undefined)?.$el
            if (target && el && el.parentNode !== target) target.appendChild(el)
        },
        async cancel(): Promise<void> {
            this.cancelLoading = true
            try {
                if (await (this.onCancel as () => boolean | void | Promise<boolean | void>)() !== false) this.toggle(false)
            } finally {
                this.cancelLoading = false
            }
        },
        async submit(): Promise<void> {
            this.submitLoading = true
            try {
                if (await (this.onSubmit as () => boolean | void | Promise<boolean | void>)() !== false) this.toggle(false)
            } finally {
                this.submitLoading = false
            }
        }
    },
    render(h): VNode {
        const footer = this.$slots.footer || [
            h(Button, { props: { size: 'small', loading: this.cancelLoading }, on: { click: this.cancel } }, [this.footerTxt[0]]),
            h(Button, { props: { size: 'small', type: 'success', loading: this.submitLoading }, on: { click: this.submit } }, [this.footerTxt[1]])
        ]
        const children = [
            ...(this.$slots.default || []),
            this.$slots.title && h('span', { slot: 'title' }, this.$slots.title),
            h('span', { slot: 'footer', class: 'popup-modal-footer' }, footer)
        ]
        return h(Dialog, {
            ref: 'dialog',
            props: {
                appendToBody: true,
                ...this.modalProps,
                title: this.title,
                visible: this.show,
                showClose: this.showClose,
                closeOnClickModal: this.closeOnMask,
                width: this.width
            },
            on: { 'update:visible': (visible: boolean) => { this.show = visible } }
        }, children)
    }
})
