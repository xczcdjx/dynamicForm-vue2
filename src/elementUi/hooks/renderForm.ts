import Vue, { CreateElement, VNode } from 'vue'
import {
    Input, InputNumber, Select, Option, OptionGroup, Radio, RadioButton,
    RadioGroup, Checkbox, CheckboxGroup, Switch, DatePicker, TimePicker,
    Slider, Cascader, Tag
} from 'element-ui'
import { DyFormItem, SelectOptionItem } from '../formTypes'

// Vue 2 has no global h(). These VNodes are created synchronously while the form renders.
const h: CreateElement = new Vue().$createElement
export type SelectOption = SelectOptionItem
export type TreeSelectOption = SelectOptionItem
export type RenderProps = Record<string, any>

type Model = any
const inputPropNames = new Set([
    'value', 'size', 'resize', 'form', 'disabled', 'readonly', 'type', 'autosize',
    'autocomplete', 'autoComplete', 'validateEvent', 'suffixIcon', 'prefixIcon',
    'label', 'clearable', 'showPassword', 'showWordLimit', 'tabindex'
])

function read(model: Model, item?: DyFormItem): any {
    const value = item ? item.value : model
    return value && typeof value === 'object' && value.__v_isRef === true ? value.value : value
}

function write(model: Model, item: DyFormItem | undefined, value: any, options?: SelectOptionItem[]): void {
    if (item) {
        if (item.value && typeof item.value === 'object' && item.value.__v_isRef === true) item.value.value = value
        else Vue.set(item, 'value', value)
        item.onChange?.(value, item, options ?? item.options)
    } else if (model && typeof model === 'object' && 'value' in model) {
        model.value = value
    }
}

function fieldProps(item?: DyFormItem): RenderProps {
    if (!item) return {}
    const { placeholder, clearable, disabled, filterable, multiple, type, rows } = item
    return { placeholder, clearable, disabled, filterable, multiple, type, rows }
}

function control(component: any, model: Model, optionProps: RenderProps = {}, item?: DyFormItem, event = 'input'): VNode {
    return h(component, {
        props: { ...fieldProps(item), ...optionProps, value: read(model, item) },
        on: { [event]: (value: any) => write(model, item, value) }
    })
}

function optionsOf(options: SelectOptionItem[], item?: DyFormItem): SelectOptionItem[] {
    return item?.options ?? options
}

function fields(item?: DyFormItem) {
    return { label: item?.labelField || 'label', value: item?.valueField || 'value' }
}

function selectOptions(options: SelectOptionItem[], item?: DyFormItem): VNode[] {
    const names = fields(item)
    return options.map((option, index) => {
        const children = option.children || option.options
        if (children) return h(OptionGroup, { key: String(index), props: { label: option[names.label] } }, selectOptions(children, item))
        return h(Option, { key: String(index), props: {
            label: option[names.label], value: option[names.value], disabled: option.disabled
        } })
    })
}

export function renderInput(model: Model, optionProps: RenderProps = {}, rf?: DyFormItem): VNode {
    const inputProps: RenderProps = {}
    const attrs: RenderProps = {}
    const merged: RenderProps = { ...fieldProps(rf), ...optionProps, value: read(model, rf) }
    Object.keys(merged).forEach(key => {
        if (merged[key] === undefined) return
        if (inputPropNames.has(key)) inputProps[key] = merged[key]
        else attrs[key] = merged[key]
    })
    return h(Input, {
        props: inputProps,
        attrs,
        on: { input: (value: any) => write(model, rf, value) }
    })
}

export function renderSelect(model: Model, options: SelectOption[], optionProps: RenderProps = {}, rf?: DyFormItem): VNode {
    const opts = optionsOf(options, rf)
    return h(Select, {
        props: { ...fieldProps(rf), ...optionProps, value: read(model, rf) },
        on: { input: (value: any) => write(model, rf, value, opts) }
    }, selectOptions(opts, rf))
}

// Element UI's select provides the same single/multiple value behavior.
export function renderPopSelect(model: Model, options: SelectOption[], optionProps: RenderProps = {}, rf?: DyFormItem, _defaultRender?: VNode): VNode {
    return renderSelect(model, options, optionProps, rf)
}

