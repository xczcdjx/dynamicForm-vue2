import { DecorateDyFormItem, DyFormItem, RenderType } from '../formTypes'
import * as renderers from './renderForm'
import { useReactiveForm } from '../../hooks/useDyForm'

const optionRenderers = new Set<RenderType>([
    'renderSelect', 'renderPopSelect', 'renderTreeSelect',
    'renderRadioGroup', 'renderRadioButtonGroup', 'renderCheckboxGroup'
])

export function useDecorateForm<Row extends Record<string, any>>(
    items: DecorateDyFormItem<Row>[], isReactive = true
): DyFormItem<Row>[] {
    const decorated = items.map(item => {
        if (item.render2) return item
        const renderType = item.renderType || 'renderInput'
        const renderer = renderers[renderType] as (...args: any[]) => any
        item.render2 = current => optionRenderers.has(renderType)
            ? renderer(current.value, current.options || [], current.renderProps || {}, current)
            : renderer(current.value, current.renderProps || {}, current)
        return item
    })
    return useReactiveForm(decorated, isReactive)
}
