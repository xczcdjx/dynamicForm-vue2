<script lang="ts">
import {defineComponent, ref} from 'vue'
import {Table, TableColumn} from 'element-ui'
import {LoadedScroll} from '@/index'
import {EleZealCard} from '@/elementUi'

type Row = {id: number; name: string}
const pageSize = 20

export default defineComponent({
  name: 'TableScroll',
  components: {LoadedScroll, EleZealCard, ElTable: Table, ElTableColumn: TableColumn},
  setup() {
    const tableData = ref<Row[]>([])
    const loading = ref(false)
    const isError = ref(false)
    const finished = ref(false)
    let page = 1
    let failedOnce = false

    function mockApi(currentPage: number): Promise<Row[]> {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // 第三页只失败一次，方便验证错误提示和点击重试。
          if (currentPage === 3 && !failedOnce) {
            failedOnce = true
            reject(new Error('模拟加载失败'))
            return
          }
          if (currentPage > 5) {
            resolve([])
            return
          }
          const start = (currentPage - 1) * pageSize + 1
          resolve(Array.from({length: pageSize}, (_, index) => ({
            id: start + index,
            name: `数据 ${start + index}`
          })))
        }, 800)
      })
    }

    async function fetchData() {
      const currentPage = page
      const list = await mockApi(currentPage)
      finished.value = list.length < pageSize
      tableData.value = currentPage === 1 ? list : [...tableData.value, ...list]
      // 成功后才递增，失败重试不会跳页。
      page = currentPage + 1
    }

    async function refreshData() {
      page = 1
      failedOnce = false
      finished.value = false
      isError.value = false
      // 第一页返回后替换，刷新失败时保留原列表。
      await fetchData()
    }

    return {tableData, loading, isError, finished, fetchData, refreshData}
  }
})
</script>

<template>
  <!-- EleZealCard 内部复用 useWindowSize/useObserverSize，通过插槽提供尺寸。 -->
  <EleZealCard title="User List" :check-window-size="[756, 100]" :observe-delay="100">
    <template #controlBtn="{isMobile, width}">
      <span class="scroll-demo-description">
        {{ isMobile ? '移动端' : '桌面端' }} · {{ width }}px · 下拉刷新，滚动到底部加载更多
      </span>
    </template>

    <template #default="{tableHeight, isMobile}">
      <LoadedScroll
        :loading.sync="loading"
        :is-error.sync="isError"
        :load-data="fetchData"
        :finished="finished"
        scroll-node=".el-table__body-wrapper"
        :stack-status="false"
        pull-refresh
        :refresh-data="refreshData"
        support-mode="all"
        :refresh-loading="false"
      >
        <template #default="{hintHeight}">
          <!-- 表格自身滚动，表头固定；提示隐藏时 hintHeight 为 0。 -->
          <el-table
            :data="tableData"
            row-key="id"
            :height="Math.max(1, tableHeight - hintHeight)"
            :size="isMobile ? 'mini' : 'small'"
            border
          >
            <el-table-column prop="id" label="ID" :width="isMobile ? 80 : 120" />
            <el-table-column prop="name" label="名称" min-width="160" />
          </el-table>
        </template>
      </LoadedScroll>
    </template>
  </EleZealCard>
</template>

<style scoped>
.scroll-demo-description {
  color: #606266;
  font-size: 12px;
  white-space: normal;
}
</style>
