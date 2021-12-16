import { defineComponent } from 'vue'
import { BufferGeometry, Line, LineBasicMaterial, Vector3 } from 'three'

import { BaseScene } from '@/utils/scene'

export default defineComponent({
    name: 'StudeyLines',
    setup() {
        const Scene = new BaseScene({
            parentSelect: '#app',
            id: 'StudeyLinesScene',
        })
        // 线
        const material = new LineBasicMaterial({ color: 0x0000ff })
        const points = [
            new Vector3(-10, 0, 0),
            new Vector3(0, 10, 0),
            new Vector3(10, 0, 0),
        ]
        const geometry = new BufferGeometry().setFromPoints(points)
        const line = new Line(geometry, material)
        Scene.animate.extendUpdate.push(
            () => {
                // line.rotation.x += 0.01
                line.rotation.y += 0.01
            }
        )
        Scene.scene.add(line)

        return () => <div></div>
    },
})