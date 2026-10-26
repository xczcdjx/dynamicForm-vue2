import Vue from 'vue'
import type { DyFormItem } from '../elementUi/formTypes'

type KeyOf<Row> = Extract<keyof Row, string>
type ItemList<Row> = DyFormItem<Row>[] | { value: DyFormItem<Row>[] }
export type DyFormItemLike<Row extends Record<string, any>> = DyFormItem<Row>

function isRef(value: any): value is { value: any } {
    return !!value && typeof value === 'object' && value.__v_isRef === true
}

function getItemValue(item: DyFormItem): any {
    return isRef(item.value) ? item.value.value : item.value
}

function putItemValue(item: DyFormItem, value: any): void {
    if (isRef(item.value)) item.value.value = value
    else Vue.set(item, 'value', value)
}

/** Make items observable when they are created outside a Vue component's data(). */
export function useReactiveForm<Row extends Record<string, any>>(
    items: DyFormItemLike<Row>[], isReactive = true
): DyFormItem<Row>[] {
    return isReactive ? items.map(item => Vue.observable(item)) : items
}

/** Operations on the same item objects consumed by EleDynamicForm. */
export function useDyForm<Row extends Record<string, any>>(items: ItemList<Row>) {
    const getItems = (): DyFormItem<Row>[] => Array.isArray(items) ? items : items.value
    const find = <K extends KeyOf<Row>>(key: K) => getItems().find(item => item.key === key)

    const setDisabled = (disabled: boolean, keys?: KeyOf<Row>[]): void => {
        getItems().forEach(item => {
            if (!keys || keys.includes(item.key as KeyOf<Row>)) Vue.set(item, 'disabled', disabled)
        })
    }

    const setHidden = (hidden: boolean, keys?: KeyOf<Row>[]): void => {
        getItems().forEach(item => {
            if (!keys || keys.includes(item.key as KeyOf<Row>)) Vue.set(item, 'hidden', hidden)
        })
    }

    const setValue = <K extends KeyOf<Row>>(key: K, value: Row[K]): void => {
        const item = find(key)
        if (item) putItemValue(item, value)
    }

    const setValues = (patch: Partial<Row>): void => {
        Object.keys(patch).forEach(key => setValue(key as KeyOf<Row>, patch[key as KeyOf<Row>] as Row[KeyOf<Row>]))
    }

    const getValue = <K extends KeyOf<Row>>(key: K): Row[K] | undefined => {
        const item = find(key)
        return item ? getItemValue(item) : undefined
    }

    const getValues = <K extends KeyOf<Row>>(keys?: readonly K[]): Partial<Row> => {
        const selected = keys ? new Set<string>(keys) : null
        return getItems().reduce((result, item) => {
            if (!selected || selected.has(item.key)) result[item.key as KeyOf<Row>] = getItemValue(item)
            return result
        }, {} as Partial<Row>)
    }

    const onReset = (value: any = null): void => {
        getItems().forEach(item => putItemValue(item, value))
    }

    const getItem = <K extends KeyOf<Row>>(key: K): DyFormItem<Row> | undefined => find(key)

    const setItem = <K extends KeyOf<Row>>(key: K, patch: Partial<Omit<DyFormItem<Row>, 'key'>>): void => {
        const item = find(key)
        if (!item) return
        Object.keys(patch).forEach(name => Vue.set(item, name, patch[name]))
    }

    const setItems = <K extends KeyOf<Row>>(patches: [K, Partial<Omit<DyFormItem<Row>, 'key'>>][]): void => {
        patches.forEach(([key, patch]) => setItem(key, patch))
    }

    const updateKeys = <K extends KeyOf<Row>>(patches: [K, string][]): void => {
        patches.forEach(([key, newKey]) => {
            const item = find(key)
            if (item) Vue.set(item, 'key', newKey)
        })
    }

    return {
        setDisabled, setHidden, setValue, setValues, getValue, getValues,
        onReset, getItem, setItem, setItems, updateKeys
    }
}
