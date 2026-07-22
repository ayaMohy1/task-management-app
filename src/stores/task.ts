import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Task, TaskStatus } from '../types/task'
import { taskService } from '../services/taskService'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref('')

  //   task action ( Search, Filter)
  const searchQuery = ref('')
  const filterStatus = ref<TaskStatus | 'All'>('All')
  const filteredTasks = computed(() => {
    return (
      tasks.value
        // 1. Search Filter
        .filter((task) => task.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
        // 2. Status Filter
        .filter((task) => {
          if (filterStatus.value === 'All') return true
          return task.status === filterStatus.value
        })
    )
  })

  //   get all tasks
  async function fetchAllTasks() {
    loading.value = true
    error.value = ''

    try {
      tasks.value = await taskService.getAllTasks()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Something went wrong'
    } finally {
      loading.value = false
    }
  }

  //   add new task
  function addTask(task: Omit<Task, 'id'>) {
    const newTask: Task = {
      id: Date.now(),
      ...task,
    }

    taskService.addTask(newTask)
    tasks.value.push(newTask)
  }

  //   update specific task by id
  function updateTask(updatedTask: Task) {
    taskService.updateTask(updatedTask)
    const index = tasks.value.findIndex((t) => t.id === updatedTask.id)

    if (index !== -1) {
      tasks.value[index] = updatedTask
    }
  }

  //   delete task
  function deleteTask(id: number) {
    taskService.deleteTask(id)
    tasks.value = tasks.value.filter((task) => task.id !== id)
  }

  //   get specific task by id
  function getTaskById(id: number) {
    return tasks.value.find((task) => task.id === id)
  }

  return {
    tasks,
    loading,
    error,
    filteredTasks,
    fetchAllTasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    searchQuery,
    filterStatus,
  }
})
