import Vue, { PropType, VNode } from 'vue'
import {
    Button, Drawer, Pagination, Table, TableColumn, Dropdown, DropdownMenu, DropdownItem
} from 'element-ui'
import EleDynamicForm from './EleDynamicForm'
import { useDyForm } from '../hooks/useDyForm'
import type { DyFormItem } from './formTypes'
import type { ZealColumn, ZealPagination, TableBtnType } from '../types/form'

export const EleZealTableSearch = Vue.extend({
    name: 'EleZealTableSearch',
    props: {
        title: String,
        drawerTitle: String,
        searchItems: { type: Array as PropType<DyFormItem[]>, default: () => [] },
        searchFormMaxHeight: { type: String, default: '200px' },
        size: { type: [Number, String] as PropType<number | string>, default: 240 },
        drawerOpenTxt: { type: String, default: 'Search Drawer' },
        searchBtnTxt: { type: Array as PropType<string[]>, default: () => ['Reset', 'Search'] },
        mobileDrawer: { type: Boolean, default: true },
        closeDrawerAuto: { type: Boolean, default: false },
        copyDefault: { type: Boolean, default: false },
        isMobile: { type: Boolean, default: false },
        formSize:{
            type: String as PropType<"" | "medium" | "small" | "mini">,
            default: 'default'
        }
    },
    data() { return { drawShow: false, copyData: {} as Record<string, any> } },
    mounted() { if (this.copyDefault) this.copyData = useDyForm(this.searchItems).getValues() },
    watch: {
        isMobile(value: boolean) { if (!value && !this.closeDrawerAuto) this.drawShow = false }
    },
    methods: {
        toggleDrawer(value?: boolean) { this.drawShow = value === undefined ? !this.drawShow : value },
        onReset() {
            const form = useDyForm(this.searchItems)
            if (this.copyDefault) form.setValues(this.copyData)
            else form.onReset(null)
            this.$emit('onReset')
            this.toggleDrawer(false)
        },
        onSearch() {
            this.$emit('onSearch', this.getParams())
            this.toggleDrawer(false)
        },
        getParams(): Record<string, any> { return useDyForm(this.searchItems).getValues() },
        actionButtons(h: typeof this.$createElement): VNode {
            const buttons = this.$scopedSlots.searchBtn?.({ onSearch: this.onSearch, onReset: this.onReset })
            return h('div', { class: 'searchBtn' }, buttons || [
                h(Button, { props: { size: 'small' }, on: { click: this.onReset } }, [this.searchBtnTxt[0]]),
                h(Button, { props: { type: 'primary', size: 'small' }, on: { click: this.onSearch } }, [this.searchBtnTxt[1]])
            ])
        }
    },
    render(h): VNode {
        const title = this.$scopedSlots.title?.({}) || h('div', { class: 'naiTitle' }, [this.title || ''])
        const searchForm = (inDrawer: boolean) => h('div', {
            class: 'searchForm', style: { maxHeight: inDrawer ? undefined : this.searchFormMaxHeight }
        }, [h(EleDynamicForm, {
            props: { items: this.searchItems, preset: inDrawer ? 'fullRow' : 'grid',
                formConfig: { labelPosition: 'left', showMessage: false, size: inDrawer ? 'small' : this.formSize } }
        })])
        const desktop = !this.mobileDrawer || !this.isMobile
        const content = desktop ? [title, searchForm(false), this.actionButtons(h)] : [
            h('div', { class: 'drawerSearchBtn' }, [
                title,
                this.$scopedSlots.drawerBtn?.({ openDrawer: () => this.toggleDrawer(true) }) ||
                h(Button, { props: { size: 'small' }, on: { click: () => this.toggleDrawer(true) } }, [this.drawerOpenTxt])
            ])
        ]
        const drawer = h(Drawer, {
            class: 'eleZealSearchDrawer',
            props: { visible: this.drawShow, size: this.size, direction: 'ttb', appendToBody: true,
                title: this.drawerTitle || this.title },
            on: { 'update:visible': (value: boolean) => { this.drawShow = value } }
        }, [searchForm(true), this.actionButtons(h)])
        // Drawer moves its root to body. Keep a stable sibling so Vue never
        // inserts desktop fields relative to that detached root when resizing.
        return h('div', { class: 'eleZealTableSearch' }, [
            h('div', { key: 'search-content', class: 'searchContent' }, content),
            drawer
        ])
    }
})

function mobileLayout(layout?: string): string | undefined {
    return layout?.split(',').map(part => part.trim()).filter(part => part !== 'sizes' && part !== 'jumper').join(', ')
}

