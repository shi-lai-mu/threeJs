import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({

    setup() {
        const canvas = ref()
        // scene
        const scene = new Scene()

        // cube
        const geometry = new BoxGeometry(1, 1, 1)
        const material = new MeshBasicMaterial({ color: 0xff0000 })
        const mesh = new Mesh(geometry, material)
        scene.add(mesh)

        // screen size
        const screenSize = {
            width: 800, 
            height: 600,
        }

        // camera
        const camera = new PerspectiveCamera(75, screenSize.width / screenSize.height)
        camera.position.z = 3
        scene.add(camera)

        onMounted(() => {
            // renderer
            const renderer = new WebGLRenderer({
                canvas: canvas.value,
            })
            renderer.setSize(screenSize.width, screenSize.height)
            renderer.render(scene, camera)
        })

        return () => (
            <canvas ref={canvas}></canvas>
        )
    }
})