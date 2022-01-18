import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'

import './layout.module.scss'

export default defineComponent({
  setup() {
    return () => (
      <RouterView></RouterView>
    )
  },
})
