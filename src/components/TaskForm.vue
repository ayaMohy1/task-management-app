<script setup lang="ts">
// utils
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useTaskStore } from '../stores/task'
import type { Task, TaskStatus } from '../types/task'
import { priorityOptions, statusOptions } from '../utils/utils'

const props = defineProps<{
  task?: Task
}>()

const emit = defineEmits<{
  close: []
  saved: [message: string]
}>()

const taskStore = useTaskStore()

const newTask = reactive({
  title: '',
  description: '',
  status: 'Pending' as TaskStatus,
  priority: 'Medium',
})

const selectedDate = ref<Date | null>(null)
const selectedTime = ref<string>('')

const resetForm = () => {
  newTask.title = ''
  newTask.description = ''
  newTask.status = 'Pending'
  newTask.priority = 'Medium'
  selectedDate.value = null
  selectedTime.value = ''
}

const tryParseLegacyDate = (value: string): Date | null => {
  if (!value || value === 'No due date') return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const fillForm = (task?: Task) => {
  if (task) {
    newTask.title = task.title
    newTask.description = task.description
    newTask.status = task.status
    newTask.priority = task.priority

    const parsed = tryParseLegacyDate(task.dueDate)
    selectedDate.value = parsed
    selectedTime.value = parsed
      ? `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
      : ''
    return
  }

  resetForm()
}

watch(() => props.task, fillForm, { immediate: true })

/* ------------------------------------------------------------------ */
/* Calendar popup                                                      */
/* ------------------------------------------------------------------ */

const calendarOpen = ref(false)
const viewMonth = ref(new Date())
viewMonth.value.setDate(1)

const dateFieldRef = ref<HTMLElement | null>(null)

const monthLabel = computed(() =>
  viewMonth.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
)

const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const calendarDays = computed(() => {
  const year = viewMonth.value.getFullYear()
  const month = viewMonth.value.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay() // 0 = Sunday
  const gridStart = new Date(year, month, 1 - startOffset)

  const today = new Date()

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + i)
    return {
      date,
      inCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
      isSelected: selectedDate.value ? isSameDay(date, selectedDate.value) : false,
    }
  })
})

const openCalendar = () => {
  if (selectedDate.value) {
    viewMonth.value = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), 1)
  }
  calendarOpen.value = true
}

const prevMonth = () => {
  viewMonth.value = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  viewMonth.value = new Date(viewMonth.value.getFullYear(), viewMonth.value.getMonth() + 1, 1)
}

const pickDay = (date: Date) => {
  selectedDate.value = new Date(date)
  calendarOpen.value = false
}

const clearDate = () => {
  selectedDate.value = null
  selectedTime.value = ''
  calendarOpen.value = false
}

const jumpToToday = () => {
  const today = new Date()
  viewMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)
  selectedDate.value = today
}

const formattedDate = computed(() =>
  selectedDate.value
    ? selectedDate.value.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '',
)

const formattedTime = computed(() => {
  const time = selectedTime.value

  if (!time) return ''

  const parts = time.split(':')
  if (parts.length !== 2) return ''

  const hour = Number(parts[0])
  const minute = Number(parts[1])

  if (Number.isNaN(hour) || Number.isNaN(minute)) return ''

  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12

  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`
})

// Final string handed to the store, keeping the existing Task.dueDate shape
const dueDateOutput = computed(() => {
  if (!selectedDate.value) return 'No due date'

  const date = new Date(selectedDate.value)

  if (selectedTime.value) {
    const [hour, minute] = selectedTime.value.split(':').map(Number)
    date.setHours(hour ?? 0, minute ?? 0, 0, 0)
  }

  return date.toISOString()
})

const statusOpen = ref(false)
const priorityOpen = ref(false)
const statusFieldRef = ref<HTMLElement | null>(null)
const priorityFieldRef = ref<HTMLElement | null>(null)

const pickStatus = (value: TaskStatus) => {
  newTask.status = value
  statusOpen.value = false
}

const pickPriority = (value: string) => {
  newTask.priority = value
  priorityOpen.value = false
}

// handle date validation
const dateError = computed(() => {
  if (!selectedDate.value) return ''

  const selected = new Date(selectedDate.value)

  if (selectedTime.value) {
    const parts = selectedTime.value.split(':')

    if (parts.length === 2) {
      const hour = Number(parts[0])
      const minute = Number(parts[1])

      selected.setHours(hour, minute, 0, 0)
    }
  } else {
    selected.setHours(23, 59, 59, 999)
  }

  return selected < new Date() ? 'Due date cannot be in the past.' : ''
})

const isDateValid = computed(() => !dateError.value)

/* ------------------------------------------------------------------ */
/* Shared click-outside handling for all popups                        */
/* ------------------------------------------------------------------ */

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (calendarOpen.value && dateFieldRef.value && !dateFieldRef.value.contains(target)) {
    calendarOpen.value = false
  }
  if (statusOpen.value && statusFieldRef.value && !statusFieldRef.value.contains(target)) {
    statusOpen.value = false
  }
  if (priorityOpen.value && priorityFieldRef.value && !priorityFieldRef.value.contains(target)) {
    priorityOpen.value = false
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return
  calendarOpen.value = false
  statusOpen.value = false
  priorityOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
})

/* ------------------------------------------------------------------ */
/* Submit                                                               */
/* ------------------------------------------------------------------ */

