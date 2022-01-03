import {
    AmbientLight,
    AxesHelper,
    Mesh,
    MeshBasicMaterial,
    MeshMatcapMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    PlaneBufferGeometry,
    PointLight,
    Scene,
    TorusBufferGeometry,
    WebGLRenderer,
} from 'three'
import { defineComponent, onMounted, ref } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { GUI } from 'dat.gui'
import { loaderTextureTask } from '@/utils/texture'
// import typefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json'

// font 字体转换 https://gero3.github.io/facetype.js/

export default defineComponent({

    setup() {
        const canvas = ref()

        // scene
        const scene = new Scene()

        // axes
        const axesHelper = new AxesHelper()
        scene.add(axesHelper)
 
        // cube
        // const mesh = new Mesh(
        //     new PlaneBufferGeometry(1, 1, 100, 100),
        //     new MeshStandardMaterial({
        //         color: 0xff0000,
        //     }),
        // )
        
        // scene.add(mesh)

        // texture
        const {
            matcapTexture,
        } = loaderTextureTask({
            matcapTexture: '/static/textures/matcaps/1.png'
        })

        // font
        const fontLoader = new FontLoader().load(
            '/static/fonts/helvetiker_regular.typeface.json',
            font => {
                const textGeometry = new TextGeometry(
                    'Hello Three',
                    {
                        font,
                        size: 0.5,
                        height: 0.2,
                        curveSegments: 5,
                        bevelEnabled: true,
                        bevelThickness: 0.03,
                        bevelSize: 0.02,
                        bevelOffset: 0,
                        bevelSegments: 5,
                    }
                )
                const material = new MeshMatcapMaterial({ matcap: matcapTexture })

                textGeometry.computeBoundingBox()
                // textGeometry.translate(
                //     - ((textGeometry!.boundingBox?.max.x ?? 0) - 0.02) * 0.5,
                //     - ((textGeometry!.boundingBox?.max.y ?? 0) - 0.02) * 0.5,
                //     - ((textGeometry!.boundingBox?.max.z ?? 0) - 0.02) * 0.5,
                // )
                textGeometry.center()

                const textMesh = new Mesh(
                    textGeometry,
                    material,
                )
                scene.add(textMesh)

                const donutGeometry = new TorusBufferGeometry(0.3, 0.2, 20, 45)

                // TODO: 此处循环创建时可以将材质放在外面创建，避免重复载入相同的材质
                console.time('donuts')
                for (let i = 0; i < 100; i++) {
                    // FIXME: const material = new MeshMatcapMaterial({ matcap: matcapTexture })
                    const donut = new Mesh(donutGeometry, material)
                    donut.position.x = (Math.random() - 0.5) * 10
                    donut.position.y = (Math.random() - 0.5) * 10
                    donut.position.z = (Math.random() - 0.5) * 10
                    donut.lookAt(textMesh.position)
                    const scale = Math.min(Math.max(Math.random(), 0.5), 1)
                    donut.scale.set(scale, scale, scale)
                    scene.add(donut)
                }
                console.timeEnd('donuts')
            }
        )
        
        // lights
        const ambientLight = new AmbientLight(0xffffff, 0.5)
        scene.add(ambientLight)

        const pointLight = new PointLight(0xffffff, 0.6)
        pointLight.position.x = 2
        pointLight.position.y = 3
        pointLight.position.z = 4
        scene.add(pointLight)

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
        camera.position.z = 3
        scene.add(camera)

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
            // const clock = new Clock()
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
        })

        return () => (
            <canvas ref={canvas}></canvas>
        )
    }
})