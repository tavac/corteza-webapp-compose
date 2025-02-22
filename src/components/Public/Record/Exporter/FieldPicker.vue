<template>
  <b-card
    header-bg-variant="white"
    footer-bg-variant="white"
  >
    <b-form-group>
      <label>{{ $t('recordList.export.selectFields') }}</label>
      <field-picker
        v-if="module"
        :module="module"
        :system-fields="systemFields"
        :disabled-types="disabledTypes"
        :fields.sync="selectedFields"
        :labels="{
          searchPlaceholder: $t('field:selector.search'),
          availableFields: $t('field:selector.available'),
          selectAllFields: $t('field:selector.selectAll'),
          selectedFields: $t('field:selector.selected'),
          unselectAllFields: $t('field:selector.unselectAll'),
          systemField: $t('field:selector.systemField'),
        }"
        max-height="max-height: 45vh;"
      />

      <i>{{ $t('recordList.export.limitations') }}</i>
    </b-form-group>

    <b-form-group
      breakpoint="md"
      :label="$t('recordList.export.query.label')"
    >
      <b-form-input
        v-model="exportQuery"
        :placeholder="$t('recordList.export.query.placeholder')"
      />
    </b-form-group>

    <b-form-group
      breakpoint="md"
      :label="$t('recordList.export.filter.label')"
    >
      <b-form-textarea
        v-model="exportFilter"
        :placeholder="$t('recordList.export.filter.placeholder')"
      />
      <b-form-text>
        <i18next
          path="recordList.export.filter.footnote"
          tag="label"
        >
          <code>${recordID}</code>
          <code>${ownerID}</code>
          <code>${userID}</code>
        </i18next>
      </b-form-text>
    </b-form-group>

    <b-form-group>
      <b-form-checkbox
        v-model="forTimezone"
        class="mb-1"
      >
        {{ $t('recordList.export.specifyTimezone') }}
      </b-form-checkbox>

      <vue-select
        v-if="forTimezone"
        v-model="exportTimezone"
        :options="timezones"
        :placeholder="$t('recordList.export.timezonePlaceholder')"
      />
    </b-form-group>

    <b-form-group>
      <b-form-radio-group
        v-model="rangeType"
        :options="rangeTypeOptions"
        stacked
      />
    </b-form-group>

    <b-row no-gutters>
      <b-col cols="5">
        <b-form-group
          v-if="rangeType === 'range'"
          label-cols="5"
          :label="$t('recordList.export.rangeBy')"
        >
          <b-form-select
            v-model="rangeBy"
            :options="rangeByOptions"
          />
        </b-form-group>
      </b-col>
    </b-row>
    <b-row
      v-if="rangeType === 'range'"
      no-gutters
    >
      <b-col cols="5">
        <b-form-group
          label-cols="5"
          :label="$t('recordList.export.dateRange')"
        >
          <b-form-select
            v-model="range"
            :options="dateRangeOptions"
          />
        </b-form-group>
      </b-col>
      <b-col
        cols="3"
        class="ml-5"
      >
        <b-form-input
          v-model="start"
          :state="dateRangeValid ? null : false"
          type="date"
          :max="end"
          @keydown.prevent
        />
      </b-col>
      <b-col
        cols="3"
        class="ml-2"
      >
        <b-form-input
          v-model="end"
          :state="dateRangeValid ? null : false"
          type="date"
          :min="start"
          @keydown.prevent
        />
      </b-col>
    </b-row>

    <div
      slot="footer"
      class="d-flex"
    >
      <span
        v-if="!!getExportableCount"
        class="my-auto"
      >
        {{ $t('recordList.export.recordCount', { count: getExportableCount}) }}
      </span>
      <span class="ml-auto">
        <c-input-processing
          v-if="allowJSON"
          :processing="processing"
          :disabled="exportDisabled"
          :variant="'dark'"
          size="lg"
          class="mr-2 mb-2"
          @click="doExport('json')"
        >
          {{ $t('recordList.export.json') }}
        </c-input-processing>
        <c-input-processing
          v-if="allowCSV"
          :processing="processing"
          :disabled="exportDisabled"
          :variant="'dark'"
          size="lg"
          class="mr-2 mb-2"
          @click="doExport('csv')"
        >
          {{ $t('recordList.export.csv') }}
        </c-input-processing>
      </span>
    </div>
  </b-card>
