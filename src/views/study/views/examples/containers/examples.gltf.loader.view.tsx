import { defineComponent, onDeactivated } from 'vue'
// import { Spector } from 'spectorjs'
import { GUI } from 'dat.gui'
import { Event, AxesHelper, Color, DirectionalLight, LightProbe, MeshBasicMaterial, Object3D, sRGBEncoding, TextureLoader, Vector3, BufferGeometry, PointsMaterial, BufferAttribute, Points, ShaderMaterial, AdditiveBlending, Clock, Raycaster, Matrix4 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { OrbitControls  } from 'three/examples/jsm/controls/OrbitControls'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'

import { BaseScene } from '@/utils/scene'

import firefliesVertexShader from '@/views/study/assets/shaders/firedlies/vertex.glsl?raw'
import firefliesFragmentShader from '@/views/study/assets/shaders/firedlies/fragment.glsl?raw'

import portalVertexShader from '@/views/study/assets/shaders/portal/vertex.glsl?raw'
import portalFragmentShader from '@/views/study/assets/shaders/portal/fragment.glsl?raw'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';


import '@/views/study/assets/styles/loader.scss'

// const spector = new Spector()
// spector.displayUI()

const debugObject = {
    clearColor: '#1F1a19',
    portalColorStart: '#1e09c0',
    portalColorEnd: '#594aeb',
}
const gui = new GUI({
    width: 400,
})


export default defineComponent({
    name: 'StudeyGlTFLoader',
    setup() {
        const { scene, camera, renderer, parentNode, animate } = new BaseScene({
            parentSelect: '#app',
            id: 'StudeyGlTFLoaderScene',
        })
        // const axes = new AxesHelper(20)
        // const controls = new TrackballControls(camera, parentNode as HTMLElement)

        camera.position.set(-30, 40, 30)
        
        
        renderer.setClearColor(debugObject.clearColor)
        gui
            .addColor(debugObject, 'clearColor')
            .onChange(() => renderer.setClearColor(debugObject.clearColor))

        // 萤火虫
        const firefliesGeometry = new BufferGeometry()
        const firefliesCount = 30
        const positionArray = new Float32Array(firefliesCount * 3)
        const scaleArray = new Float32Array(firefliesCount)

        for (let i = 0; i < firefliesCount; i++) {
            positionArray[i * 3 + 0] = (Math.random() - 0.5) * 8
            positionArray[i * 3 + 1] = Math.random() * 4
            positionArray[i * 3 + 2] = (Math.random() - 0.5) * 8

            scaleArray[i] = Math.random() + 0.5
        }
        firefliesGeometry.setAttribute('position', new BufferAttribute(positionArray, 3))
        firefliesGeometry.setAttribute('aScale', new BufferAttribute(scaleArray, 1))

        // const firefliesMaterial = new PointsMaterial({ size: 1, sizeAttenuation: true })
        const firefliesMaterial = new ShaderMaterial({
            vertexShader: firefliesVertexShader,
            fragmentShader: firefliesFragmentShader,
            transparent: true,
            blending: AdditiveBlending,
            depthWrite: false,
            uniforms: {
                uPixelRatio: {
                    value: Math.min(window.devicePixelRatio, 2),
                },
                uSize: { value: 100 },
                uTime: { value: 0 },
            },
        })
        const fireflies = new Points(firefliesGeometry, firefliesMaterial)
        firefliesGeometry.scale(5, 5, 5)
        scene.add(fireflies)

        const clock = new Clock()

        gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1)

        // 门
        const portalLightMaterial = new ShaderMaterial({
            vertexShader: portalVertexShader,
            fragmentShader: portalFragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uColorStart: { value: new Color(debugObject.portalColorStart) },
                uColorEnd: { value: new Color(debugObject.portalColorEnd) },
            },
        })
        gui
            .addColor(debugObject, 'portalColorStart')
            .onChange(() => {
                portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
            })
        gui
            .addColor(debugObject, 'portalColorEnd')
            .onChange(() => {
                portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
            })

        // clock
        animate.extendUpdate.push(() => {
            const uTime = clock.getElapsedTime()
            firefliesMaterial.uniforms.uTime.value = uTime
            portalLightMaterial.uniforms.uTime.value = uTime
        })
 
        // const lightprobe = new LightProbe()
        // scene.add(lightprobe)

        // const directionalLight = new DirectionalLight(0xcccccc, .2) 
        // directionalLight.position.set(10, 0, 10)
        // scene.add(directionalLight)

        // const ambientLight = new AmbientLight(0xcccccc, 1)
        // scene.add(ambientLight)


        // renderer.setClearColor(new Color(0xcccccc))
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.xr.enabled = true
        // renderer.shadowMap.type = PCFSoftShadowMap
        document.body.appendChild( VRButton.createButton( renderer ) );

        // scene.add(axes)

        // controls.rotateSpeed = 2.5
        // controls.zoomSpeed = 1.2
        // controls.panSpeed = 0.8
        // controls.noZoom = false
        // controls.noPan = false
        // controls.staticMoving = true
        // controls.dynamicDampingFactor = 0.3

        const textureloader = new TextureLoader()
        const bakeTexture = textureloader.load('/model/baked.jpg')
        bakeTexture.flipY = false
        bakeTexture.encoding = sRGBEncoding
        const bakeMaterial = new MeshBasicMaterial({ map: bakeTexture })

        const poleLightMaterial = new MeshBasicMaterial({ color: 0xffffe5 })
        // const portalLightMaterial = new MeshBasicMaterial({ color: 0xffffff })

        const loader = new GLTFLoader()
        loader.load(
            '/model/maxTest1.glb',
            gltf => {
                gltf.scene.scale.set(3, 3, 3)
                // gltf.scene.position.set(0, -30, 80)
                gltf.scene.receiveShadow = true
                gltf.scene.castShadow = true
                // animate.extendUpdate.push(() => {
                //     gltf.scene.rotation.y += 0.001
                // })
                scene.add(gltf.scene)


                const gltfMap: Record<string, Object3D<Event>> = {}
                gltf.scene.children.forEach(child => gltfMap[child.name] = child)

                const { protalLight, poleLightA, poleLightB, backed } = gltfMap
                poleLightA.material = poleLightMaterial
                poleLightB.material = poleLightMaterial
                protalLight.material = portalLightMaterial
                backed.material = bakeMaterial

                gltf.scene.rotation.y += -300


                // const control = new OrbitControls(camera, renderer.domElement)
                // control.autoRotate = true
                // control.target = new Vector3(0, -20, 0)

                console.log('end');
                const controls = new PointerLockControls( camera);
                controls.getObject().position.set(0, 50, 0);
                // controls.getObject().lookAt(gltf.scene.position)
                scene.add( controls.getObject() );
                // 捕捉光标
                parentNode?.addEventListener('click', () => {
                    controls.lock()
                })
                let velocity = new Vector3(); //移动速度变量
                let direction = new Vector3(); //移动的方向变量
                let rotation = new Vector3(); //当前的相机朝向
                let speed = 500; //控制器移动速度
                let upSpeed = 200; //控制跳起时的速度
                let spaceUp = true;
                let canJump = false;
                let downKeyBoard = ''
                const onKeyDown = ( event: KeyboardEvent ) => {
                    switch ( event.keyCode ) {
                        case 38: // up
                        case 87: // w
                            downKeyBoard = 'w';
                            break;
                        case 37: // left
                        case 65: // a
                            downKeyBoard = 'a'
                            break;
                        case 40: // down
                        case 83: // s
                            downKeyBoard = 's'
                            break;
                        case 39: // right
                        case 68: // d
                            downKeyBoard = 'd'
                            break;
                        case 32: // space
                            if ( canJump ) velocity.y += upSpeed;
                            canJump = false;
                            break;
                    }
                };
                const onKeyUp = () => {
                    downKeyBoard = ''
                    direction.set(0, 0, 0)
                    velocity.set(0, 0, 0)
                }

                document.addEventListener( 'keydown', onKeyDown, false );
                document.addEventListener( 'keyup', onKeyUp, false );

                //获取到控制器对象
                var control = controls.getObject();

                //获取刷新时间
                var delta =  clock.getDelta()
                animate.extendUpdate.push(() => {
                    //velocity每次的速度，为了保证有过渡
                    velocity.x -= velocity.x * 10.0 * delta;
                    velocity.z -= velocity.z * 10.0 * delta;
                    velocity.y -= 9.8 * 50.0 * delta; // 默认下降的速度

                    //获取当前按键的方向并获取朝哪个方向移动
                    direction.z = Number( downKeyBoard === 'w' ) - Number( downKeyBoard === 's' );
                    direction.x = Number( downKeyBoard === 'a' ) - Number( downKeyBoard === 'd' );


                    if (['w', 's'].includes(downKeyBoard)) velocity.z -= direction.z * speed * delta;
                    if (['a', 'd'].includes(downKeyBoard)) velocity.x -= direction.x * speed * delta;

                    var upRaycaster = new Raycaster(new Vector3(), new Vector3( 0, 1, 0), 0, 10);
                    var horizontalRaycaster = new Raycaster(new Vector3(), new Vector3(), 0, 10);
                    var downRaycaster = new Raycaster(new Vector3(), new Vector3( 0, -1, 0), 0, 10);

                    // horizontalRaycaster.set( control.position , rotation );
                    // downRaycaster.set( control.position , rotation );
                    
                    //horizontal.setDirection(rotation);

                    downRaycaster.ray.origin.copy( control.position );
                    var intersections = downRaycaster.intersectObjects( scene.children, true);
                    var onObject = intersections.length > 0;
                    
                    //判断是否停在了立方体上面
                    if ( onObject === true ) {
                        velocity.y = Math.max( 0, velocity.y );
                        canJump = true;
                    }

                    //将法向量的值归一化
                    direction.normalize();

                    //根据速度值移动控制器
                    control.translateOnAxis(new Vector3(
                        velocity.x,
                        0,
                        velocity.z,
                    ), delta)
                    control.position.y += velocity.y * 0.05
                    // control.translateX( velocity.x * delta );
                    // control.translateY( velocity.y * delta );
                    // control.translateZ( velocity.z * delta );
                })
            },
            xhr => {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' )
            },
            error => {
                console.error(error)
            }
        )

        return () => <div></div>
    },
})