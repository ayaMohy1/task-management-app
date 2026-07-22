<template>
  <div class="task-card" :class="`theme-${task.status}`" @click="goToTaskDetail">
    <!-- Top Row: Title & Priority Pill -->
    <div class="card-header">
      <div class="card-header-title-section">
        <img src="/planning.png" class="card-header-image" alt="task" />
        <div>
          <h3 class="task-title">{{ task?.title }}</h3>

          <div class="card-footer">
            <span>Due Date: {{ ' ' }} </span>
            <span class="time-text">
              {{ task?.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date' }}</span
            >
          </div>
        </div>
      </div>

      <span :class="['priority-badge', task?.priority.toLowerCase()]">
        {{ task.priority }} Priority
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
// utils
import type { Task } from '../types/task'
import { useRouter } from 'vue-router'

const props = defineProps<{
  task: Task
}>()

const router = useRouter()

const goToTaskDetail = () => {
  router.push(`/task/${props.task.id}`)
}
</script>
