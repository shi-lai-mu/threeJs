import {
    AdditiveBlending,
    AmbientLight,
    BoxBufferGeometry,
    BufferAttribute,
    BufferGeometry,
    Clock,
    Color,
    ConeBufferGeometry,
    DirectionalLight,
    Float32BufferAttribute,
    Fog,
    Group,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PCFSoftShadowMap,
    PerspectiveCamera,
    PlaneBufferGeometry,
    PointLight,
    Points,
    PointsMaterial,
    RepeatWrapping,
    Scene,
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
        // screen size 
        let screenSize = {
            width: 0, 
            height: 0,
        }
        // Galaxy
        const parameters = {
            size: 0.01,
            count: 50000,
            radius: 5,
            branches: 3,
            weight: 1.5,
            pow: 3,
            spin: 1,
            insideColor: '#ff6030',
            outsideColor: '#1b3984',
        }
        let geometry: BufferGeometry
        let material: PointsMaterial
        let points: Points
        const generateGalaxy = () => {
            if (points) {
                geometry.dispose()
                material.dispose()
                scene.remove(points)
            }

            geometry = new BufferGeometry()
            material = new PointsMaterial({
                size: parameters.size,
                sizeAttenuation: true,
                depthWrite: true,
                blending: AdditiveBlending,
                vertexColors: true,
            })
            points = new Points(
                geometry,
                material,
            )
            const positions = new Float32Array(parameters.count * 3)
            const colors = new Float32Array(parameters.count * 3)
            const insideColor = new Color(parameters.insideColor) 
            const outsideColor = new Color(parameters.outsideColor) 

            for (let i = 0; i < parameters.count; i ++) {
                const i3 =i * 3

                const radius = parameters.radius * Math.random()
                const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
                const spinAngle = radius * parameters.spin

                const weight = () => Math.pow(Math.random(), parameters.pow) * (Math.random() < 0.5 ? 1 : - 1)
                // const weight = () => (Math.random() - 0.5) * parameters.weight

                positions[i3    ] = (Math.cos(branchAngle + spinAngle) * radius) + weight()
                positions[i3 + 1] = weight()
                positions[i3 + 2] = (Math.sin(branchAngle + spinAngle) * radius) + weight()

                // color
                const mixedColor = insideColor.clone().lerp(outsideColor, radius / parameters.radius)
                colors[i3    ] = mixedColor.r
                colors[i3 + 1] = mixedColor.g
                colors[i3 + 2] = mixedColor.b

                if (i< 20) {
                    console.log(radius / parameters.radius);
                    
                }
            }
            geometry.setAttribute('position', new BufferAttribute(positions, 3))
            geometry.setAttribute('color', new BufferAttribute(colors, 3))

            scene.add(points)
        }
        generateGalaxy()

        // GUI control
        gui.add(parameters, 'branches', 1, 20, 1).onFinishChange(generateGalaxy)
        gui.add(parameters, 'radius', 1, 20, 1).onFinishChange(generateGalaxy)
        gui.add(parameters, 'count', 1, 100000, 1).onFinishChange(generateGalaxy)
        gui.add(parameters, 'size', 0.01, 20, 0.01).onFinishChange(generateGalaxy)
        gui.add(parameters, 'weight', 0.01, 20, 0.01).onFinishChange(generateGalaxy)
        gui.add(parameters, 'pow', 0.01, 200, 0.01).onFinishChange(generateGalaxy)
        gui.add(parameters, 'spin', 0.01, 200, 0.01).onFinishChange(generateGalaxy)
        gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
        gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)
        
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