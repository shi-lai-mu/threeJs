import { defineComponent } from 'vue'
import { AmbientLight, AxesHelper, Color, DirectionalLight, LightProbe, MeshBasicMaterial, sRGBEncoding, TextureLoader, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { OrbitControls  } from 'three/examples/jsm/controls/OrbitControls'

import { BaseScene } from '@/views/study/components/scene'

const easeOutCirc = () => {

}

export default defineComponent({
    name: 'StudeyGlTFLoader',
    setup() {
        const { scene, camera, renderer, parentNode, animate } = new BaseScene({
            parentSelect: '#app',
            id: 'StudeyGlTFLoaderScene',
        })
        // const axes = new AxesHelper(20)
        // const controls = new TrackballControls(camera, parentNode as HTMLElement)

        // camera.position.set(-30, 40, 30)
        // camera.lookAt(scene.position)
 
        // const lightprobe = new LightProbe()
        // scene.add(lightprobe)

        // const directionalLight = new DirectionalLight(0xcccccc, .2)
        // directionalLight.position.set(10, 0, 10)
        // scene.add(directionalLight)

        // const ambientLight = new AmbientLight(0xcccccc, 1)
        // scene.add(ambientLight)


        // renderer.setClearColor(new Color(0xcccccc))
        renderer.setSize(window.innerWidth, window.innerHeight)

        // scene.add(axes)

        // controls.rotateSpeed = 2.5;
        // controls.zoomSpeed = 1.2;
        // controls.panSpeed = 0.8;
        // controls.noZoom = false;
        // controls.noPan = false;
        // controls.staticMoving = true;
        // controls.dynamicDampingFactor = 0.3;

        const textureloader = new TextureLoader()
        const bakeTexture = textureloader.load('/model/baked.jpg')
        bakeTexture.flipY = false
        bakeTexture.encoding = sRGBEncoding
        const bakeMaterial = new MeshBasicMaterial({ map: bakeTexture })

        const poleLightMaterial = new MeshBasicMaterial({ color: 0xffffe5 })

        const loader = new GLTFLoader()
        loader.load(
            '/model/maxTest1.glb',
            gltf => {
                gltf.scene.scale.set(5, 5, 5)
                gltf.scene.position.set(0, -30, 80)
                // gltf.scene.receiveShadow = false
                // gltf.scene.castShadow = false
                animate.extendUpdate.push(() => {
                    gltf.scene.rotation.y += 0.001
                })
                scene.add(gltf.scene)

                gltf.scene.traverse(child => {
                    child.material = bakeMaterial;
                    console.log(child);
                })

                const control = new OrbitControls(camera, renderer.domElement)
                control.autoRotate = true
                control.target = new Vector3(0, -20, 80)
            },
            xhr => {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            error => {
                console.error(error)
            }
        )

        return () => <div></div>
    },
})