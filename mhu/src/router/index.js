import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  // 未来可以在这里添加更多路由
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;