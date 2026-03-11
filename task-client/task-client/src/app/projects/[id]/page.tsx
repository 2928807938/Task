"use client";

import React from 'react';
import {useParams} from 'next/navigation';
import ProjectDetailTemplate from '@/ui/templates/ProjectDetailTemplate';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;

  // 直接渲染项目详情模板，使用假数据
  return <ProjectDetailTemplate projectId={projectId} />;
}
