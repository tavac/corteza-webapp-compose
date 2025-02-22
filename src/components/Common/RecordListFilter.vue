<template>
  <div>
    <b-button
      :id="selectedFieldId"
      variant="link p-0 ml-1"
      :class="[inFilter ? 'text-primary' : 'text-secondary']"
      @click.stop
    >
      <font-awesome-icon :icon="['fas', 'filter']" />
    </b-button>

    <b-popover
      ref="popover"
      custom-class="cpopover shadow-sm"
      triggers="click blur"
      placement="bottom"
      delay="0"
      boundary="viewport"
      boundary-padding="2"
      :target="selectedFieldId"
      @show="onOpen"
      @hide="onHide"
    >
      <div class="py-3 px-2">
        <table v-if="componentFilter.length">
          <template
            v-for="(filterGroup, groupIndex) in componentFilter"
          >
            <template v-if="filterGroup.filter.length">
              <tr
                v-for="(filter, index) in filterGroup.filter"
                :key="`${groupIndex}-${index}`"
              >
                <td>
                  <h6
                    v-if="index === 0"
                    class="mb-0"
                  >
                    {{ $t('recordList.filter.where') }}
                  </h6>
                  <b-form-select
                    v-else
                    v-model="filter.condition"
                    :options="conditions"
                  />
                </td>
                <td>
                  <b-form-select
                    v-model="filter.name"
                    :options="fieldOptions"
                    value-field="name"
                    text-field="label"
                    @change="onChange($event, groupIndex, index)"
                  />
                </td>
                <td>
                  <b-form-select
                    v-model="filter.operator"
                    :options="getOperators(filter.kind)"
                  />
                </td>
                <td>
                  <field-editor
                    v-if="getField(filter.name)"
                    v-bind="mock"
                    class="field-editor mb-0"
                    value-only
                    :field="getField(filter.name)"
                    :record="filter.record"
                    @change="onValueChange"
                  />
                </td>
                <td class="pl-1">
                  <b-button
                    :id="`${groupIndex}-${index}`"
                    ref="delete"
                    variant="link"
                    class="d-flex align-items-center"
                    @click="deleteFilter(groupIndex, index)"
                  >
                    <font-awesome-icon
                      :icon="['far', 'trash-alt']"
                      size="sm"
                    />
                  </b-button>
                </td>
              </tr>

              <tr :key="`addFilter-${groupIndex}`">
                <td class="pb-0">
                  <b-button
                    variant="link text-decoration-none"
                    class="d-flex align-items-center"
                    style="min-height: 38px; min-width: 84px;"
                    @click="addFilter(groupIndex)"
                  >
                    <font-awesome-icon
                      :icon="['fas', 'plus']"
                      size="sm"
                      class="mr-1"
                    />
                    {{ $t('general.label.add') }}
                  </b-button>
                </td>
              </tr>

              <tr
                :key="`groupCondtion-${groupIndex}`"
              >
                <td
                  colspan="100%"
                  class="p-0 filter-border justify-content-center"
                  :class="{ 'pb-1': filterGroup.groupCondition }"
                >
                  <b-form-select
                    v-if="filterGroup.groupCondition"
                    v-model="filterGroup.groupCondition"
                    class="w-auto"
                    :options="conditions"
                  />

                  <b-button
                    v-else
                    variant="outline-primary"
                    class="btn-add-group bg-white py-2 px-3"
                    @click="addGroup()"
                  >
                    <font-awesome-icon
                      :icon="['fas', 'plus']"
                      class="h6 mb-0 "
                    />
                  </b-button>
                </td>
              </tr>
            </template>
          </template>
        </table>

        <div
          ref="filter-footer"
          class="d-flex justify-content-end"
        >
          <b-button
            ref="btnSave"
            class="mr-3"
            variant="primary"
            @click="onSave"
          >
            {{ $t('general.label.save') }}
          </b-button>
        </div>
      </div>

      <a
        ref="focusMe"
        href=""
        disabled
      />
    </b-popover>
  </div>
