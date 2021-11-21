import { RouteRecordRaws } from "@/types/router";

/** 学习路由 */
export const studyViewRouter: RouteRecordRaws[] = [
    {
        path: '/study',
        name: 'study-view',
        redirect: { name: 'study-demo' },
        component: () => import('./study.layout'),
        children: [
            {
                path: 'demo',
                name: 'study-demo',
                component: () => import('./views/demo/study.demo.view'),
            },
        ],
    }
]