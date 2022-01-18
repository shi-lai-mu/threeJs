import { defineComponent } from 'vue'
import { RouterView } from 'vue-router';

import '@/layouts/default/layout.module.scss'

export default defineComponent({
    name: 'StudyLayout',
    setup() {
        return () => <RouterView></RouterView>
    }
})