import { createRouter, createWebHistory } from "vue-router";

import { studyViewRouter } from "@/views/study/study.router";

/** 路由实例 */
export const MainRouter = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
          name: 'root',
          path: '/',
          component: () => import('@/layouts/default/layout'),
        },
        ...studyViewRouter,
    ],
})