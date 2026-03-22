'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiChevronRight, FiClock, FiMoreHorizontal, FiUsers } from 'react-icons/fi';

import { ProjectListItem } from '@/types/api-types';
import { getBgColorClass, getInitials } from '@/utils/avatar-utils';

import ProjectCardMenu from './ProjectCardMenu';
import { getProgressTone, getProjectDuration, getProjectProgress } from './project-list-utils';

interface ProjectCardProps {
  project: ProjectListItem & { archived?: boolean };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const progress = getProjectProgress(project);
  const duration = getProjectDuration(project.createdAt);
  const progressTone = getProgressTone(progress);
  const description = project.description?.trim() || '暂无项目描述';

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

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.24 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/project-detail?id=${project.id}`)}
      className="surface-card group relative grid h-full grid-rows-[auto_auto_auto_1fr] overflow-hidden p-4"
      style={{
        boxShadow: isHovered ? '0 16px 36px rgba(15, 23, 42, 0.12)' : undefined,
      }}
    >
      <div
        className="absolute inset-x-4 top-0 h-14 rounded-b-[20px] opacity-90 blur-2xl"
        style={{
          background: project.archived
            ? 'linear-gradient(135deg, rgba(245,158,11,0.16), rgba(245,158,11,0.02))'
            : 'linear-gradient(135deg, rgba(99,102,241,0.16), rgba(59,130,246,0.04))',
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-md ${getBgColorClass(project.id)}`}>
            {getInitials(project.name)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-[var(--foreground)]">
                {project.name}
              </h3>
              <span
                className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  color: project.archived ? 'var(--theme-warning-700)' : 'var(--theme-success-700)',
                  backgroundColor: project.archived ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  borderColor: project.archived ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.18)',
                }}
              >
                {project.archived ? '已归档' : '进行中'}
              </span>
            </div>
            <p className="mt-1 line-clamp-1 text-xs text-[var(--theme-neutral-500)]">
              负责人：{project.ownerName || '未分配负责人'}
            </p>
          </div>
        </div>

        <div ref={menuRef} className="relative z-10 shrink-0" onClick={(event) => event.stopPropagation()}>
          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="project-menu-button flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--theme-card-border)] bg-white/75 text-[var(--theme-neutral-500)] shadow-sm transition hover:text-[var(--foreground)] dark:bg-white/5"
            aria-label="打开项目操作菜单"
          >
            <FiMoreHorizontal className="h-4 w-4" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <div className="project-menu absolute right-0 top-10 z-20">
                <ProjectCardMenu project={{ ...project, archived: !!project.archived }} onClose={() => setMenuOpen(false)} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="relative mt-3 line-clamp-2 text-sm leading-5 text-[var(--theme-neutral-600)] dark:text-[var(--theme-neutral-300)]">
        {description}
      </p>

      <div className="relative mt-4 rounded-3xl border border-white/60 bg-white/65 p-3 backdrop-blur dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--theme-neutral-400)]">进度</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">{progress}%</div>
          </div>
          <div
            className="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
            style={{
              color: progressTone.text,
              background: progressTone.pillBackground,
              borderColor: progressTone.pillBorder,
            }}
          >
            {progressTone.label}
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--theme-neutral-200)]/80 dark:bg-[var(--theme-neutral-700)]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.75, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: progressTone.bar }}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 self-end">
        <div className="rounded-2xl bg-black/[0.02] p-2.5 text-xs dark:bg-white/[0.03]">
          <div className="flex items-center gap-1.5 text-[var(--theme-neutral-400)]">
            <FiUsers className="h-3.5 w-3.5" />
            成员
          </div>
          <div className="mt-1 font-semibold text-[var(--foreground)]">{project.memberCount || 0} 人</div>
        </div>

        <div className="rounded-2xl bg-black/[0.02] p-2.5 text-xs dark:bg-white/[0.03]">
          <div className="flex items-center gap-1.5 text-[var(--theme-neutral-400)]">
            <FiClock className="h-3.5 w-3.5" />
            周期
          </div>
          <div className="mt-1 font-semibold text-[var(--foreground)]">{duration} 天</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3 text-[11px]" style={{ borderColor: 'var(--theme-card-border)' }}>
        <span className="line-clamp-1 text-[var(--theme-neutral-500)]">
          {project.ownerName || '未分配负责人'}
        </span>
        <button
          onClick={(event) => {
            event.stopPropagation();
            router.push(`/project-detail?id=${project.id}`);
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[rgba(99,102,241,0.12)] px-3 py-1.5 text-xs font-semibold text-[var(--theme-primary-700)] transition hover:bg-[rgba(99,102,241,0.18)] dark:text-[var(--theme-primary-200)]"
        >
          详情
          <FiChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.article>
  );
};

export default ProjectCard;
