import React from 'react';
import {TaskDetailTemplate} from '@/ui/templates/TaskDetailTemplate';
import MainLayout from '@/ui/templates/MainLayout';

export default function Page({ params }: { params: { taskId: string } }) {
  const { taskId } = params;

  return (
    <MainLayout title="任务详情">
      <TaskDetailTemplate taskId={taskId} />
    </MainLayout>
  );
}
