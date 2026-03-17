import { QueryClient } from '@tanstack/react-query';

interface QueryErrorLike {
  status?: number;
}

const getErrorStatus = (error: Error): number | undefined => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as QueryErrorLike).status;
    return typeof status === 'number' ? status : undefined;
  }

  return undefined;
};

/**
 * 优化的React Query配置
 * 针对Dashboard和任务管理场景进行性能优化
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据保鲜时间 - 5分钟内不重新获取相同数据
      staleTime: 5 * 60 * 1000,
      
      // 缓存时间 - 30分钟后从缓存中移除
      gcTime: 30 * 60 * 1000,
      
      // 重试配置 - 网络错误时最多重试3次，每次延迟递增
      retry: (failureCount, error: Error) => {
        // 4xx错误不重试（客户端错误）
        const status = getErrorStatus(error);
        if (status !== undefined && status >= 400 && status < 500) {
          return false;
        }
        // 最多重试3次
        return failureCount < 3;
      },
      
      // 重试延迟 - 指数回退策略
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // 在网络重新连接时重新获取数据
      refetchOnReconnect: 'always',
      
      // 窗口聚焦时不自动重新获取（避免频繁请求）
      refetchOnWindowFocus: false,
      
      // 组件挂载时根据数据新鲜度决定是否重新获取
      refetchOnMount: true,
      
      // 网络模式 - 始终可以获取数据，即使离线也显示缓存数据
      networkMode: 'always',
      
      // 定义哪些错误应该设置为Error状态
      throwOnError: false,
      
      // 启用查询结构共享以优化内存使用
      structuralSharing: true,
    },
    mutations: {
      // 变更重试策略 - 更保守的重试
      retry: (failureCount, error: Error) => {
        // POST/PUT/DELETE等变更操作通常不应该重试，除非是网络错误
        const status = getErrorStatus(error);
        if (status !== undefined && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      
      // 变更重试延迟
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      
      // 网络模式
      networkMode: 'online',
    },
  },
});

/**
 * Dashboard专用查询配置
 * 用于覆盖特定查询的默认配置
 */
export const dashboardQueryConfig = {
  // Dashboard数据相对静态，可以有较长的保鲜时间
  staleTime: 10 * 60 * 1000, // 10分钟
  
  // 缓存时间较长，用户在不同页面间切换时避免重新加载
  gcTime: 60 * 60 * 1000, // 1小时
  
  // Dashboard数据变化频率低，重试次数可以多一些
  retry: 3,
  
  // 在窗口聚焦时不自动刷新，避免干扰用户
  refetchOnWindowFocus: false,
  
  // 在组件重新挂载时根据新鲜度判断
  refetchOnMount: true,
  
  // 启用后台更新，当用户不在当前标签页时也能更新数据
  refetchOnReconnect: true,
} as const;

/**
 * 实时数据查询配置
 * 用于需要频繁更新的数据
 */
export const realTimeQueryConfig = {
  // 实时数据保鲜时间短
  staleTime: 30 * 1000, // 30秒
  
  // 缓存时间相对短
  gcTime: 5 * 60 * 1000, // 5分钟
  
  // 快速重试
  retry: 1,
  retryDelay: 1000,
  
  // 窗口聚焦时立即刷新
  refetchOnWindowFocus: true,
  
  // 网络重连时立即刷新
  refetchOnReconnect: true,
} as const;

/**
 * 静态数据查询配置
 * 用于不常变化的配置类数据
 */
export const staticQueryConfig = {
  // 静态数据保鲜时间很长
  staleTime: 60 * 60 * 1000, // 1小时
  
  // 缓存时间更长
  gcTime: 24 * 60 * 60 * 1000, // 24小时
  
  // 很少需要重试
  retry: 1,
  
  // 不需要在窗口聚焦时刷新
  refetchOnWindowFocus: false,
  
  // 组件挂载时一般不需要重新获取
  refetchOnMount: false,
} as const;
