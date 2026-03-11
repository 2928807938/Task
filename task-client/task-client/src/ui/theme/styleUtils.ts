/**
 * 样式工具函数 - 将常用颜色映射到主题变量
 */

// 任务状态颜色映射
export const taskStatusColors = {
  // 待处理状态
  waiting: {
    background: 'var(--theme-status-waiting-bg)',
    text: 'var(--theme-status-waiting-text)',
    border: 'var(--theme-status-waiting-border)',
    // 图表使用
    bgOpacity: 'rgba(var(--theme-warning-500-rgb), 0.6)',
    borderOpacity: 'rgba(var(--theme-warning-500-rgb), 1)'
  },
  // 进行中状态
  inProgress: {
    background: 'var(--theme-status-inprogress-bg)',
    text: 'var(--theme-status-inprogress-text)',
    border: 'var(--theme-status-inprogress-border)',
    // 图表使用
    bgOpacity: 'rgba(var(--theme-info-500-rgb), 0.6)',
    borderOpacity: 'rgba(var(--theme-info-500-rgb), 1)'
  },
  // 已完成状态
  completed: {
    background: 'var(--theme-status-completed-bg)',
    text: 'var(--theme-status-completed-text)',
    border: 'var(--theme-status-completed-border)',
    // 图表使用
    bgOpacity: 'rgba(var(--theme-success-500-rgb), 0.6)',
    borderOpacity: 'rgba(var(--theme-success-500-rgb), 1)'
  },
  // 已逾期状态
  overdue: {
    background: 'var(--theme-status-overdue-bg)',
    text: 'var(--theme-status-overdue-text)',
    border: 'var(--theme-status-overdue-border)',
    // 图表使用
    bgOpacity: 'rgba(var(--theme-error-500-rgb), 0.6)',
    borderOpacity: 'rgba(var(--theme-error-500-rgb), 1)'
  }
};

// 任务优先级颜色映射
export const taskPriorityColors = {
  // 高优先级
  high: {
    background: 'var(--theme-priority-high-bg)',
    text: 'var(--theme-priority-high-text)',
    border: 'var(--theme-priority-high-border)',
    // 图表使用
    bgOpacity: 'rgba(var(--theme-error-500-rgb), 0.6)',
    borderOpacity: 'rgba(var(--theme-error-500-rgb), 1)'
  },
  // 中优先级
  medium: {
    background: 'var(--theme-priority-medium-bg)',
    text: 'var(--theme-priority-medium-text)',
    border: 'var(--theme-priority-medium-border)',
    // 图表使用
    bgOpacity: 'rgba(var(--theme-warning-500-rgb), 0.6)',
    borderOpacity: 'rgba(var(--theme-warning-500-rgb), 1)'
  },
  // 低优先级
  low: {
    background: 'var(--theme-priority-low-bg)',
    text: 'var(--theme-priority-low-text)',
    border: 'var(--theme-priority-low-border)',
    // 图表使用
    bgOpacity: 'rgba(var(--theme-success-500-rgb), 0.6)',
    borderOpacity: 'rgba(var(--theme-success-500-rgb), 1)'
  }
};

// 头像渐变色 - 暗色模式和亮色模式共用
export const avatarGradients = [
  'from-primary-500 to-primary-400',
  'from-info-500 to-info-400',
  'from-success-500 to-success-400',
  'from-warning-500 to-warning-400',
  'from-error-500 to-error-400',
  'from-purple-500 to-purple-400',
  'from-pink-500 to-pink-400',
];

// 文本颜色工具函数
export const textColors = {
  // 主要文本
  primary: 'text-neutral-900 dark:text-neutral-100',
  // 次要文本
  secondary: 'text-neutral-700 dark:text-neutral-300',
  // 提示文本
  tertiary: 'text-neutral-500 dark:text-neutral-400',
  // 禁用文本
  disabled: 'text-neutral-400 dark:text-neutral-600',
};

// 背景颜色工具函数
export const bgColors = {
  // 主背景
  primary: 'bg-background dark:bg-background',
  // 卡片背景
  card: 'bg-card-bg dark:bg-card-bg',
  // 悬停背景
  hover: 'hover:bg-card-hover dark:hover:bg-card-hover',
};

// 边框颜色工具函数
export const borderColors = {
  light: 'border-neutral-200 dark:border-neutral-700',
  medium: 'border-neutral-300 dark:border-neutral-600',
  focus: 'focus:border-primary-500 dark:focus:border-primary-400',
};
