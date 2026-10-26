import Vue, { PropType, VNode } from 'vue'
import { Form, FormItem, Row, Col } from 'element-ui'
import { DyFormItem, PresetType, RenderType } from './formTypes'
import * as renderers from './hooks/renderForm'

function fieldValue(item: DyFormItem): any {
    const value = item.value
    return value && typeof value === 'object' && value.__v_isRef === true ? value.value : value
}

function assignValue(item: DyFormItem, value: any): void {
    if (item.value && typeof item.value === 'object' && item.value.__v_isRef === true) {
        item.value.value = value
    } else {
        Vue.set(item, 'value', value)
    }
    item.onChange?.(value, item, item.options)
}

export default Vue.extend({
    name: 'EleDynamicForm',
    props: {
        items: { type: Array as PropType<DyFormItem[]>, required: true },
        formConfig: { type: Object as PropType<Record<string, any>>, default: () => ({ labelPosition: 'left' }) },
        rowConfig: { type: Object as PropType<Record<string, any>>, default: () => ({ gutter: 10 }) },
        rules: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
        preset: {
            type: String as PropType<PresetType>,
            default: 'fullRow',
            validator: (value: string) => value === 'fullRow' || value === 'grid'
        }
    },
    computed: {
        visibleItems(): DyFormItem[] {
            return this.items.filter(item => !item.hidden).slice().sort((a, b) =>
                (a.sort ?? Infinity) - (b.sort ?? Infinity))
        },
        formModel(): Record<string, any> {
            return this.visibleItems.reduce((model, item) => {
                model[item.key] = fieldValue(item)
                return model
            }, {} as Record<string, any>)
        },
        combinedRules(): Record<string, any> {
            const rules: Record<string, any> = {}
            this.visibleItems.forEach(item => {
                if (item.rule) rules[item.path || item.key] = item.rule
                else if (item.required) rules[item.path || item.key] = {
                    required: true,
                    message: item.requiredHint?.(item.label || '') || `${item.label || item.key}不能为空`,
                    trigger: 'blur'
                }
            })
            return { ...rules, ...this.rules }
        }
    },
    methods: {
        getResult(type: 'res' | 'ori' = 'res'): Record<string, any> | DyFormItem[] {
            return type === 'ori' ? this.visibleItems : { ...this.formModel }
        },
        reset(value: any = null): void {
            this.visibleItems.forEach(item => assignValue(item, value))
            this.$nextTick(() => (this.$refs.form as Form | undefined)?.clearValidate())
        },
        validator(): Promise<Record<string, any>> {
            return new Promise((resolve, reject) => {
                const form = this.$refs.form as Form | undefined
                if (!form) return reject(new Error('Form is not mounted'))
                form.validate((valid: boolean, fields: object) => {
                    if (valid) resolve({ ...this.formModel })
                    else reject(fields)
                })
            })
        },
        renderControl(h: typeof this.$createElement, item: DyFormItem): VNode | VNode[] | null {
            const setValue = (value: any) => assignValue(item, value)
            if (item.render2) return item.render2(item, setValue)
            const type = (item.renderType || 'renderInput') as RenderType
            const renderer = renderers[type] as (...args: any[]) => VNode
            const withOptions = /^(renderSelect|renderPopSelect|renderTreeSelect|renderRadioGroup|renderRadioButtonGroup|renderCheckboxGroup)$/.test(type)
            return withOptions
                ? renderer(item.value, item.options || [], item.renderProps || {}, item)
                : renderer(item.value, item.renderProps || {}, item)
        }
    },
    render(h): VNode {
        const fields = this.visibleItems.map(item => {
            const formItem = h(FormItem, {
                key: item.key,
                props: { label: item.label, prop: item.path || item.key }
            }, [this.renderControl(h, item)])
            return this.preset === 'grid'
                ? h(Col, { key: item.key, props: { span: item.span ?? 24, offset: item.offset ?? 0 } }, [formItem])
                : formItem
        })
        return h('div', { class: 'dynamicForm' }, [
            this.$scopedSlots.header && h('div', { class: 'header' }, this.$scopedSlots.header({})),
            h(Form, { ref: 'form', props: { ...this.formConfig, model: this.formModel, rules: this.combinedRules } },
                this.preset === 'grid' ? [h(Row, { props: this.rowConfig }, fields)] : fields),
            this.$scopedSlots.footer && h('div', { class: 'footer' }, this.$scopedSlots.footer({}))
        ])
    }
})
