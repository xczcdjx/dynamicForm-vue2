<script lang="ts">
import Vue, { defineComponent, getCurrentInstance, h } from 'vue'
import {
  EleDynamicForm,
  ElePopupModal,
  EleZealCard,
  EleZealTable,
  EleZealTableBtnControl,
  EleZealTablePaginationControl,
  EleZealTableSearch,
  useDecorateForm,
  useDyForm,
  usePagination,
  useZealColumnTool
} from '@/elementUi'
import type { elePopupModalRef, eleDynamicFormRef, TableBtnType } from '@/elementUi'

interface SongRow {
  no: number
  title: string
  length: string
}

type SearchValues = Omit<SongRow, 'no'> & { no: number | '' | null | undefined }

type RowActions = {
  editItem(row: SongRow): void
  deleteItem(row: SongRow): void
}

const seedRows: SongRow[] = [
  { no: 3, title: 'Wonderwall', length: '4:18' },
  { no: 4, title: "Don't Look Back in Anger", length: '4:48' },
  { no: 12, title: 'Champagne Supernova', length: '7:27' },
  ...Array.from({ length: 50 }, (_, i) => ({
    no: i + 13, title: 'test Data ' + (i + 1), length: String(i * i)
  }))
]

export default defineComponent({
  name: 'finalTypeTest',
  components: {
    EleDynamicForm, ElePopupModal, EleZealCard, EleZealTableSearch,
    EleZealTablePaginationControl, EleZealTable, EleZealTableBtnControl
  },
  setup () {
    const instance = getCurrentInstance()
    if (!instance) throw new Error('finalTypeTest must be initialized inside setup')
    const vm = instance.proxy as Vue & RowActions
    const upItem = (row: SongRow): void => vm.editItem(row)
    const delItem = (row: SongRow): void => vm.deleteItem(row)
    const { tableColumns, eleZealCardRef } = useZealColumnTool<SongRow>(({ isMobile }) => [
      { type: 'selection' },
      { prop: 'no', label: 'No' },
      { prop: 'title', label: 'Title', slot: 'mobile-title' },
      { prop: 'length', label: 'Length' },
      {
        label: 'Actions', fixed: 'right', width: isMobile.value ? 100 : 180,
        render2: row => {
          const btnItems: TableBtnType[] = [
            { title: 'Update', key: 'up', onSelect: () => upItem(row) },
            { title: 'Delete', key: 'del', type: 'danger', onSelect: () => delItem(row) }
          ]
          return h(EleZealTableBtnControl, {
            props: { isMobile: isMobile.value, btnItems }
          })
        }
      }
    ], { align: 'center' })
    return { tableColumns, eleZealCardRef }
  },
  data () {
    return {
      sourceRows: seedRows.map(row => ({ ...row })),
      tableData: [] as SongRow[],
      selectedNos: [] as number[],
      editingNo: null as number | null,
      loading: false,
      searchItems: useDecorateForm<SearchValues>([
        { key: 'no', label: 'No', value: undefined, renderType: 'renderInputNumber',
          renderProps: { placeholder: 'Please Input' }, span: 8 },
        { key: 'title', label: 'Title', value: '', renderProps: { placeholder: 'Please Input' }, span: 8 },
        { key: 'length', label: 'Length', value: '', renderProps: { placeholder: 'Please Input' }, span: 8 },
        ...Array(30).fill({
          key: "length",
          label: "Length",
          span:8
        })
      ]),
      editItems: useDecorateForm<SongRow>([
        { key: 'no', label: 'No', value: null, required: true, renderType: 'renderInputNumber' },
        { key: 'title', label: 'Title', value: '', required: true },
        { key: 'length', label: 'Length', value: '', required: true }
      ]),
      pagination: usePagination()
    }
  },
  created () {
    this.pagination.layout = 'total, prev, pager, next, sizes'
    this.pagination.onChange = this.fetchData
    this.pagination.onPageSizeChange = this.fetchData
    this.fetchData()
  },
  methods: {
    async fetchData (): Promise<void> {
      this.loading = true
      const values = useDyForm(this.searchItems).getValues()
      const rows = this.sourceRows.filter(row =>
          (values.no === null || values.no === '' || values.no === undefined || row.no === Number(values.no)) &&
          (!values.title || row.title.toLowerCase().includes(String(values.title).toLowerCase())) &&
          (!values.length || row.length.includes(String(values.length)))
      )
      const lastPage = Math.max(1, Math.ceil(rows.length / this.pagination.pageSize))
      if (this.pagination.pageNo > lastPage) this.pagination.pageNo = lastPage
      const start = (this.pagination.pageNo - 1) * this.pagination.pageSize
      this.tableData = await new Promise<SongRow[]>((resolve) => {
        setTimeout(() => {
          resolve(rows.slice(start, start + this.pagination.pageSize))
          this.pagination.total = rows.length
        }, 1500)
      })
      this.selectedNos = []
      this.$nextTick(() => { this.loading = false })
    },
    search () {
      this.pagination.pageNo = 1
      this.fetchData()
    },
    resetSearch () {
      useDyForm(this.searchItems).setValue('no', undefined)
      this.pagination.pageNo = 1
      this.fetchData()
    },
    addItem () {
      this.editingNo = null
      useDyForm(this.editItems).setValues({
        no: Math.max(0, ...this.sourceRows.map(row => Number(row.no))) + 1,
        title: '', length: ''
      })
      ;(this.$refs.modal as elePopupModalRef).toggle(true)
    },
    editItem (row: SongRow): void {
      this.editingNo = row.no
      useDyForm(this.editItems).setValues(row)
      ;(this.$refs.modal as elePopupModalRef).toggle(true)
    },
    async saveItem (): Promise<boolean> {
      let values: Record<string, unknown>
      try {
        values = await (this.$refs.editForm as eleDynamicFormRef).validator()
      } catch (error) {
        return false
      }
      const no = Number(values.no)
      if (this.sourceRows.some(row => row.no === no && row.no !== this.editingNo)) {
        this.$message.error('No 已存在')
        return false
      }
      const row = { no, title: String(values.title), length: String(values.length) }
      if (this.editingNo === null) this.sourceRows.unshift(row)
      else {
        const index = this.sourceRows.findIndex(item => item.no === this.editingNo)
        if (index !== -1) this.$set(this.sourceRows, index, row)
      }
      this.pagination.pageNo = 1
      this.fetchData()
      this.$message.success(this.editingNo === null ? 'Add successful' : 'Update successful')
      return true
    },
    deleteItem (row: SongRow): void {
      this.sourceRows = this.sourceRows.filter(item => item.no !== row.no)
      this.fetchData()
      this.$message.success('Delete successful')
    },
    deleteSelected () {
      this.sourceRows = this.sourceRows.filter(row => !this.selectedNos.includes(row.no))
      this.fetchData()
      this.$message.success('Delete selected successful')
    },
    onSelectionChange (rows: SongRow[]): void {
      this.selectedNos = rows.map(row => row.no)
    },
    rowActions (row: SongRow): TableBtnType[] {
      return [
        { key: 'update', title: 'Update', onSelect: () => this.editItem(row) },
        { key: 'delete', title: 'Delete', type: 'danger', onSelect: () => this.deleteItem(row) }
      ]
    }
  }
})
</script>

