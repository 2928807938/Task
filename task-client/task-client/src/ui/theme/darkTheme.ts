/**
 * 暗色主题定义
 */

import {ThemeDefinition} from './themeTypes';

export const darkTheme: ThemeDefinition = {
  mode: 'dark',
  colors: {
    // 主色调
    primary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
      800: '#3730A3',
      900: '#312E81',
    },

    // 暗色模式下的中性色
    neutral: {
      50: '#171717',  // 反转
      100: '#1F2937',
      200: '#374151',
      300: '#4B5563',
      400: '#6B7280',
      500: '#9CA3AF',
      600: '#D1D5DB',
      700: '#E5E7EB',
      800: '#F3F4F6',
      900: '#F9FAFB',  // 反转
    },

    // 功能色 - 暗色模式下调整亮度
    success: {
      50: '#064E3B',
      100: '#065F46',
      200: '#047857',
      500: '#10B981',
      700: '#D1FAE5',
    },

    warning: {
      50: '#78350F',
      100: '#92400E',
      200: '#B45309',
      500: '#F59E0B',
      700: '#FEF3C7',
    },

    error: {
      50: '#7F1D1D',
      100: '#991B1B',
      200: '#B91C1C',
      500: '#EF4444',
      700: '#FEE2E2',
    },

    info: {
      50: '#1E3A8A',
      100: '#1D4ED8',
      200: '#2563EB',
      500: '#3B82F6',
      700: '#DBEAFE',
    },

    // 背景和前景 - 暗色模式下反转
    background: '#121212',
    foreground: '#F3F4F6',

    // 卡片和组件 - 暗色模式
    card: {
      background: '#1F2937',
      border: '#374151',
      hover: '#2D3748',
    },
  },

  // 任务相关颜色 - 暗色模式
  taskColors: {
    priority: {
      high: {
        bg: '#7F1D1D',
        text: '#FCA5A5',
        border: '#B91C1C',
      },
      medium: {
        bg: '#78350F',
        text: '#FCD34D',
        border: '#B45309',
      },
      low: {
        bg: '#064E3B',
        text: '#6EE7B7',
        border: '#047857',
      },
    },

    status: {
      inProgress: {
        bg: '#1E3A8A',
        text: '#93C5FD',
        border: '#1D4ED8',
      },
      completed: {
        bg: '#064E3B',
        text: '#6EE7B7',
        border: '#047857',
      },
      overdue: {
        bg: '#7F1D1D',
        text: '#FCA5A5',
        border: '#B91C1C',
      },
      waiting: {
        bg: '#78350F',
        text: '#FCD34D',
        border: '#B45309',
      },
    },

    // 任务卡片渐变色 - 暗色模式下稍微暗化
    gradients: [
      'from-blue-600 to-blue-500',
      'from-pink-600 to-pink-500',
      'from-amber-600 to-amber-500',
      'from-emerald-600 to-emerald-500',
      'from-purple-600 to-purple-500',
      'from-indigo-600 to-indigo-500'
    ],
  },

  // 阴影 - 暗色模式下更强
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
  },

  // 排版 - 与亮色主题保持一致
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },

  // 边框圆角 - 与亮色主题保持一致
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },

  // 间距 - 与亮色主题保持一致
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  // 过渡时间 - 与亮色主题保持一致
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Dashboard专用主题配置
  dashboard: {
    // 仪表盘卡片样式
    cards: {
      // 主要数据卡片（不跟随主题） - 保持与亮色主题相同的颜色
      primary: {
        gradient: 'bg-gradient-to-br from-blue-700 to-blue-600',
        text: '#FFFFFF',
        subtext: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(49, 130, 206, 0.25)',
        icon: 'text-blue-50'
      },
      // 次要数据卡片（跟随主题） - 深色模式下的调整
      secondary: {
        background: '#0A101F', // 更深的深蓝黑色
        text: '#E2E8F0',
        subtext: '#A0AEC0',
        border: '#1A202C',
        hover: '#0E1628'
      },
      // 活动卡片 - 深色模式下的调整
      activity: {
        background: '#0A101F',
        border: '#1A202C',
        hover: '#0E1628'
      }
    },

    // 特定图表样式
    charts: {
      // 基础图表（跟随主题） - 深色模式下的调整
      base: {
        grid: '#1A202C',
        text: '#A0AEC0',
        axis: '#718096'
      },
      // 固定配色方案（不跟随主题） - 保持与亮色主题相同的颜色
      palette: {
        // 主要数据系列 - 与浅色主题保持相同，确保数据可视化的一致性
        primary: [
          '#3182CE', // 主要薄蓝色
          '#2C7A7B', // 干净的青绿色
          '#DD6B20', // 温暖橙色
          '#805AD5', // 沉稳紫色
          '#319795', // 海蓝色
          '#3182CE'  // 回到蓝色
        ],
        // 次要系列
        secondary: [
          '#63B3ED', // 轻盈蓝色
          '#4FD1C5', // 清新的青绿色
          '#F6AD55', // 温和的橙色
          '#B794F4', // 柔和的紫色
          '#76E4F7', // 亮丽的海薄蓝
          '#63B3ED'  // 回到轻盈蓝
        ],
        // 强调色
        accent: [
          '#BEE3F8', // 浅蓝
          '#B2F5EA', // 浅绿
          '#FEEBC8', // 浅橙
          '#E9D8FD', // 浅紫
          '#AFF1FE', // 浅蓝青
          '#BEE3F8'  // 回到浅蓝
        ]
      }
    },

    // 数据展示区域背景 - 深色模式下的调整
    sections: {
      main: {
        background: '#0A101F', // 深蓝黑色主背景
        border: '#1A202C'
      },
      sidebar: {
        background: '#070C19', // 稍暗一点的背景，增加层次感
        border: '#1A202C'
      },
      highlight: {
        background: 'rgba(44, 82, 130, 0.2)', // 微妙的蓝色高亮效果
        border: '#2A4365'
      }
    }
  },
};
