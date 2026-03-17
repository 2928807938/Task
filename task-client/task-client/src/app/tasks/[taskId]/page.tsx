import React from 'react';
import {TaskDetailTemplate} from '@/ui/templates/TaskDetailTemplate';
import MainLayout from '@/ui/templates/MainLayout';

type TaskDetailPageProps = {
  params: Promise<{
    taskId: string;
  }>;
};

export default async function Page({ params }: TaskDetailPageProps) {
  const { taskId } = await params;

  return (
    <MainLayout title="任务详情">
      <TaskDetailTemplate taskId={taskId} />
    </MainLayout>
  );
}
