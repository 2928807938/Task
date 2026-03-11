"use client";

import React, { Suspense } from 'react';
import AiAnalysisTemplate from "@/ui/templates/AiAnalysisTemplate";
import MainLayout from "@/ui/templates/MainLayout";
import {useSearchParams} from 'next/navigation';

// 创建包含 useSearchParams 的子组件
function AiAnalysisContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams?.get('projectId');

  return (
    <MainLayout title="需求分析">
      <AiAnalysisTemplate projectId={projectId || undefined} />
    </MainLayout>
  );
}

export default function AiAnalysisPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">加载中...</div>}>
      <AiAnalysisContent />
    </Suspense>
  );
}
