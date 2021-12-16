import { RouteRecordRaws } from "@/types/router";

/** 学习 路由 */
export const examplesViewRouter: RouteRecordRaws[] = [
    {
        path: '/examples',
        name: 'examples-view',
        redirect: { name: 'examples-geometry' },
        component: () => import('../../study.layout'),
        children: [
            {
                path: 'geometry',
                meta: { title: '正方体' },
                name: 'examples-geometry',
                component: () => import('./containers/examples.geometry.view'),
            },
            {
                path: 'lines',
                meta: { title: '画线' },
                name: 'examples-lines',
                component: () => import('./containers/examples.lines.view'),
            },
            {
                path: 'gltfLoader',
                meta: { title: 'gltf 加载器' },
                name: 'gltf-loader',
                component: () => import('./containers/examples.gltf.loader.view'),
            },
        ],
    }
] 