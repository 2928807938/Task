import React from 'react';
import {ProjectTask} from '@/types/api-types';
import TaskDetailModalComponent from '@/ui/organisms/TaskDetail/TaskDetailModal';

// 定义接口，确保类型一致性
interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string; // 新增：任务ID属性
  projectId?: string;
  onTaskUpdated?: (updatedTask: ProjectTask) => void;
  projectMembers?: Array<{ id: string; name: string; avatar?: string }>;
}

/**
 * 任务详情模态框
 * 此文件为重定向，实际组件实现在TaskDetail目录中
 */
const TaskDetailModal: React.FC<TaskDetailModalProps> = (props) => {
  return <TaskDetailModalComponent {...props} />;
};

export default TaskDetailModal;
