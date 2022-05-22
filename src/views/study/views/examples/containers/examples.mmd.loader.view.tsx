import { defineComponent, onDeactivated } from 'vue'
// import { Spector } from 'spectorjs'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'

import Ammos from 'three/examples/js/libs/ammo.wasm'
import { OrbitControls  } from 'three/examples/jsm/controls/OrbitControls'
import { OutlineEffect  } from 'three/examples/jsm/effects/OutlineEffect'
import { MMDLoader  } from 'three/examples/jsm/loaders/MMDLoader'
import { MMDAnimationHelper  } from 'three/examples/jsm/animation/MMDAnimationHelper'

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';


import '@/views/study/assets/styles/loader.scss'

import ammoWasmWasm from 'three/examples/js/libs/ammo.wasm.wasm?url'
import { AmbientLight } from 'three'
console.log(ammoWasmWasm);

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


const clock = new THREE.Clock();


export default defineComponent({
    name: 'MMDLoader',
    setup() {
        let stats: any;
                        
        let mesh: any, camera: any, scene: any, renderer: any, effect: any;
        let helper: any, ikHelper: any, physicsHelper: any;
        
        // let Ammo = AmmoJS

        Ammos.bind(window)({}).then((v) => {

            ;(window as any).Ammo = v

            init();
            // animate();
        })
        

        function init() {
                
            const container = document.createElement( 'div' );
            document.body.appendChild( container );

            container.addEventListener('dblclick', () => {
                document.body.requestFullscreen()
            })

            camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
            camera.position.z = 30;

            // scene

            scene = new THREE.Scene();
            scene.background = new THREE.Color( 0xffffff );

            const gridHelper = new THREE.PolarGridHelper( 30, 10 );
            gridHelper.position.y = - 10;
            scene.add( gridHelper );

            const ambient = new THREE.AmbientLight( 0x666666 );
            scene.add( ambient );

            // const directionalLight = new THREE.DirectionalLight( 0x887766 );
            // directionalLight.position.set( - 1, 1, 1 ).normalize();
            // scene.add( directionalLight );

            //

            renderer = new THREE.WebGLRenderer( { antialias: true } );
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize( window.innerWidth, window.innerHeight );
            container.appendChild( renderer.domElement );
            renderer.xr.enabled = true
            // renderer.shadowMap.type = PCFSoftShadowMap
            document.body.appendChild( VRButton.createButton( renderer ) );

            effect = new OutlineEffect( renderer );
            const ambientLight = new AmbientLight(0xffffff, 0.5)
            scene.add(ambientLight)

            // STATS

            stats = new (Stats as any)();
            container.appendChild( stats.dom );

            // model

            function onProgress( xhr: any ) {

                if ( xhr.lengthComputable ) {

                    const percentComplete = xhr.loaded / xhr.total * 100;
                    console.log( Math.round( percentComplete, 2 ) + '% downloaded' );

                }

            }


            const modelFile = `${import.meta.env.VITE_APP_PREFIX}pmx/kizunaai/kizunaai.pmx`;
            const vmdFiles = [ `${import.meta.env.VITE_APP_PREFIX}vmd/ai.vmd` ];

            helper = new MMDAnimationHelper( {
                afterglow: 2.0
            } );

            const loader = new MMDLoader();

            loader.loadWithAnimation( modelFile, vmdFiles, function ( mmd ) {

                mesh = mmd.mesh;
                mesh.position.y = - 10;
                scene.add( mesh );

                helper.add( mesh, {
                    animation: mmd.animation,
                    physics: true
                } );

                ikHelper = helper.objects.get( mesh ).ikSolver.createHelper();
                ikHelper.visible = false;
                scene.add( ikHelper );

                physicsHelper = helper.objects.get( mesh ).physics.createHelper();
                physicsHelper.visible = false;
                scene.add( physicsHelper );

                initGui();

            }, onProgress );

            const controls = new OrbitControls( camera, renderer.domElement );
            controls.minDistance = 10;
            controls.maxDistance = 100;

            window.addEventListener( 'resize', onWindowResize );

            function initGui() {

                const api = {
                    'animation': true,
                    'ik': true,
                    'outline': true,
                    'physics': true,
                    'show IK bones': false,
                    'show rigid bodies': false
                };

                const gui = new GUI();

                gui.add( api, 'animation' ).onChange( function () {

                    helper.enable( 'animation', api[ 'animation' ] );

                } );

                gui.add( api, 'ik' ).onChange( function () {

                    helper.enable( 'ik', api[ 'ik' ] );

                } );

                gui.add( api, 'outline' ).onChange( function () {

                    effect.enabled = api[ 'outline' ];

                } );

                gui.add( api, 'physics' ).onChange( function () {

                    helper.enable( 'physics', api[ 'physics' ] );

                } );

                gui.add( api, 'show IK bones' ).onChange( function () {

                    ikHelper.visible = api[ 'show IK bones' ];

                } );

                gui.add( api, 'show rigid bodies' ).onChange( function () {

                    if ( physicsHelper !== undefined ) physicsHelper.visible = api[ 'show rigid bodies' ];

                } );

            }
            renderer.setAnimationLoop(animate)

        }

        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            effect.setSize( window.innerWidth, window.innerHeight );

        }

        //

        function animate() {

            // requestAnimationFrame( animate );

            stats.begin();
            render();
            stats.end();

        }

        function render() {

            helper.update( clock.getDelta() );
            effect.render( scene, camera );

        }

        return () => <div></div>
    },
})