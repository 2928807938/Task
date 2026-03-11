"use client";

import React from 'react';
import MainLayout from '@/ui/templates/MainLayout';
import TeamManagementTemplate from '@/ui/templates/TeamManagementTemplate';

export default function TeamManagementPage() {
  return (
    <MainLayout title="团队管理">
      <TeamManagementTemplate />
    </MainLayout>
  );
}
