<script setup lang="ts">
// utils
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTaskStore } from '../stores/task'
import { filterOptions, dotClass } from '../utils/utils'
import type { TaskStatus } from '../types/task'
// components
import TaskForm from '../components/TaskForm.vue'
import TaskCard from '../components/TaskCard.vue'
import EmptyCard from '../components/EmptyCard.vue'
import LoadingState from '../components/LoadingState.vue'

const taskStore = useTaskStore()

// add new task modal
const isModalOpen = ref(false)
const openAddModal = () => {
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal()
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

const filterOpen = ref(false)
const filterFieldRef = ref<HTMLElement | null>(null)

const currentFilterLabel = () =>
  filterOptions.find((opt) => opt.value === taskStore.filterStatus)?.label ?? 'All Tasks'

const pickFilter = (value: TaskStatus) => {
  taskStore.filterStatus = value
  filterOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (filterOpen.value && filterFieldRef.value && !filterFieldRef.value.contains(target)) {
    filterOpen.value = false
  }
}

const handleFilterEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') filterOpen.value = false
}

onMounted(() => {
  taskStore.fetchAllTasks()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleFilterEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleFilterEscape)
})
</script>

<template>
  <div class="task-manager">
    <div class="task-manager-header">
      <!-- 1. Breadcrumb -->
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li class="">Task Management System</li>
          <li class="separator">></li>
          <li class="current">My Task</li>
        </ol>
      </nav>

      <!-- Header -->
      <header class="header">
        <h1>My Tasks</h1>
      </header>

      <!-- Controls Section -->
      <div class="controls-container">
        <!-- Search Bar - Left-aligned -->
        <div class="search-toolbox">
          <div class="search-row">
            <div class="search-box">
              <svg
                class="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input v-model="taskStore.searchQuery" type="text" placeholder="Search tasks..." />
            </div>
          </div>
          <div class="toolbox-action">
            <!-- Filter Dropdown -->
            <div
              class="filter-group select"
              :class="{ 'select--open': filterOpen }"
              ref="filterFieldRef"
            >
              <button
                type="button"
                class="select__trigger"
                aria-haspopup="listbox"
                :aria-expanded="filterOpen"
                @click="filterOpen = !filterOpen"
              >
                <span class="select__dot" :class="dotClass(taskStore.filterStatus)" />
                {{ currentFilterLabel() }}
                <svg
                  class="select__chevron"
                  viewBox="0 0 12 8"
                  width="12"
                  height="8"
                  aria-hidden="true"
                >
                  <path
                    d="M1 1.5L6 6.5L11 1.5"
                    stroke="currentColor"
                    stroke-width="1.6"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>

              <ul v-if="filterOpen" class="select__menu">
                <li
                  v-for="opt in filterOptions"
                  :key="opt.value"
                  class="select__option"
                  :class="{ 'select__option--active': taskStore.filterStatus === opt.value }"
                  @click="pickFilter(opt.value)"
                >
                  <span class="select__dot" :class="dotClass(opt.value)" />
                  {{ opt.label }}
                </li>
              </ul>
            </div>

            <button class="add-task-btn" @click="openAddModal">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <hr class="separate-line" />

    <!-- Task List (Matching Image Design) -->
    <div class="task-manager-main">
      <div class="task-list">
        <LoadingState v-if="taskStore.loading" />
        <div v-else-if="taskStore.error">
          {{ taskStore.error }}
        </div>
        <div v-else>
          <TaskCard v-for="task in taskStore.filteredTasks" :key="task.id" :task="task" />

          <!-- Empty State -->
          <div v-if="taskStore.filteredTasks.length === 0">
            <EmptyCard />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Task Modal Dialog -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">
              <div class="modal-icon modal-icon-positive">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <h2 id="delete-modal-title">Create New Task</h2>
            </div>

            <button type="button" class="close-btn" @click="closeModal" aria-label="Close dialog">
              ✕
            </button>
          </div>

          <div class="modal-body">
            <TaskForm @close="closeModal" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
