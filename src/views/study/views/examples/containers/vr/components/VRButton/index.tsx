import { defineComponent } from "vue";

import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { WebGLRenderer } from "three";

export default defineComponent({
    name: 'VRButton',
    props: {
        renderer: {
            type: WebGLRenderer,
            required: true,
            default: () => null,
        }
    },
    setup(props, { slots }) {
        if (!props.renderer) throw Error(`VR Button Error: WebGLRenderer is Empty!`)

        const vrButtonElement = VRButton.createButton(props.renderer)
        document.body.append(vrButtonElement)
        
        return () => (
            <div onClick={() => vrButtonElement.click()}>
                {slots?.default?.({ el: vrButtonElement })}
            </div>
        )
    }
})