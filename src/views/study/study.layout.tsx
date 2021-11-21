import { defineComponent } from 'vue'
import { RouterView } from 'vue-router';

export default defineComponent({
    name: 'StudyLayout',
    setup() {
        return () => <RouterView></RouterView>
    }
})