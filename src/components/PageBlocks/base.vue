<script>
import { compose } from '@cortezaproject/corteza-js'
import Wrap from './Wrap'

export default {
  components: {
    Wrap,
  },

  props: {
    boundingRect: {
      type: Object,
      required: false,
      default: undefined,
    },

    blockIndex: {
      type: Number,
      default: -1,
    },

    namespace: {
      type: compose.Namespace,
      required: true,
    },

    page: {
      type: compose.Page,
      required: true,
    },

    block: {
      type: compose.PageBlock,
      required: true,
    },

    module: {
      type: compose.Module,
      required: false,
      default: undefined,
    },

    record: {
      type: compose.Record,
      required: false,
      default: undefined,
    },

    mode: {
      type: String,
      required: false,
      default: '',
    },
  },

  computed: {
    options () {
      return this.block.options
    },
  },
}
</script>
