import { createRouter, createWebHistory } from "vue-router";
const routes = [
  {
    path: "/editor",
    component: () => import("@/views/editor.vue"),
  },
  {
    path: "/",
    component: () => import("@/views/feed.vue"),
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