const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  if (!newTask.title.trim()) return
  if (!isDateValid.value) return

  const payload = {
    title: newTask.title.trim(),
    description: newTask.description.trim(),
    status: newTask.status,
    dueDate: dueDateOutput.value,
    priority: newTask.priority,
  }

  if (props.task) {
    taskStore.updateTask({ id: props.task.id, ...payload })
    emit('saved', 'Task updated successfully')
  } else {
    taskStore.addTask(payload)
    emit('saved', 'Task created successfully')
  }

  if (!props.task) resetForm()
  closeModal()
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="modal-form">
    <div class="form-group">
      <label for="task-title" class="task-title"> Title <span class="required">*</span></label>
      <input
        id="task-title"
        v-model="newTask.title"
        type="text"
        placeholder="e.g. Redesign homepage hero section"
        required
        autofocus
      />
    </div>

    <div class="form-group">
      <label for="task-description">Description</label>
      <textarea
        id="task-description"
        v-model="newTask.description"
        rows="3"
        placeholder="Describe what needs to be done..."
      />
    </div>

    <div class="form-row">
      <!-- Status: custom dropdown -->
      <div class="form-group" ref="statusFieldRef">
        <label id="task-status-label" for="task-status">Status</label>
        <div class="select" :class="{ 'select--open': statusOpen }">
          <button
            type="button"
            class="select__trigger"
            aria-haspopup="listbox"
            :aria-expanded="statusOpen"
            aria-labelledby="task-status-label"
            @click="statusOpen = !statusOpen"
          >
            <span
              class="select__dot"
              :class="`select__dot--${newTask.status.replace(/\s+/g, '').toLowerCase()}`"
            />
            {{ newTask.status }}
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

          <ul v-if="statusOpen" class="select__menu">
            <li
              v-for="opt in statusOptions"
              :key="opt.value"
              class="select__option"
              :class="{ 'select__option--active': newTask.status === opt.value }"
              @click="pickStatus(opt.value)"
            >
              <span
                class="select__dot"
                :class="`select__dot--${opt.value.replace(/\s+/g, '').toLowerCase()}`"
              />
              {{ opt.label }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Priority: custom dropdown -->
      <div class="form-group" ref="priorityFieldRef">
        <label id="task-priority-label" for="priority">Priority</label>
        <div class="select" :class="{ 'select--open': priorityOpen }">
          <button
            type="button"
            class="select__trigger"
            aria-haspopup="listbox"
            :aria-expanded="priorityOpen"
            aria-labelledby="task-priority-label"
            @click="priorityOpen = !priorityOpen"
          >
            <span
              class="select__dot"
              :class="`select__dot--priority-${newTask.priority.toLowerCase()}`"
            />
            {{ newTask.priority }}
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

          <ul v-if="priorityOpen" class="select__menu">
            <li
              v-for="opt in priorityOptions"
              :key="opt.value"
              class="select__option"
              :class="{ 'select__option--active': newTask.priority === opt.value }"
              @click="pickPriority(opt.value)"
            >
              <span
                class="select__dot"
                :class="`select__dot--priority-${opt.value.toLowerCase()}`"
              />
              {{ opt.label }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Due date: calendar popup field -->
    <div class="form-group" ref="dateFieldRef">
      <label id="task-date-label" for="task-date">Due Date</label>
      <div class="datefield" :class="{ 'datefield--open': calendarOpen }">
        <button
          type="button"
          class="datefield__trigger"
          aria-haspopup="dialog"
          :aria-expanded="calendarOpen"
          aria-labelledby="task-date-label"
          @click="openCalendar"
        >
          <svg
            class="datefield__icon"
            viewBox="0 0 20 20"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <rect
              x="2.5"
              y="4"
              width="15"
              height="13"
              rx="2"
              stroke="currentColor"
              stroke-width="1.4"
              fill="none"
            />
            <path d="M2.5 8H17.5" stroke="currentColor" stroke-width="1.4" />
            <path
              d="M6.5 2.5V5.5M13.5 2.5V5.5"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
            />
          </svg>
          <span :class="{ datefield__placeholder: !selectedDate }">
            {{ selectedDate ? formattedDate : 'Select a date' }}
          </span>
          <span v-if="formattedTime" class="datefield__time">{{ formattedTime }}</span>
        </button>

        <div v-if="calendarOpen" class="calendar" aria-label="Choose a due date">
          <div class="calendar__header">
            <button
              type="button"
              class="calendar__nav"
              @click="prevMonth"
              aria-label="Previous month"
            >
              ‹
            </button>
            <span class="calendar__month">{{ monthLabel }}</span>
            <button type="button" class="calendar__nav" @click="nextMonth" aria-label="Next month">
              ›
            </button>
          </div>

          <div class="calendar__weekdays">
            <span v-for="d in weekdayLabels" :key="d">{{ d }}</span>
          </div>

          <div class="calendar__grid">
            <button
              v-for="cell in calendarDays"
              :key="cell.date.toISOString()"
              type="button"
              class="calendar__day"
              :class="{
                'calendar__day--muted': !cell.inCurrentMonth,
                'calendar__day--today': cell.isToday,
                'calendar__day--selected': cell.isSelected,
              }"
              @click="pickDay(cell.date)"
            >
              {{ cell.date.getDate() }}
            </button>
          </div>

          <div class="calendar__time">
            <label for="task-time-input">Time</label>
            <input id="task-time-input" type="time" v-model="selectedTime" />
          </div>

          <div class="calendar__footer">
            <button type="button" class="calendar__link" @click="jumpToToday">Today</button>
            <button type="button" class="calendar__link calendar__link--clear" @click="clearDate">
              Clear
            </button>
          </div>
        </div>
      </div>

      <p v-if="dateError" class="form-error">
        {{ dateError }}
      </p>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="!newTask.title.trim() || !isDateValid"
      >
        {{ task ? 'Save Changes' : 'Add Task' }}
      </button>
    </div>
  </form>
</template>
