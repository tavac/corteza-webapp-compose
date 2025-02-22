<template>
  <b-card
    :header="workflow ? $t('automation.editTitle.workflow') : $t('automation.editTitle.script')"
    footer-class="text-right"
  >
    <b-form-group
      :label="$t('automation.buttonLabel')"
    >
      <b-input-group>
        <b-form-input
          v-model="button.label"
        />
        <b-input-group-append>
          <page-translator
            v-if="page"
            :page="page"
            :block="block"
            :highlight-key="`pageBlock.${block.blockID}.automation`"
            button-variant="light"
          />
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <b-form-group
      :label="$t('automation.buttonVariant')"
    >
      <b-select
        v-model="button.variant"
        class="w-100"
        size="sm"
      >
        <b-select-option
          v-for="({ variant, label }) in variants"
          :key="variant"
          :value="variant"
        >
          {{ label }}
        </b-select-option>
      </b-select>
    </b-form-group>

    <div
      v-if="workflow"
    >
      <h5>
        {{ workflow.meta.name || $t('automation.noLabel') }}
      </h5>
      <var>
        {{ $t('automation.stepID', { stepID: trigger.stepID}) }}
      </var>
    </div>
    <code
      v-else-if="button.script"
    >
      {{ button.script }}
    </code>
    <b-alert
      v-else
      show
      variant="warning"
    >
      {{ $t('automation.noScript' ) }}
    </b-alert>
    <p
      v-if="workflow && workflow.meta"
      class="mb-0 mt-2"
    >
      {{ workflow.meta.description || $t('automation.noDescription') }}
    </p>
    <p
      v-else-if="script"
      class="mb-0 mt-2"
    >
      {{ script.description || $t('automation.noDescription') }}
    </p>
    <template #footer>
      <c-input-confirm
        variant="link-light"
        @confirmed="$emit('delete', button)"
      />
    </template>
  </b-card>
</template>
<script>
import { compose } from '@cortezaproject/corteza-js'
import PageTranslator from 'corteza-webapp-compose/src/components/Admin/Page/PageTranslator'

export default {
  components: {
    PageTranslator,
  },

  i18nOptions: {
    namespaces: 'block',
  },

  props: {
    button: {
      type: Object,
      required: true,
    },

    script: {
      type: Object,
      required: false,
      default: undefined,
    },

    trigger: {
      type: Object,
      required: false,
      default: undefined,
    },

    page: {
      type: compose.Page,
      required: true,
    },

    block: {
      type: compose.PageBlock,
      required: true,
    },
  },

  computed: {
    variants () {
      return [
        'primary',
        'secondary',
        'light',
        'dark',
        'success',
        'danger',
        'warning',
      ].map(variant => ({ variant, label: this.$t(`${variant}Button`) }))
    },

    workflow () {
      return this.trigger ? this.trigger.workflow : undefined
    },
  },
}
</script>
