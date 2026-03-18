'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiArrowDown,
  FiArrowUp,
  FiFilter,
  FiGrid,
  FiList,
  FiSearch,
  FiZap,
  FiX,
} from 'react-icons/fi';

interface ProjectListToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortDirection: 'asc' | 'desc';
  toggleSortDirection: () => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  resultCount: number;
  totalCount: number;
}

const ProjectListToolbar: React.FC<ProjectListToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  sortDirection,
  toggleSortDirection,
  viewMode,
  setViewMode,
  resultCount,
  totalCount,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <section className="surface-card-strong p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-neutral-400)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索项目名称、描述或负责人…"
              className="h-12 w-full rounded-full border border-[color:var(--theme-card-border)] bg-white/80 pl-11 pr-12 text-sm text-[var(--foreground)] shadow-sm outline-none transition focus:border-[var(--theme-primary-300)] focus:ring-4 focus:ring-[rgba(99,102,241,0.12)] dark:bg-[rgba(15,23,42,0.75)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--theme-neutral-400)] transition hover:bg-black/5 hover:text-[var(--foreground)] dark:hover:bg-white/10"
                aria-label="清空搜索"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/50 bg-white/70 px-3 py-2 text-sm text-[var(--theme-neutral-600)] shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-[var(--theme-neutral-300)]">
            <FiZap className="h-4 w-4 text-[var(--theme-primary-500)]" />
            <span>
              当前显示 <strong className="font-semibold text-[var(--foreground)]">{resultCount}</strong> / {totalCount} 个项目
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="app-segmented">
            <button
              onClick={() => setViewMode('grid')}
              className={`app-segmented-item ${viewMode === 'grid' ? 'app-segmented-item-active' : ''}`}
            >
              <span className="flex items-center gap-2">
                <FiGrid className="h-4 w-4" />
                网格
              </span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`app-segmented-item ${viewMode === 'list' ? 'app-segmented-item-active' : ''}`}
            >
              <span className="flex items-center gap-2">
                <FiList className="h-4 w-4" />
                列表
              </span>
            </button>
          </div>

          <button
            onClick={toggleSortDirection}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[color:var(--theme-card-border)] bg-white/75 px-4 text-sm font-medium text-[var(--foreground)] shadow-sm transition hover:-translate-y-0.5 dark:bg-white/5"
          >
            {sortDirection === 'asc' ? <FiArrowUp className="h-4 w-4" /> : <FiArrowDown className="h-4 w-4" />}
            {sortDirection === 'asc' ? '最早创建' : '最新创建'}
          </button>

          <button
            onClick={() => setShowFilters((value) => !value)}
            className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium shadow-sm transition ${showFilters
              ? 'border-[rgba(99,102,241,0.28)] bg-[rgba(99,102,241,0.14)] text-[var(--theme-primary-700)] dark:text-[var(--theme-primary-200)]'
              : 'border-[color:var(--theme-card-border)] bg-white/75 text-[var(--foreground)] dark:bg-white/5'
            }`}
          >
            <FiFilter className="h-4 w-4" />
            快速筛选
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.24 }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 rounded-3xl border border-white/50 bg-white/70 p-4 text-sm text-[var(--theme-neutral-600)] shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-[var(--theme-neutral-300)] lg:grid-cols-[1.2fr_1fr]">
              <div>
                <div className="font-semibold text-[var(--foreground)]">筛选能力正在升级</div>
                <p className="mt-1 leading-6">
                  这一版先把搜索、排序和视图切换做好，后续可以继续补充状态、成员、时间范围等筛选项。
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/50 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--theme-neutral-400)]">推荐</div>
                  <div className="mt-2 font-medium text-[var(--foreground)]">优先做项目状态筛选</div>
                </div>
                <div className="rounded-2xl border border-white/50 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--theme-neutral-400)]">下一步</div>
                  <div className="mt-2 font-medium text-[var(--foreground)]">支持负责人和团队筛选</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProjectListToolbar;
