'use client'

import {useTaskStore} from '@/store/useTaskStore'

export default function TaskList() {
    const { tasks, toggleTask, removeTask } = useTaskStore()

    if (tasks.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                暂无任务，添加一个任务开始吧！
            </div>
        )
    }

    return (
        <ul className="space-y-2">
            {tasks.map(task => (
                <li
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                >
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={!!task.completedAt}
                            onChange={() => toggleTask(task.id)}
                            className="w-5 h-5 accent-blue-500"
                        />
                        <span className={`${task.completedAt ? 'line-through text-gray-400' : ''}`}>
              {task.title}
            </span>
                    </div>
                    <button
                        onClick={() => removeTask(task.id)}
                        className="text-red-500 hover:text-red-700"
                    >
                        删除
                    </button>
                </li>
            ))}
        </ul>
    )
}