<template>
  <main class="zeal-final">
    <EleZealCard ref="eleZealCardRef" zeal-height="100vh" :out-padding="20">
      <template #header="{ isMobile }">
        <EleZealTableSearch ref="search" title="zeal test" :is-mobile="isMobile" :size="320"
                            form-size="small"
                            :search-items="searchItems" @onSearch="search" @onReset="resetSearch" />
      </template>
      <template #controlBtn>
        <el-button type="success" size="small" @click="addItem">Add</el-button>
        <el-button type="danger" size="small" :disabled="!selectedNos.length" @click="deleteSelected">Del Selected</el-button>
      </template>
      <template #toolBtn>
        <el-button size="small">Tool...</el-button>
      </template>
      <template #default="{ tableHeight }">
        <EleZealTable :data="tableData" :columns="tableColumns"
                      :max-height="tableHeight"
                      :loading="loading" :table-config="{ size: 'small' }"
                      @selection-change="onSelectionChange">
          <template #mobile-title="cell">
            <div class="mobile-song-title" :title="cell.row.title">{{ cell.row.title }}</div>
            <small class="mobile-song-length">{{ cell.row.length }}</small>
          </template>
          <template #empty><p>No data</p></template>
        </EleZealTable>
      </template>
      <template #footer="{ isMobile }">
        <EleZealTablePaginationControl :is-mobile="isMobile" :pagination="pagination" />
      </template>
      <template #rest>
        <ElePopupModal ref="modal" :title="editingNo === null ? 'add Test' : 'update Test'"
                       :modal-props="{ customClass: 'zeal-final-dialog' }" :on-submit="saveItem">
          <EleDynamicForm ref="editForm" :items="editItems" />
        </ElePopupModal>
      </template>
    </EleZealCard>
  </main>
</template>