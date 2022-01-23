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
            {
                path: '05',
                name: 'demo-05',
                component: () => import('./containers/05.view'),
            },
            {
                path: '06',
                name: 'demo-06',
                component: () => import('./containers/06.view'),
            },
            {
                path: '07',
                name: 'demo-07',
                component: () => import('./containers/07.view'),
            },
            {
                path: '08',
                name: '08-galaxy',
                component: () => import('./containers/08Galaxy.view'),
            },
            {
                path: '09',
                name: '09-Raycaster',
                component: () => import('./containers/09Raycaster.view'),
            },
            {
                path: '10',
                name: '10-Physics',
                component: () => import('./containers/10Physics.view'),
            },
        ],
    }
]