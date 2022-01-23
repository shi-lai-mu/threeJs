import {
    Clock,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PCFSoftShadowMap,
    PerspectiveCamera,
    PlaneBufferGeometry,
    PointLight,
    PolyhedronBufferGeometry,
    Scene,
    SphereBufferGeometry,
    Vector2,
    WebGLRenderer,
} from 'three'
import { defineComponent, onMounted, ref } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'dat.gui'
import * as CANNON from 'cannon'

const gui = new GUI()

export default defineComponent({

    setup() {
        const canvas = ref()

        // scene
        const scene = new Scene()
        // screen size 
        let screenSize = {
            width: 0, 
            height: 0,
        }
        const reSize = () => {
            screenSize = {
                width: window.outerWidth, 
                height: window.outerHeight ,
            }
        }

        // physics
        const world = new CANNON.World()
        world.gravity.set(0, - 9.82, 0)

        const sphereShape = new CANNON.Sphere(0.5)
        const sphereBody = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 3, 0),
            shape: sphereShape
        })
        world.addBody(sphereBody)

        const floorShape = new CANNON.Plane()
        const floorBody = new CANNON.Body()
        floorBody.mass = 0
        floorBody.addShape(floorShape)
        // 因为地板旋转了 此处也要同步旋转
        floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5)
        world.addBody(floorBody)

        // Geometry
        const plane = new Mesh(
            new PlaneBufferGeometry(10, 10),
            new MeshStandardMaterial({
                color: '#CCC',
                metalness: 0.3,
                roughness: 0.4,
            })
        )
        plane.receiveShadow = true
        plane.rotation.x = - Math.PI * 0.5

        const sphere = new Mesh(
            new SphereBufferGeometry(0.5, 30, 30),
            new MeshStandardMaterial({
                color: '#FFF',
                roughness: 0.4,
            })
        )
        sphere.castShadow = true
        sphere.position.y += 2


        scene.add(plane, sphere)

        // lights
        const pointLight = new PointLight(0xffffff, 0.5)
        pointLight.position.set(-5,3,6)
        pointLight.lookAt(plane.position)
        pointLight.castShadow = true
        pointLight.shadow.mapSize.width = 1024 * 2
        pointLight.shadow.mapSize.height = 1024 * 2
        scene.add(pointLight)

        reSize()

        const mouse = new Vector2()
        const mouseMove = ({ clientX, clientY }: MouseEvent) => {
            mouse.x = clientX / screen.width * 2 - 1
            mouse.y = - (clientY / screen.height * 2 - 1)
        }

        // camera
        const camera = new PerspectiveCamera(75, screenSize.width / screenSize.height)
        camera.position.set(-2, 5, 5)
        scene.add(camera)

        // animate
        const clock = new Clock()

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
            let oldElapsedTime = 0
            const tick = () => {
                const elapsedTime = clock.getElapsedTime()
                const deltaTime = elapsedTime - oldElapsedTime
                oldElapsedTime = elapsedTime

                // update physics world
                world.step(1 / 60,  deltaTime, 3)

                sphere.position.copy(sphereBody.position)

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
            <canvas ref={canvas} onMousemove={mouseMove} ></canvas>
        )
    }
})