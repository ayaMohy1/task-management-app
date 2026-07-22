import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import HomeView from '@/pages/HomeView.vue'

// ----------------------
// Mock Store
// ----------------------
const mockStore = {
  loading: false,
  error: '',
  searchQuery: '',
  filterStatus: 'All',
  filteredTasks: [
    {
      id: 1,
      title: 'Test Task',
      description: 'Test Description',
      status: 'Pending',
      priority: 'Medium',
      dueDate: '2026-07-30T10:00:00.000Z',
    },
  ],
  fetchAllTasks: vi.fn(),
}

vi.mock('@/stores/task', () => ({
  useTaskStore: () => mockStore,
}))

// ----------------------
// Mock Utils
// ----------------------
vi.mock('@/utils/utils', () => ({
  filterOptions: [
    { label: 'All Tasks', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Done', value: 'Done' },
    { label: 'In Progress', value: 'In Progress' },
  ],
  dotClass: vi.fn(() => ''),
}))

describe('HomeView', () => {
  beforeEach(() => {
    mockStore.loading = false
    mockStore.error = ''
    mockStore.searchQuery = ''
    mockStore.filterStatus = 'All'
    mockStore.filteredTasks = [
      {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'Pending',
        priority: 'Medium',
        dueDate: '2026-07-30T10:00:00.000Z',
      },
    ]

    mockStore.fetchAllTasks.mockClear()
  })

  const createWrapper = () =>
    mount(HomeView, {
      global: {
        stubs: {
          Teleport: true,
          Transition: false,

          TaskCard: {
            props: ['task'],
            template: '<div class="task-card">{{ task.title }}</div>',
          },

          TaskForm: {
            template: '<div>Task Form</div>',
          },

          LoadingState: {
            template: '<div>Loading...</div>',
          },

          EmptyCard: {
            template: '<div>No Tasks</div>',
          },
        },
      },
    })

  it('renders page title', () => {
    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('My Tasks')
  })

  it('calls fetchAllTasks on mount', () => {
    createWrapper()

    expect(mockStore.fetchAllTasks).toHaveBeenCalledOnce()
  })

  it('shows loading state', () => {
    mockStore.loading = true

    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Loading...')
  })

  it('shows error message', () => {
    mockStore.error = 'Something went wrong'

    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('renders task cards', () => {
    const wrapper = createWrapper()

    expect(wrapper.find('.task-card').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Task')
  })

  it('shows empty state', () => {
    mockStore.filteredTasks = []

    const wrapper = createWrapper()

    expect(wrapper.text()).toContain('No Tasks')
  })

  it('updates search query', async () => {
    const wrapper = createWrapper()

    const input = wrapper.find('input')

    await input.setValue('Vue')

    expect(mockStore.searchQuery).toBe('Vue')
  })

  it('opens filter dropdown', async () => {
    const wrapper = createWrapper()

    expect(wrapper.find('.select__menu').exists()).toBe(false)

    await wrapper.find('.select__trigger').trigger('click')

    expect(wrapper.find('.select__menu').exists()).toBe(true)
  })
})
