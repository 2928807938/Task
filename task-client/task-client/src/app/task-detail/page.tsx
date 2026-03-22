"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MainLayout from '@/ui/templates/MainLayout';
import { TaskDetailTemplate } from '@/ui/templates/TaskDetailTemplate';

function TaskDetailPageContent() {
  const searchParams = useSearchParams();
  const taskId = searchParams?.get('id') || '';

  if (!taskId) {
    return (
      <MainLayout title="任务详情">
        <div className="flex min-h-[40vh] items-center justify-center px-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          未找到任务 ID，请从任务列表重新进入。
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="任务详情">
      <TaskDetailTemplate taskId={taskId} />
    </MainLayout>
  );
}

export default function TaskDetailPage() {
  return (
    <Suspense fallback={null}>
      <TaskDetailPageContent />
    </Suspense>
  );
}
