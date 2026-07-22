import type { Task } from '../types/task'
const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Build Login Page',
    description: 'Create authentication page using Vue 3',
    status: 'Done',
    dueDate: 'Aug 14, 2026 · 5:55 PM',
    priority: 'Medium',
  },
  {
    id: 2,
    title: 'Implement Task Management',
    description: 'Create a task management system with Vue 3 and TypeScript',
    status: 'In Progress',
    dueDate: 'Aug 16, 2026 · 5:55 PM',
    priority: 'Medium',
  },
  {
    id: 3,
    title: 'Design Fintech Dashboard',
    description: 'Finish dashboard widgets',
    status: 'In Progress',
    dueDate: 'Aug 17, 2026 · 5:55 PM',
    priority: 'High',
  },
  {
    id: 4,
    title: 'Build Digital Agency Landing Page',
    description: 'Create a landing page for a digital agency',
    status: 'Pending',
    dueDate: 'Aug 18, 2026 · 5:55 PM',
    priority: 'Low',
  },
  {
    id: 4,
    title: 'Client Meeting — SaaS Project',
    description: '',
    status: 'Pending',
    dueDate: 'Aug 19, 2026 · 6:55 PM',
    priority: 'High',
  },
  {
    id: 5,
    title: 'Client Meeting — Travel Agency Project',
    description: '',
    status: 'Done',
    dueDate: 'Aug 20, 2026 · 5:55 PM',
    priority: 'High',
  },
  {
    id: 6,
    title: 'Client Meeting — Ecommerce Project',
    description: '',
    status: 'In Progress',
    dueDate: 'Aug 14, 2026 · 5:55 PM',
    priority: 'High',
  },
  {
    id: 7,
    title: 'Client Meeting — AI Project',
    description: '',
    status: 'Pending',
    dueDate: 'Sep 14, 2026 · 3:50 PM',
    priority: 'Medium',
  },
  {
    id: 8,
    title: 'Client Meeting — Vue Project',
    description: '',
    status: 'Done',
    dueDate: 'Sep 18, 2026 · 2:30 PM',
    priority: 'Medium',
  },
  {
    id: 9,
    title: 'Client Meeting — React Project',
    description: '',
    status: 'In Progress',
    dueDate: 'Oct 14, 2026 · 5:30 PM',
    priority: 'Low',
  },
]

// Task Service
export const taskService = {
  async getAllTasks(): Promise<Task[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const hasError = false

        if (hasError) {
          reject(new Error('Failed to load tasks'))
        } else {
          resolve([...mockTasks])
        }
      }, 1000)
    })
  },
  getTaskById(id: number) {
    return mockTasks.find((task) => task.id === id)
  },

  addTask(task: Task) {
    mockTasks.push(task)
  },

  updateTask(task: Task) {
    const index = mockTasks.findIndex((t) => t.id === task.id)

    if (index !== -1) {
      mockTasks[index] = task
    }
  },
  deleteTask(id: number) {
    const index = mockTasks.findIndex((t) => t.id === id)

    if (index !== -1) {
      mockTasks.splice(index, 1)
    }
  },
}
