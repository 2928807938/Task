'use client'

import React, {useCallback, useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';

/**
 * 全局加载指示器
 * 特点：
 * 1. 简洁优雅的动画
 * 2. 柔和的透明度和模糊效果
 * 3. 最小化干扰用户体验
 * 4. 响应式设计，适应不同屏幕尺寸
 */
export const GlobalLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<string>('页面加载中');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // 显示加载状态的函数
  const showLoader = useCallback((type: string = '页面加载中') => {
    setActionType(type);
    setIsLoading(true);
  }, []);

  // 隐藏加载状态的函数
  const hideLoader = useCallback(() => {
    // 设置短延迟，确保动画完成
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  // 监听路由变化
  useEffect(() => {
    const handleStart = () => {
      showLoader('页面加载中');
    };

    const handleComplete = () => {
      hideLoader();
    };

    // 创建自定义事件处理函数
    const handleCustomStart = (event: CustomEvent) => {
      const detail = event.detail || {};
      showLoader(detail.actionType || '处理中');
    };

    const handleCustomComplete = () => {
      hideLoader();
    };

    // 添加路由事件监听
    window.addEventListener('routeChangeStart', handleStart);
    window.addEventListener('routeChangeComplete', handleComplete);
    window.addEventListener('routeChangeError', handleComplete);

    // 添加自定义事件监听
    window.addEventListener('showGlobalLoader', handleCustomStart as EventListener);
    window.addEventListener('hideGlobalLoader', handleCustomComplete);

    // 监听按钮点击事件，预加载相关资源 - 使用capture确保在捕获阶段就处理
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button, a, [role="button"]');

      if (button) {
        // 如果是导航按钮，立即显示加载状态
        const href = button.getAttribute('href');
        const navigateAttr = button.getAttribute('data-navigate');
        const isNavigationButton = button.getAttribute('data-navigation') === 'true';

        if (href || navigateAttr || isNavigationButton) {
          // 使用RAF确保在下一帧显示，但不延迟
          requestAnimationFrame(() => {
            showLoader('页面准备中');
          });
        }
      }
    };

    document.addEventListener('click', handleButtonClick, { capture: true });

    return () => {
      // 移除所有事件监听
      window.removeEventListener('routeChangeStart', handleStart);
      window.removeEventListener('routeChangeComplete', handleComplete);
      window.removeEventListener('routeChangeError', handleComplete);
      window.removeEventListener('showGlobalLoader', handleCustomStart as EventListener);
      window.removeEventListener('hideGlobalLoader', handleCustomComplete);
      document.removeEventListener('click', handleButtonClick, { capture: true });
    };
  }, [showLoader, hideLoader]);

  // 监听路由参数变化也触发加载状态 - 使用ref避免重复触发
  const prevPathRef = React.useRef(pathname);
  const prevParamsRef = React.useRef(searchParams?.toString());

  useEffect(() => {
    // 记录当前路径和参数
    const currentParams = searchParams?.toString();

    // 比较是否真正变化了
    if (pathname !== undefined &&
        (pathname !== prevPathRef.current || currentParams !== prevParamsRef.current)) {
      // 立即显示加载状态，不设置延迟
      showLoader('页面加载中');

      // 页面内容加载完成后，取消加载状态
      const timer = setTimeout(() => {
        hideLoader();
      }, 300); // 减少等待时间

      // 更新引用值
      prevPathRef.current = pathname;
      prevParamsRef.current = currentParams;

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, showLoader, hideLoader]);

  // 暴露全局方法用于手动触发加载状态 - 优化直接调用
  useEffect(() => {
    // 定义全局方法 - 直接调用性能更好
    window.showGlobalLoading = (actionType: string = '处理中') => {
      // 直接调用内部方法，避免事件调度延迟
      showLoader(actionType);
    };

    window.hideGlobalLoading = () => {
      // 直接调用内部方法，避免事件调度延迟
      hideLoader();
    };

    // 仍然保留事件监听以兼容其他调用方式
    const handleCustomStart = (event: CustomEvent) => {
      const detail = event.detail || {};
      showLoader(detail.actionType || '处理中');
    };

    const handleCustomComplete = () => {
      hideLoader();
    };

    window.addEventListener('showGlobalLoader', handleCustomStart as EventListener);
    window.addEventListener('hideGlobalLoader', handleCustomComplete);

    return () => {
      // 清理全局方法和事件监听
      delete window.showGlobalLoading;
      delete window.hideGlobalLoading;
      window.removeEventListener('showGlobalLoader', handleCustomStart as EventListener);
      window.removeEventListener('hideGlobalLoader', handleCustomComplete);
    };
  }, [showLoader, hideLoader]);

  // 使用AnimatePresence实现优雅的进出场动画
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }} // 减少动画时间，更快显示
        >
          <div className="relative">
            {/* 精致模糊背景 */}
            <motion.div
              className="absolute inset-0 bg-white/30 dark:bg-gray-900/40 rounded-2xl backdrop-blur-xl"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                width: '120px',
                height: '120px',
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />

            {/* 主要加载动画 */}
            <div className="w-[120px] h-[120px] flex flex-col items-center justify-center">
              {/* 圆形加载指示器 */}
              <div className="relative mb-2">
                <div className="w-12 h-12 rounded-full relative flex items-center justify-center">
                  {/* 旋转动画 */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-blue-500/10 dark:border-blue-400/10 border-t-blue-500 dark:border-t-blue-400"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.2,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                  />

                  {/* 中心图标 */}
                  <motion.div
                    className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center"
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="M12 8v4l2 2" />
                    </svg>
                  </motion.div>
                </div>

                {/* 底部光晕效果 */}
                <motion.div
                  className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-500/5 to-indigo-500/5 blur-xl z-[-1]"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* 加载文字 - 动态显示不同操作类型 */}
              <motion.p
                className="text-xs font-medium text-gray-600 dark:text-gray-300"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                key={actionType} // 确保文本变化时有动画
              >
                {actionType}
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoader;
