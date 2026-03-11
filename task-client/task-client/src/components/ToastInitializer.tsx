'use client';

import {useEffect, useState} from 'react';
import {toast} from '@/ui/molecules/Toast';

/**
 * Toast初始化组件
 * 用于在应用启动时验证Toast系统的可用性
 * 注意：这个组件在新的全局toast实例下已不再必要，但保留以便验证系统可用性
 */
const ToastInitializer: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  // 在组件挂载时验证Toast功能
  useEffect(() => {
    // 测试toast实例是否可用
    setTimeout(() => {
      try {
        // 测试是否可以调用函数（但不实际显示）
        if (typeof toast.info === 'function') {
          setIsInitialized(true);

          // 在生产环境中注释下面这行代码
          // toast.info('通知系统已准备就绪', 2000);
        }
      } catch (error) {
        console.warn('Toast组件初始化检查失败:', error);
      }
    }, 500);

    return () => {
      setIsInitialized(false);
    };
  }, []);

  // 这个组件不渲染任何内容
  return null;
};

export default ToastInitializer;
