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
        ],
    }
] 