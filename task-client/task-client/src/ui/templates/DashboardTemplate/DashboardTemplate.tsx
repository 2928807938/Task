'use client';

import React from 'react';
import {motion} from 'framer-motion';

interface DashboardTemplateProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardTemplate({
  title,
  children
}: DashboardTemplateProps) {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--background)' }}>
      {/* 头部标题栏 -  */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="py-4 px-6 mb-6 flex items-center justify-between"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderBottom: '1px solid var(--theme-card-border)',
          boxShadow: 'var(--theme-shadow-md)'
        }}
      >
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h1>
      </motion.header>

      {/* 主内容区域 - 增加内边距，提供更多呼吸空间 */}
      <div className="px-6 py-4">
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
