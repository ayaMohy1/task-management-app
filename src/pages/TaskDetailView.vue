<script setup lang="ts">
// utils
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '../stores/task'
import type { TaskStatus } from '../types/task'

// components
import TaskForm from '../components/TaskForm.vue'
import LoadingState from '../components/LoadingState.vue'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const toastMessage = ref('')
const toastVisible = ref(false)

const statusSteps: TaskStatus[] = ['Pending', 'In Progress', 'Done']

const taskId = computed(() => Number(route.params.id))
const task = computed(() => taskStore.getTaskById(taskId.value))

const statusClass = computed(() => {
  if (!task.value) return ''
  return task.value.status.toLowerCase().replace(/\s+/g, '-')
})

const currentStepIndex = computed(() => {
  if (!task.value) return 0
  return statusSteps.indexOf(task.value.status)
})

const progressPercent = computed(() => {
  if (currentStepIndex.value <= 0) return 0
  return (currentStepIndex.value / (statusSteps.length - 1)) * 100
})

const isModalOpen = computed(() => isEditModalOpen.value || isDeleteModalOpen.value)

const showToast = (message: string) => {
  toastMessage.value = message
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, 3000)
}

const openEditModal = () => {
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}

const openDeleteModal = () => {
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
}

const handleFormSaved = (message: string) => {
  showToast(message)
}

const confirmDelete = () => {
  if (!task.value) return
  taskStore.deleteTask(task.value.id)
  closeDeleteModal()
  router.push('/')
}

const updateStatus = (status: TaskStatus) => {
  if (!task.value || task.value.status === status) return
  taskStore.updateTask({ ...task.value, status })
  showToast(`Status updated to ${status}`)
}

const isStepCompleted = (index: number) => index < currentStepIndex.value

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeEditModal()
    closeDeleteModal()
  }
}

watch(isModalOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''

  if (open) {
    document.addEventListener('keydown', handleEscape)
  } else {
    document.removeEventListener('keydown', handleEscape)
  }
})

onMounted(() => {
  if (taskStore.tasks.length === 0) {
    taskStore.fetchAllTasks()
  }
})
</script>

<template>
  <div class="task-manager task-detail-page">
    <div class="task-manager-header">
      <!-- 1. Breadcrumb -->
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>Task Management System</li>
          <li class="separator">&gt;</li>
          <li>
            <RouterLink class="breadcrumb-link" to="/">My Task</RouterLink>
          </li>
          <li class="separator">&gt;</li>
          <li class="current">Task Detail</li>
        </ol>
      </nav>
      <!-- Header -->
      <header class="header">
        <h1 class="detail-title">{{ task?.title }}</h1>
        <span :class="['priority-badge', task?.priority.toLowerCase()]">
          {{ task?.priority }}
        </span>
      </header>
      <!-- action (Back button, Edit, Delete) -->
      <div class="task-manager-header-action">
        <RouterLink class="back-link" to="/">
          <span class="back-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </span>
          <span class="back-text"> Back to tasks </span>
        </RouterLink>
        <div class="detail-actions">
          <button type="button" class="detail-btn detail-btn-edit" @click="openEditModal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Edit
          </button>
          <button type="button" class="detail-btn detail-btn-delete" @click="openDeleteModal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>

    <LoadingState v-if="taskStore.loading" :count="1" />

    <div v-else-if="taskStore.error" class="detail-message detail-error">
      <p>{{ taskStore.error }}</p>
      <RouterLink class="back-link" to="/">Back to tasks</RouterLink>
    </div>

    <article v-else class="detail-card">
      <section class="task-card" :class="`theme-${task?.status}`">
        <div class="status-stepper-header">
          <h2>Progress</h2>
          <span class="progress-label">{{ Math.round(progressPercent) }}% complete</span>
        </div>

        <div class="status-progress-track">
          <div class="status-progress-fill" :style="{ width: `${progressPercent}%` }" />
        </div>

        <div class="status-stepper">
          <button
            v-for="(step, index) in statusSteps"
            :key="step"
            type="button"
            class="status-step"
            :class="{
              active: task?.status === step,
              completed: isStepCompleted(index),
            }"
            @click="updateStatus(step)"
          >
            <span class="step-indicator">
              <svg
                v-if="isStepCompleted(index)"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span v-else>{{ index + 1 }}</span>
            </span>
            <span class="step-label">{{ step }}</span>
          </button>
        </div>
      </section>

      <div class="detail-meta">
        <div class="meta-card">
          <span class="meta-label">Status:</span>
          <span :class="['status-badge', statusClass]">{{ task?.status }}</span>
        </div>

        <div class="meta-card">
          <span class="meta-label">Priority</span>
          <span :class="['priority-badge', task?.priority.toLowerCase()]">
            {{ task?.priority }}
          </span>
        </div>

        <div class="meta-card">
          <span class="meta-label">Due Date</span>
          <span class="meta-value">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {{ task?.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date' }}
          </span>
        </div>
      </div>

      <section class="detail-section">
        <span class="meta-label">Description</span>
        <p class="detail-description">
          {{ task?.description || 'No description provided for this task.' }}
        </p>
      </section>
    </article>
  </div>

  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isEditModalOpen && task" class="modal-backdrop" @click.self="closeEditModal">
        <div class="modal-card" aria-modal="true" aria-labelledby="edit-modal-title">
          <div class="modal-header">
            <h2 id="edit-modal-title">Edit Task</h2>
            <button
              type="button"
              class="close-btn"
              @click="closeEditModal"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
          <div class="modal-body">
            <TaskForm :task="task" @close="closeEditModal" @saved="handleFormSaved" />
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="isDeleteModalOpen && task" class="modal-backdrop" @click.self="closeDeleteModal">
        <div
          class="modal-card modal-card-sm modal-card-danger"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon modal-icon-negative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                  width="20px"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </div>
              <h2 id="delete-modal-title">Delete Task</h2>
            </div>
            <button
              type="button"
              class="close-btn"
              @click="closeDeleteModal"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
          <div class="modal-body">
            <p class="delete-message">
              Are you sure you want to delete
              <strong>"{{ task.title }}" ?</strong>
            </p>
            <p class="delete-message-center">This action cannot be undone.</p>
            <div class="modal-footer">
              <button type="button" class="detail-btn detail-btn-delete" @click="closeDeleteModal">
                Cancel
              </button>
              <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="toastVisible" class="toast" aria-live="polite">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        {{ toastMessage }}
      </div>
    </Transition>
  </Teleport>
</template>
