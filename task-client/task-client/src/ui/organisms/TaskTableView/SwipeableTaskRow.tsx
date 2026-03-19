import React from 'react';
import {ProjectTask} from '@/types/api-types';
import SwipeableTaskItem from '@/ui/molecules/SwipeableTaskItem';
import {FiCheck, FiTrash2} from 'react-icons/fi';
import {Avatar} from '@/ui/atoms/Avatar';

interface SwipeableTaskRowProps {
  task: ProjectTask;
  tasks: ProjectTask[];
  onTaskClick?: (task: ProjectTask) => void;
  onTaskComplete?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
}

const priorityLabelMap: Record<ProjectTask['priority'], string> = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低'
};

const statusMetaMap: Record<ProjectTask['status'], { label: string; chipClass: string }> = {
  IN_PROGRESS: {
    label: '进行中',
    chipClass: 'border-blue-200/80 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300'
  },
  COMPLETED: {
    label: '已完成',
    chipClass: 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
  },
  OVERDUE: {
    label: '已逾期',
    chipClass: 'border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300'
  },
  WAITING: {
    label: '待处理',
    chipClass: 'border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'
  }
};

const lineClampStyle: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden'
};

const formatDateParts = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    date: date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-'),
    time: date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  };
};

const getDueMeta = (task: ProjectTask) => {
  const formatted = formatDateParts(task.dueDate);
  if (!formatted) {
    return null;
  }

  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (task.status === 'COMPLETED') {
    return {
      ...formatted,
      textClass: 'text-slate-500 dark:text-slate-400',
      chipClass: 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
      label: '已完成'
    };
  }

  if (diffDays < 0) {
    return {
      ...formatted,
      textClass: 'text-rose-600 dark:text-rose-300',
      chipClass: 'border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300',
      label: '已逾期'
    };
  }

  if (diffDays === 0) {
    return {
      ...formatted,
      textClass: 'text-amber-600 dark:text-amber-300',
      chipClass: 'border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
      label: '今天到期'
    };
  }

  if (diffDays <= 2) {
    return {
      ...formatted,
      textClass: 'text-yellow-600 dark:text-yellow-300',
      chipClass: 'border-yellow-200/80 bg-yellow-50 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-300',
      label: `${diffDays} 天后到期`
    };
  }

  return {
    ...formatted,
    textClass: 'text-slate-700 dark:text-slate-300',
    chipClass: 'border-slate-200/80 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300',
    label: '正常'
  };
};

