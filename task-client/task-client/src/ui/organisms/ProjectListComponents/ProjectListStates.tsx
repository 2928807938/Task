'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiLoader, FiPlus, FiRefreshCw } from 'react-icons/fi';

interface LoadingStateProps {
  message?: string;
  viewMode?: 'grid' | 'list';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = '正在加载项目...', viewMode = 'grid' }) => {
  const count = viewMode === 'grid' ? 6 : 4;

  return (
    <div className="space-y-6">
      <div className="surface-card-strong p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="h-12 w-full max-w-xl animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
          <div className="flex gap-3">
            <div className="h-11 w-28 animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
            <div className="h-11 w-36 animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-5">
          {Array.from({ length: count }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="surface-card p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
                  <div className="space-y-2">
                    <div className="h-5 w-36 animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
                    <div className="h-4 w-24 animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
                  </div>
                </div>
                <div className="h-10 w-10 animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
              </div>

              <div className="mt-6 space-y-3">
                <div className="h-4 w-full animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
                <div className="h-4 w-4/5 animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
              </div>

              <div className="mt-6 rounded-3xl border border-white/50 bg-white/50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="h-10 w-20 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
                  <div className="h-8 w-20 animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
                </div>
                <div className="h-2.5 w-full animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="h-16 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
                  <div className="h-16 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="surface-card p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
                  <div className="space-y-2">
                    <div className="h-5 w-40 animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
                    <div className="h-4 w-72 animate-pulse rounded-full bg-black/5 dark:bg-white/10" />
                  </div>
                </div>
                <div className="h-14 w-full max-w-xs animate-pulse rounded-2xl bg-black/5 dark:bg-white/10" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-sm text-[var(--theme-neutral-500)]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <FiLoader className="h-4 w-4 text-[var(--theme-primary-500)]" />
        </motion.div>
        {message}
      </div>
    </div>
  );
};

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message = '加载数据时发生错误', onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card-strong flex flex-col items-center px-6 py-14 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(239,68,68,0.12)] text-[var(--theme-error-500)]">
        <FiAlertTriangle className="h-9 w-9" />
      </div>
      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-[var(--foreground)]">项目列表加载失败</h3>
      <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--theme-neutral-500)]">{message}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--theme-primary-500),var(--theme-info-500))] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(59,130,246,0.24)]"
        >
          <FiRefreshCw className="h-4 w-4" />
          重新加载
        </button>
      )}
    </motion.div>
  );
};

interface EmptyStateProps {
  onClearFilters: () => void;
  onCreateProject: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onClearFilters, onCreateProject }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card-strong px-6 py-14 text-center"
    >
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[rgba(99,102,241,0.12)] text-[var(--theme-primary-500)] shadow-sm">
        <FiPlus className="h-10 w-10" />
      </div>

      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-[var(--foreground)]">这里还没有合适的项目卡片</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--theme-neutral-500)]">
        可以先清空当前搜索条件，或者直接创建一个新项目。新的布局会自动适应项目数量，不会再出现单卡片缩在角落的问题。
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--theme-card-border)] bg-white/75 px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm dark:bg-white/5"
        >
          清空筛选
        </button>
        <button
          onClick={onCreateProject}
          className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--theme-primary-500),var(--theme-info-500))] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(59,130,246,0.24)]"
        >
          <FiPlus className="h-4 w-4" />
          新建项目
        </button>
      </div>
    </motion.div>
  );
};
