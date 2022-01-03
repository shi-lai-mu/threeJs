import {
    AmbientLight,
    AxesHelper,
    BoxBufferGeometry,
    BoxGeometry,
    Clock,
    Color,
    DirectionalLight,
    HemisphereLight,
    Mesh,
    MeshBasicMaterial,
    MeshMatcapMaterial,
    MeshStandardMaterial,
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
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { GUI } from 'dat.gui'
import { loaderTextureTask } from '@/utils/texture'

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
            new PlaneBufferGeometry(5, 5, 100, 100),
            material,
        )
        plane.rotation.x = - Math.PI * 0.5
        plane.position.y = - 0.65

        const box = new Mesh(
            new BoxBufferGeometry(0.75, 0.75, 0.75),
            material,
        )

        const torus = new Mesh(
            new TorusBufferGeometry(0.3, 0.2, 32, 64),
            material,
        )
        torus.position.x = 1.5

        const sphere = new Mesh(
            new SphereBufferGeometry(0.5, 32, 32),
            material,
        )

        sphere.position.x = - 1.5

        scene.add(plane, box, torus, sphere)


        // lights
        // 环境光 场景环境下的基础光 (低成本计算)
        const ambientLight = new AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)
        // gui.add(ambientLight, 'intensity').max(1).min(0).step(0.01)

        // 方向光 从一个方向发射光线 (中成本计算)
        const directionalLight = new DirectionalLight(0x00fffc, 0.3)
        directionalLight.position.set(1, 0.25, 0)
        scene.add(directionalLight)
        // gui.add(directionalLight, 'intensity').max(1).min(0).step(0.01)

        // 半球光 顶部和底部发出光 (低成本计算)
        const hemisphereLight = new HemisphereLight(0xff0000, 0x0000ff, 0.3)
        scene.add(hemisphereLight)
        // gui.add(hemisphereLight, 'intensity').max(1).min(0).step(0.01)

        // 点光 从一点散发光 (中成本计算)
        const pointLight = new PointLight(0xff9000, 0.5)
        scene.add(pointLight)

        // 矩形区域光 矩形的朝一个方向发射光 (高成本计算)
        // 仅对 MeshStandardMaterial 和 MeshPhysicalMaterial 生效 
        const rectAreaLight = new RectAreaLight(0x4e00ff, 2, 1, 1)
        rectAreaLight.position.set(- 0.5, 0, 1.5)
        rectAreaLight.lookAt(box.position)
        scene.add(rectAreaLight)

        // 聚光灯 朝一个物体以手电筒形式发射灯光 
        const spotLight = new SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1 , 0.25, 1)
        spotLight.position.set(0, 2, 3)
        scene.add(spotLight)


        // const pointLight = new PointLight(0xffffff, 0.6)
        // pointLight.position.x = 2
        // pointLight.position.y = 3
        // pointLight.position.z = 4
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