export function renderTreeSelect(model: Model, options: TreeSelectOption[], optionProps: RenderProps = {}, rf?: DyFormItem): VNode {
    const data = optionsOf(options, rf)
    const names = fields(rf)
    const props = {
        value: names.value, label: names.label, children: rf?.childrenField || 'children',
        emitPath: false, ...(optionProps.props || {})
    }
    return h(Cascader, {
        props: { ...fieldProps(rf), ...optionProps, props, options: data, value: read(model, rf) },
        on: { input: (value: any) => write(model, rf, value, data) }
    })
}

function renderChoices(component: any, model: Model, options: SelectOption[], optionProps: RenderProps, rf?: DyFormItem): VNode {
    const opts = optionsOf(options, rf)
    const names = fields(rf)
    const group = component === Checkbox ? CheckboxGroup : RadioGroup
    return h(group, {
        props: { ...fieldProps(rf), ...optionProps, value: read(model, rf) },
        on: { input: (value: any) => write(model, rf, value, opts) }
    }, opts.map((option, index) => h(component,
        { key: String(index), props: { label: option[names.value], disabled: option.disabled } },
        [String(option[names.label] ?? '')]
    )))
}

export function renderRadioGroup(model: Model, options: SelectOption[], optionProps: RenderProps = {}, rf?: DyFormItem): VNode {
    return renderChoices(Radio, model, options, optionProps, rf)
}

export function renderRadioButtonGroup(model: Model, options: SelectOption[], optionProps: RenderProps = {}, rf?: DyFormItem): VNode {
    return renderChoices(RadioButton, model, options, optionProps, rf)
}

export function renderCheckboxGroup(model: Model, options: SelectOption[], optionProps: RenderProps = {}, rf?: DyFormItem): VNode {
    return renderChoices(Checkbox, model, options, optionProps, rf)
}

export function renderSwitch(model: Model, optionProps: RenderProps = {}, rf?: DyFormItem): VNode {
    return control(Switch, model, optionProps, rf)
}

export function renderDatePicker(model: Model, optionProps: RenderProps = {}, rf?: DyFormItem): VNode {
    return control(DatePicker, model, optionProps, rf)
}

export function renderTimePicker(model: Model, optionProps: RenderProps = {}, rf?: DyFormItem): VNode {
    return control(TimePicker, model, optionProps, rf)
}

export function renderCheckbox(model: Model, optionProps: RenderProps = {}, rf?: DyFormItem): VNode {
    return control(Checkbox, model, { label: rf?.label, ...optionProps }, rf)
}

export function renderSlider(model: Model, optionProps: RenderProps = {}, rf?: DyFormItem): VNode {
    return control(Slider, model, optionProps, rf)
}

export function renderInputNumber(model: Model, optionProps: RenderProps = {}, rf?: DyFormItem): VNode {
    return control(InputNumber, model, optionProps, rf, 'change')
}

const tagStates = new WeakMap<object, { draft: string }>()
export function renderDynamicTags(model: Model, optionProps: RenderProps = {}, rf?: DyFormItem): VNode {
    const key = rf || (model && typeof model === 'object' ? model : null)
    const state = key ? tagStates.get(key) || Vue.observable({ draft: '' }) : Vue.observable({ draft: '' })
    if (key && !tagStates.has(key)) tagStates.set(key, state)
    const current = read(model, rf)
    const tags: any[] = Array.isArray(current) ? current : []
    const valueField = rf?.valueField
    const labelField = rf?.labelField || 'label'
    const update = (next: any[]) => write(model, rf, next)
    const add = () => {
        const text = state.draft.trim()
        if (!text) return
        update([...tags, valueField ? { [labelField]: text, [valueField]: text } : text])
        state.draft = ''
    }
    return h('div', { class: 'dynamic-form-tags' }, [
        ...tags.map((tag, index) => h(Tag, {
            key: String(index), props: { closable: true, ...optionProps },
            on: { close: () => update(tags.filter((_, i) => i !== index)) }
        }, [String(valueField ? tag[labelField] : tag)])),
        h(Input, {
            style: { width: '120px', display: 'inline-block' },
            props: { size: 'mini', value: state.draft, placeholder: rf?.placeholder || '新增标签' },
            on: { input: (value: string) => { state.draft = value }, blur: add },
            nativeOn: { keydown: (event: KeyboardEvent) => { if (event.key === 'Enter') add() } }
        })
    ])
}
