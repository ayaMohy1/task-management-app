import type { TaskStatus } from '../types/task'

export const filterOptions: { value: TaskStatus; label: string }[] = [
  { value: 'All', label: 'All Tasks' },
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Done', label: 'Done' },
]

export const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Done', label: 'Done' },
]

export const priorityOptions = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
]

export const dotClass = (value: string) => {
  switch (value) {
    case 'Pending':
      return 'select__dot--pending'
    case 'In Progress':
      return 'select__dot--inprogress'
    case 'Done':
      return 'select__dot--done'
    default:
      return 'select__dot--all'
  }
}