</template>

<script>
import { compose } from '@cortezaproject/corteza-js'
import { components } from '@cortezaproject/corteza-vue'
import moment from 'moment'
import tz from 'compact-timezone-list'
import { VueSelect } from 'vue-select'
const fmtDate = (d) => d.format('YYYY-MM-DD')
const { FieldPicker } = components

export default {
  i18nOptions: {
    namespaces: 'block',
  },

  components: {
    FieldPicker,
    VueSelect,
  },

  props: {
    allowJSON: {
      type: Boolean,
      default: true,
    },
    allowCSV: {
      type: Boolean,
      default: true,
    },
    module: {
      type: compose.Module,
      required: true,
    },
    preselectedFields: {
      type: Array,
      default: () => [],
    },
    recordCount: {
      type: Number,
      default: 0,
    },
    query: {
      type: String,
      required: false,
      default: undefined,
    },
    prefilter: {
      type: String,
      required: false,
      default: undefined,
    },
    selection: {
      type: Array,
      required: false,
      default: () => [],
    },
    filterRangeType: {
      type: String,
      default: 'all',
    },
    filterRangeBy: {
      type: String,
      default: 'created_at',
    },
    dateRange: {
      type: String,
      default: 'lastMonth',
    },
    startDate: {
      type: String,
      default: null,
    },
    endDate: {
      type: String,
      default: null,
    },
    systemFields: {
      type: Array,
      default: () => ['ownedBy', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'],
    },
    disabledTypes: {
      type: Array,
      default: () => ['User', 'Record', 'File'],
    },
    processing: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      fields: [],
      forTimezone: false,
      exportTimezone: undefined,
      filter: {
        rangeType: null,
        query: this.query,
        filter: this.prefilter,
        rangeBy: null,
        date: {
          range: null,
          start: null,
          end: null,
        },
      },
    }
  },

  computed: {
    timezones () {
      return tz.map(({ label, tzCode, offset }) => ({ label, tzCode, offset }))
    },

    // These should be computed, because of i18n
    rangeTypeOptions () {
      return [
        {
          value: 'all',
          text: this.$t('recordList.export.all'),
        },
        {
          value: 'range',
          text: this.$t('recordList.export.inRange'),
        },
        {
          value: 'selection',
          text: this.$t('recordList.export.selection'),
          disabled: !this.hasSelection,
        },
      ]
    },

    /**
     * checks if the given date-range is valid
     * @returns {Boolean}
     */
    dateRangeValid () {
      if (this.end < this.start) {
        return false
      }
      return true
    },

    rangeByOptions () {
      return [
        {
          value: 'created_at',
          text: this.$t('recordList.export.filter.createdAt'),
        },
        {
          value: 'updated_at',
          text: this.$t('recordList.export.filter.updatedAt'),
        },
      ]
    },

    dateRangeOptions () {
      return [
        {
          value: 'lastMonth',
          text: this.$t('recordList.export.filter.lastMonth'),
        },
        {
          value: 'thisMonth',
          text: this.$t('recordList.export.filter.thisMonth'),
        },
        {
          value: 'lastWeek',
          text: this.$t('recordList.export.filter.lastWeek'),
        },
        {
          value: 'thisWeek',
          text: this.$t('recordList.export.filter.thisWeek'),
        },
        {
          value: 'today',
          text: this.$t('recordList.export.filter.today'),
        },
        {
          value: 'custom',
          text: this.$t('recordList.export.filter.custom'),
        },
      ]
    },

    hasSelection () {
      return !!this.selection.length
    },

    getExportableCount () {
      // when exporting selection, only selected records are applicable
      if (this.rangeType === 'selection') {
        return this.selection.length
      }
      return this.recordCount
    },

    exportDisabled () {
      return !this.dateRangeValid || this.fields.length === 0 || !this.recordCount
    },

    selectedFields: {
      get () {
        return this.fields
      },

      set (selectedFields) {
        this.fields = selectedFields
      },
    },

    rangeBy: {
      get () {
        return this.filter.rangeBy
      },

      set (rangeBy) {
        this.filter.rangeBy = rangeBy
      },
    },

    exportQuery: {
      get () {
        return this.filter.query
      },
      set (v) {
        this.filter.query = v
      },
    },

    exportFilter: {
      get () {
        return this.filter.filter
      },
      set (v) {
        this.filter.filter = v
      },
    },

    rangeType: {
      get () {
        return this.filter.rangeType
      },

      set (rangeType) {
        this.filter.rangeType = rangeType
      },
    },

    range: {
      get () {
        return this.filter.date.range
      },

      set (range) {
        this.filter.date.range = range
        if (range !== 'custom') {
          this.filter.date.start = this.calcStart(moment(), range)
          this.filter.date.end = this.calcEnd(moment(), range)
        }
      },
    },

    start: {
      get () {
        return this.filter.date.start
      },

      set (start) {
        this.filter.date.start = start
        this.filter.date.range = 'custom'
      },
    },

    end: {
      get () {
        return this.filter.date.end
      },

      set (end) {
        this.filter.date.end = end
        this.filter.date.range = 'custom'
      },
    },
  },

  // Watchers needed for storybook
  watch: {
    filter: {
      handler: function (nv) {
        this.$emit('change', this.filter)
      },
      deep: true,
    },

    preselectedFields: {
      handler: function (value) {
        this.fields = value.filter(f => this.disabledTypes.indexOf(f.kind) < 0)
      },
      immediate: true,
    },

    filterRangeType: {
      handler: function (value) {
        this.filter.rangeType = value
      },
      immediate: true,
    },

    filterRangeBy: {
      handler: function (value) {
        this.filter.rangeBy = value
      },
      immediate: true,
    },

    startDate: {
      handler: function (value) {
        this.start = value
      },
    },

    endDate: {
      handler: function (value) {
        this.end = value
      },
    },

    dateRange: {
      handler: function (value) {
        this.range = value
      },
    },

    hasSelection: {
      handler: function (h) {
        if (h) {
          this.rangeType = 'selection'
        }
      },
      immediate: true,
    },
  },

  mounted () {
    if (this.startDate || this.endDate) {
      this.start = this.startDate
      this.end = this.endDate
    } else {
      this.range = this.dateRange
    }
  },

  methods: {
    calcStart (m, range) {
      if (range === 'lastMonth') {
        return fmtDate(m.subtract('1', 'months').startOf('month'))
      } else if (range === 'thisMonth') {
        return fmtDate(m.startOf('month'))
      } else if (range === 'lastWeek') {
        return fmtDate(m.subtract('1', 'week').startOf('week'))
      } else if (range === 'thisWeek') {
        return fmtDate(m.startOf('week'))
      } else if (range === 'today') {
        return fmtDate(m.startOf('day'))
      } else {
        throw new Error('notification.datePreset.undefined')
      }
    },

    calcEnd (m, range) {
      if (range === 'lastMonth') {
        return fmtDate(m.subtract('1', 'months').endOf('month'))
      } else if (range === 'thisMonth') {
        return fmtDate(m.endOf('month'))
      } else if (range === 'lastWeek') {
        return fmtDate(m.subtract('1', 'week').endOf('week'))
      } else if (range === 'thisWeek') {
        return fmtDate(m.endOf('week'))
      } else if (range === 'today') {
        return fmtDate(m.endOf('day'))
      } else {
        throw new Error('notification.datePreset.undefined')
      }
    },

    makeFilters ({ rangeType, rangeBy, date }) {
      if (rangeType === 'all') {
        return undefined
      }

      if (rangeType === 'selection') {
        // @todo improve with IN operator when supported
        return `(${
          this.selection.map(r => `recordID='${r}'`)
            .join(' OR ')
        })`
      }

      let start, end
      if (date.start) {
        start = `DATE(${rangeBy})>='${date.start}'`
      }
      if (date.end) {
        end = `DATE(${rangeBy})<='${date.end}'`
      }

      if (start && end) {
        return `(${start}) AND (${end})`
      }
      return start || end
    },

    doExport (kind) {
      this.$emit('export', {
        ext: kind,
        fields: this.fields.map(({ name }) => name),
        filters: this.makeFilters(this.filter),
        filterRaw: this.filter,
        timezone: this.forTimezone ? this.exportTimezone : undefined,
      })
    },
  },
}
</script>
