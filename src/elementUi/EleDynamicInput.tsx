import { VNode } from 'vue'
import { Button, Input } from 'element-ui'
import DynamicInput from '../origin/DynamicInput'
import type { DyBtnConfig, DyConfig, DyCFormItem, DynamicInputSlots } from '../types'
import { formatNumberInput, resetObj } from '../utils/tools'

export default DynamicInput.extend({
    name: 'EleDynamicInput',
    watch: {
        renderM: {
            handler(items: DyCFormItem[]) {
                if (this.isController) this.$emit('onMerge', resetObj(items, this.ml.arraySplitSymbol), items)
            },
            deep: true
        }
    },
    render(h): VNode {
        const buttons: DyBtnConfig = { resetTxt: '重置', newTxt: '添加项', mergeTxt: '合并', ...this.btnConfigs }
        const config: DyConfig = {
            hideReset: false, maxHeight: '300px', autoScroll: true, allowFilter: true,
            hideArrayBtn: false, hideNumberBtn: false, ...this.configs
        }
        const slots = this.$scopedSlots as DynamicInputSlots
        const size = this.size === 'large' ? 'medium' : this.size === 'small' ? 'small' : undefined
        const button = (title: string, type: string, click: () => void, disabled = false) =>
            h(Button, { props: { type, size, disabled }, on: { click } }, [title])
        const append = () => {
            this.addRInput()
            if (config.autoScroll) this.$nextTick(() => {
                const list = this.$refs.dyFormListRef as HTMLElement
                if (list) list.scrollTop = list.scrollHeight
            })
        }
        const rows = this.renderM.map((item, index, arr) => {
            const scope = {
                row: item, index, isLast: index === arr.length - 1,
                addItem: append,
                removeItem: () => { this.renderM = this.renderM.filter(row => row.rId !== item.rId) },
                toggleArray: () => (item.isArray = !item.isArray),
                toggleNumber: () => (item.isNumber = !item.isNumber)
            }
            const typeTools = slots.typeTools ? slots.typeTools(scope) : [
                !config.hideArrayBtn && button('Array', item.isArray ? 'success' : '', scope.toggleArray),
                !config.hideNumberBtn && button('Number', item.isNumber ? 'success' : '', scope.toggleNumber)
            ]
            const valueInput = h(Input, {
                class: 'value',
                props: { value: item.value, size },
                on: { input: (value: string) => {
                    item.value = config.allowFilter && item.isNumber
                        ? formatNumberInput(value, item.isArray, this.ml.arraySplitSymbol) : value
                } }
            }, [h('span', { slot: 'prefix', class: 'typeTools' }, typeTools)])
            return h('div', { class: 'dItem', key: item.rId }, [
                h('div', { class: 'input' }, [
                    h(Input, { class: 'key', props: { value: item.key, size },
                        on: { input: (value: string) => { item.key = value } } }),
                    h('span', ':'), valueInput
                ]),
                h('div', { class: 'btn' }, slots.rowActions ? slots.rowActions(scope) : [
                    button('+', 'success', scope.addItem, !scope.isLast),
                    button('-', 'danger', scope.removeItem)
                ])
            ])
        })
        const controls = [
            !this.renderM.length && (slots.newBtn ? slots.newBtn({ newItem: append }) : button(buttons.newTxt, 'success', append)),
            !this.isController && h('div', [
                !config.hideReset && (slots.resetBtn ? slots.resetBtn({ reset: this.reset }) : button(buttons.resetTxt, '', this.reset)),
                slots.mergeBtn ? slots.mergeBtn({ merge: this.merge }) : button(buttons.mergeTxt, 'info', this.merge)
            ])
        ]
        return h('div', { class: [this.dyCls || 'dynamicInput', this.size] }, [
            h('div', { class: ['dyFormList', !rows.length && 'noList'], style: { maxHeight: config.maxHeight }, ref: 'dyFormListRef' }, rows),
            h('div', { class: ['control', !rows.length && 'noList'] }, controls)
        ])
    }
})
