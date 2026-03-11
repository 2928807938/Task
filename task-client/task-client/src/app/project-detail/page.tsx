"use client";

import ProjectDetailTemplate from '@/ui/templates/ProjectDetailTemplate';

export default function ProjectDetailPage() {
  // 从URL或状态管理中获取projectId
  // 在实际应用中，这应该从路由参数或全局状态中获取
  const projectId = "default-project-id";
  
  return <ProjectDetailTemplate projectId={projectId} />;
}
