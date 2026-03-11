/**
 * 主题工具函数
 */

import {ThemeDefinition, ThemeMode} from './themeTypes';
import {lightTheme} from './lightTheme';
import {darkTheme} from './darkTheme';

/**
 * 获取当前激活的主题对象
 */
export const getActiveTheme = (mode: ThemeMode): ThemeDefinition => {
  return mode === 'light' ? lightTheme : darkTheme;
};

/**
 * 生成用于注入到CSS变量的主题变量字符串
 */
export const generateThemeVariables = (theme: ThemeDefinition): string => {
  return `
    --theme-background: ${theme.colors.background};
    --theme-foreground: ${theme.colors.foreground};
    
    /* 主色调 */
    --theme-primary-50: ${theme.colors.primary[50]};
    --theme-primary-100: ${theme.colors.primary[100]};
    --theme-primary-200: ${theme.colors.primary[200]};
    --theme-primary-300: ${theme.colors.primary[300]};
    --theme-primary-400: ${theme.colors.primary[400]};
    --theme-primary-500: ${theme.colors.primary[500]};
    --theme-primary-600: ${theme.colors.primary[600]};
    --theme-primary-700: ${theme.colors.primary[700]};
    --theme-primary-800: ${theme.colors.primary[800]};
    --theme-primary-900: ${theme.colors.primary[900]};
    
    /* 中性色 */
    --theme-neutral-50: ${theme.colors.neutral[50]};
    --theme-neutral-100: ${theme.colors.neutral[100]};
    --theme-neutral-200: ${theme.colors.neutral[200]};
    --theme-neutral-300: ${theme.colors.neutral[300]};
    --theme-neutral-400: ${theme.colors.neutral[400]};
    --theme-neutral-500: ${theme.colors.neutral[500]};
    --theme-neutral-600: ${theme.colors.neutral[600]};
    --theme-neutral-700: ${theme.colors.neutral[700]};
    --theme-neutral-800: ${theme.colors.neutral[800]};
    --theme-neutral-900: ${theme.colors.neutral[900]};
    
    /* 功能色 */
    --theme-success-50: ${theme.colors.success[50]};
    --theme-success-100: ${theme.colors.success[100]};
    --theme-success-200: ${theme.colors.success[200]};
    --theme-success-500: ${theme.colors.success[500]};
    --theme-success-700: ${theme.colors.success[700]};
    
    --theme-warning-50: ${theme.colors.warning[50]};
    --theme-warning-100: ${theme.colors.warning[100]};
    --theme-warning-200: ${theme.colors.warning[200]};
    --theme-warning-500: ${theme.colors.warning[500]};
    --theme-warning-700: ${theme.colors.warning[700]};
    
    --theme-error-50: ${theme.colors.error[50]};
    --theme-error-100: ${theme.colors.error[100]};
    --theme-error-200: ${theme.colors.error[200]};
    --theme-error-500: ${theme.colors.error[500]};
    --theme-error-700: ${theme.colors.error[700]};
    
    --theme-info-50: ${theme.colors.info[50]};
    --theme-info-100: ${theme.colors.info[100]};
    --theme-info-200: ${theme.colors.info[200]};
    --theme-info-500: ${theme.colors.info[500]};
    --theme-info-700: ${theme.colors.info[700]};
    
    /* 卡片 */
    --theme-card-bg: ${theme.colors.card.background};
    --theme-card-border: ${theme.colors.card.border};
    --theme-card-hover: ${theme.colors.card.hover};
    
    /* 任务优先级 */
    --theme-priority-high-bg: ${theme.taskColors.priority.high.bg};
    --theme-priority-high-text: ${theme.taskColors.priority.high.text};
    --theme-priority-high-border: ${theme.taskColors.priority.high.border};
    
    --theme-priority-medium-bg: ${theme.taskColors.priority.medium.bg};
    --theme-priority-medium-text: ${theme.taskColors.priority.medium.text};
    --theme-priority-medium-border: ${theme.taskColors.priority.medium.border};
    
    --theme-priority-low-bg: ${theme.taskColors.priority.low.bg};
    --theme-priority-low-text: ${theme.taskColors.priority.low.text};
    --theme-priority-low-border: ${theme.taskColors.priority.low.border};
    
    /* 任务状态 */
    --theme-status-inprogress-bg: ${theme.taskColors.status.inProgress.bg};
    --theme-status-inprogress-text: ${theme.taskColors.status.inProgress.text};
    --theme-status-inprogress-border: ${theme.taskColors.status.inProgress.border};
    
    --theme-status-completed-bg: ${theme.taskColors.status.completed.bg};
    --theme-status-completed-text: ${theme.taskColors.status.completed.text};
    --theme-status-completed-border: ${theme.taskColors.status.completed.border};
    
    --theme-status-overdue-bg: ${theme.taskColors.status.overdue.bg};
    --theme-status-overdue-text: ${theme.taskColors.status.overdue.text};
    --theme-status-overdue-border: ${theme.taskColors.status.overdue.border};
    
    --theme-status-waiting-bg: ${theme.taskColors.status.waiting.bg};
    --theme-status-waiting-text: ${theme.taskColors.status.waiting.text};
    --theme-status-waiting-border: ${theme.taskColors.status.waiting.border};
    
    /* 阴影 */
    --theme-shadow-sm: ${theme.shadows.sm};
    --theme-shadow-md: ${theme.shadows.md};
    --theme-shadow-lg: ${theme.shadows.lg};
    
    /* 字体 */
    --theme-font-family: ${theme.typography.fontFamily};
    
    /* 字体大小 */
    --theme-font-size-xs: ${theme.typography.fontSize.xs};
    --theme-font-size-sm: ${theme.typography.fontSize.sm};
    --theme-font-size-base: ${theme.typography.fontSize.base};
    --theme-font-size-lg: ${theme.typography.fontSize.lg};
    --theme-font-size-xl: ${theme.typography.fontSize.xl};
    --theme-font-size-2xl: ${theme.typography.fontSize['2xl']};
    
    /* 字重 */
    --theme-font-weight-normal: ${theme.typography.fontWeight.normal};
    --theme-font-weight-medium: ${theme.typography.fontWeight.medium};
    --theme-font-weight-semibold: ${theme.typography.fontWeight.semibold};
    --theme-font-weight-bold: ${theme.typography.fontWeight.bold};
    
    /* 圆角 */
    --theme-radius-sm: ${theme.borderRadius.sm};
    --theme-radius-md: ${theme.borderRadius.md};
    --theme-radius-lg: ${theme.borderRadius.lg};
    --theme-radius-xl: ${theme.borderRadius.xl};
    --theme-radius-full: ${theme.borderRadius.full};
    
    /* 间距 */
    --theme-spacing-xs: ${theme.spacing.xs};
    --theme-spacing-sm: ${theme.spacing.sm};
    --theme-spacing-md: ${theme.spacing.md};
    --theme-spacing-lg: ${theme.spacing.lg};
    --theme-spacing-xl: ${theme.spacing.xl};
    
    /* 过渡 */
    --theme-transition-fast: ${theme.transitions.fast};
    --theme-transition-normal: ${theme.transitions.normal};
    --theme-transition-slow: ${theme.transitions.slow};
  `;
};

/**
 * 将主题应用到文档根元素
 */
export const applyThemeToRoot = (theme: ThemeDefinition): void => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    const themeVars = generateThemeVariables(theme);

    // 将CSS变量应用到根元素
    root.style.cssText = themeVars;

    // 设置主题模式类
    if (theme.mode === 'dark') {
      root.classList.add('dark-theme');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark-theme');
      root.style.colorScheme = 'light';
    }
  }
};