export const EleZealTablePaginationControl = Vue.extend({
    name: 'EleZealTablePaginationControl',
    props: {
        pagination: { type: Object as PropType<ZealPagination>, required: true },
        pageConfig: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
        isMobile: { type: Boolean, default: false }
    },
    methods: {
        onChange(page: number) {
            this.pagination.pageNo = page
            this.pagination.onChange()
        },
        onPageSizeChange(size: number) {
            this.pagination.pageNo = 1
            this.pagination.pageSize = size
            this.pagination.onPageSizeChange()
        }
    },
    render(h): VNode {
        return h(Pagination, {
            class: 'eleZealTablePaginationControl',
            props: {
                currentPage: this.pagination.pageNo,
                pageSize: this.pagination.pageSize,
                total: this.pagination.total,
                pageSizes: this.pagination.pageSizes,
                layout: this.isMobile && !this.$slots.default ? mobileLayout(this.pagination.layout) : this.pagination.layout,
                ...this.pageConfig
            },
            on: { 'current-change': this.onChange, 'size-change': this.onPageSizeChange }
        }, this.$slots.default)
    }
})

export const EleZealTable = Vue.extend({
    name: 'EleZealTable',
    inheritAttrs: false,
    props: {
        data: { type: Array as PropType<any[]>, default: () => [] },
        columns: { type: Array as PropType<ZealColumn<any>[]>, default: () => [] },
        loading: { type: Boolean, default: false },
        maxHeight: { type: [Number, String] as PropType<number | string> },
        columnAlign: { type: String as PropType<'left' | 'center' | 'right'> },
        stripe: { type: Boolean, default: true },
        border: { type: Boolean, default: false },
        tableConfig: { type: Object as PropType<Record<string, any>>, default: () => ({}) }
    },
    render(h): VNode {
        const columns = this.columns.map(column => {
            const { render2, slot, key, ...props } = column
            const slotName = slot || (column.prop ? `cell-${column.prop}` : '')
            const customSlot = this.$scopedSlots[slotName]
            const needsCell = !!render2 || !!customSlot || (!!column.prop && column.type !== 'selection' && column.type !== 'index')
            return h(TableColumn, {
                key: key || String(column.prop || column.label),
                props: { ...props, align: column.align || this.columnAlign },
                scopedSlots: needsCell ? { default: (scope: { row: any; $index: number }) => {
                    if (render2) return render2(scope.row, scope.$index)
                    if (customSlot) return customSlot(scope)
                    return column.prop ? scope.row[column.prop] : null
                } } : undefined
            })
        })
        const namedSlots = [
            this.$scopedSlots.empty && h('div', { slot: 'empty' }, this.$scopedSlots.empty({})),
            this.$scopedSlots.append && h('div', { slot: 'append' }, this.$scopedSlots.append({}))
        ]
        return h(Table, {
            class: 'eleZealTable',
            attrs: this.$attrs,
            props: { ...this.tableConfig, data: this.data, maxHeight: this.maxHeight,
                stripe: this.stripe, border: this.border },
            directives: [{ name: 'loading', value: this.loading }],
            on: this.$listeners
        }, [...columns, ...namedSlots])
    }
})

export const EleZealTableBtnControl = Vue.extend({
    name: 'EleZealTableBtnControl',
    props: {
        isMobile: { type: Boolean, default: false },
        btnItems: { type: Array as PropType<TableBtnType[]>, default: () => [] },
        size: { type: String, default: 'small' },
        dropDownProps: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
        dropDownText: { type: String, default: 'controls' }
    },
    methods: {
        onSelect(key: string) {
            this.btnItems.find(item => item.key === key)?.onSelect?.(key)
            this.$emit('onSelect', key)
        }
    },
    render(h): VNode {
        const size = this.size === 'large' ? 'medium' : this.size
        if (!this.isMobile) return h('div', { class: 'zealTableBtnControl' }, this.btnItems.map(item => {
            const { key, title, onSelect, ...props } = item
            return h(Button, { key, props: { ...props, size }, on: { click: () => this.onSelect(key) } }, [title || ''])
        }))
        const menu = h(DropdownMenu, { slot: 'dropdown' }, this.btnItems.map(item =>
            h(DropdownItem, { key: item.key, props: { command: item.key, disabled: item.disabled } }, [item.title || ''])
        ))
        const trigger = this.$slots.text || h(Button, { props: { size } }, [this.dropDownText])
        return h('div', { class: 'zealTableBtnControl',style:{
            justifyContent: 'center',
            } }, [
            h(Dropdown, {
                props: { size, trigger: 'click', placement: 'bottom', ...this.dropDownProps },
                on: { command: this.onSelect }
            }, [trigger, menu])
        ])
    }
})
