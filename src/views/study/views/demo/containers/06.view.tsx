import {
    AmbientLight,
    AxesHelper,
    BoxBufferGeometry,
    BoxGeometry,
    CameraHelper,
    Clock,
    Color,
    DirectionalLight,
    DirectionalLightHelper,
    HemisphereLight,
    Mesh,
    MeshBasicMaterial,
    MeshMatcapMaterial,
    MeshStandardMaterial,
    PCFSoftShadowMap,
    PerspectiveCamera,
    PlaneBufferGeometry,
    PointLight,
    RectAreaLight,
    Scene,
    SphereBufferGeometry,
    SpotLight,
    TorusBufferGeometry,
    WebGLRenderer,
} from 'three'
import { defineComponent, onMounted, ref } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'

const gui = new GUI()

export default defineComponent({

    setup() {
        const canvas = ref()

        // scene
        const scene = new Scene()

        // axes
        const axesHelper = new AxesHelper()
        scene.add(axesHelper)
 
        // cube
        const material = new MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.4,
        })
        const plane = new Mesh(
            new PlaneBufferGeometry(5, 5),
            material,
        )
        plane.rotation.x = - Math.PI * 0.5
        plane.position.y = - 0.5
        plane.receiveShadow = true

        const box = new Mesh(
            new BoxBufferGeometry(0.75, 0.75, 0.75),
            material,
        )
        box.castShadow = true

        const torus = new Mesh(
            new TorusBufferGeometry(0.3, 0.2, 32, 64),
            material,
        )
        torus.position.x = 1.5
        torus.castShadow = true

        const sphere = new Mesh(
            new SphereBufferGeometry(0.5, 32, 32),
            material,
        )
        sphere.castShadow = true

        sphere.position.x = - 1.5

        scene.add(plane, box, torus, sphere)

        // const pointLight = new PointLight(0xffffff, 0.6)
        // pointLight.position.set(2, 3, 4)
        // pointLight.castShadow = true
        // scene.add(pointLight)

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

        // camera
        const camera = new PerspectiveCamera(75, screenSize.width / screenSize.height)
        camera.position.set(2, 1.5, 2)
        scene.add(camera)   

        // animate
        const clock = new Clock()

        // light
        const directionalLight = new DirectionalLight(0xffffff, 0.5)
        directionalLight.position.set(2, 2, - 1)
        directionalLight.position.set(2, 2, - 1)
        directionalLight.castShadow = true

        // 设置阴影渲染的分辨率
        directionalLight.shadow.mapSize.width = 1024 * 2
        directionalLight.shadow.mapSize.height = 1024 * 2
        // 设置阴影渲染的 起始和终点距离
        directionalLight.shadow.camera.near = 1 
        directionalLight.shadow.camera.far = 6
        // 阴影模糊程度
        // directionalLight.shadow.radius = 10
        // directionalLight.lookAt(box.position)
        scene.add(directionalLight)

        const directionalHelper = new DirectionalLightHelper(directionalLight)
        const directionalLightCameraHelper = new CameraHelper(directionalLight.shadow.camera)
        scene.add(directionalHelper, directionalLightCameraHelper)

        onMounted(() => {
            window.addEventListener('dblclick', () => {
                if (!document.fullscreenElement) {
                    canvas.value.requestFullscreen()
                } else {
                    document.exitFullscreen()
                }
            })

            // renderer
            const renderer = new WebGLRenderer({
                canvas: canvas.value,
            })
            renderer.setSize(screenSize.width, screenSize.height)
            renderer.shadowMap.enabled = true
            // renderer.shadowMap.type = PCFSoftShadowMap

            renderer.render(scene, camera)

            window.addEventListener('resize', () => {
                reSize()
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
            })

            // controls
            const controls = new OrbitControls(camera, canvas.value)
            controls.enableDamping = true

            // animation
            // const clock = new Clock()
            const tick = () => {
                const elapsedTime = clock.getElapsedTime()

                // update camera
                camera.aspect = screenSize.width / screenSize.height
                camera.updateProjectionMatrix()

                renderer.setSize(screenSize.width, screenSize.height)

                // update objects
                box.rotation.y = 0.1 * elapsedTime
                torus.rotation.y = 0.1 * elapsedTime
                sphere.rotation.y = 0.1 * elapsedTime

                torus.rotation.x = 0.15 * elapsedTime
                box.rotation.x = 0.15 * elapsedTime
                sphere.rotation.x = 0.15 * elapsedTime

                // update the sphere
                sphere.position.x = Math.cos(elapsedTime)
                sphere.position.z = Math.sin(elapsedTime)
                sphere.position.y = Math.abs(Math.sin(elapsedTime * 3))

                // Update controls
                controls.update()

                // Render
                renderer.render(scene, camera)

                // Call tick again on the next frame
                window.requestAnimationFrame(tick)
            }
            tick() 
        })

        return () => (
            <canvas ref={canvas}></canvas>
        )
    }
})