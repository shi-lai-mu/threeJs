import { createRouter, createWebHistory } from "vue-router";

import { demoViewRouter, examplesViewRouter } from "@/views/study/studay.router";

/** 路由实例 */
export const MainRouter = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
          name: 'root',
          path: '/',
          component: () => import('@/layouts/default/layout'),
        },
        ...examplesViewRouter,
        ...demoViewRouter,
    ],
})