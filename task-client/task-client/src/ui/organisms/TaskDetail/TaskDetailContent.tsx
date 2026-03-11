import React, {useState} from 'react';
import {motion} from 'framer-motion';
import {FiHash, FiLink, FiUser, FiEdit2, FiCheck, FiX} from 'react-icons/fi';
import {ProjectTask} from '@/types/api-types';
import {PriorityBadge, StatusBadge, TaskAssignee, TaskDateInfo, TaskInfoCard, TaskTypeBadge} from './TaskInfoCard';
import ProgressBar from '@/ui/atoms/ProgressBar';

interface TaskDetailContentProps {
  task: ProjectTask;
  completedTaskCount?: number;
  totalTaskCount?: number;
  overallProgress?: number;
  onTaskUpdate?: (updatedTask: Partial<ProjectTask>) => void;
  projectMembers?: Array<{ id: string; name: string; avatar?: string }>;
}

/**
 * 任务详情内容组件，遵循苹果设计规范
 */
const TaskDetailContent: React.FC<TaskDetailContentProps> = ({
  task,
  completedTaskCount = 0,
  totalTaskCount = 0,
  overallProgress = 0,
  onTaskUpdate,
  projectMembers = []
}) => {
  // 编辑状态管理
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // 判断任务是否已经完成
  const isTaskCompleted = task.status === 'COMPLETED';

  // 判断任务是否已逾期（未完成且截止日期已过）
  const isTaskOverdue: boolean = (
    !isTaskCompleted &&
    task.dueDate &&
    new Date(task.dueDate) < new Date()
  ) ? true : false;

  // 开始编辑
  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditingValue(currentValue);
  };

  // 保存编辑
  const saveEdit = () => {
    if (editingField && onTaskUpdate) {
      onTaskUpdate({
        [editingField]: editingValue
      });
    }
    setEditingField(null);
    setEditingValue('');
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingField(null);
    setEditingValue('');
  };

  // 编辑模式组件
  const EditableField: React.FC<{
    field: string;
    value: string;
    multiline?: boolean;
    placeholder?: string;
  }> = ({ field, value, multiline = false, placeholder = '' }) => {
    const isEditing = editingField === field;
    
    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          {multiline ? (
            <textarea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
              rows={3}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              autoFocus
            />
          )}
          <button
            onClick={saveEdit}
            className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
          >
            <FiCheck size={16} />
          </button>
          <button
            onClick={cancelEdit}
            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>
      );
    }

    return (
      <div className="group flex items-start justify-between">
        <div className="flex-1">
          {multiline ? (
            <div className="bg-gray-50 dark:bg-gray-800/30 p-2 text-sm rounded-lg text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {value || '无描述'}
            </div>
          ) : (
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {value || placeholder}
            </span>
          )}
        </div>
        {onTaskUpdate && (
          <button
            onClick={() => startEditing(field, value)}
            className="ml-2 p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
          >
            <FiEdit2 size={14} />
          </button>
        )}
      </div>
    );
  };

  return (
    <motion.div
      className="p-4 space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 任务标题 */}
      <TaskInfoCard label="标题">
        <EditableField
          field="title"
          value={task.title}
          placeholder="输入任务标题"
        />
      </TaskInfoCard>

      {/* 任务描述 */}
      <TaskInfoCard label="描述">
        <EditableField
          field="description"
          value={task.description || ''}
          multiline={true}
          placeholder="输入任务描述"
        />
      </TaskInfoCard>

      {/* 任务类型和优先级 */}
      <div className="grid grid-cols-2 gap-2">
        <TaskInfoCard label="任务类型" icon={<FiHash size={14} />} delay={0.05}>
          <TaskTypeBadge isMainTask={!task.parentTaskId} />
        </TaskInfoCard>

        <TaskInfoCard label="优先级" icon={<FiLink size={14} />} delay={0.1}>
          <PriorityBadge priority={task.priority} color={task.priorityColor} />
        </TaskInfoCard>
      </div>

      {/* 仅对子任务显示状态 */}
      {task.parentTaskId && (
        <TaskInfoCard label="状态" delay={0.15}>
          <StatusBadge status={task.status} />
        </TaskInfoCard>
      )}

      {/* 负责人 */}
      <TaskInfoCard label="负责人" icon={<FiUser size={14} />} delay={0.2}>
        <TaskAssignee assignee={task.assignee} />
      </TaskInfoCard>

      {/* 日期信息 */}
      <TaskInfoCard label="日期" delay={0.25}>
        <TaskDateInfo
          createdAt={task.createdAt}
          startTime={task.startTime}
          dueDate={task.dueDate}
          isOverdue={isTaskOverdue}
        />
      </TaskInfoCard>

      {/* 进度信息 */}
      {totalTaskCount > 0 && (
        <TaskInfoCard label="进度" delay={0.3}>
          <div className="space-y-2">
            <ProgressBar percentage={overallProgress} showLabel={true} showGradient={true} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              完成 {completedTaskCount}/{totalTaskCount} 个任务
            </p>
          </div>
        </TaskInfoCard>
      )}
    </motion.div>
  );
};

export default TaskDetailContent;
