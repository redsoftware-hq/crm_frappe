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
      v-if="contact.data"
      :parent="$refs.parentRef"
      class="flex h-full flex-col overflow-hidden border-r"
    >
      <div class="border-b">
        <FileUploader
          @success="changeContactImage"
          :validateFile="validateFile"
        >
          <template #default="{ openFileSelector, error }">
            <div class="flex flex-col items-start justify-start gap-4 p-5">
              <div class="flex gap-4 items-center">
                <div class="group relative h-15.5 w-15.5">
                  <Avatar
                    size="3xl"
                    class="h-15.5 w-15.5"
                    :label="contact.data.full_name"
                    :image="contact.data.image"
                  />
                  <component
                    :is="contact.data.image ? Dropdown : 'div'"
                    v-bind="
                      contact.data.image
                        ? {
                            options: [
                              {
                                icon: 'upload',
                                label: contact.data.image
                                  ? __('Change image')
                                  : __('Upload image'),
                                onClick: openFileSelector,
                              },
                              {
                                icon: 'trash-2',
                                label: __('Remove image'),
                                onClick: () => changeContactImage(''),
                              },
                            ],
                          }
                        : { onClick: openFileSelector }
                    "
                    class="!absolute bottom-0 left-0 right-0"
                  >
                    <div
                      class="z-1 absolute bottom-0 left-0 right-0 flex h-14 cursor-pointer items-center justify-center rounded-b-full bg-black bg-opacity-40 pt-5 opacity-0 duration-300 ease-in-out group-hover:opacity-100"
                      style="
                        -webkit-clip-path: inset(22px 0 0 0);
                        clip-path: inset(22px 0 0 0);
                      "
                    >
                      <CameraIcon class="h-6 w-6 cursor-pointer text-white" />
                    </div>
                  </component>
                </div>
                <div class="flex flex-col gap-2 truncate text-ink-gray-9">
                  <div class="truncate text-2xl font-medium">
                    <span v-if="contact.data.salutation">
                      {{ contact.data.salutation + '. ' }}
                    </span>
                    <span>{{ contact.data.full_name }}</span>
                  </div>
                  <div
                    v-if="contact.data.company_name"
                    class="flex items-center gap-1.5 text-base text-ink-gray-8"
                  >
                    <Avatar
                      size="xs"
                      :label="contact.data.company_name"
                      :image="
                        getOrganization(contact.data.company_name)
                          ?.organization_logo
                      "
                    />
                    <span class="">{{ contact.data.company_name }}</span>
                  </div>
                  <ErrorMessage :message="__(error)" />
                </div>
              </div>
              <div class="flex gap-1.5">
                <Button
                  v-if="contact.data.actual_mobile_no"
                  :label="__('Make Call')"
                  size="sm"
                  @click="
                    callEnabled && makeCall(contact.data.actual_mobile_no)
                  "
                >
                  <template #prefix>
                    <PhoneIcon class="h-4 w-4" />
                  </template>
                </Button>
                <Button
                  :label="__('Delete')"
                  theme="red"
                  size="sm"
                  @click="deleteContact"
                >
                  <template #prefix>
                    <FeatherIcon name="trash-2" class="h-4 w-4" />
                  </template>
                </Button>
              </div>
            </div>
          </template>
        </FileUploader>
      </div>
      <div
        v-if="sections.data"
        class="flex flex-1 flex-col justify-between overflow-hidden"
      >
        <SidePanelLayout
          v-model="contact.data"
          :sections="sections.data"
          doctype="Contact"
          @update="updateField"
          @reload="sections.reload"
        />
      </div>
    </Resizer>
    <Tabs as="div" v-model="tabIndex" :tabs="tabs">
      <template #tab-item="{ tab, selected }">
        <button
          class="group flex items-center gap-2 border-b border-transparent py-2.5 text-base text-ink-gray-5 duration-300 ease-in-out hover:border-outline-gray-3 hover:text-ink-gray-9"
          :class="{ 'text-ink-gray-9': selected }"
        >
          <component v-if="tab.icon" :is="tab.icon" class="h-5" />
          {{ __(tab.label) }}
          <Badge
            class="group-hover:bg-surface-gray-7"
            :class="[selected ? 'bg-surface-gray-7' : 'bg-gray-600']"
            variant="solid"
            theme="gray"
            size="sm"
          >
            {{ tab.count }}
          </Badge>
        </button>
      </template>
      <template #tab-panel="{ tab }">
        <div
          v-if="!rows.length"
          class="grid flex-1 place-items-center text-xl font-medium text-ink-gray-4"
        >
          <div class="flex flex-col items-center justify-center space-y-3">
            <component :is="tab.icon" class="!h-10 !w-10" />
            <div>{{ __('No {0} Found', [__(tab.label)]) }}</div>
          </div>
        </div>
      </template>
    </Tabs>
  </div>
  <ErrorPage v-else :errorTitle="errorTitle" :errorMessage="errorMessage" />
  <AddressModal v-model="showAddressModal" v-model:address="_address" />
