'use client';

import React from 'react';
import MainLayout from '@/ui/templates/MainLayout';
import TaskManagementTemplate from '@/ui/templates/TaskManagementTemplate';
import {Task, TaskPriority, TaskStatus} from '@/core/domain/entities/task';
import useTaskHook from '@/hooks/use-task-hook';
import LoadingSpinner from '@/ui/molecules/LoadingSpinner';
import {ProjectTask} from '@/types/api-types';

export default function TasksPage() {
  const taskApi = useTaskHook();

  // 使用useTaskApi模块提供的钩子获取任务数据
  const { useGetProjectTasks } = useTaskHook();

  // 这里假设使用默认项目，实际应用中应从上下文或URL参数中获取项目ID
  const projectId = '1'; // 默认项目ID，实际应用中需要替换为实际ID

  // 使用React Query获取任务数据
  const { data: tasksResponse, isLoading, isError } = useGetProjectTasks(projectId);

  // 将ProjectTask类型转换为Task类型
  const tasks = (tasksResponse?.content || []).map((projectTask: ProjectTask): Task => ({
    id: projectTask.id,
    title: projectTask.title,
    description: projectTask.description || '',
    status: convertStatus(projectTask.status),
    priority: convertPriority(projectTask.priority),
    assignee: {
      id: projectTask.assigneeId || '',
      name: projectTask.assignee || ''
    },
    createdAt: projectTask.createdAt ? new Date(projectTask.createdAt) : new Date(),
    dueDate: projectTask.dueDate ? new Date(projectTask.dueDate) : undefined,
    progress: projectTask.progress || 0
  }));

  // 状态转换函数
  function convertStatus(status: string): TaskStatus {
    switch(status) {
      case 'IN_PROGRESS': return TaskStatus.IN_PROGRESS;
      case 'COMPLETED': return TaskStatus.COMPLETED;
      case 'WAITING': return TaskStatus.WAITING;
      case 'OVERDUE': return TaskStatus.OVERDUE;
      default: return TaskStatus.WAITING;
    }
  }

  // 优先级转换函数
  function convertPriority(priority: string): TaskPriority {
    switch(priority) {
      case 'HIGH': return TaskPriority.HIGH;
      case 'MEDIUM': return TaskPriority.MEDIUM;
      case 'LOW': return TaskPriority.LOW;
      default: return TaskPriority.MEDIUM;
    }
  }

  // 处理添加任务
  const handleAddTask = () => {
    // 实际应用中这里会打开任务创建表单或对话框
  };

  // 处理编辑任务
  const handleEditTask = (taskId: string) => {
    // 实际应用中这里会打开任务编辑表单或对话框
  };

  if (isLoading) {
    return (
      <MainLayout title="任务管理">
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout title="任务管理">
        <div className="flex justify-center items-center h-96">
          <p className="text-red-500">加载任务数据时出错，请稍后重试</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="任务管理">
      <TaskManagementTemplate
        initialTasks={tasks || []}
        onAddTask={handleAddTask}
        onEditTask={handleEditTask}
      />
    </MainLayout>
  );
}
