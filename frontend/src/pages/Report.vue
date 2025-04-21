<template>
  <LayoutHeader v-if="report.data">
    <template #left-header>
      <Breadcrumbs :items="breadcrumbs">
        <template #prefix="{ item }">
          <Icon v-if="item.icon" :icon="item.icon" class="mr-2 h-4" />
        </template>
      </Breadcrumbs>
    </template>
    <!-- <template #right-header>
      <CustomActions
        v-if="report.data._customActions?.length"
        :actions="report.data._customActions"
      />
    </template> -->
  </LayoutHeader>
  <div v-if="report.data">
    <div class="flex-1 overflow-auto p-4">
      <table class="w-full table-auto border border-collapse border-gray-200">
        <thead class="bg-gray-100" v-if="columns.length">
          <tr>
            <th
              v-for="col in columns"
              :key="col.fieldname"
              class="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- If no data -->
          <tr v-if="!columns.length || !dataRows.length">
            <td
              :colspan="columns.length || 1"
              class="text-center py-6 text-gray-500 text-sm"
            >
              No data available
            </td>
          </tr>

          <!-- If data exists -->
          <tr
            v-else
            v-for="(row, rowIndex) in dataRows"
            :key="rowIndex"
            class="hover:bg-gray-50"
          >
            <td
              v-for="col in columns"
              :key="col.fieldname"
              class="border border-gray-300 px-4 py-2 text-sm text-gray-800"
            >
              {{ row[col.fieldname] ?? '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Error handling -->
  <ErrorPage v-else :errorTitle="errorTitle" :errorMessage="errorMessage" />

  <!-- Address modal -->
  <AddressModal v-model="showAddressModal" v-model:address="_address" />
</template>



<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Breadcrumbs,
  Avatar,
  FileUploader,
  Tabs,
  Dropdown,
  Badge,
  createResource,
} from 'frappe-ui'

import LayoutHeader from '@/components/LayoutHeader.vue'
import ErrorPage from '@/components/ErrorPage.vue'
import Resizer from '@/components/Resizer.vue'
import Icon from '@/components/Icon.vue'
import CameraIcon from '@/components/Icons/CameraIcon.vue'
import AddressModal from '@/components/Modals/AddressModal.vue'
import { globalStore } from '@/stores/global.js'
import { organizationsStore } from '@/stores/organizations.js'
import { getView } from '@/utils/view'
import { getSettings } from '@/stores/settings'
import { getMeta } from '@/stores/meta'

const route = useRoute()
const router = useRouter()

const props = defineProps({
  reportName: {
    type: String,
    default:""
  },
})

const reportName = computed(() => {
  return props.reportName
    || route.params.reportName       // if you ever set it via a :param on the path
    || route.query.view              // or if you pass it as ?view=…
})

const report = createResource({
  url: 'crm.api.report.get_report',
  cache: ['report_name', reportName.value],
  params: { report_name: reportName.value },
   auto: true,
  auto: true,
  transform: (data) => ({
    ...data,
    actual_mobile_no: data.mobile_no,
    mobile_no: data.mobile_no,
  }),
  onError: (err) => {
    if (err.messages?.[0]) {
      errorTitle.value = __('Not permitted')
      errorMessage.value = __(err.messages?.[0])
    } else {
      router.push({ name: 'Reports' })
    }
  },
})

const showAddressModal = ref(false)
const _address = ref({})
const errorTitle = ref('')
const errorMessage = ref('')
const tabIndex = ref(0)

const breadcrumbs = computed(() => {
  let items = [{ label: __('Reports'), route: { name: 'Reports' } }]
  if (route.query.view || route.query.viewType) {
    let view = getView(route.query.view, route.query.viewType, 'Report')
    if (view) {
      items.push({
        label: __(view.label),
        icon: view.icon,
        route: { name: 'Reports', query: { view: route.query.view } },
      })
    }
  }
  return items
})

const columns = ref([])
const rows = ref([])

const reportResource = createResource({
  url: 'crm.api.report.get_report',
  params: { report_name: props.reportName },
  auto: true,
  onSuccess: (res) => {
    console.log('Fetched report:', res)
    columns.value = res.columns
    rows.value = res.data
  },
  onError: (err) => {
    errorTitle.value = __('Report Error')
    errorMessage.value = err.message
  },
})

const dataRows = computed(() => rows.value || [])
</script>

<style scoped>
/* Scoped styles here if needed */
</style>
