import { RouteRecordRaw } from "vue-router";

export type RouteRecordRaws = {
    meta?: Record<string, string>
    children?: RouteRecordRaws[]
} & RouteRecordRaw