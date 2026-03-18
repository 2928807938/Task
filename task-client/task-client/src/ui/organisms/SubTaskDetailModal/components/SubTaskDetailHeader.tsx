'use client';

import React from 'react';
import {motion} from 'framer-motion';
import {FiCalendar, FiClock, FiFlag, FiUser} from 'react-icons/fi';
import {ProjectTask} from '@/types/api-types';
import {useTheme} from '@/ui/theme';
import {Avatar} from '@/ui/atoms/Avatar';
import TaskStatusBadge from '@/ui/atoms/TaskStatusBadge';
import TaskPriorityBadge from '@/ui/atoms/TaskPriorityBadge';
import TaskDueDateBadge from '@/ui/atoms/DueDateBadge';

interface SubTaskDetailHeaderProps {
  task: ProjectTask;
  isSubTask: boolean;
  isSubTaskFocused?: boolean;
}

const SubTaskDetailHeader: React.FC<SubTaskDetailHeaderProps> = ({
  task,
  isSubTask,
  isSubTaskFocused = false
}) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="relative overflow-hidden rounded-[28px] border border-card-border/70 bg-gradient-to-br from-white via-white to-primary-50/80 p-5 shadow-sm dark:border-slate-800/80 dark:from-slate-950 dark:via-slate-950 dark:to-primary-950/20 sm:p-6"
    >
      <div className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-primary-200/30 blur-3xl dark:bg-primary-500/20" />
      <div className="absolute left-0 top-10 h-24 w-24 rounded-full bg-sky-200/20 blur-3xl dark:bg-sky-500/10" />

      <div className="relative space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {isSubTaskFocused && isSubTask ? (
              <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                子任务
              </span>
            ) : null}
            <TaskStatusBadge status={task.status} statusColor={task.statusColor} />
            <TaskPriorityBadge priority={task.priority} priorityColor={task.priorityColor} />
            {task.dueDate ? <TaskDueDateBadge dueDate={task.dueDate} /> : null}
          </div>

          <div className={`text-xs font-medium ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
            创建 {new Date(task.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        <div>
          <h1 className={`text-2xl font-semibold leading-tight tracking-tight sm:text-[2rem] ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            {task.title}
          </h1>
          {task.description ? (
            <p className={`mt-3 line-clamp-3 text-sm leading-7 ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
              {task.description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] border border-white/70 bg-white/70 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              <FiUser className="text-primary-500" /> 负责人
            </div>
            <div className="flex items-center gap-3">
              <Avatar name={task.assignee || '未分配'} src={task.assigneeAvatar} size="sm" />
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                {task.assignee || '未分配'}
              </span>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/70 bg-white/70 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              <FiClock className="text-emerald-500" /> 开始
            </div>
            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              {task.startTime ? new Date(task.startTime).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '未设置'}
            </span>
          </div>

          <div className="rounded-[22px] border border-white/70 bg-white/70 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              <FiCalendar className="text-orange-500" /> 截止
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '未设置'}
              </span>
              <FiFlag className="text-rose-500" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SubTaskDetailHeader;
