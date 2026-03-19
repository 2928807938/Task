"use client";

import {Suspense} from 'react';
import ProjectDetailTemplate from '@/ui/templates/ProjectDetailTemplate';

function ProjectDetailPageContent() {
  const projectId = "default-project-id";

  return <ProjectDetailTemplate projectId={projectId} />;
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={null}>
      <ProjectDetailPageContent />
    </Suspense>
  );
}
