<template>
<div>
  <div v-if="!!page" class="d-flex w-100 overflow-hidden">
    <div
      class="flex-grow-1 overflow-auto d-flex px-2 w-100"
    >
      <router-view
        v-if="recordID || isRecordCreatePage"
        :namespace="namespace"
        :module="module"
        :page="page"
        class="flex-grow-1 overflow-auto d-flex flex-column"
      />

      <grid
        v-else
        :namespace="namespace"
        :module="module"
        :page="page"
      />
    </div>

    <attachment-modal />
  </div>
    <tour
        ref="tour"
        :tour="tourSteps"
        :callbacks="{
          onPrevRedirect: () => this.$router.push({ name: 'namespaces' }),
          onNextRedirect: () => console.log('onNextRedirect'),
        }"
      />
  </div>
</template>
<script>
import Grid from 'corteza-webapp-compose/src/components/Public/Page/Grid'
import AttachmentModal from 'corteza-webapp-compose/src/components/Public/Page/Attachment/Modal'
import PageList from 'corteza-webapp-compose/src/tours/page-list'
import { compose } from '@cortezaproject/corteza-js'
import { components } from '@cortezaproject/corteza-vue'
const { Tour } = components

export default {
  components: {
    Grid,
    AttachmentModal,
    Tour,
  },

  props: {
    namespace: { // via router-view
      type: compose.Namespace,
      required: true,
    },

    page: { // via route-view
      type: compose.Page,
      required: true,
    },

    // We're using recordID to check if we need to display router-view or grid component
    recordID: String,
  },

  data () {
    return {
      filteredFields: [],
    }
  },

  computed: {
    tourSteps () {
      return PageList
    },

    isRecordCreatePage () {
      return this.$route.name === 'page.record.create'
    },

    tourButtons () {
      return {
        onPrevRedirect: () => this.$router.push({ name: 'namespaces' }),
        onNextRedirect: () => console.log('onNextRedirect'),
      }
    },

    module () {
      if (this.page.moduleID) {
        return this.$store.getters['module/getByID'](this.page.moduleID)
      }

      return undefined
    },
  },
  created () {

  },
  methods: {

    startTour () {
      console.log('22asaa')
      // this.$refs.tour.nextStep()
    //  this.$refs.tour.start()
    },
  },
}
</script>
