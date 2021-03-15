<template>
  <div>
    <b-btn
      v-for="(i) of items"
      :key="i.page.pageID"
      variant="link"
      class="w-100 text-left"
      :class="{
        'py-2': topLevel,
      }"
      :to="{ name: 'page', params: { pageID: i.page.pageID }}"
      @click="$emit('page-selected')"
    >
      {{ i.page.title }}

      <template
        v-if="i.children.length"
      >
        <b-btn
          variant="link"
          @click.self.stop.prevent="toggle(i.page)"
        >
          <template v-if="!collapses[pageIndex(i.page)]">
            (down)
          </template>
          <template v-else>
            (up)
          </template>
        </b-btn>
        <b-collapse
          :visible="collapses[pageIndex(i.page)]"
          @click.stop.prevent
        >
          <sidebar-nav-item
            class="ml-2"
            :items="i.children"
            :start-expanded="startExpanded"
            v-on="$listeners"
          />
        </b-collapse>
      </template>
    </b-btn>
  </div>
</template>

<script>
export default {
  name: 'sidebar-nav-item',

  props: {
    items: {
      type: Array,
      required: true,
      default: () => [],
    },
    startExpanded: {
      type: Boolean,
      required: false,
    },
    topLevel: {
      type: Boolean,
      required: false,
    },
  },

  data () {
    return {
      collapses: {},
    }
  },

  watch: {
    items: {
      handler: function (items) {
        for (const i of items) {
          this.setState(i.page, this.startExpanded)
        }
      },
      immediate: true,
    },
  },

  methods: {
    pageIndex (p) {
      return p.pageID || p.pageHandle || p.pageTitle
    },

    toggle (p) {
      const px = this.pageIndex(p)
      this.$set(this.collapses, px, !this.collapses[px])
    },

    setState (p, state = false) {
      const px = this.pageIndex(p)
      this.$set(this.collapses, px, state)
    },
  },
}
</script>
