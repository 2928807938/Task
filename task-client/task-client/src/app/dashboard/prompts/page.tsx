'use client';

import React from 'react';

import LlmPromptCenter from '@/ui/organisms/LlmPromptCenter';
import MainLayout from '@/ui/templates/MainLayout';

export default function DashboardPromptPage() {
  return (
    <MainLayout title="提示词与冲突看板">
      <LlmPromptCenter
        scope="user"
        title="我的分析提示词与冲突看板"
        description="你可以在这里维护个人分析偏好，并在每次新增、编辑、启停后自动查看与个人规则、所属项目规则之间的冲突。"
      />
    </MainLayout>
  );
}
