<template>
    <LayoutHeader v-if="contact.data">
      <template #left-header>
        <Breadcrumbs :items="breadcrumbs">
          <template #prefix="{ item }">
            <Icon v-if="item.icon" :icon="item.icon" class="mr-2 h-4" />
          </template>
        </Breadcrumbs>
      </template>
    </LayoutHeader>
  
    <div v-if="contact.data" ref="parentRef" class="flex h-full">
      <Resizer
        :parent="$refs.parentRef"
        class="flex h-full flex-col overflow-hidden border-r"
      >
        <!-- Contact Header Section -->
        <div class="border-b">
          <FileUploader
            @success="changeContactImage"
            :validateFile="validateFile"
          >
            <template #default="{ openFileSelector, error }">
              <div class="flex flex-col items-start gap-4 p-5">
                <div class="flex items-center gap-4">
                  <div class="group relative h-15.5 w-15.5">
                    <Avatar
                      size="3xl"
                      :label="contact.data.full_name"
                      :image="contact.data.image"
                    />
                    <component
                      :is="contact.data.image ? Dropdown : 'div'"
                      v-bind="contact.data.image
                        ? {
                            options: [
                              {
                                icon: 'upload',
                                label: __('Change image'),
                                onClick: openFileSelector,
                              },
                              {
                                icon: 'trash-2',
                                label: __('Remove image'),
                                onClick: () => changeContactImage(''),
                              },
                            ],
                          }
                        : { onClick: openFileSelector }"
                      class="!absolute bottom-0 left-0 right-0"
                    >
                      <div
                        class="z-1 absolute bottom-0 left-0 right-0 flex h-14 cursor-pointer items-center justify-center rounded-b-full bg-black bg-opacity-40 pt-5 opacity-0 duration-300 ease-in-out group-hover:opacity-100"
                        style="-webkit-clip-path: inset(22px 0 0 0); clip-path: inset(22px 0 0 0);"
                      >
                        <CameraIcon class="h-6 w-6 text-white" />
                      </div>
                    </component>
                  </div>
                </div>
  
              </div>
            </template>
          </FileUploader>
        </div>
      </Resizer>
  
    </div>
  
    <ErrorPage v-else :errorTitle="errorTitle" :errorMessage="errorMessage" />
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
      required: true,
    },
  })
  
  const contact = createResource({
    url: 'crm.api.report.get_report',
    cache: ['report_name', props.reportName],
    params: { report_name: props.reportName },
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
  
  // Report data
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
  