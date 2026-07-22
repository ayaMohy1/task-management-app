import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/pages/HomeView.vue'
import TaskDetailView from '@/pages/TaskDetailView.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import { useTaskStore } from '@/stores/task'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/task/:id',
      name: 'task-detail',
      component: TaskDetailView,
      beforeEnter: (to) => {
        const taskStore = useTaskStore()

        const exists = taskStore.tasks.some((task) => task.id === Number(to.params.id))

        if (!exists) {
          return { name: 'not-found' }
        }
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage,
    },
  ],
})

export default router
