<template>
  <b-tabs
    active-nav-item-class="bg-grey"
    nav-wrapper-class="bg-white border-bottom"
    card
  >
    <template #tabs-end>
      <page-translator
        v-if="page"
        :page="page"
        :block="block"
        :disabled="isNew"
        button-variant="link"
      />
    </template>
    <b-tab
      active
      :title="$t('general.label.general')"
    >
      <div class="mh-tab overflow-auto">
        <b-form-group
          for="title"
          :label="$t('general.titleLabel')"
        >
          <b-input-group>
            <b-form-input
              id="title"
              v-model="block.title"
              type="text"
              class="form-control"
              :placeholder="$t('general.titlePlaceholder')"
            />
            <b-input-group-append>
              <page-translator
                v-if="page"
                :page="page"
                :block="block"
                :highlight-key="`pageBlock.${block.blockID}.title`"
                button-variant="light"
              />
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group
          for="description"
          :label="$t('general.descriptionLabel')"
        >
          <b-input-group>
            <b-form-input
              id="description"
              v-model="block.description"
              type="text"
              class="form-control"
              :placeholder="$t('general.descriptionPlaceholder')"
            />
            <b-input-group-append>
              <page-translator
                v-if="page"
                :page="page"
                :block="block"
                :highlight-key="`pageBlock.${block.blockID}.description`"
                button-variant="light"
              />
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
        <b-form-group
          for="color"
          :label="$t('general.headerStyle')"
        >
          <b-form-select
            id="color"
            v-model="block.style.variants.headerText"
            :options="textVariants"
          />
        </b-form-group>
      </div>
    </b-tab>
    <page-block
      v-bind="{ ...$attrs, ...$props }"
      mode="configurator"
      class="mh-tab overflow-auto"
      v-on="$listeners"
    />
  </b-tabs>
</template>
<script>
import { compose, NoID } from '@cortezaproject/corteza-js'
import PageTranslator from 'corteza-webapp-compose/src/components/Admin/Page/PageTranslator'
import PageBlock from './index'

export default {
  i18nOptions: {
    namespaces: 'block',
  },

  components: {
    PageBlock,
    PageTranslator,
  },

  props: {
    block: {
      type: compose.PageBlock,
      required: true,
    },

    page: {
      type: compose.Page,
      required: true,
    },
  },

  computed: {
    textVariants () {
      return [
        { value: 'dark', text: this.$t('general.style.default') },
        { value: 'primary', text: this.$t('general.style.primary') },
        { value: 'secondary', text: this.$t('general.style.secondary') },
        { value: 'success', text: this.$t('general.style.success') },
        { value: 'warning', text: this.$t('general.style.warning') },
        { value: 'danger', text: this.$t('general.style.danger') },
      ]
    },

    blockClass () {
      return [
        'text-' + this.block.style.variants.headerText,
      ]
    },

    isNew () {
      return this.block.blockID === NoID
    },
  },
}
</script>
<style scoped>
.mh-tab {
  max-height: calc(100vh - 16rem);
}
</style>
