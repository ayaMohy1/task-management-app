import type { Task } from '../types/task'
const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Build Login Page',
    description:
      'Create a responsive login page with form validation, password visibility toggle, and API integration.',
    status: 'Done',
    dueDate: '2026-07-29T21:00:00.000Z',
    priority: 'Medium',
  },
  {
    id: 2,
    title: 'Implement Task Management',
    description: 'Develop CRUD functionality for tasks using Vue 3, Pinia, and TypeScript.',
    status: 'In Progress',
    dueDate: '2026-07-30T16:30:00.000Z',
    priority: 'High',
  },
  {
    id: 3,
    title: 'Design Fintech Dashboard',
    description: 'Create analytics cards, charts, and responsive layouts for the dashboard.',
    status: 'In Progress',
    dueDate: '2026-08-19T20:00:00.000Z',
    priority: 'High',
  },
  {
    id: 4,
    title: 'Build Digital Agency Landing Page',
    description:
      'Develop a modern landing page with hero section, services, testimonials, and contact form.',
    status: 'Pending',
    dueDate: '2026-08-18T20:00:00.000Z',
    priority: 'Low',
  },
  {
    id: 5,
    title: 'Client Meeting — SaaS Project',
    description:
      'Discuss project milestones, feature requests, and deployment timeline with the client.',
    status: 'Pending',
    dueDate: '2026-08-20T05:00:00.000Z',
    priority: 'High',
  },
  {
    id: 6,
    title: 'Client Meeting — Travel Agency Project',
    description: 'Review booking workflow improvements and mobile responsiveness.',
    status: 'Done',
    dueDate: '2026-08-21T04:00:00.000Z',
    priority: 'High',
  },
  {
    id: 7,
    title: 'Client Meeting — Ecommerce Project',
    description: 'Present checkout flow updates and discuss payment gateway integration.',
    status: 'In Progress',
    dueDate: '2026-08-14T02:00:00.000Z',
    priority: 'High',
  },
  {
    id: 8,
    title: 'Client Meeting — AI Project',
    description: 'Review AI chatbot progress and finalize the next sprint objectives.',
    status: 'Pending',
    dueDate: '2026-08-15T03:30:00.000Z',
    priority: 'Medium',
  },
  {
    id: 9,
    title: 'Client Meeting — Vue Project',
    description: 'Demonstrate new UI components and gather stakeholder feedback.',
    status: 'Done',
    dueDate: '2026-08-25T20:00:00.000Z',
    priority: 'Medium',
  },
  {
    id: 10,
    title: 'Client Meeting — React Project',
    description: 'Review project architecture and discuss migration strategy.',
    status: 'In Progress',
    dueDate: '2026-09-19T20:00:00.000Z',
    priority: 'Low',
  },
  {
    id: 11,
    title: 'Write API Documentation',
    description:
      'Document all REST endpoints, request parameters, responses, and authentication flow.',
    status: 'Pending',
    dueDate: '2026-09-02T14:00:00.000Z',
    priority: 'Medium',
  },
  {
    id: 12,
    title: 'Optimize Dashboard Performance',
    description:
      'Reduce bundle size, implement lazy loading, and improve Lighthouse performance score.',
    status: 'In Progress',
    dueDate: '2026-09-05T17:30:00.000Z',
    priority: 'High',
  },
  {
    id: 13,
    title: 'Fix Authentication Bugs',
    description:
      'Resolve token expiration issues, refresh token handling, and session persistence.',
    status: 'Pending',
    dueDate: '2026-09-08T11:00:00.000Z',
    priority: 'High',
  },
  {
    id: 14,
    title: 'Prepare Sprint Demo',
    description:
      'Create demo scenarios, verify completed features, and prepare presentation slides.',
    status: 'Done',
    dueDate: '2026-09-10T15:00:00.000Z',
    priority: 'Low',
  },
  {
    id: 15,
    title: 'Deploy Production Release',
    description:
      'Deploy the latest version to production, verify health checks, and monitor logs after release.',
    status: 'Pending',
    dueDate: '2026-09-15T19:00:00.000Z',
    priority: 'High',
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
