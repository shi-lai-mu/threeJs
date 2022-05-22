import { defineComponent, onMounted, ref } from "vue";
import VRButton from "../components/VRButton";
import { VRScene } from "../lib/VRScene";

import styles from './index.module.scss'


export default defineComponent({
    name: 'VR-MMD',
    setup() {
        const vrScene = new VRScene({
            parentSelect: '#app',
            id: 'MMDScene',
        })
        return () => (
            <>
                <VRButton
                    renderer={vrScene.renderer}
                    v-slots={{
                        default: ({ el }: { el: HTMLElement }) => {
                            el.className = styles.mmdVRButton
                        }
                    }}
                />
            </>
        )
    }
})