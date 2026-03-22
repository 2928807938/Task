"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MainLayout from '@/ui/templates/MainLayout';
import ProjectDetailTemplate from '@/ui/templates/ProjectDetailTemplate';

function ProjectDetailPageContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('id') || '';

  if (!projectId) {
    return (
      <MainLayout title="项目详情">
        <div className="flex min-h-[40vh] items-center justify-center px-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          未找到项目 ID，请从项目列表重新进入。
        </div>
      </MainLayout>
    );
  }

  return <ProjectDetailTemplate projectId={projectId} />;
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={null}>
      <ProjectDetailPageContent />
    </Suspense>
  );
}
