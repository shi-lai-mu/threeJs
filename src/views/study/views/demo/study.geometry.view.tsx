import { defineComponent } from 'vue'
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'

import { BaseScene } from '@/views/study/components/scene'

export default defineComponent({
    name: 'StudeyGeometry',
    setup() {
        const Scene = new BaseScene({
            parentSelect: '#app',
            id: 'StudeyGeometryScene',
        })
        // 立方体
        const geometry = new BoxGeometry()
        const material = new MeshBasicMaterial({ color: 0x00ff00 })
        const cube = new Mesh(geometry, material)
        Scene.scene.add(cube)
        Scene.camera.position.z = 5
        Scene.animate.extendUpdate.push(() => {
            cube.rotation.x += 0.01
            cube.rotation.y += 0.01
        })

        return () => (<div></div>)
    },
})