import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';

/**
 * 任务分析加载视图组件
 * 用于SSE任务分析过程中显示加载状态
 * 设计遵循苹果人机交互规范，提供友好的动态反馈
 */
const AnalysisLoadingView: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  // 添加状态跟踪关闭事件
  const [closeAttempted, setCloseAttempted] = useState(false);

  // 尝试关闭弹框的函数 - 优化版
  const attemptClose = (immediate = false) => {
    // 如果已经尝试过关闭，不重复处理
    if (closeAttempted && !immediate) return;

    setCloseAttempted(true);

    if (onClose) {
      // 直接执行关闭回调，不等待事件循环
      setTimeout(() => onClose(), 0);
    } else {
      // 触发全局关闭事件
      window.dispatchEvent(new CustomEvent('forceCloseModal', { detail: { immediate: true } }));
    }
  };

  // 监听强制关闭事件
  useEffect(() => {

    const handleForceClose = (event: Event) => {
      // 检查是否是立即模式
      const customEvent = event as CustomEvent;
      const immediate = customEvent.detail?.immediate === true;
      attemptClose(immediate);
    };

    // 监听两种关闭事件
    window.addEventListener('forceCloseAnalysisLoading', handleForceClose);
    window.addEventListener('forceCloseModal', handleForceClose);

    // 添加定时器，如果长时间没有关闭，尝试自动关闭
    const autoCloseTimer = setTimeout(() => {
      attemptClose();
    }, 30000); // 30秒后自动关闭，防止卡死

    // 清理函数
    return () => {
      window.removeEventListener('forceCloseAnalysisLoading', handleForceClose);
      window.removeEventListener('forceCloseModal', handleForceClose);
      clearTimeout(autoCloseTimer);
    };
  }, [onClose]);

  // 如果已经尝试关闭，但还没有关闭成功，再次尝试
  useEffect(() => {
    if (closeAttempted) {
      const retryTimer = setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 1000);

      return () => clearTimeout(retryTimer);
    }
  }, [closeAttempted, onClose]);


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/25 backdrop-blur-md z-50">
      <motion.div
        className="bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl text-center max-w-md mx-auto p-8 relative overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* 本次分析图标 - 使用图标动画 */}
        <div className="mb-8 relative z-10">
          <div className="relative mx-auto w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <motion.div
              className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 dark:border-t-blue-400 animate-spin"
              style={{ animationDuration: '1.8s' }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            />

            {/* 苹果风格微妙光效 */}
            <div className="absolute -inset-3 rounded-full border border-blue-200/30 dark:border-blue-700/30"></div>
            <div className="absolute -inset-6 rounded-full border border-blue-100/20 dark:border-blue-800/20 animate-pulse"></div>
          </div>
        </div>

        {/* 标题和描述文本 - 苹果风格友好提示 */}
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-3 relative z-10 tracking-tight">
          任务分配中
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed max-w-sm mx-auto">
          我们正在为您智能分配任务结构，这将帮助您优化工作流程并提高团队协作效率。
        </p>



        {/* 苹果风格加载指示器 */}
        <div className="relative my-2 flex justify-center">
          <div className="flex space-x-1 py-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500/70 dark:bg-blue-400/70 rounded-full"
                animate={{ scale: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>

        {/* 苹果风格渐变背景光效 */}
        <motion.div
          className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-purple-500/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-400/5 to-indigo-500/5 rounded-full blur-3xl"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 2.5 }}
        />

        {/* 苹果风格底部提示文本 */}
        <motion.p
          className="text-xs text-gray-400 dark:text-gray-500 mt-8 italic font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          分析完成后将自动跳转
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AnalysisLoadingView;
