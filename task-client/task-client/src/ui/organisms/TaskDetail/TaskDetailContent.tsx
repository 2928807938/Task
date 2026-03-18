import React, {useState} from 'react';
import {motion} from 'framer-motion';
import {
  FiActivity,
  FiCalendar,
  FiCheck,
  FiClock,
  FiEdit2,
  FiFileText,
  FiFlag,
  FiHash,
  FiPlay,
  FiType,
  FiUser,
  FiX
} from 'react-icons/fi';
import {ProjectTask} from '@/types/api-types';
import {PriorityBadge, StatusBadge, TaskTypeBadge} from './TaskInfoCard';
import ProgressBar from '@/ui/atoms/ProgressBar';

interface TaskDetailContentProps {
  task: ProjectTask;
  completedTaskCount?: number;
  totalTaskCount?: number;
  overallProgress?: number;
  onTaskUpdate?: (updatedTask: Partial<ProjectTask>) => void;
  projectMembers?: Array<{ id: string; name: string; avatar?: string }>;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '未设置';

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '未设置';
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch {
    return '未设置';
  }
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return '未设置';

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '未设置';
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch {
    return '未设置';
  }
};

const getPriorityLabel = (priority?: string) => {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
      return '高优先级';
    case 'MEDIUM':
      return '中优先级';
    case 'LOW':
      return '低优先级';
    default:
      return '未设置';
  }
};

const getStatusLabel = (status?: string) => {
  switch (status?.toUpperCase()) {
    case 'IN_PROGRESS':
      return '进行中';
    case 'COMPLETED':
      return '已完成';
    case 'OVERDUE':
      return '已逾期';
    case 'WAITING':
      return '筹划中';
    default:
      return status || '未设置';
  }
};

