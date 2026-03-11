'use client'

import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useTaskStore} from '@/store/useTaskStore'

const taskSchema = z.object({
    title: z.string().min(1, '任务标题不能为空').max(100, '任务标题不能超过100个字符')
})

type TaskFormValues = z.infer<typeof taskSchema>

export default function TaskForm() {
    const addTask = useTaskStore(state => state.addTask)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: ''
        }
    })

    const onSubmit = (data: TaskFormValues) => {
        addTask(data.title)
        reset()
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6">
            <div className="flex gap-2">
                <div className="flex-grow">
                    <input
                        {...register('title')}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="添加新任务..."
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
                    )}
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    添加
                </button>
            </div>
        </form>
    )
}
