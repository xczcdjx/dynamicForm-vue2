import { VNode } from 'vue'

export type PresetType = 'fullRow' | 'grid'
export type RenderType = 'renderInput' | 'renderSelect' | 'renderRadioGroup' |
    'renderRadioButtonGroup' | 'renderCheckboxGroup' | 'renderSwitch' |
    'renderDatePicker' | 'renderTimePicker' | 'renderCheckbox' |
    'renderSlider' | 'renderInputNumber' | 'renderPopSelect' |
    'renderTreeSelect' | 'renderDynamicTags'

export interface SelectOptionItem {
    label?: string
    value?: any
    disabled?: boolean
    children?: SelectOptionItem[]
    options?: SelectOptionItem[]
    [key: string]: any
}

export interface DyFormItem<Row = any> {
    key: keyof Row & string
    label?: string
    value: any
    path?: string
    hidden?: boolean
    disabled?: boolean
    required?: boolean
    requiredHint?: (label: string) => string
    rule?: object | object[]
    span?: number
    offset?: number
    sort?: number
    placeholder?: string
    options?: SelectOptionItem[]
    labelField?: string
    valueField?: string
    renderType?: RenderType
    renderProps?: Record<string, any>
    render2?: (item: DyFormItem<Row>, setValue: (value: any) => void) => VNode | VNode[] | null
    onChange?: (value: any, item: DyFormItem<Row>, options?: SelectOptionItem[]) => void
    [key: string]: any
}

export type DecorateDyFormItem<Row = any> = DyFormItem<Row>

export interface EleDynamicFormRef {
    reset(value?: any): void
    validator(): Promise<Record<string, any>>
    getResult(type?: 'res' | 'ori'): Record<string, any> | DyFormItem[]
}
