'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiChevronRight, FiClock, FiMoreHorizontal, FiUser } from 'react-icons/fi';

import { ProjectListItem as ProjectListItemType } from '@/types/api-types';
import { getBgColorClass, getInitials } from '@/utils/avatar-utils';

import ProjectCardMenu from './ProjectCardMenu';
import { formatProjectDate, getProgressTone, getProjectDuration, getProjectProgress } from './project-list-utils';

interface ProjectListItemProps {
  project: ProjectListItemType & { archived?: boolean };
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project }) => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const progress = getProjectProgress(project);
  const duration = getProjectDuration(project.createdAt);
  const progressTone = getProgressTone(progress);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleNavigate = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onClick={handleNavigate}
      className="surface-card group cursor-pointer overflow-visible p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-sm ${getBgColorClass(project.id)}`}>
            {getInitials(project.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-[var(--foreground)] sm:text-lg">{project.name}</h3>
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium"
                style={{
                  color: project.archived ? 'var(--theme-warning-700)' : 'var(--theme-success-700)',
                  backgroundColor: project.archived ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  borderColor: project.archived ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.18)',
                }}
              >
                {project.archived ? '已归档' : '活跃'}
              </span>
            </div>

            <p className="mt-1 line-clamp-1 text-sm text-[var(--theme-neutral-500)]">
              {project.description?.trim() || '暂无项目描述'}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--theme-neutral-500)] sm:text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.03] px-3 py-1.5 dark:bg-white/[0.05]">
                <FiUser className="h-3.5 w-3.5" />
                {project.ownerName || '未分配负责人'}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.03] px-3 py-1.5 dark:bg-white/[0.05]">
                <FiCalendar className="h-3.5 w-3.5" />
                {formatProjectDate(project.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.03] px-3 py-1.5 dark:bg-white/[0.05]">
                <FiClock className="h-3.5 w-3.5" />
                {duration} 天周期
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:min-w-[340px] lg:justify-end">
          <div className="min-w-[170px] flex-1 rounded-2xl border border-white/60 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <div className="mb-2 flex items-center justify-between text-xs text-[var(--theme-neutral-500)]">
              <span>项目进度</span>
              <span
                className="rounded-full border px-2 py-1 font-semibold"
                style={{
                  color: progressTone.text,
                  background: progressTone.pillBackground,
                  borderColor: progressTone.pillBorder,
                }}
              >
                {progress}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--theme-neutral-200)]/80 dark:bg-[var(--theme-neutral-700)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: progressTone.bar }}
              />
            </div>
          </div>

          <div className="hidden text-right text-sm text-[var(--theme-neutral-500)] xl:block">
            <div className="font-semibold text-[var(--foreground)]">{project.memberCount || 0} 人</div>
            <div>团队成员</div>
          </div>

          <div ref={menuRef} className="relative shrink-0" onClick={(event) => event.stopPropagation()}>
            <button
              onClick={() => setMenuOpen((value) => !value)}
              className="project-menu-button flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--theme-card-border)] bg-white/75 text-[var(--theme-neutral-500)] shadow-sm transition hover:text-[var(--foreground)] dark:bg-white/5"
              aria-label="项目菜单"
            >
              <FiMoreHorizontal className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <div className="project-menu absolute right-0 top-full mt-2">
                  <ProjectCardMenu project={{ ...project, archived: !!project.archived }} onClose={() => setMenuOpen(false)} />
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden items-center text-[var(--theme-neutral-400)] transition group-hover:text-[var(--theme-primary-500)] sm:flex">
            <FiChevronRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ProjectListItem;