</template>

<script setup>
import ErrorPage from '@/components/ErrorPage.vue'
import Resizer from '@/components/Resizer.vue'
import Icon from '@/components/Icon.vue'
import SidePanelLayout from '@/components/SidePanelLayout.vue'
import LayoutHeader from '@/components/LayoutHeader.vue'
import PhoneIcon from '@/components/Icons/PhoneIcon.vue'
import CameraIcon from '@/components/Icons/CameraIcon.vue'
import DealsListView from '@/components/ListViews/DealsListView.vue'
import AddressModal from '@/components/Modals/AddressModal.vue'
import { formatDate, timeAgo, createToast } from '@/utils'
import { getView } from '@/utils/view'
import { getSettings } from '@/stores/settings'
import { getMeta } from '@/stores/meta'
import { globalStore } from '@/stores/global.js'
import { usersStore } from '@/stores/users.js'
import { organizationsStore } from '@/stores/organizations.js'
import { statusesStore } from '@/stores/statuses'
import { callEnabled } from '@/composables/settings'
import {
  Breadcrumbs,
  Avatar,
  FileUploader,
  Tabs,
  call,
  createResource,
  usePageMeta,
  Dropdown,
} from 'frappe-ui'
import { ref, computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { errorMessage as _errorMessage } from '../utils'

const { brand } = getSettings()
const { $dialog, makeCall } = globalStore()

const { getUser } = usersStore()
const { getOrganization } = organizationsStore()
const { getDealStatus } = statusesStore()
const { doctypeMeta } = getMeta('Contact')

const props = defineProps({
  contactId: {
    type: String,
    required: true,
  },
})

const route = useRoute()
const router = useRouter()

const showAddressModal = ref(false)
const _address = ref({})

const errorTitle = ref('')
const errorMessage = ref('')

const contact = createResource({
  url: 'crm.api.contact.get_contact',
  cache: ['contact', props.contactId],
  params: { contactId: props.contactId },
  auto: true,
  transform: (data) => {
    return {
      ...data,
      actual_mobile_no: data.mobile_no,
      mobile_no: data.mobile_no,
    }
  },
  onSuccess: () => {
    errorTitle.value = ''
    errorMessage.value = ''
  },
  onError: (err) => {
    if (err.messages?.[0]) {
      errorTitle.value = __('Not permitted')
      errorMessage.value = __(err.messages?.[0])
    } else {
      router.push({ name: 'Contacts' })
    }
  },
})

const breadcrumbs = computed(() => {
  let items = [{ label: __('Contacts'), route: { name: 'Contacts' } }]

  if (route.query.view || route.query.viewType) {
    let view = getView(route.query.view, route.query.viewType, 'Contact')
    if (view) {
      items.push({
        label: __(view.label),
        icon: view.icon,
        route: {
          name: 'Contacts',
          params: { viewType: route.query.viewType },
          query: { view: route.query.view },
        },
      })
    }
  }

  items.push({
    label: title.value,
    route: { name: 'Contact', params: { contactId: props.contactId } },
  })
  return items
})



const tabIndex = ref(0)



async function updateField(fieldname, value) {
  await call('frappe.client.set_value', {
    doctype: 'Contact',
    name: props.contactId,
    fieldname,
    value,
  })
  createToast({
    title: 'Contact updated',
    icon: 'check',
    iconClasses: 'text-ink-green-3',
  })

  contact.reload()
}

const { getFormattedCurrency } = getMeta('CRM Deal')

const columns = computed(() => dealColumns)

function getDealRowObject(deal) {
  return {
    name: deal.name,
    organization: {
      label: deal.organization,
      logo: getOrganization(deal.organization)?.organization_logo,
    },
    annual_revenue: getFormattedCurrency('annual_revenue', deal),
    status: {
      label: deal.status,
      color: getDealStatus(deal.status)?.color,
    },
    email: deal.email,
    mobile_no: deal.mobile_no,
    deal_owner: {
      label: deal.deal_owner && getUser(deal.deal_owner).full_name,
      ...(deal.deal_owner && getUser(deal.deal_owner)),
    },
    modified: {
      label: formatDate(deal.modified),
      timeAgo: __(timeAgo(deal.modified)),
    },
  }
}

const dealColumns = [
  {
    label: __('Organization'),
    key: 'organization',
    width: '11rem',
  },
  {
    label: __('Amount'),
    key: 'annual_revenue',
    align: 'right',
    width: '9rem',
  },
  {
    label: __('Status'),
    key: 'status',
    width: '10rem',
  },
  {
    label: __('Email'),
    key: 'email',
    width: '12rem',
  },
  {
    label: __('Mobile no'),
    key: 'mobile_no',
    width: '11rem',
  },
  {
    label: __('Deal owner'),
    key: 'deal_owner',
    width: '10rem',
  },
  {
    label: __('Last modified'),
    key: 'modified',
    width: '8rem',
  },
]
</script>
