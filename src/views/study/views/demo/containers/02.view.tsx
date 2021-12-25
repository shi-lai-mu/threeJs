import { BoxGeometry, Clock, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { defineComponent, onMounted, ref, render } from "vue";
import gsap from 'gsap'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

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
        let screenSize = {
            width: 0, 
            height: 0,
        }

        const reSize = () => {
            screenSize = {
                width: window.innerWidth, 
                height: window.innerHeight,
            }
        }
        reSize()
        

        let cursor = {
            x: 0,
            y: 0,
        }

        // camera
        const camera = new PerspectiveCamera(75, screenSize.width / screenSize.height)
        camera.position.z = 3
        scene.add(camera)

        // event
        // document.addEventListener('mousemove', ({ clientY, clientX }) => {
        //     cursor = {
        //         x: clientX / screenSize.width - 0.5,
        //         y: clientY / screenSize.height - 0.5,
        //     }

        //     camera.position.x = Math.cos(cursor.x * Math.PI * 2) * 2
        //     camera.position.z = Math.sin(cursor.x * Math.PI * 2) * 2
        //     camera.position.y = cursor.y * 3
        //     camera.lookAt(mesh.position)
        // })

        window.addEventListener('dblclick', () => {
            if (!document.fullscreenElement) {
                canvas.value.requestFullscreen()
            } else {
                document.exitFullscreen()
            }
        })

        onMounted(() => {
            // renderer
            const renderer = new WebGLRenderer({
                canvas: canvas.value,
            })
            renderer.setSize(screenSize.width, screenSize.height)
            renderer.render(scene, camera)

            window.addEventListener('resize', () => {
                reSize()
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            })

            // controls
            const controls = new OrbitControls(camera, canvas.value)
            controls.enableDamping = true

            // animation
            // const clock = new Clock();
            const tick = () => {

                // update camera
                camera.aspect = screenSize.width / screenSize.height
                camera.updateProjectionMatrix()

                renderer.setSize(screenSize.width, screenSize.height)

                controls.update()
                renderer.render(scene, camera)
                window.requestAnimationFrame(tick)
            }
            tick()
            gsap.to(mesh.position, {
                x: 1,
                duration: 1,
                delay: 1,
            })
            gsap.to(mesh.position, {
                x: 0,
                duration: 1,
                delay: 2,
            })
        })

        return () => (
            <canvas ref={canvas}></canvas>
        )
    }
})