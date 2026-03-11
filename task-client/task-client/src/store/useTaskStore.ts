import {create} from 'zustand'
import {TaskPriority, TaskStatus} from '@/core/domain/entities/task'

type SimpleTask = {
    id: string
    title: string
    status: TaskStatus
    priority: TaskPriority
    createdAt: Date
    completedAt?: Date
}

type TaskStore = {
    tasks: SimpleTask[]
    addTask: (title: string) => void
    toggleTask: (id: string) => void
    removeTask: (id: string) => void
}

export const useTaskStore = create<TaskStore>((set) => ({
    tasks: [],
    addTask: (title) =>
        set((state) => ({
            tasks: [...state.tasks, {
                id: Date.now().toString(), // 使用字符串类型ID避免精度问题
                title,
                status: TaskStatus.WAITING,
                priority: TaskPriority.MEDIUM,
                createdAt: new Date()
            }]
        })),
    toggleTask: (id) =>
        set((state) => ({
            tasks: state.tasks.map(task =>
                task.id === id
                    ? {
                        ...task,
                        status: task.status === TaskStatus.COMPLETED ? TaskStatus.IN_PROGRESS : TaskStatus.COMPLETED,
                        completedAt: task.status === TaskStatus.COMPLETED ? undefined : new Date()
                      }
                    : task
            )
        })),
    removeTask: (id) =>
        set((state) => ({
            tasks: state.tasks.filter(task => task.id !== id)
        })),
}))
