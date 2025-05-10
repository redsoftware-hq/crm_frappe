<template>
  <LayoutHeader>
    <template #left-header>
      <ViewBreadcrumbs v-model="viewControls" routeName="Reports" />
    </template>
    <template #right-header>
      <CustomActions
        v-if="reportsListView?.customListActions"
        :actions="reportsListView.customListActions"
      />
      <!-- <Button
        variant="solid"
        :label="__('Create')"
        @click="showReportModal = true"
      >
        <template #prefix><FeatherIcon name="plus" class="h-4" /></template>
      </Button> -->
    </template>
  </LayoutHeader>
  
  <ViewControls
    ref="viewControls"
    v-model="reports"
    v-model:loadMore="loadMore"
    v-model:resizeColumn="triggerResize"
    v-model:updatedPageCount="updatedPageCount"
    doctype="Report"
  />

  <ReportsListView
    ref="reportsListView"
    v-if="reports.data && rows.length"
    v-model="reports.data.page_length_count"
    v-model:list="reports"
    :rows="rows"
    :columns="reports.data.columns"
    :options="{
      showTooltip: false,
      resizeColumn: true,
      rowCount: reports.data.row_count,
      totalCount: reports.data.total_count,
    }"
    @loadMore="() => loadMore++"
    @columnWidthUpdated="() => triggerResize++"
    @updatePageCount="(count) => (updatedPageCount = count)"
    @applyFilter="(data) => viewControls.applyFilter(data)"
    @applyLikeFilter="(data) => viewControls.applyLikeFilter(data)"
    @likeDoc="(data) => viewControls.likeDoc(data)"
  />

  <div
    v-else-if="reports.data"
    class="flex h-full items-center justify-center"
  >
    <div
      class="flex flex-col items-center gap-3 text-xl font-medium text-ink-gray-4"
    >
      <ReportsIcon class="h-10 w-10" />
      <span>{{ __('No {0} Found', [__('Reports')]) }}</span>
      <Button :label="__('Create')" @click="showReportModal = true">
        <template #prefix><FeatherIcon name="plus" class="h-4" /></template>
      </Button>
    </div>
  </div>

  <ReportModal v-model="showReportModal" v-model:report="report" />
</template>

<script setup>
import ViewBreadcrumbs from '@/components/ViewBreadcrumbs.vue'
import CustomActions from '@/components/CustomActions.vue'
import ReportsIcon from '@/components/Icons/DashboardIcon.vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import ReportModal from '@/components/Modals/ReportDetailModal.vue'
import ReportsListView from '../components/ListViews/ReportsListView.vue'
import ViewControls from '@/components/ViewControls.vue'
import { getMeta } from '@/stores/meta'
import { reportsStore } from '@/stores/reports.js'
import { formatDate, timeAgo } from '@/utils'
import { ref, computed } from 'vue'

const { getFormattedPercent, getFormattedFloat, getFormattedCurrency } =
  getMeta('Report')

const showReportModal = ref(false)
const report = ref({})

// reports data is loaded in the ViewControls component
const reports = ref({})
const loadMore = ref(1)
const triggerResize = ref(1)
const updatedPageCount = ref(20)
const viewControls = ref(null)
const reportsListView= ref(null)  

const rows = computed(() => {
  if (
    !reports.value?.data?.data ||
    !['list', 'group_by'].includes(reports.value.data.view_type)
  )
    return []
  return reports.value?.data.data.map((reportData) => {
    let _rows = {}
    reports.value?.data.rows.forEach((row) => {
      _rows[row] = reportData[row]

      let fieldType = reports.value?.data.columns?.find(
        (col) => (col.key || col.value) == row,
      )?.type

      if (
        fieldType &&
        ['Date', 'Datetime'].includes(fieldType) &&
        !['modified', 'creation'].includes(row)
      ) {
        _rows[row] = formatDate(reportData[row], '', true, fieldType == 'Datetime')
      }

      if (fieldType && fieldType == 'Currency') {
        _rows[row] = getFormattedCurrency(row, reportData)
      }

      if (fieldType && fieldType == 'Float') {
        _rows[row] = getFormattedFloat(row, reportData)
      }

      if (fieldType && fieldType == 'Percent') {
        _rows[row] = getFormattedPercent(row, reportData)
      }

      if (row == 'modified' || row == 'creation') {
        _rows[row] = {
          label: formatDate(reportData[row]),
          timeAgo: __(timeAgo(reportData[row])),
        }
      }
    })
    return _rows
  })
})
</script>
