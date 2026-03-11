import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {FiAlertTriangle} from 'react-icons/fi';
import {ProjectTask} from '@/types/api-types';
import useTaskHook from '@/hooks/use-task-hook';
import {Controller, useForm} from 'react-hook-form';
import {getPriorityStyle, getStatusStyle} from '@/utils/style-utils';
import DatePicker from '../../molecules/DatePicker';
import MemberPicker from '../../molecules/MemberPicker';

interface TaskEditorProps {
  task: ProjectTask;
  projectId: string;
  onCancel: () => void;
  onSave: (updatedTask: ProjectTask) => void;
  projectMembers?: Array<{ id: string; name: string; avatar?: string }>;
}

// 表单数据类型
// 定义为更宽松的类型，接受任何字符串值
// 实际上我们会存储从后端获取的ID字符串
// 而不是特定的枚举值
interface TaskFormData {
  title: string;
  description: string;
  status: any; // 定义为any以接受任何ID字符串值
  priority: any; // 定义为any以接受任何ID字符串值
  dueDate: string;
  assigneeId: string;
}

/**
 * 任务编辑器组件
 * 遵循苹果设计规范，提供简洁、直观的任务编辑体验
 */
const TaskEditor: React.FC<TaskEditorProps> = ({
  task,
  projectId,
  onCancel,
  onSave,
  projectMembers = []
}) => {
  // 状态管理
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  // 获取当前日期作为最早可选日期
  const [minDate] = useState<Date>(new Date());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 使用任务API
  const taskApi = useTaskHook();
  const { data: statusItems, isLoading: isLoadingStatuses } = taskApi.useGetProjectStatusList(projectId);
  const { data: priorityItems, isLoading: isLoadingPriorities } = taskApi.useGetProjectPriorityList(projectId);
  const { mutate: editTask } = taskApi.useEditTask(); // 将Hook移到组件顶层

  // 表单设置
  const { handleSubmit, control, formState: { errors }, register, setValue, watch, reset } = useForm({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || '',
      priority: task?.priority || '',
      // 保留完整的ISO格式日期时间字符串，不要截断时间部分
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString() : '',
      assigneeId: task?.assigneeId || ''
    }
  });

  // 添加API错误监听，当状态或优先级数据加载失败时显示错误
  useEffect(() => {
    if (statusItems === null && !isLoadingStatuses) {
      console.error('获取状态列表失败，返回值为null');
      // 设置一个默认状态数组，避免渲染错误
      setValue('status', "IN_PROGRESS");
    }

    if (priorityItems === null && !isLoadingPriorities) {
      console.error('获取优先级列表失败，返回值为null');
      // 设置一个默认优先级数组，避免渲染错误
      setValue('priority', "HIGH");
    }
  }, [statusItems, priorityItems, isLoadingStatuses, isLoadingPriorities, setValue]);

  // 当任务数据变化时，设置表单值
  useEffect(() => {
    if (!task) return;

    // 尝试找到匹配的状态和优先级
    let statusId = '';
    let priorityId = '';
    let assigneeId = '';

    // 匹配状态
    if (statusItems && statusItems.length > 0) {
      if (task.status && typeof task.status === 'string') {
        // 直接匹配 ID
        const directMatch = statusItems.find(item => item.id === task.status);
        if (directMatch) {
          statusId = directMatch.id;
        } else {
          // 尝试通过名称匹配
          const nameMatch = statusItems.find(item =>
            item.name.includes(task.status) || task.status.includes(item.name)
          );

          if (nameMatch) {
            statusId = nameMatch.id;
          } else {
            // 如果还是没有匹配项，使用第一个选项
            statusId = statusItems[0].id;
          }
        }
      } else {
        statusId = statusItems[0].id;
      }
    }

    // 匹配优先级
    if (priorityItems && priorityItems.length > 0) {
      if (task.priority && typeof task.priority === 'string') {
        // 直接匹配 ID
        const directMatch = priorityItems.find(item => item.id === task.priority);
        if (directMatch) {
          priorityId = directMatch.id;
        } else {
          // 尝试通过名称匹配
          const nameMatch = priorityItems.find(item =>
            item.name.includes(task.priority) || task.priority.includes(item.name)
          );

          if (nameMatch) {
            priorityId = nameMatch.id;
          } else {
            // 如果还是没有匹配项，使用第一个选项
            priorityId = priorityItems[0].id;
          }
        }
      } else {
        priorityId = priorityItems[0].id;
      }
    }

    // 匹配负责人
    if (projectMembers && projectMembers.length > 0 && task.assigneeId) {
      // 1. 先检查任务的assigneeId是否直接匹配成员ID
      const directMatch = projectMembers.find(member => member.id === task.assigneeId);
      if (directMatch) {
        assigneeId = directMatch.id;
      }
      // 2. 如果任务包含负责人名称但ID不匹配，尝试通过名称匹配
      else if (task.assignee) {
        const nameMatch = projectMembers.find(member =>
          member.name === task.assignee ||
          (member.name && task.assignee &&
           (member.name.includes(task.assignee) || task.assignee.includes(member.name)))
        );

        if (nameMatch) {
          assigneeId = nameMatch.id;
        }
      }
    } else {
      // 如果有assigneeId就直接使用，即使在projectMembers不存在
      assigneeId = task.assigneeId || '';
    }

    // 设置表单值 - 使用前面匹配到的正确ID
    setValue('title', task.title || '');
    setValue('description', task.description || '');
    // 使用类型断言强制转换为任意类型，解决类型不匹配问题
    setValue('status', statusId as any);
    setValue('priority', priorityId as any);
    // 保留完整的ISO格式日期时间字符串，不要截断时间部分
    setValue('dueDate', task.dueDate ? new Date(task.dueDate).toISOString() : '');
    setValue('assigneeId', assigneeId);

  }, [task, statusItems, priorityItems, projectMembers, setValue]);

  // 监听表单值变化
  const watchedDueDate = watch('dueDate');
  const watchedStatus = watch('status');
  const watchedPriority = watch('priority');
  const watchedAssigneeId = watch('assigneeId');

  // 提交表单
  const onSubmit = async (data: TaskFormData) => {
    // 检查截止日期是否填写
    if (!data.dueDate) {
      setErrorMessage("截止日期为必填项，请选择截止日期");
      return;
    }

    // 验证截止日期是否早于当前日期
    if (data.dueDate && new Date(data.dueDate) < new Date()) {
      setErrorMessage("截止日期不能早于当前日期");
      return;
    }

    // 验证负责人是否选择
    if (!data.assigneeId) {
      setErrorMessage("负责人为必填项，请选择负责人");
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 构建更新后的任务对象 - 使用更简单的方式
      // 不进行复杂的类型转换，直接使用原始数据
      const updatedTask = {
        ...task,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        assigneeId: data.assigneeId
      };

      // 如果状态项和优先级项不为null，则找到选中的项
      const selectedStatus = statusItems && statusItems.length > 0 ?
        statusItems.find(item => item.id === data.status) : null;

      const selectedPriority = priorityItems && priorityItems.length > 0 ?
        priorityItems.find(item => item.id === data.priority) : null;

      // 根据选中的状态和优先级设置任务属性
      if (selectedStatus) {
        // 使用类型断言解决类型错误
        updatedTask.status = selectedStatus.name as any;
        updatedTask.statusColor = selectedStatus.color;
      }

      if (selectedPriority) {
        // 使用类型断言解决类型错误
        updatedTask.priority = selectedPriority.name as any;
        updatedTask.priorityColor = selectedPriority.color;
      }

      // 确保提交到后端的是完整ISO格式的日期时间
      const formattedDueDate = data.dueDate;

      // 调用API更新任务 - 使用组件顶层已定义的editTask函数
      editTask({
        taskId: task.id,
        title: data.title,
        description: data.description,
        statusId: data.status, // 直接使用表单中的ID
        priorityId: data.priority, // 直接使用表单中的ID
        assigneeId: data.assigneeId,
        dueDate: formattedDueDate // 使用完整的ISO格式日期时间
      }, {
        onSuccess: () => {
          onSave(updatedTask);
        },
        onError: (error: any) => {
          setErrorMessage(error.message || '更新任务失败');
          setIsSubmitting(false);
        }
      });
    } catch (error: any) {
      setErrorMessage(error.message || '更新任务失败');
      setIsSubmitting(false);
    }
  };

  // 获取当前选中的负责人
  const selectedMember = projectMembers.find(member => member.id === watchedAssigneeId);

  // 获取状态样式
  const getStatusStyleClass = (status: string) => {
    const style = getStatusStyle(status);
    return `${style.textColor} ${style.bgColor} ${style.borderColor}`;
  };

  // 获取优先级样式
  const getPriorityStyleClass = (priority: string) => {
    const style = getPriorityStyle(priority);
    return `${style.textColor} ${style.bgColor} ${style.borderColor}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      {/* 错误消息显示 */}
      {(errorMessage || Object.keys(errors).length > 0) && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center">
          <FiAlertTriangle className="mr-2 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* 标题 */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            标题
          </label>
          <input
            id="title"
            type="text"
            {...register('title', { required: '请输入任务标题' })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="输入任务标题"
          />
          {errors.title && (
            <p className="text-red-500 text-xs">{errors.title.message}</p>
          )}
        </div>

        {/* 描述 */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            描述
          </label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            placeholder="输入任务描述"
          />
        </div>

        {/* 状态和优先级 */}
        <div className="space-y-3">
          {/* 状态 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              状态
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-1.5">
                  {!statusItems || statusItems.length === 0 ? (
                    <div className="text-sm text-gray-500">正在加载状态选项...</div>
                  ) : (
                    statusItems.map((status) => (
                      <button
                        key={status.id}
                        type="button"
                        className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium transition-all hover:opacity-90 active:opacity-75 ${field.value === status.id ? 'shadow-md ring-2 ring-white' : 'opacity-80 hover:opacity-100'}`}
                        style={{
                          color: 'white',
                          backgroundColor: status.color,
                          borderColor: status.color,
                          outline: field.value === status.id ? `2px solid ${status.color}` : 'none',
                          outlineOffset: '1px'
                        }}
                        onClick={() => field.onChange(status.id)}
                      >
                        <span className="mr-1 text-white">
                          {status.name === '已完成' || status.name === 'COMPLETED' || status.name === 'DONE' ? '●' : '○'}
                        </span>
                        {status.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            />
          </div>

          {/* 优先级 */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              优先级
            </label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-1.5">
                  {!priorityItems || priorityItems.length === 0 ? (
                    <div className="text-sm text-gray-500">正在加载优先级选项...</div>
                  ) : (
                    priorityItems.map((priority) => (
                      <button
                        key={priority.id}
                        type="button"
                        className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-medium transition-all hover:opacity-90 active:opacity-75 ${field.value === priority.id ? 'shadow-md ring-2 ring-white' : 'opacity-80 hover:opacity-100'}`}
                        style={{
                          color: 'white',
                          backgroundColor: priority.color,
                          borderColor: priority.color,
                          outline: field.value === priority.id ? `2px solid ${priority.color}` : 'none',
                          outlineOffset: '1px'
                        }}
                        onClick={() => field.onChange(priority.id)}
                      >
                        <span className="mr-1 text-white">●</span>
                        {priority.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* 截止日期和负责人 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 截止日期（必填） */}
          <div className="space-y-1">
            <label htmlFor="dueDate" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              截止日期 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Controller
                name="dueDate"
                control={control}
                rules={{
                  required: "截止日期为必填项",
                  validate: value => !!value || "请选择一个有效的截止日期"
                }}
                render={({ field }) => (
                  <div className="relative">
                    <DatePicker
                      selectedDate={field.value ? new Date(field.value) : null}
                      onChange={(date) => {
                        if (date) {
                          // 为了与Java的OffsetDateTime完全兼容
                          // 1. 使用toISOString()生成包含时区偏移的ISO-8601格式
                          // 2. 确保包含年月日、时分秒和时区信息
                          const isoString = date.toISOString();

                          field.onChange(isoString);
                          // 清除错误
                          setErrorMessage(null);
                        } else {
                          field.onChange('');
                        }
                      }}
                      position="top"
                      showTimePicker={true}
                      is24Hour={true}
                      minDate={minDate} // 设置最早可选日期为当前日期
                      className={errors.dueDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                  </div>
                )}
              />

              {/* 显示错误信息 */}
              {errors.dueDate && (
                <div className="absolute mt-1 text-xs text-red-500">
                  {errors.dueDate.message?.toString()}
                </div>
              )}
            </div>
          </div>

          {/* 负责人 */}
          <div className="space-y-1">
            <label htmlFor="assigneeId" className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              负责人
            </label>
            <Controller
              name="assigneeId"
              control={control}
              render={({ field }) => (
                <MemberPicker
                  selectedMember={selectedMember ?
                    {
                      id: selectedMember.id,
                      name: selectedMember.name,
                      avatar: selectedMember.avatar
                    } : null
                  }
                  members={projectMembers.map(member => ({
                    id: member.id,
                    name: member.name,
                    avatar: member.avatar
                  }))}
                  onChange={(memberId) => {
                    field.onChange(memberId);
                  }}
                  position="top"
                />
              )}
            />
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default TaskEditor;
