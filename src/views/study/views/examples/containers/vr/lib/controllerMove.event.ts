import {
    AdditiveBlending,
    BoxGeometry,
    BufferGeometry,
    CircleGeometry,
    EventListener,
    Float32BufferAttribute,
    Group,
    Line,
    LineBasicMaterial,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    PlaneGeometry,
    Quaternion,
    RingGeometry,
    Vector2,
    Vector3,
    WebGLRenderer,
} from 'three'
import { VRScene } from './VRScene'

export interface ControllerEventUserData {
    isSelecting: boolean
}
export let INTERSECTION: Vector3 | undefined = undefined
const tempMatrix = new Matrix4()
const mouse = new Vector2()
const mouseTarget = {
    floor: null,
} as {
    floor: null | Vector3
}

/** 注册 控制器 移动事件 */
export function registerControllerMoveBaseEvent(this: VRScene, renderer: WebGLRenderer) {
    const { raycaster, gridHelper, scene, camera } = this

    const marker = new Mesh(
        new CircleGeometry(0.25, 32).rotateX(-Math.PI / 2),
        new MeshBasicMaterial({ color: 0x808080 })
    )
    scene.add(marker)

    const floor = new Mesh(
        new PlaneGeometry(300, 300, 2, 2).rotateX(-Math.PI / 2),
        new MeshBasicMaterial({ color: 0x999, transparent: true, opacity: 0.25 })
    )
    floor.position.setY(0)
    scene.add(floor)

    const { controller } = registerVRController.apply(this, [[floor], marker])
    const x = registerMouseController.apply(this, [[floor], marker])

    return { controller }
}

/** 注册 VR 控制器 */
function registerVRController(
    this: VRScene,
    intersectObjects: Mesh<BufferGeometry, MeshBasicMaterial>[],
    marker: Mesh<BufferGeometry, MeshBasicMaterial>
) {
    const { raycaster, camera, renderer } = this
    // 右手
    const controller1 = renderer.xr.getController(0)
    controller1.addEventListener('selectstart', onSelectStart)
    controller1.addEventListener('selectend', onSelectEnd)
    controller1.addEventListener('connected', function (this: any, event) {
        this.add(buildController(event.data))
    })
    controller1.addEventListener('disconnected', function (this: any) {
        this.remove(this.children[0])
    })

    // 左手
    const controller2 = renderer.xr.getController(1)
    controller2.addEventListener('selectstart', onSelectStart)
    controller2.addEventListener('selectend', onSelectEnd)
    controller2.addEventListener('connected', function (this: any, event) {
        this.add(buildController(event.data))
    })
    controller2.addEventListener('disconnected', function (this: any) {
        this.remove(this.children[0])
    })

    window.addEventListener('resize', onWindowResize, false)

    const controllerSelecting = (controller: Group) => {
        if (controller.userData.isSelecting === true) {
            tempMatrix.identity().extractRotation(controller.matrixWorld)

            raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld)
            raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix)

            const intersects = raycaster.intersectObjects(intersectObjects)

            if (intersects.length > 0) {
                // console.log({ point: intersects[0].point, intersects })
                const { point } = intersects[0]
                INTERSECTION = point
                // if (INTERSECTION.y < 3) {
                //     INTERSECTION.setY(3)
                // }
            }
        }
    }

    this.animate.extendUpdate.push(() => {
        INTERSECTION = undefined

        controllerSelecting(controller1)
        controllerSelecting(controller2)

        if (INTERSECTION) {
            marker.position.copy(INTERSECTION).setY((INTERSECTION as Vector3).y)
        }

        marker.visible = INTERSECTION !== undefined
    })

    function onSelectStart(this: Group & { userData: ControllerEventUserData }) {
        this.userData.isSelecting = true
    }

    function onSelectEnd(this: Group & { userData: ControllerEventUserData }) {
        this.userData.isSelecting = false
        if (INTERSECTION) {
            // camera.position.copy(INTERSECTION)
            const baseReferenceSpace = renderer.xr.getReferenceSpace()
            const offsetPosition = {
                x: -INTERSECTION.x,
                y: -INTERSECTION.y,
                z: -INTERSECTION.z,
                w: 1,
            }
            const offsetRotation = new Quaternion()
            const transform = new (XRRigidTransform as any)(offsetPosition, offsetRotation)
            const teleportSpaceOffset = baseReferenceSpace?.getOffsetReferenceSpace(transform)
            console.log(transform)
            ;(renderer.xr as any).setReferenceSpace(teleportSpaceOffset)
        }
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()

        renderer.setSize(window.innerWidth, window.innerHeight)
    }

    return {
        controller: [controller1, controller2],
    }
}

/** 注册 鼠标 控制 */
function registerMouseController(
    this: VRScene,
    intersectObjects: Mesh<BufferGeometry, MeshBasicMaterial>[],
    marker: Mesh<BufferGeometry, MeshBasicMaterial>
) {
    const { parentNode, raycaster, camera, screen } = this

    parentNode?.addEventListener('mouseout', event => {
        marker.visible = false
        mouseTarget.floor = null
    })

    parentNode?.addEventListener('mousemove', event => {
        const { clientX, clientY } = event as MouseEvent
        mouse.x = (clientX / screen.width) * 2 - 1
        mouse.y = -((clientY / screen.height) * 2 - 1)

        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(intersectObjects)

        if (intersects.length === 1) {
            marker.position.copy(intersects[0].point).setY(0.25)
            mouseTarget.floor = intersects[0].point
        }
        marker.visible = true
    })

    // 双击 移动位置
    parentNode?.addEventListener('dblclick', () => {
        if (mouseTarget.floor) {
            const camera = this.camera.position.copy(mouseTarget.floor)
            if (camera.y <= 1) {
                camera.setY(3)
            }
            const { x, y, z } = this.camera.position
        }
    })

    // 根据摄像机的点位进行 检测
}

/** 为控制器添加指线 */
function buildController(data: any) {
    let geometry, material
    switch (data.targetRayMode) {
        case 'tracked-pointer':
            geometry = new BufferGeometry()
            geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3))
            geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3))

            material = new LineBasicMaterial({
                vertexColors: true,
                blending: AdditiveBlending,
            })

            return new Line(geometry, material)

        case 'gaze':
            geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1)
            material = new MeshBasicMaterial({ opacity: 0.5, transparent: true })
            return new Mesh(geometry, material)
    }
}
