import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Clock,
    Color,
    Mesh,
    MeshBasicMaterial,
    PCFSoftShadowMap,
    PerspectiveCamera,
    Points,
    PointsMaterial,
    Raycaster,
    Scene,
    SphereBufferGeometry,
    SphereGeometry,
    Vector3,
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
        // screen size 
        let screenSize = {
            width: 0, 
            height: 0,
        }
        // Galaxy
        const parameters = {}
        const reSize = () => {
            screenSize = {
                width: window.innerWidth, 
                height: window.innerHeight,
            }
        }

        const sphere1 = new Mesh(
            new SphereBufferGeometry(1.5, 32, 32),
            new MeshBasicMaterial({ color: 0xff0000 })
        )
        sphere1.position.x = - 6

        const sphere2 = new Mesh(
            new SphereBufferGeometry(1.5, 32, 32),
            new MeshBasicMaterial({ color: 0xff0000 })
        )

        const sphere3 = new Mesh(
            new SphereBufferGeometry(1.5, 32, 32),
            new MeshBasicMaterial({ color: 0xff0000 })
        )
        sphere3.position.x = 6

        scene.add(sphere1, sphere2, sphere3)

        const raycaster = new Raycaster()
        const rayOrigin = new Vector3(- 7, 0, 0)
        const rayDirection = new Vector3(7, 0, 0)
        rayDirection.normalize()

        // 显示相交线
        const directionCount = Math.abs(rayOrigin.x - rayDirection.x) * 2
        const displayDirectionLineX = new Float32Array(directionCount * 3)
        console.log(directionCount, rayOrigin.x - rayDirection.x, rayOrigin.x, rayDirection.x);
        
        for (let i = 0; i < directionCount; i ++) {
            const i3 = i * 3
            displayDirectionLineX[i3    ] = rayOrigin.x + i
            displayDirectionLineX[i3 + 1] = rayOrigin.y
            displayDirectionLineX[i3 + 2] = rayOrigin.z
        }
        const geometry = new BufferGeometry()
        const material = new PointsMaterial({ 
            size: 0.1,
            sizeAttenuation: true,
            depthWrite: true,
            blending: AdditiveBlending,
            // vertexColors: true,
            color: 0xffffff,
        })
        geometry.setAttribute('position', new BufferAttribute(displayDirectionLineX, 3))
        scene.add(new Points(geometry, material))

        reSize()

        // camera
        const camera = new PerspectiveCamera(75, screenSize.width / screenSize.height)
        camera.position.set(0, 10, 0)
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
            const tick = () => {
                const elapsedTime = clock.getElapsedTime()

                sphere1.position.z = Math.cos(elapsedTime) * 4
                sphere2.position.z = Math.cos(elapsedTime * 0.5) * 4
                sphere3.position.z = Math.sin(elapsedTime) * 3

                raycaster.set(rayOrigin, rayDirection)
                const objectsToTest = [sphere1, sphere2, sphere3]
                const intersects = raycaster.intersectObjects(objectsToTest)

                
                for (const object of objectsToTest) {
                    object.material.color.set('#ff0000')
                }
                for (const intersect of intersects) {
                    intersect.object!.material.color.set('#0000ff')
                }
                

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