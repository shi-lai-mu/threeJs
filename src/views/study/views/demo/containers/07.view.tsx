import {
    AmbientLight,
    AxesHelper,
    BoxBufferGeometry,
    BoxGeometry,
    CameraHelper,
    Clock,
    Color,
    ConeBufferGeometry,
    DirectionalLight,
    DirectionalLightHelper,
    Float32BufferAttribute,
    Fog,
    Group,
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
    RepeatWrapping,
    Scene,
    SphereBufferGeometry,
    SpotLight,
    TorusBufferGeometry,
    WebGLRenderer,
} from 'three'
import { defineComponent, onMounted, ref } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'
import { loaderTextureTask } from '@/utils/texture'

const gui = new GUI()

export default defineComponent({

    setup() {
        const canvas = ref()

        // scene
        const scene = new Scene()

        // texture
        const {
            brickColorTexture,
            brickOcclusionTexture,
            brickNormalTexture,
            brickRoughnessTexture,

            grasslandColorTexture,
            grasslandOcclusionTexture,
            grasslandNormalTexture,
            grasslandRoughnessTexture,

            doorColorTexture,
            doorOcclusionTexture,
            doorNormalTexture,
            doorRoughnessTexture,
            doorAlphaTexture,
            doorHeightTexture,
            doorMetalnessTexture,
        } = loaderTextureTask({
            // 红砖
            brickColorTexture: '/static/textures/demo07/bricks/color.jpg',
            brickOcclusionTexture: '/static/textures/demo07/bricks/ambientOcclusion.jpg',
            brickNormalTexture: '/static/textures/demo07/bricks/normal.jpg',
            brickRoughnessTexture: '/static/textures/demo07/bricks/roughness.jpg',

            // 草地
            grasslandColorTexture: '/static/textures/demo07/grass/color.jpg',
            grasslandOcclusionTexture: '/static/textures/demo07/grass/ambientOcclusion.jpg',
            grasslandNormalTexture: '/static/textures/demo07/grass/normal.jpg',
            grasslandRoughnessTexture: '/static/textures/demo07/grass/roughness.jpg',

            // 门
            doorColorTexture: '/static/textures/demo07/door/color.jpg',
            doorOcclusionTexture: '/static/textures/demo07/door/ambientOcclusion.jpg',
            doorNormalTexture: '/static/textures/demo07/door/normal.jpg',
            doorRoughnessTexture: '/static/textures/demo07/door/roughness.jpg',
            doorAlphaTexture: '/static/textures/demo07/door/alpha.jpg',
            doorHeightTexture: '/static/textures/demo07/door/height.jpg',
            doorMetalnessTexture: '/static/textures/demo07/door/metalness.jpg',
        })

        // cube
        const material = new MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.4,
        })
        
        const plane = new Mesh(
            new PlaneBufferGeometry(40, 40),
            new MeshStandardMaterial({
                map: grasslandColorTexture,
                aoMap: grasslandOcclusionTexture,
                normalMap: grasslandNormalTexture,
                roughnessMap: grasslandRoughnessTexture,
            }),
        )
        grasslandColorTexture.repeat.set(8, 8)
        grasslandColorTexture.wrapS = RepeatWrapping
        grasslandColorTexture.wrapT = RepeatWrapping
        plane.rotation.x = - Math.PI * 0.5
        plane.receiveShadow = true

        const wallMaterial = new MeshStandardMaterial({
            map: brickColorTexture,
            aoMap: brickOcclusionTexture,
            normalMap: brickNormalTexture,
            roughnessMap: brickRoughnessTexture,
        })
        const walls = new Mesh(
            new BoxBufferGeometry(5, 5, 5),
            wallMaterial,
        )
        walls.castShadow = true

        const door = new Mesh(
            new PlaneBufferGeometry(2, 2, 100, 100),
            new MeshStandardMaterial({
                map: doorColorTexture,
                aoMap:doorOcclusionTexture,
                alphaMap: doorAlphaTexture,
                roughnessMap: doorRoughnessTexture,
                displacementMap: doorHeightTexture,
                normalMap: doorNormalTexture,
                metalnessMap: doorMetalnessTexture,
                roughness: 0.3,
                transparent: true,
                displacementScale: 0.1,
            })
        )
        door.position.z = 2.5
        door.position.y = 1
        door.geometry.setAttribute('uv2', new Float32BufferAttribute(door.geometry.attributes.uv.array, 2))

        const roof = new Mesh(
            new ConeBufferGeometry(4, 2, 4),
            wallMaterial,
        )
        roof.position.y = 3 + 0.5
        roof.rotation.y = Math.PI * 0.25

        const graves = new Group()
        const graveGeometry = new BoxBufferGeometry(0.6, 0.8, 0.1)
        const graveMaterial = new MeshStandardMaterial({ color: '#727272' })
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2
            const radius = 3 + Math.random() * 17

            const grave = new Mesh(graveGeometry, graveMaterial)
            grave.position.set(Math.cos(angle) * radius, 0.3, Math.sin(angle) * radius)
            grave.rotation.x = (Math.random() - 0.5) * 0.4
            grave.rotation.z = (Math.random() - 0.5) * 0.4
            grave.rotation.set(
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.4
            )

            grave.castShadow = true

            graves.add(grave)
        }
        scene.add(graves)

        scene.add(plane, walls, door, roof)

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
        camera.position.set(4, 5, 4)
        scene.add(camera)   

        // animate
        const clock = new Clock()

        // light
        const directionalLight = new DirectionalLight(0x262837, 0.2)
        directionalLight.position.set(- 2, 2, 1)
        directionalLight.castShadow = true

        // 设置阴影渲染的分辨率
        directionalLight.shadow.mapSize.width = 1024 * 2
        directionalLight.shadow.mapSize.height = 1024 * 2
        // 设置阴影渲染的 起始和终点距离
        // directionalLight.shadow.camera.near = 1
        // directionalLight.shadow.camera.far = 6
        // 阴影模糊程度
        directionalLight.shadow.radius = 10
        directionalLight.lookAt(walls.position)
        scene.add(directionalLight)

        const ambientLight = new AmbientLight(0x262837, 0.1)
        scene.add(ambientLight)

        const doorLight = new PointLight('#ff7d46', 2, 7)
        doorLight.position.set(0, 2.2, 3)
        doorLight.castShadow = true
        scene.add(doorLight)

        /**
         * Fog
         */
        const fog = new Fog('#262837', 1, 15)
        scene.fog = fog

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
            renderer.setClearColor('#262837')
            renderer.setSize(screenSize.width, screenSize.height)
            renderer.shadowMap.type = PCFSoftShadowMap
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