</template>
<script>
import FieldEditor from '../ModuleFields/Editor'
import { compose, validator } from '@cortezaproject/corteza-js'
export default {
  i18nOptions: {
    namespaces: 'block',
  },

  components: {
    FieldEditor,
  },
  props: {
    selectedField: {
      type: Object,
      required: true,
      default: () => {},
    },
    namespace: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    module: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    recordListFilter: {
      type: Array,
      required: true,
      default: () => [],
    },
  },

  data () {
    return {
      componentFilter: [],

      conditions: [
        { value: 'AND', text: this.$t('recordList.filter.conditions.and') },
        { value: 'OR', text: this.$t('recordList.filter.conditions.or') },
      ],

      mock: {},

      // Used to prevent unwanted closure of popover
      preventPopoverClose: false,
    }
  },

  computed: {
    fields () {
      return [
        ...[...this.module.fields].sort((a, b) =>
          (a.label || a.name).localeCompare(b.label || b.name),
        ),
        ...this.module.systemFields(),
      ].filter(({ kind }) => !['File'].includes(kind))
    },

    fieldOptions () {
      return this.fields.map(({ name, label }) => ({ name, label: label || name }))
    },

    inFilter () {
      return this.recordListFilter.some(({ filter }) => {
        return filter.some(({ name, value }) => name === this.selectedField.name && value)
      })
    },

    selectedFieldId () {
      return this.selectedField.fieldID
    },
  },

  created () {
    // Change all module fields to single value to keep multi value fields and single value
    const module = JSON.parse(JSON.stringify(this.module || {}))

    module.fields = module.fields.map(f => {
      f.isMulti = false
      return f
    })

    this.mock = {
      namespace: this.namespace,
      module,
      errors: new validator.Validated(),
    }
  },

  methods: {
    onHide (e) {
      if (this.preventPopoverClose) {
        e.preventDefault()
        // Focuses invisible element to refocus popover (problems with closing it otherwise)
        this.$nextTick(() => {
          this.$refs.focusMe.focus()
        })
      }
    },

    onValueChange () {
      this.preventPopoverClose = true

      setTimeout(() => {
        this.preventPopoverClose = false
      }, 100)
    },

    onChange (selected, groupIndex, index) {
      const field = this.getField(selected)
      const filterExists = !!(this.componentFilter[groupIndex] || { filter: [] }).filter[index]
      if (field && filterExists) {
        const tempFilter = [...this.componentFilter]
        tempFilter[groupIndex].filter[index].kind = field.kind
        tempFilter[groupIndex].filter[index].name = field.name
        tempFilter[groupIndex].filter[index].value = undefined
        this.componentFilter = tempFilter
      }
    },

    getOperators (kind) {
      const operators = [
        {
          value: '=',
          text: this.$t('recordList.filter.operators.equal'),
        },
        {
          value: '!=',
          text: this.$t('recordList.filter.operators.notEqual'),
        },
      ]

      if (['Number', 'DateTime'].includes(kind)) {
        return [
          ...operators,
          {
            value: '>',
            text: this.$t('recordList.filter.operators.greaterThan'),
          },
          {
            value: '<',
            text: this.$t('recordList.filter.operators.lessThan'),
          },
        ]
      } else if (['String', 'Url', 'Email'].includes(kind)) {
        return [
          ...operators,
          {
            value: 'LIKE',
            text: this.$t('recordList.filter.operators.contains'),
          },
        ]
      }

      return operators
    },

    getField (name = '') {
      const field = name ? this.mock.module.fields.find(f => f.name === name) : undefined

      return { ...field }
    },

    createDefaultFilter (condition, field) {
      return {
        condition: condition,
        name: field.name,
        operator: '=',
        value: undefined,
        kind: field.kind,
        record: new compose.Record(this.mock.module, {}),
      }
    },

    createDefaultFilterGroup (groupCondition = undefined) {
      return {
        groupCondition,
        filter: [
          this.createDefaultFilter('Where', this.selectedField),
        ],
      }
    },

    addFilter (groupIndex) {
      if ((this.componentFilter[groupIndex] || {}).filter) {
        this.componentFilter[groupIndex].filter.push(this.createDefaultFilter('AND', this.selectedField))
      }
    },

    addGroup () {
      this.$refs.btnSave.focus()

      this.componentFilter[this.componentFilter.length - 1].groupCondition = 'AND'
      this.componentFilter.push(this.createDefaultFilterGroup())
    },

    deleteFilter (groupIndex, index) {
      const filterExists = !!(this.componentFilter[groupIndex] || { filter: [] }).filter[index]

      if (filterExists) {
        // Set focus to previous element
        this.onSetFocus(groupIndex, index)
        // Delete filter from filterGroup
        this.componentFilter[groupIndex].filter.splice(index, 1)

        // If filter was last in filterGroup, delete filterGroup
        if (!this.componentFilter[groupIndex].filter.length) {
          this.componentFilter.splice(groupIndex, 1)

          // If no more filterGroups, add default back
          if (!this.componentFilter.length) {
            this.componentFilter.push(this.createDefaultFilterGroup())
          } else if (groupIndex === this.componentFilter.length) {
            // Reset first filterGroup groupCondition if last filterGroup was deleted
            this.componentFilter[groupIndex - 1].groupCondition = undefined
          }
        }
      }
    },

    onSetFocus (groupIndex, index) {
      let focusIndex = this.$refs.delete.findIndex(r => r.id === `${groupIndex}-${index}`)
      if (focusIndex > 0) {
        focusIndex--
      }
      this.$refs.delete[focusIndex].focus()
    },

    onOpen () {
      if (this.recordListFilter.length) {
        // Create record and fill its values property if value exists
        this.componentFilter = this.recordListFilter.map(({ groupCondition, filter = [] }) => {
          filter = filter.map(({ value, ...f }) => {
            f.record = new compose.Record(this.mock.module, {})
            f.record.values[f.name] = value
            return f
          })

          return { groupCondition, filter }
        })
      }

      // If no filterGroups, add default
      if (!this.componentFilter.length) {
        this.componentFilter.push(this.createDefaultFilterGroup())
      }
    },

    onSave () {
      this.$refs.popover.$emit('close')

      // Emit only value and not whole record with every filter
      this.$emit('filter', this.componentFilter.map(({ groupCondition, filter = [] }) => {
        filter = filter.map(({ record, ...f }) => {
          if (record) {
            f.value = record.values[f.name]
          }
          return f
        })

        return { groupCondition, filter }
      }))
    },
  },
}
</script>
<style lang="scss">
.cpopover .popover-body {
  max-width: 800px;
  max-height: 500px;
  overflow-y: auto;
  padding: 0;
  color: #2d2d2d;
  text-align: center;
  background: white;
  border-radius: 0.25rem;
  opacity: 1 !important;
  box-shadow: 0 3px 48px #00000026;
  font-size: 0.9rem;
}

.cpopover .arrow {
  &::before {
    border-bottom-color: white;
    border-top-color: white;
  }

  &::after {
    border-top-color: white;
  }
}

.cpopover {
  max-width: 800px;
  opacity: 1 !important;
  border-color: transparent;
}

.child-inline-flex > span {
  display: inline-flex !important;
  vertical-align: -webkit-baseline-middle;
  padding: 0;
}

.field-editor {
  .v-select {
    max-width: 15vw;
  }
}
</style>
<style lang="scss" scoped>
.filter-border {
  background-image: linear-gradient(to left, lightgray, lightgray);
  background-repeat: no-repeat;
  background-size: 100% 1px;
  background-position: center;
}

table {
  border-collapse: separate;
}

td {
  padding-bottom: 0.25rem;
  padding-right: 0.25rem;
}

.btn-add-group {
  &:hover, &:active {
    background-color: $primary !important;
    color: white !important;
  }
}
</style>
