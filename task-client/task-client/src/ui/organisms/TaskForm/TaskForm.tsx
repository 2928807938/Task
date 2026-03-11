'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {motion} from 'framer-motion';
import {FiAlertCircle, FiCalendar, FiPlus, FiTag} from 'react-icons/fi';

const taskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').max(100, '任务标题不能超过100个字符')
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onAddTask: (title: string) => void;
}

export function TaskForm({ onAddTask }: TaskFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: ''
    }
  });

  const onSubmit = (data: TaskFormValues) => {
    onAddTask(data.title);
    reset();
    setIsExpanded(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-8"
    >
      <div
        className={`bg-gray-50 rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'p-6' : 'p-4'}`}
        style={{
          boxShadow: isHovered || isExpanded
            ? 'inset 2px 2px 5px rgba(166, 180, 200, 0.25), inset -2px -2px 5px rgba(255, 255, 255, 0.6), 4px 4px 10px rgba(166, 180, 200, 0.15), -4px -4px 10px rgba(255, 255, 255, 0.3)'
            : 'inset 1px 1px 3px rgba(166, 180, 200, 0.15), inset -1px -1px 3px rgba(255, 255, 255, 0.5)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!isExpanded ? (
          <div
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md"
              style={{
                boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.3), -2px -2px 5px rgba(255, 255, 255, 0.5)'
              }}
            >
              <FiPlus className="w-5 h-5" />
            </motion.div>
            <p className="text-gray-600 font-medium">添加新任务...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <input
                {...register('title')}
                placeholder="输入任务标题..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-gray-700 bg-white focus:outline-none"
                style={{
                  boxShadow: 'inset 2px 2px 5px rgba(166, 180, 200, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.7)'
                }}
              />
              {errors.title && (
                <div className="flex items-center gap-1.5 mt-2 text-red-500 text-sm">
                  <FiAlertCircle className="w-4 h-4" />
                  <span>{errors.title.message}</span>
                </div>
              )}
            </div>

            {/* 可选的任务属性 */}
            <div className="flex flex-wrap gap-3 mb-5">
              <motion.div
                whileHover={{ y: -2 }}
                className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm text-gray-600 cursor-pointer"
                style={{
                  boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.15), -2px -2px 5px rgba(255, 255, 255, 0.5)'
                }}
              >
                <FiCalendar className="w-3.5 h-3.5 text-blue-500" />
                <span>设置截止日期</span>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm text-gray-600 cursor-pointer"
                style={{
                  boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.15), -2px -2px 5px rgba(255, 255, 255, 0.5)'
                }}
              >
                <FiTag className="w-3.5 h-3.5 text-yellow-500" />
                <span>添加标签</span>
              </motion.div>
            </div>

            {/* 控制按钮 */}
            <div className="flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                style={{
                  boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.15), -2px -2px 5px rgba(255, 255, 255, 0.5)'
                }}
              >
                取消
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium flex items-center gap-1.5"
                style={{
                  boxShadow: '2px 2px 5px rgba(166, 180, 200, 0.2), -2px -2px 5px rgba(255, 255, 255, 0.5)'
                }}
              >
                <FiPlus className="w-4 h-4" />
                创建任务
              </motion.button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}
