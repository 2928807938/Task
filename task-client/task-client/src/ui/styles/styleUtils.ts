/**
 * 样式工具函数 - 固定颜色（不依赖主题系统）
 */

// 任务状态颜色映射
export const taskStatusColors = {
  // 待处理状态
  waiting: {
    background: '#FEF3C7',
    text: '#B45309',
    border: '#FDE68A',
    // 图表使用
    bgOpacity: 'rgba(245, 158, 11, 0.6)',
    borderOpacity: 'rgba(245, 158, 11, 1)'
  },
  // 进行中状态
  inProgress: {
    background: '#DBEAFE',
    text: '#1D4ED8',
    border: '#BFDBFE',
    // 图表使用
    bgOpacity: 'rgba(59, 130, 246, 0.6)',
    borderOpacity: 'rgba(59, 130, 246, 1)'
  },
  // 已完成状态
  completed: {
    background: '#D1FAE5',
    text: '#047857',
    border: '#A7F3D0',
    // 图表使用
    bgOpacity: 'rgba(16, 185, 129, 0.6)',
    borderOpacity: 'rgba(16, 185, 129, 1)'
  },
  // 已逾期状态
  overdue: {
    background: '#FEE2E2',
    text: '#B91C1C',
    border: '#FECACA',
    // 图表使用
    bgOpacity: 'rgba(239, 68, 68, 0.6)',
    borderOpacity: 'rgba(239, 68, 68, 1)'
  }
};

// 任务优先级颜色映射
export const taskPriorityColors = {
  // 高优先级
  high: {
    background: '#FEE2E2',
    text: '#B91C1C',
    border: '#FECACA',
    // 图表使用
    bgOpacity: 'rgba(239, 68, 68, 0.6)',
    borderOpacity: 'rgba(239, 68, 68, 1)'
  },
  // 中优先级
  medium: {
    background: '#FEF3C7',
    text: '#B45309',
    border: '#FDE68A',
    // 图表使用
    bgOpacity: 'rgba(245, 158, 11, 0.6)',
    borderOpacity: 'rgba(245, 158, 11, 1)'
  },
  // 低优先级
  low: {
    background: '#D1FAE5',
    text: '#047857',
    border: '#A7F3D0',
    // 图表使用
    bgOpacity: 'rgba(16, 185, 129, 0.6)',
    borderOpacity: 'rgba(16, 185, 129, 1)'
  }
};

// 头像渐变色
export const avatarGradients = [
  'from-indigo-500 to-indigo-400',
  'from-blue-500 to-blue-400',
  'from-green-500 to-green-400',
  'from-amber-500 to-amber-400',
  'from-red-500 to-red-400',
  'from-purple-500 to-purple-400',
  'from-pink-500 to-pink-400',
];

// 文本颜色工具函数
export const textColors = {
  // 主要文本
  primary: 'text-neutral-900',
  // 次要文本
  secondary: 'text-neutral-700',
  // 提示文本
  tertiary: 'text-neutral-500',
  // 禁用文本
  disabled: 'text-neutral-400',
};

// 背景颜色工具函数
export const bgColors = {
  // 主背景
  primary: 'bg-neutral-100',
  // 卡片背景
  card: 'bg-white',
  // 悬停背景
  hover: 'hover:bg-neutral-50',
};

// 边框颜色工具函数
export const borderColors = {
  light: 'border-neutral-200',
  medium: 'border-neutral-300',
  focus: 'focus:border-indigo-500',
};
