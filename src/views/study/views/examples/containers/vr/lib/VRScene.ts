import { BaseSceneOptions } from '@/utils/scene'
import {
    AmbientLight,
    Color,
    DirectionalLight,
    Fog,
    GridHelper,
    Group,
    LineBasicMaterial,
    LineSegments,
    PerspectiveCamera,
    PolarGridHelper,
    Raycaster,
    Scene,
    sRGBEncoding,
    Vector3,
    WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory'
import Stats from 'three/examples/jsm/libs/stats.module'
import { registerControllerMoveBaseEvent } from './controllerMove.event'
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry'

export const { innerWidth, innerHeight, devicePixelRatio } = window

export class VRScene {
    /** 窗口信息 */
    readonly screen = {
        width: window.innerWidth,
        height: window.innerHeight,
    }
    /** 场景实例 */
    readonly scene = new Scene()
    /** 渲染器实例 */
    readonly renderer = new WebGLRenderer({
        antialias: true,
    })
    /** 摄像机实例 */
    readonly camera: PerspectiveCamera
    /** 场景父级节点 */
    readonly parentNode: Element | null
    /** 创建场景 传入配置 */
    readonly options?: BaseSceneOptions
    /** 射线 碰撞 */
    readonly raycaster = new Raycaster()
    /** 地板 网格 */
    readonly gridHelper = new GridHelper(300, 300, new Color(0xff0000), new Color(0xcccccc))

    /** 控制器 */
    controls = {
        vr: [],
        orbit: null,
    } as { vr: Group[]; orbit: OrbitControls | null }

    constructor(options?: BaseSceneOptions) {
        const { screen } = this
        this.options = options

        if (options?.id) {
            this.sceneNode.select(`#${options.id}`) && this.render.destroy()
        }

        const { scene, renderer } = this

        this.camera = new PerspectiveCamera(50, screen.width / screen.height, 0.1, 1000)
        this.camera.position.set(10, 6, 0)
        // this.camera.lookAt(new Vector3(-10, -100, -10))

        this.parentNode = this.sceneNode.select(this.options?.parentSelect ?? 'body')

        // scene.background = new Color(0x505050)

        const gridHelper = new PolarGridHelper(30, 10)
        this.gridHelper.position.y = -3
        scene.add(this.gridHelper)

        const ambient = new AmbientLight(0x666666)
        scene.add(ambient)

        renderer.setSize(screen.width, screen.height)
        renderer.setPixelRatio(devicePixelRatio)
        renderer.outputEncoding = sRGBEncoding

        renderer.xr.enabled = true

        const stats = new (Stats as any)()
        this.parentNode?.appendChild(stats.dom)

        this.addEffect()
        this.addControls()
        this.addRaycaster()

        this.render.create(options)
    }

    /** 节点操作 */
    readonly sceneNode = {
        /** 选择节点 */
        select: (selectString: string) => {
            return document.querySelector(selectString)
        },
    }

    // document.body.append(renderer.domElement)

    /** 渲染方法 */
    readonly render = {
        /** 创建 */
        create: (options?: BaseSceneOptions) => {
            console.info('render create')
            if (options?.id) {
                this.renderer.domElement.id = options.id
            }
            this.parentNode?.append(this.renderer.domElement)
            this.animate.start()
        },
        /** 销毁 */
        destroy: () => {
            console.info('render destroy')
            const { animate, options, sceneNode } = this
            animate.stop()
            animate.extendUpdate = []
            if (options?.id) {
                const targetNode = sceneNode.select(`#${options.id}`)
                targetNode && this.parentNode?.removeChild(targetNode)
            }
        },
    }

    /** 渲染循环更新 方法 */
    readonly animate = {
        /** 更新状态 */
        status: false,
        /** 开始 循环 */
        start: () => {
            this.animate.status = true
            //   this.animate.update()
            this.renderer.setAnimationLoop(this.animate.update)
        },
        /** 停止 循环 */
        stop: () => {
            console.log('animate stop')
            this.animate.status = false
        },
        /** 重置 循环 */
        reset: () => {
            const { animate, options, parentNode } = this
            animate.stop()
            if (options?.id) {
                const node = document.querySelector(`#${options.id}`)
                node && parentNode?.removeChild(node)
            }
            setTimeout(animate.start, 100)
        },
        /** 更新方法 */
        update: () => {
            if (this.animate.status) {
                this.animate.extendUpdate.forEach(fn => fn())
            }
        },
        /** 拓展渲染方法 */
        extendUpdate: [
            () => {
                // requestAnimationFrame(this.animate.update)
                this.renderer.render(this.scene, this.camera)
            },
        ],
    }

    /** 添加 基础效果 */
    addEffect() {
        const effect = new OutlineEffect(this.renderer)
        const ambientLight = new AmbientLight(0xffffff, 0.5)

        const light = new DirectionalLight(0xffffff)
        light.position.set(1, 1, 1).normalize()

        const fogColor = 0xffffff
        const fog = new Fog(fogColor, 5, 250)
        this.scene.fog = fog

        this.renderer.setClearColor(fogColor)

        this.scene.add(ambientLight, light)
    }

    /** 添加 控制项 */
    addControls() {
        const { renderer, scene } = this
        this.controls.orbit = new OrbitControls(this.camera, renderer.domElement)

        // 为手柄添加移动操作
        const { controller } = registerControllerMoveBaseEvent.apply(this, [renderer])
        controller.map(controllerEntity => scene.add(controllerEntity))

        // 添加右手0和左手1手柄（在场景内显示手柄）
        const controllerModelFactory = new XRControllerModelFactory()
        const controllerGrip1 = renderer.xr.getControllerGrip(0)
        controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1))
        const controllerGrip2 = renderer.xr.getControllerGrip(1)
        controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2))

        scene.add(controllerGrip1, controllerGrip2)
        // controls.minDistance = 10;
        // controls.maxDistance = 100;
    }

    /** 添加 互动计算 */
    addRaycaster() {}
}
