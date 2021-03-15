<template>
  <div>
    <div
      v-if="superSpecial && tinyNav"
      class="mobile-top-nav bg-white p-3"
    >
      <b-btn
        variant="link"
        @click="expanded=true"
        class="float-left"
      >
        (OPEN!)
      </b-btn>

      <div class="logo-ph float-left" />
    </div>

    <div
      v-if="superSpecial && expanded"
      class="backdrop"
      @click="expanded=false"
    />

    <nav
      class="bg-white"
      :class="{
        tiny,
        'super-special': superSpecial,
      }"
    >

      <header>
        <b-container
          fluid
          class="bg-light pt-4"
          :class="{
            'bg-white': tiny && !superSpecial,
          }"
        >
          <b-row>
            <b-col class="d-inline-flex align-items-center">
              <div class="logo-ph" />
              <span
                v-if="!tiny || superSpecial"
                class="ml-2"
              >
                Corteza#
              </span>
            </b-col>
          </b-row>

          <b-row class="mt-3">
            <b-col>
              <vue-select
                v-if="!tiny || superSpecial"
                key="namespaceID"
                label="name"
                class="bg-white"
                :clearable="false"
                :options="namespaces"
                :value="namespace"
                @option:selected="$router.push({ name: 'namespace', params: { slug: $event.slug } })"
              >
                <template #list-footer>
                  <router-link :to="{ name: 'namespace.create' }">
                    + Add New#
                  </router-link>
                </template>
              </vue-select>
            </b-col>
          </b-row>

          <b-row
            v-if="!tiny || superSpecial"
            class="mt-3 pt-4 pb-2 bg-white"
          >
            <b-col>
              <b-input
                v-model.trim="query"
                class="mw-100"
                type="search"
                :placeholder="$t('sidebar.searchPlaceholder')"
              />
            </b-col>
          </b-row>
        </b-container>
      </header>

      <div
        v-if="tiny"
        class="header-delimiter bg-light"
      />

      <div class="body px-3 py-2">
        <sidebar-nav-item
          v-if="!tiny || superSpecial"
          :items="navItems"
          :start-expanded="!!query"
          top-level
          @page-selected="onPageSelected"
        />
      </div>

      <!-- Footer -->
      <footer>
        <b-container
          fluid
        >
        <b-row>
          <b-col>
            <b-btn
              v-if="tinyNav && expanded"
              variant="link"
              class="float-left"
              @click="expanded=false"
            >
              left
            </b-btn>

            <b-btn
              variant="link"
              class="float-right"
            >
              logout
            </b-btn>
            <b-btn
              variant="link"
              class="float-right"
              :to="{ name: 'admin.modules' }"
            >
              admin
            </b-btn>

            <b-btn
              v-if="tinyNav && !expanded"
              variant="link"
              class="float-right"
              @click="expanded=true"
            >
              right
            </b-btn>
          </b-col>
        </b-row>
        </b-container>
      </footer>
    </nav>
  </div>
</template>

<script>
import { NoID } from '@cortezaproject/corteza-js'
import SidebarNavItem from './SidebarNavItem'
import { VueSelect } from 'vue-select'

export default {
  components: {
    SidebarNavItem,
    VueSelect,
  },

  props: {
    namespaces: {
      type: Array,
      required: true,
      default: () => [],
    },

    namespace: {
      type: Object,
      required: false,
      default: () => ({}),
    },

    pages: {
      type: Array,
      required: true,
      default: () => [],
    },

    page: {
      type: Object,
      required: false,
      default: () => ({}),
    },

    tinyNav: {
      type: Boolean,
      required: false,
      default: false,
    },

    superSpecial: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data () {
    return {
      query: '',
      expanded: false,
    }
  },

  computed: {
    tiny () {
      return this.tinyNav && !this.expanded
    },

    navItems () {
      const wrap = (p) => ({ page: p, children: [] })

      const current = this.filteredPages.map(wrap)
      const cx = this.pageIndex(current)
      const ax = this.pageIndex(this.pages.map(wrap))

      for (let i = current.length - 1; i >= 0; i--) {
        const cp = current[i]

        // Here, we'll need to nest our pages.
        // If the requested page isn't in the current index, check in the all index.
        // If still not there, just place it somewhere...
        if (cp.page.selfID && cp.page.selfID !== NoID) {
          let p = cx[cp.page.selfID]
          if (!p) {
            if (ax[cp.page.selfID]) {
              current.splice(i, 1, ax[cp.page.selfID])
              p = ax[cp.page.selfID]
              cx[p.page.pageID] = p
            } else {
              current.splice(i, 0, cp)
              p = cp
            }
            i++
          } else {
            current.splice(i, 1)
          }
          p.children.push(cp)
        }
      }

      return current
    },

    filteredPages () {
      if (!this.query) {
        return this.pages
      }

      const rr = []
      for (const p of this.pages) {
        if (this.checkPage(p, this.query)) {
          rr.push(p)
        }
      }

      return rr
    },
  },

  methods: {
    onPageSelected () {
      if (this.tinyNav) {
        this.expanded = false
      }
    },

    checkPage (p, query) {
      const ix = `${p.pageID}${p.handle}${p.title}`.toLowerCase().trim()
      return ix.indexOf(query.toLowerCase().trim()) > -1
    },

    pageIndex (wraps) {
      const ix = {}

      for (const w of wraps) {
        ix[w.page.pageID] = w
      }

      return ix
    },
  },

}
</script>

<style lang="scss" scoped>

.backdrop {
  background-color: #1e1e1eA5;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9000;
}

.mobile-top-nav {
  width: 100vw;
  position: fixed;
  top: 0;
}

nav {
  width: 320px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  max-height: 100%;
  margin: 0;
  outline: 0;
  -webkit-transform: translateX(0);
  transform: translateX(0);

  // transition: width 0.5s;
  transition: transform 0.5s;

  &.tiny:not(.super-special) {
    width: 80px;
  }

  &.tiny.super-special {
    transform: translateX(-320px);
  }

  .header-delimiter {
    width: calc(100% - 20px);
    margin: 0 auto;
    height: 1px;
  }

  header {
    display: flex;
    flex-direction: row;
    flex-grow: 0;
    align-items: center;
  }

  .body {
    flex-grow: 1;
    height: 100%;
    overflow-y: auto;
  }

  footer {
    flex-grow: 0;
  }

}

.logo-ph {
  width: 50px;
  height: 50px;
  background-color: orange;
}

</style>
