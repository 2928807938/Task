'use client';

import React from 'react';
import MainLayout from '@/ui/templates/MainLayout';
import ProjectListTemplate from '@/ui/templates/ProjectListTemplate';

export default function ProjectsPage() {
  return (
    <MainLayout title="项目列表">
      <ProjectListTemplate />
    </MainLayout>
  );
}
