import { RouteRecordRaws } from '@/types/router'

/** VR 路由 */
export const VRViewRouter: RouteRecordRaws[] = [
  {
    path: 'vr',
    meta: { title: 'VR' },
    name: 'vr-home',
    component: () => import('.'),
  },
  {
    path: 'vr/mmd',
    meta: { title: 'MMD' },
    name: 'vr-mmd',
    component: () => import('./mmd'),
  },
]
