'use client';

import React from 'react';
import { FiArrowRight, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface ProjectHeaderStat {
  label: string;
  value: string;
  hint: string;
}

interface ProjectListHeaderProps {
  onCreateProject: () => void;
  stats: ProjectHeaderStat[];
}

const ProjectListHeader: React.FC<ProjectListHeaderProps> = ({ onCreateProject, stats }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="dashboard-surface p-6 sm:p-8"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-medium text-[var(--theme-primary-700)] shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-[var(--theme-primary-200)]">
            Project Workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            项目空间
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--theme-neutral-500)] sm:text-base">
            重新梳理后的项目页更强调概览、筛选和重点项目，单个项目也能自然占满布局，不再显得零碎空洞。
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="hidden rounded-2xl border border-white/50 bg-white/65 px-4 py-3 text-sm text-[var(--theme-neutral-600)] shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-[var(--theme-neutral-300)] md:block">
            优先查看高活跃项目，快速进入详情继续推进。
          </div>
          <button
            onClick={onCreateProject}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--theme-primary-500),var(--theme-info-500))] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(99,102,241,0.28)] transition-transform duration-200 hover:-translate-y-0.5"
          >
            <FiPlus className="h-4 w-4" />
            <span>新建项目</span>
            <FiArrowRight className="h-4 w-4 opacity-80" />
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="surface-card px-5 py-4"
          >
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--theme-neutral-400)]">
              {stat.label}
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
              {stat.value}
            </div>
            <div className="mt-2 text-sm text-[var(--theme-neutral-500)]">{stat.hint}</div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default ProjectListHeader;