const SwipeableTaskRow: React.FC<SwipeableTaskRowProps> = ({
  task,
  tasks,
  onTaskClick,
  onTaskComplete,
  onTaskDelete
}) => {
  const handleCompleteTask = () => {
    if (onTaskComplete && task.status !== 'COMPLETED') {
      onTaskComplete(task.id);
    }
  };

  const handleDeleteTask = () => {
    if (onTaskDelete) {
      onTaskDelete(task.id);
    }
  };

  const statusMeta = statusMetaMap[task.status] ?? statusMetaMap.WAITING;
  const priorityLabel = priorityLabelMap[task.priority] || task.priority || '无';
  const startInfo = formatDateParts(task.startTime);
  const dueInfo = getDueMeta(task);
  const progress = Math.max(0, Math.min(task.progress || 0, 100));
  const parentTaskId = task.parentTaskId || task.parentId;
  const parentTaskTitle = parentTaskId ? tasks.find(item => item.id === parentTaskId)?.title : null;
  const rowSurface = task.status === 'COMPLETED'
    ? 'bg-emerald-50/60 dark:bg-emerald-500/[0.08]'
    : 'bg-white/95 dark:bg-slate-950/40';
  const rowHoverSurface = task.status === 'COMPLETED'
    ? 'group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/[0.12]'
    : 'group-hover:bg-slate-50 dark:group-hover:bg-white/[0.05]';
  const cellBaseClass = `${rowSurface} ${rowHoverSurface} border-y border-slate-200/80 px-4 py-4 align-middle transition-all duration-200 dark:border-white/10`;
  const swipeSurfaceClass = `${rowSurface} ${rowHoverSurface} rounded-[18px] shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)]`;

  return (
    <tr className="group">
      <td className={`${cellBaseClass} w-[38%] rounded-l-[20px] border-l`}>
        <SwipeableTaskItem
          onSwipeRight={handleCompleteTask}
          onSwipeLeft={handleDeleteTask}
          isCompleted={task.status === 'COMPLETED'}
          rightActionText={task.status === 'COMPLETED' ? '已完成' : '完成'}
          leftActionText="删除"
          rightActionIcon={<FiCheck size={18} />}
          leftActionIcon={<FiTrash2 size={18} />}
          rightActionColor="#10b981"
          leftActionColor="#ef4444"
          className={swipeSurfaceClass}
        >
          <div className="flex h-full w-full cursor-pointer items-start gap-3 rounded-[18px] px-0 select-none" onClick={() => onTaskClick && onTaskClick(task)}>
            <div className="mt-1 h-11 w-1 shrink-0 rounded-full" style={{ backgroundColor: task.statusColor || '#3b82f6' }} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{task.title}</div>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusMeta.chipClass}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCompleteTask();
                    }}
                    disabled={task.status === 'COMPLETED'}
                    className={`inline-flex items-center rounded-full px-2.5 py-1.5 text-xs font-medium transition-all ${
                      task.status === 'COMPLETED'
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20'
                    }`}
                  >
                    <FiCheck className="mr-1" size={13} />
                    完成
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteTask();
                    }}
                    className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition-all hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                  >
                    <FiTrash2 className="mr-1" size={13} />
                    删除
                  </button>
                </div>
              </div>

              {task.description && (
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400" style={lineClampStyle}>
                  {task.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {parentTaskTitle && (
                  <span className="inline-flex items-center rounded-full border border-violet-200/80 bg-violet-50 px-2.5 py-1 font-medium text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
                    父任务 · {parentTaskTitle}
                  </span>
                )}
                <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 font-medium text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                  ID · {task.id.slice(-6)}
                </span>
              </div>
            </div>
          </div>
        </SwipeableTaskItem>
      </td>

      <td className={`${cellBaseClass} w-[10%] text-center`}>
        {!parentTaskId ? (
          <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
            主任务
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-violet-200/80 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
            子任务
          </span>
        )}
      </td>

      <td className={`${cellBaseClass} w-[10%] text-center`}>
        {task.priorityColor ? (
          <span
            className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm"
            style={{
              backgroundColor: `${task.priorityColor}15`,
              color: task.priorityColor,
              borderColor: `${task.priorityColor}40`
            }}
          >
            {priorityLabel} 优先
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">-</span>
        )}
      </td>

      <td className={`${cellBaseClass} w-[12%] text-center`}>
        {task.assignee ? (
          <div className="inline-flex max-w-full items-center rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1.5 dark:border-white/10 dark:bg-white/[0.03]">
            <Avatar name={task.assignee} size="xs" className="mr-2 shrink-0" />
            <span className="max-w-[88px] truncate text-sm text-slate-600 dark:text-slate-300">{task.assignee}</span>
          </div>
        ) : (
          <span className="inline-flex items-center rounded-full border border-dashed border-slate-200 px-2.5 py-1 text-xs text-slate-400 dark:border-white/10 dark:text-slate-500">
            未分配
          </span>
        )}
      </td>

      <td className={`${cellBaseClass} w-[12%] text-center`}>
        {startInfo ? (
          <div className="space-y-1">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{startInfo.date}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500">{startInfo.time}</div>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">—</span>
        )}
      </td>

      <td className={`${cellBaseClass} w-[12%] text-center`}>
        {dueInfo ? (
          <div className="space-y-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${dueInfo.chipClass}`}>
              {dueInfo.label}
            </span>
            <div className={`text-sm font-medium ${dueInfo.textClass}`}>{dueInfo.date}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500">{dueInfo.time}</div>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">—</span>
        )}
      </td>

      <td className={`${cellBaseClass} w-[8%] rounded-r-[20px] border-r text-center`}>
        <div className="mx-auto w-full max-w-[88px]">
          <div className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">{progress}%</div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </td>
    </tr>
  );
};

export default SwipeableTaskRow;