const TaskDetailContent: React.FC<TaskDetailContentProps> = ({
  task,
  completedTaskCount = 0,
  totalTaskCount = 0,
  overallProgress = 0,
  onTaskUpdate
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  const isTaskCompleted = task.status === 'COMPLETED';
  const isTaskOverdue = Boolean(!isTaskCompleted && task.dueDate && new Date(task.dueDate) < new Date());

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditingValue(currentValue);
  };

  const saveEdit = () => {
    if (editingField && onTaskUpdate) {
      onTaskUpdate({
        [editingField]: editingValue
      });
    }
    setEditingField(null);
    setEditingValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const EditableField: React.FC<{
    field: string;
    value: string;
    multiline?: boolean;
    placeholder?: string;
    large?: boolean;
  }> = ({ field, value, multiline = false, placeholder = '', large = false }) => {
    const isEditing = editingField === field;

    if (isEditing) {
      return (
        <div className="flex items-start gap-2">
          {multiline ? (
            <textarea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              placeholder={placeholder}
              className="min-h-[120px] flex-1 rounded-2xl border border-card-border bg-white px-4 py-3 text-sm text-neutral-900 shadow-sm outline-none ring-0 transition focus:border-primary-400 dark:border-slate-700 dark:bg-slate-900 dark:text-neutral-100"
              rows={4}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              placeholder={placeholder}
              className={`flex-1 rounded-2xl border border-card-border bg-white px-4 py-3 shadow-sm outline-none ring-0 transition focus:border-primary-400 dark:border-slate-700 dark:bg-slate-900 dark:text-neutral-100 ${large ? 'text-xl font-semibold sm:text-2xl' : 'text-sm'}`}
              autoFocus
            />
          )}
          <button
            onClick={saveEdit}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white transition hover:bg-emerald-600"
          >
            <FiCheck size={16} />
          </button>
          <button
            onClick={cancelEdit}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-300 dark:hover:bg-rose-900/30"
          >
            <FiX size={16} />
          </button>
        </div>
      );
    }

    return (
      <div className="group flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {multiline ? (
            <div className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm leading-7 text-neutral-600 dark:bg-slate-900/70 dark:text-neutral-300">
              {value || placeholder || '暂无描述'}
            </div>
          ) : (
            <div className={large ? 'text-2xl font-semibold leading-tight text-neutral-900 dark:text-white sm:text-3xl' : 'text-sm font-medium text-neutral-800 dark:text-neutral-200'}>
              {value || placeholder || '未设置'}
            </div>
          )}
        </div>
        {onTaskUpdate ? (
          <button
            onClick={() => startEditing(field, value)}
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 opacity-0 transition hover:bg-neutral-100 hover:text-primary-600 group-hover:opacity-100 dark:hover:bg-slate-800 dark:hover:text-primary-300"
          >
            <FiEdit2 size={15} />
          </button>
        ) : null}
      </div>
    );
  };

  const InfoRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
    iconTone: string;
  }> = ({ icon, label, children, iconTone }) => (
    <div className="grid gap-4 border-b border-card-border/70 px-4 py-5 last:border-b-0 dark:border-slate-800/70 sm:grid-cols-[160px_minmax(0,1fr)] sm:px-6">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconTone}`}>
          {icon}
        </span>
        <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">{label}</span>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );

  return (
    <motion.div
      className="space-y-5 p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <section className="relative overflow-hidden rounded-[28px] border border-card-border/70 bg-gradient-to-br from-white via-white to-primary-50/70 p-5 shadow-sm dark:border-slate-800/80 dark:from-slate-950 dark:via-slate-950 dark:to-primary-950/20 sm:p-6">
        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-primary-200/30 blur-3xl dark:bg-primary-500/20" />
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <TaskTypeBadge isMainTask={!task.parentTaskId} />
              <PriorityBadge priority={task.priority} color={task.priorityColor} />
              <StatusBadge status={getStatusLabel(task.status)} statusColor={task.statusColor} />
            </div>
            <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
              创建于 {formatDateTime(task.createdAt)}
            </span>
          </div>

          <EditableField field="title" value={task.title} placeholder="输入任务标题" large={true} />

          <div className="flex flex-wrap gap-6 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-2">
              <FiUser className="text-primary-500" /> {task.assignee || '未分配负责人'}
            </span>
            <span className="inline-flex items-center gap-2">
              <FiPlay className="text-primary-500" /> {formatDate(task.startTime)} 开始
            </span>
            <span className="inline-flex items-center gap-2">
              <FiCalendar className="text-primary-500" /> {formatDate(task.dueDate)} 截止
            </span>
          </div>

          {totalTaskCount > 0 ? (
            <div className="rounded-[24px] border border-white/70 bg-white/70 p-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">任务进度</p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    已完成 {completedTaskCount}/{totalTaskCount} 项
                    {isTaskOverdue ? ' · 当前存在逾期风险' : ''}
                  </p>
                </div>
                <span className="text-2xl font-semibold text-neutral-900 dark:text-white">{overallProgress}%</span>
              </div>
              <ProgressBar percentage={overallProgress} height="md" color="bg-gradient-to-r from-primary-500 to-sky-500" />
            </div>
          ) : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-card-border/70 bg-white/85 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/70">
        <InfoRow icon={<FiType className="text-lg" />} label="标题" iconTone="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
          <EditableField field="title" value={task.title} placeholder="输入任务标题" />
        </InfoRow>

        <InfoRow icon={<FiFileText className="text-lg" />} label="描述" iconTone="bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-300">
          <EditableField field="description" value={task.description || ''} multiline={true} placeholder="输入任务描述" />
        </InfoRow>

        <InfoRow icon={<FiUser className="text-lg" />} label="负责人" iconTone="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300">
          <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{task.assignee || '未分配'}</div>
        </InfoRow>

        <InfoRow icon={<FiFlag className="text-lg" />} label="优先级" iconTone="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300">
          <div className="flex items-center gap-3">
            <PriorityBadge priority={task.priority} color={task.priorityColor} />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">{getPriorityLabel(task.priority)}</span>
          </div>
        </InfoRow>

        <InfoRow icon={<FiActivity className="text-lg" />} label="状态" iconTone="bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/20 dark:text-fuchsia-300">
          <div className="flex items-center gap-3">
            <StatusBadge status={getStatusLabel(task.status)} statusColor={task.statusColor} />
            <span className="text-sm text-neutral-500 dark:text-neutral-400">{isTaskOverdue ? '当前已逾期，请优先处理' : '任务状态正常'}</span>
          </div>
        </InfoRow>

        <InfoRow icon={<FiClock className="text-lg" />} label="开始" iconTone="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300">
          <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{formatDate(task.startTime)}</div>
        </InfoRow>

        <InfoRow icon={<FiCalendar className="text-lg" />} label="截止" iconTone="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{formatDate(task.dueDate)}</span>
            {isTaskOverdue ? (
              <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                已逾期
              </span>
            ) : null}
          </div>
        </InfoRow>

        <InfoRow icon={<FiHash className="text-lg" />} label="任务 ID" iconTone="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{task.id}</div>
        </InfoRow>
      </section>
    </motion.div>
  );
};

export default TaskDetailContent;
