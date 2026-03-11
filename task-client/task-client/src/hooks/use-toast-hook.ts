import { useCallback } from 'react';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

/**
 * Toast通知Hook
 * 简单的通知系统，可以集成更复杂的toast库
 */
export const useToast = () => {
  const showToast = useCallback((options: ToastOptions) => {
    // 这里可以集成实际的toast库，比如react-hot-toast或者自定义toast组件
    // 现在使用简单的console.log作为fallback
    const { title, description, variant = 'default', duration = 3000 } = options;
    
    if (typeof window !== 'undefined') {
      // 在浏览器环境中可以显示实际的通知
      console.log(`[Toast ${variant.toUpperCase()}] ${title}${description ? `: ${description}` : ''}`);
      
      // 可以在这里实现实际的toast显示逻辑
      // 比如触发全局状态更新，或者调用toast库的API
    }
  }, []);

  return {
    showToast
  };
};