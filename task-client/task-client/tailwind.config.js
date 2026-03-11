/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/ui/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '.dark-theme'],
  theme: {
    extend: {
      // 基础颜色
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        
        // 主题色系
        primary: {
          50: 'var(--theme-primary-50)',
          100: 'var(--theme-primary-100)',
          200: 'var(--theme-primary-200)',
          300: 'var(--theme-primary-300)',
          400: 'var(--theme-primary-400)',
          500: 'var(--theme-primary-500)',
          600: 'var(--theme-primary-600)',
          700: 'var(--theme-primary-700)',
          800: 'var(--theme-primary-800)',
          900: 'var(--theme-primary-900)',
        },
        
        // 中性色
        neutral: {
          50: 'var(--theme-neutral-50)',
          100: 'var(--theme-neutral-100)',
          200: 'var(--theme-neutral-200)',
          300: 'var(--theme-neutral-300)',
          400: 'var(--theme-neutral-400)',
          500: 'var(--theme-neutral-500)',
          600: 'var(--theme-neutral-600)',
          700: 'var(--theme-neutral-700)',
          800: 'var(--theme-neutral-800)',
          900: 'var(--theme-neutral-900)',
        },
        
        // 功能色
        success: {
          50: 'var(--theme-success-50)',
          100: 'var(--theme-success-100)',
          200: 'var(--theme-success-200)',
          500: 'var(--theme-success-500)',
          700: 'var(--theme-success-700)',
        },
        
        warning: {
          50: 'var(--theme-warning-50)',
          100: 'var(--theme-warning-100)',
          200: 'var(--theme-warning-200)',
          500: 'var(--theme-warning-500)',
          700: 'var(--theme-warning-700)',
        },
        
        error: {
          50: 'var(--theme-error-50)',
          100: 'var(--theme-error-100)',
          200: 'var(--theme-error-200)',
          500: 'var(--theme-error-500)',
          700: 'var(--theme-error-700)',
        },
        
        info: {
          50: 'var(--theme-info-50)',
          100: 'var(--theme-info-100)',
          200: 'var(--theme-info-200)',
          500: 'var(--theme-info-500)',
          700: 'var(--theme-info-700)',
        },
        
        // 卡片颜色
        card: {
          bg: 'var(--theme-card-bg)',
          border: 'var(--theme-card-border)',
          hover: 'var(--theme-card-hover)',
        },
        
        // 任务优先级
        priority: {
          high: {
            bg: 'var(--theme-priority-high-bg)',
            text: 'var(--theme-priority-high-text)',
            border: 'var(--theme-priority-high-border)',
          },
          medium: {
            bg: 'var(--theme-priority-medium-bg)',
            text: 'var(--theme-priority-medium-text)',
            border: 'var(--theme-priority-medium-border)',
          },
          low: {
            bg: 'var(--theme-priority-low-bg)',
            text: 'var(--theme-priority-low-text)',
            border: 'var(--theme-priority-low-border)',
          },
        },
        
        // 任务状态
        status: {
          inProgress: {
            bg: 'var(--theme-status-inprogress-bg)',
            text: 'var(--theme-status-inprogress-text)',
            border: 'var(--theme-status-inprogress-border)',
          },
          completed: {
            bg: 'var(--theme-status-completed-bg)',
            text: 'var(--theme-status-completed-text)',
            border: 'var(--theme-status-completed-border)',
          },
          overdue: {
            bg: 'var(--theme-status-overdue-bg)',
            text: 'var(--theme-status-overdue-text)',
            border: 'var(--theme-status-overdue-border)',
          },
          waiting: {
            bg: 'var(--theme-status-waiting-bg)',
            text: 'var(--theme-status-waiting-text)',
            border: 'var(--theme-status-waiting-border)',
          },
        },
      },
      
      // 阴影
      boxShadow: {
        sm: 'var(--theme-shadow-sm)',
        md: 'var(--theme-shadow-md)',
        lg: 'var(--theme-shadow-lg)',
      },
      
      // 排版
      fontFamily: {
        base: 'var(--theme-font-family)',
      },
      
      fontSize: {
        xs: 'var(--theme-font-size-xs)',
        sm: 'var(--theme-font-size-sm)',
        base: 'var(--theme-font-size-base)',
        lg: 'var(--theme-font-size-lg)',
        xl: 'var(--theme-font-size-xl)',
        '2xl': 'var(--theme-font-size-2xl)',
      },
      
      fontWeight: {
        normal: 'var(--theme-font-weight-normal)',
        medium: 'var(--theme-font-weight-medium)',
        semibold: 'var(--theme-font-weight-semibold)',
        bold: 'var(--theme-font-weight-bold)',
      },
      
      // 边框圆角
      borderRadius: {
        sm: 'var(--theme-radius-sm)',
        md: 'var(--theme-radius-md)',
        lg: 'var(--theme-radius-lg)',
        xl: 'var(--theme-radius-xl)',
        full: 'var(--theme-radius-full)',
      },
      
      // 间距
      spacing: {
        xs: 'var(--theme-spacing-xs)',
        sm: 'var(--theme-spacing-sm)',
        md: 'var(--theme-spacing-md)',
        lg: 'var(--theme-spacing-lg)',
        xl: 'var(--theme-spacing-xl)',
      },
      
      // 过渡时间
      transitionDuration: {
        fast: 'var(--theme-transition-fast)',
        normal: 'var(--theme-transition-normal)',
        slow: 'var(--theme-transition-slow)',
      },
      
      // 动画
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        shimmer: {
          '0%': { transform: 'translateX(-150%)' },
          '100%': { transform: 'translateX(150%)' },
        },
        wave: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        breathe: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.03)' },
        },
        spinner: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideDown: 'slideDown 0.3s ease-out',
        pulse: 'pulse 1.5s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        wave: 'wave 2.5s infinite ease-in-out',
        breathe: 'breathe 3s infinite ease-in-out',
        spinner: 'spinner 1s linear infinite',
      },
    },
  },
  plugins: [],
  important: true,
};
