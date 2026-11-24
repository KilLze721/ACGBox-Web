import { createRouter, createWebHistory } from 'vue-router'
import CatalogView from '@/views/CatalogView.vue'

// 目录使用可直接访问的历史路由，根路径统一进入动画目录。
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  // 前进后退恢复原滚动位置，目录内更新查询时保留当前筛选面板位置。
  scrollBehavior: (to, from, saved) => saved ?? (to.path !== from.path ? { top: 0 } : undefined),
  routes: [
    { path: '/', redirect: { name: 'anime' } },
    {
      path: '/anime',
      name: 'anime',
      component: CatalogView,
      props: { kind: 'anime' },
      meta: { title: '动画查询' },
    },
    {
      path: '/book',
      name: 'book',
      component: CatalogView,
      props: { kind: 'book' },
      meta: { title: '书籍查询' },
    },
  ],
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ACGBox` : 'ACGBox'
})

export default router
