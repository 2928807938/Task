/**
 * 主题系统的类型定义
 */

export type ThemeMode = 'light' | 'dark';

// 基础颜色系统
export interface ColorSystem {
  // 主要颜色
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // 中性颜色
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // 状态颜色
  success: {
    50: string;
    100: string;
    200: string;
    500: string;
    700: string;
  };
  
  warning: {
    50: string;
    100: string;
    200: string;
    500: string;
    700: string;
  };
  
  error: {
    50: string;
    100: string;
    200: string;
    500: string;
    700: string;
  };
  
  info: {
    50: string;
    100: string;
    200: string;
    500: string;
    700: string;
  };
  
  // 背景和前景
  background: string;
  foreground: string;
  
  // 卡片和组件
  card: {
    background: string;
    border: string;
    hover: string;
  };
}

// 任务相关颜色
export interface TaskColors {
  priority: {
    high: {
      bg: string;
      text: string;
      border: string;
    };
    medium: {
      bg: string;
      text: string;
      border: string;
    };
    low: {
      bg: string;
      text: string;
      border: string;
    };
  };
  
  status: {
    inProgress: {
      bg: string;
      text: string;
      border: string;
    };
    completed: {
      bg: string;
      text: string;
      border: string;
    };
    overdue: {
      bg: string;
      text: string;
      border: string;
    };
    waiting: {
      bg: string;
      text: string;
      border: string;
    };
  };
  
  // 任务卡片渐变色
  gradients: string[];
}

// Dashboard专用主题配置
export interface DashboardTheme {
  // 仪表盘卡片样式
  cards: {
    // 主要数据卡片（不跟随主题）
    primary: {
      gradient: string;
      text: string;
      subtext: string;
      border: string;
      icon: string;
    };
    // 次要数据卡片（跟随主题）
    secondary: {
      background: string;
      text: string;
      subtext: string;
      border: string;
      hover: string;
    };
    // 活动卡片
    activity: {
      background: string;
      border: string;
      hover: string;
    };
  };
  
  // 特定图表样式
  charts: {
    // 基础图表（跟随主题）
    base: {
      grid: string;
      text: string;
      axis: string;
    };
    // 固定配色方案（不跟随主题）
    palette: {
      primary: string[];
      secondary: string[];
      accent: string[];
    };
  };
  
  // 数据展示区域背景
  sections: {
    main: {
      background: string;
      border: string;
    };
    sidebar: {
      background: string;
      border: string;
    };
    highlight: {
      background: string;
      border: string;
    };
  };
}

// 完整主题定义
export interface ThemeDefinition {
  mode: ThemeMode;
  colors: ColorSystem;
  taskColors: TaskColors;
  dashboard: DashboardTheme; // 新增dashboard主题配置
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// 导出主题上下文的类型
export interface ThemeContextType {
  theme: ThemeDefinition;
  mode: ThemeMode;
  toggleTheme: () => void;
  resetToSystemTheme: () => void;
  isDark: boolean;
  isSystemTheme: boolean;
}
