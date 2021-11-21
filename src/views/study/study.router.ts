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
                name: 'study-geometry',
                component: () => import('./views/demo/study.geometry.view'),
            },
        ],
    }
]