import { NavigationGuardNext, RouteLocationNormalized } from "vue-router"

import { MainRouter } from "."

/**
 * 路由守卫
 */
 MainRouter.beforeEach(
    (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
        console.log(to);
        next()
    }
)
  