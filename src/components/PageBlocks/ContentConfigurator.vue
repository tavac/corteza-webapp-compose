<template>
  <b-tab :title="$t('content.label')">
    <fieldset class="form-group">
      <c-rich-text-input
        v-model="options.body"
        :labels="{
          urlPlaceholder: $t('content.urlPlaceholder'),
          ok: $t('content.ok'),
        }"
      />
    </fieldset>
  </b-tab>
</template>
<script>
import base from './base'
import { components } from '@cortezaproject/corteza-vue'
const { CRichTextInput } = components

export default {
  i18nOptions: {
    namespaces: 'block',
  },

  name: 'Content',

  components: {
    CRichTextInput,
  },

  extends: base,
}
</script>
