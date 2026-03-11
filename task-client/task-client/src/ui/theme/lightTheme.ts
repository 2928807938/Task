/**
 * 亮色主题定义
 */

import {ThemeDefinition} from './themeTypes';

export const lightTheme: ThemeDefinition = {
  mode: 'light',
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

    // 中性色
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // 功能色
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      500: '#10B981',
      700: '#047857',
    },

    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      500: '#F59E0B',
      700: '#B45309',
    },

    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      500: '#EF4444',
      700: '#B91C1C',
    },

    info: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      500: '#3B82F6',
      700: '#1D4ED8',
    },

    // 背景和前景
    background: '#F3F4F6',
    foreground: '#171717',

    // 卡片和组件
    card: {
      background: '#FFFFFF',
      border: '#E5E7EB',
      hover: '#F9FAFB',
    },
  },

  // 任务相关颜色
  taskColors: {
    priority: {
      high: {
        bg: '#FEE2E2',
        text: '#B91C1C',
        border: '#FECACA',
      },
      medium: {
        bg: '#FEF3C7',
        text: '#B45309',
        border: '#FDE68A',
      },
      low: {
        bg: '#D1FAE5',
        text: '#047857',
        border: '#A7F3D0',
      },
    },

    status: {
      inProgress: {
        bg: '#DBEAFE',
        text: '#1D4ED8',
        border: '#BFDBFE',
      },
      completed: {
        bg: '#D1FAE5',
        text: '#047857',
        border: '#A7F3D0',
      },
      overdue: {
        bg: '#FEE2E2',
        text: '#B91C1C',
        border: '#FECACA',
      },
      waiting: {
        bg: '#FEF3C7',
        text: '#B45309',
        border: '#FDE68A',
      },
    },

    // 任务卡片渐变色
    gradients: [
      'from-blue-500 to-blue-400',
      'from-pink-500 to-pink-400',
      'from-amber-500 to-amber-400',
      'from-emerald-500 to-emerald-400',
      'from-purple-500 to-purple-400',
      'from-indigo-500 to-indigo-400'
    ],
  },

  // 阴影
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },

  // 排版
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

  // 边框圆角
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },

  // 间距
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },

  // 过渡时间
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  // Dashboard专用主题配置
  dashboard: {
    // 仪表盘卡片样式
    cards: {
      // 主要数据卡片（不跟随主题）
      primary: {
        gradient: 'bg-gradient-to-br from-blue-700 to-blue-600',
        text: '#FFFFFF',
        subtext: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(49, 130, 206, 0.25)',
        icon: 'text-blue-50'
      },
      // 次要数据卡片（跟随主题）
      secondary: {
        background: '#FFFFFF',
        text: '#2A4365', // 深青色，增强可读性
        subtext: '#4A5568',
        border: '#EDF2F7',
        hover: '#F7FAFC'
      },
      // 活动卡片
      activity: {
        background: '#FFFFFF',
        border: '#EDF2F7',
        hover: '#F7FAFC'
      }
    },

    // 特定图表样式
    charts: {
      // 基础图表（跟随主题）
      base: {
        grid: '#EDF2F7',
        text: '#718096',
        axis: '#A0AEC0'
      },
      // 固定配色方案（不跟随主题）
      palette: {
        // 主要数据系列
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

    // 数据展示区域背景
    sections: {
      main: {
        background: '#FFFFFF',
        border: '#EDF2F7'
      },
      sidebar: {
        background: '#F9FAFC', // 轻微的背景差异制造层次感
        border: '#EDF2F7'
      },
      highlight: {
        background: 'rgba(235, 244, 255, 0.8)', // 柔和的蓝色高亮
        border: '#BEE3F8'
      }
    }
  },
};
