import {
    AmbientLight,
    BufferAttribute,
    CubeTextureLoader,
    Mesh,
    MeshStandardMaterial,
    PerspectiveCamera,
    PlaneBufferGeometry,
    PointLight,
    Scene,
    WebGLRenderer,
} from 'three'
import { defineComponent, onMounted, ref } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { loaderTextureTask } from '@/utils/texture' 

// 全景 转 6位图   https://matheowis.github.io/HDRI-to-CubeMap/
// HDR 全景图 资源 https://polyhaven.com/
// 纹理质感        https://github.com/nidorx/matcaps

export default defineComponent({

    setup() {
        const canvas = ref()
        // scene
        const scene = new Scene()

        // Textures
        const {
            basecolorTexture,
            ambientOcclusionTexture,
            heightTexture,
            roughnessTexture,
            normalTexture,
            opacityTexture,
        } = loaderTextureTask({
            basecolorTexture: '/static/textures/Door_Wood/basecolor.jpg',
            ambientOcclusionTexture: '/static/textures/Door_Wood/ambientOcclusion.jpg',
            heightTexture: '/static/textures/Door_Wood/height.png',
            materialTexture: '/static/textures/Door_Wood/material.png',
            metallicTexture: '/static/textures/Door_Wood/metallic.jpg',
            normalTexture: '/static/textures/Door_Wood/normal.jpg',
            opacityTexture: '/static/textures/Door_Wood/opacity.jpg',  
            roughnessTexture: '/static/textures/Door_Wood/roughness.jpg',
        })

        const environmentMapTexture = new CubeTextureLoader().load([
            '/static/textures/environmentMaps/0/px.jpg',
            '/static/textures/environmentMaps/0/nx.jpg',
            '/static/textures/environmentMaps/0/py.jpg',
            '/static/textures/environmentMaps/0/ny.jpg',
            '/static/textures/environmentMaps/0/pz.jpg',
            '/static/textures/environmentMaps/0/nz.jpg',
        ])

        // basecolorTexture.repeat.x = 2
        // basecolorTexture.repeat.y = 3
        // basecolorTexture.wrapS = MirroredRepeatWrapping
        // basecolorTexture.wrapT = MirroredRepeatWrapping
        // basecolorTexture.offset.x = 0.5
        // basecolorTexture.offset.y = 0.5
        // basecolorTexture.magFilter = NearestFilter
 
        // cube
        const mesh = new Mesh(
            new PlaneBufferGeometry(1, 1, 100, 100),
            new MeshStandardMaterial({
                // color: 0xff0000,
                map: basecolorTexture,
                // 阴影
                aoMap: ambientOcclusionTexture,
                // 高度
                displacementMap: heightTexture,
                displacementScale: 0.1,
                // 表面反光 粗糙
                roughnessMap: roughnessTexture,
                // metalness: 0.7,
                roughness: 0.1,
                // 轮廓
                normalMap: normalTexture,
                transparent: true,
                // 透明度 
                alphaMap: opacityTexture,
                // 环境
                envMap: environmentMapTexture
                // wireframe: true,
            }),
        )
        mesh.geometry.setAttribute(
            'uv2',
            new BufferAttribute(mesh.geometry.attributes.uv.array, 2)
        )
        
        scene.add(mesh)
        
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