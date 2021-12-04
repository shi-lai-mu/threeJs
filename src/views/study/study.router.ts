import { RouteRecordRaws } from "@/types/router";

/** 学习路由 */
export const studyViewRouter: RouteRecordRaws[] = [
    {
        path: '/study',
        name: 'study-view',
        redirect: { name: 'study-geometry' },
        component: () => import('./study.layout'),
        children: [
            {
                path: 'geometry',
                meta: { title: '正方体' },
                name: 'study-geometry',
                component: () => import('./views/examples/study.geometry.view'),
            },
            {
                path: 'lines',
                meta: { title: '画线' },
                name: 'study-lines',
                component: () => import('./views/examples/study.lines.view'),
            },
            {
                path: 'gltfLoader',
                meta: { title: 'gltf 加载器' },
                name: 'gltf-loader',
                component: () => import('./views/examples/study.gltf.loader.view'),
            },
        ],
    }
] 