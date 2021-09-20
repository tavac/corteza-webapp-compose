<template>
  <div
    class="d-flex w-100 overflow-auto"
  >
    <portal to="topbar-title">
      {{ $t('title') }}
    </portal>

    <b-container
      class="ns-wrapper"
      fluid="xl"
    >
      <b-row
        no-gutters
        class="align-items-center justify-content-between"
      >
        <div
          v-if="canCreateNamespace"
          class="flex-grow-1"
        >
          <b-btn :to="{ name: 'namespace.create' }"
                 variant="primary"
                 size="lg"
          >
              {{ $t('create') }}
          </b-btn>

          <b-btn
            v-if="canImportNamespace"
            @click="showImporterModal=true"
            variant="light"
            size="lg"
            class="ml-1"
          >
            {{ $t('import') }}
          </b-btn>

          <c-permissions-button
            v-if="canGrant"
            resource="corteza::compose:namespace/*"
            buttonVariant="light"
            :buttonLabel="$t('label.permissions')"
            class="ml-1 btn-lg"
          />
        </div>
        <div class="flex-grow-1 mt-1">
          <b-input-group>
            <b-form-input
              v-model.trim="query"
              class="float-right mw-100"
              type="search"
              :placeholder="$t('searchPlaceholder')" />
            <b-input-group-append>
              <b-input-group-text class="text-primary bg-white">
                <font-awesome-icon
                  :icon="['fas', 'search']"
                />
              </b-input-group-text>
            </b-input-group-append>
          </b-input-group>
        </div>
      </b-row>

      <b-row
        v-if="namespacesFiltered && namespacesFiltered.length"
        align-v="stretch"
        class="pb-4 mt-3"
      >
        <transition-group
          name="namespace-list"
          tag="div"
          class="d-flex flex-wrap flex-row h-100 w-100"
        >
          <b-col
            v-for="n in namespacesFiltered"
            :key="n.namespaceID"
            cols="12"
            md="6"
            lg="4"
            xl="3"
            class="namespace-col my-2 w-100"
          >
            <namespace-item
              :namespace="n"
              class="namespace-item"
            />
          </b-col>
        </transition-group>
      </b-row>
      <b-row
        v-else
        class="py-4"
      >
        <b-col>
          <h3 class="text-left">
            {{ $t('noResults') }}
          </h3>
        </b-col>
      </b-row>
    </b-container>

    <b-modal
      v-if="canImportNamespace"
      v-model="showImporterModal"
      hide-header
      hide-footer
      centered
      body-class="p-1"
    >
      <b-card header-bg-variant="white"
              footer-bg-variant="white">

        <b-form-group>
          <slot name="uploadLabel">
            <label>
              {{ $t('import') }}
            </label>
          </slot>

          <uploader class="uploader"
                    :endpoint="importNamespaceEndpoint"
                    @uploaded="onUploaded"
                    :acceptedFiles="['application/zip']" />

        </b-form-group>
      </b-card>
    </b-modal>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import NamespaceItem from 'corteza-webapp-compose/src/components/Namespaces/NamespaceItem'
import Uploader from 'corteza-webapp-compose/src/components/Public/Page/Attachment/Uploader'

export default {
  i18nOptions: {
    namespaces: 'namespace',
  },

  components: {
    NamespaceItem,
    Uploader,
  },

  data () {
    return {
      query: '',
      showImporterModal: false,
    }
  },

  computed: {
    ...mapGetters({
      namespaces: 'namespace/set',
      can: 'rbac/can',
    }),

    canGrant () {
      return this.can('compose/', 'grant')
    },

    canCreateNamespace () {
      return this.can('compose/', 'namespace.create')
    },

    canImportNamespace () {
      // If a user is allowed to create a namespace, they are considered to be allowed
      // to create any underlying resource when it comes to importing.
      //
      // This was agreed upon internally and may change in the future.

      return this.can('compose/', 'namespace.create')
    },

    importNamespaceEndpoint () {
      return this.$ComposeAPI.namespaceImportEndpoint({})
    },

    namespacesFiltered () {
      return this.namespaces.filter(ns => (ns.slug || ns.name).toLowerCase().indexOf(this.query.toLowerCase()) > -1)
    },
  },

  methods: {
    onUploaded () {
      this.showImporterModal = false

      this.$store.dispatch('namespace/load', { force: true })
        .then(() => this.toastSuccess(this.$t('notification.imported')))
        .catch(this.toastErrorHandler(this.$t('notification.general.composeAccessNotAllowed')))
    },
  },
}
</script>
<style lang="scss" scoped>
  .namespace-col, .namespace-item {
    transition: all 0.2s ease;
  }

  .namespace-item {
    box-shadow: 0;
    top: 0;

    &:hover {
      box-shadow: 0 4px 8px rgba(38, 38, 38, 0.2);
      transition: all 0.2s ease;
      top: -1px;
    }
  }

  .namespace-list-leave-active {
    position: absolute;
    transition: opacity 0.25 ease;
  }

  .namespace-list-enter, .namespace-list-leave-to {
    opacity: 0;
  }
</style>
