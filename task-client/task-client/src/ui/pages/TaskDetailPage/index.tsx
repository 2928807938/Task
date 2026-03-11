'use client';

import React from 'react';
import {TaskDetailTemplate} from '@/ui/templates/TaskDetailTemplate';
import MainLayout from '@/ui/templates/MainLayout';

interface TaskDetailPageProps {
  params: {
    taskId: string;
  };
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = params;

  return (
    <MainLayout title="任务详情">
      <TaskDetailTemplate taskId={taskId} />
    </MainLayout>
  );
}
