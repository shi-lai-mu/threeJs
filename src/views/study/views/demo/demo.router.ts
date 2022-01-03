import { RouteRecordRaws } from "@/types/router";

/** demo 路由 */
export const demoViewRouter: RouteRecordRaws[] = [
    {
        path: '/demo',
        name: 'demo-view',
        redirect: { name: 'demo-01' },
        component: () => import('../../study.layout'),
        children: [
            {
                path: '01',
                name: 'demo-01',
                component: () => import('./containers/01.view'),
            },
            {
                path: '02',
                name: 'demo-02',
                component: () => import('./containers/02.view'),
            },
            {
                path: '03',
                name: 'demo-03',
                component: () => import('./containers/03.view'),
            },
            {
                path: '04',
                name: 'demo-04',
                component: () => import('./containers/04.view'),
            },
        ],
    }
]