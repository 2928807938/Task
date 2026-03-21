'use client';

import React from 'react';

import LlmPromptCenter from '@/ui/organisms/LlmPromptCenter';
import MainLayout from '@/ui/templates/MainLayout';

export default function DashboardPromptPage() {
  return (
    <MainLayout title="我的分析提示词">
      <LlmPromptCenter scope="user" />
    </MainLayout>
  );
}
