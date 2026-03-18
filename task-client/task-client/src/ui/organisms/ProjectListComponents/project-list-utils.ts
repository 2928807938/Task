import { ProjectListItem } from '@/types/api-types';

type ProjectWithTaskCounts = Partial<ProjectListItem> & {
  completedTaskCount?: number;
  taskCount?: number;
};

export const formatProjectDate = (dateStr?: string | null) => {
  if (!dateStr) return '未设置';

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return '未设置';

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const getProjectDuration = (createdAt?: string | null) => {
  if (!createdAt) return 0;

  const created = new Date(createdAt);

  if (Number.isNaN(created.getTime())) return 0;

  const diffTime = Math.abs(Date.now() - created.getTime());
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

export const getProjectProgress = (project: ProjectWithTaskCounts) => {
  if (typeof project.progress === 'number' && project.progress >= 0) {
    return Math.min(100, Math.round(project.progress));
  }

  const completedTaskCount = Number(project.completedTaskCount || 0);
  const taskCount = Number(project.taskCount || 0);

  if (taskCount > 0) {
    return Math.min(100, Math.round((completedTaskCount / taskCount) * 100));
  }

  return 0;
};

export const getProgressTone = (progress: number) => {
  if (progress >= 80) {
    return {
      text: 'var(--theme-success-700)',
      pillBackground: 'rgba(var(--theme-success-500-rgb), 0.14)',
      pillBorder: 'rgba(var(--theme-success-500-rgb), 0.2)',
      bar: 'linear-gradient(90deg, #34D399 0%, #10B981 100%)',
      label: '进展顺利',
    };
  }

  if (progress >= 35) {
    return {
      text: 'var(--theme-info-700)',
      pillBackground: 'rgba(var(--theme-info-500-rgb), 0.14)',
      pillBorder: 'rgba(var(--theme-info-500-rgb), 0.2)',
      bar: 'linear-gradient(90deg, #60A5FA 0%, #3B82F6 100%)',
      label: '稳定推进',
    };
  }

  return {
    text: 'var(--theme-warning-700)',
    pillBackground: 'rgba(var(--theme-warning-500-rgb), 0.14)',
    pillBorder: 'rgba(var(--theme-warning-500-rgb), 0.22)',
    bar: 'linear-gradient(90deg, #FBBF24 0%, #F59E0B 100%)',
    label: '需要跟进',
  };
};
