import {
    OrthographicCamera,
    PerspectiveCamera,
    Scene,
    sRGBEncoding,
    Vector3,
    WebGLRenderer,
} from 'three'

export const { innerWidth, innerHeight } = window

let animateStatus = false

export type BaseSceneOptions = {
    /** 父节点 选择器 */
    parentSelect?: string
    /** 场景ID 可用于回收 */
    id?: string
}

/** 场景 控制器 */
export class BaseScene {
    /** 场景实例 */
    readonly scene = new Scene()
    /** 渲染器实例 */
    readonly renderer = new WebGLRenderer({
        antialias: true,
        alpha: true,
    })
    /** 摄像机实例 */
    readonly camera: PerspectiveCamera
    /** 场景父级节点 */
    readonly parentNode: Element | null
    /** 创建场景 传入配置 */
    readonly options?: BaseSceneOptions

    constructor(options?: BaseSceneOptions) {
        this.options = options
        const targetPosition = new Vector3(0, 0, 0)

        const scale = innerHeight * 0.005 + 4.8
        const initialCameraPosition = new Vector3(
            20 * Math.sin(0.2 * Math.PI),
            10,
            20 * Math.cos(0.2 * Math.PI)
        )
        const orthographicCamera = new OrthographicCamera(-scale, scale, scale, 0.01, 50000)
        orthographicCamera.position.copy(initialCameraPosition)
        orthographicCamera.lookAt(targetPosition)

        this.camera = new PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
        this.parentNode = this.sceneNode.select(this.options?.parentSelect ?? 'body')

        this.renderer.setSize(innerWidth, innerHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.outputEncoding = sRGBEncoding
        this.camera.lookAt(targetPosition)
        this.camera.position.set(0, 0, 100)

        if (options?.id) {
            this.sceneNode.select(`#${options.id}`) && this.render.destroy()
        }
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
            if (options?.id) {
                this.renderer.domElement.id = options.id
            }
            this.parentNode?.append(this.renderer.domElement)
            this.animate.start()
        },
        /** 销毁 */
        destroy: () => {
            const { animate, options, sceneNode } = this
            animate.stop()
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
            animateStatus = true
            //   this.animate.update()

            this.renderer.setAnimationLoop(this.animate.update)
        },
        /** 停止 循环 */
        stop() {
            animateStatus = false
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
            this.animate.extendUpdate.forEach(fn => fn())
        },
        /** 拓展渲染方法 */
        extendUpdate: [
            () => {
                if (animateStatus) {
                    // requestAnimationFrame(this.animate.update)
                    this.renderer.render(this.scene, this.camera)
                }
            },
        ],
    }
}
