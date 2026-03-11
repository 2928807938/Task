'use client';

import React from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiCalendar, FiLock, FiStar, FiX} from 'react-icons/fi';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 半透明背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 模态框内容 */}
          <motion.div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md border border-gray-200/50 dark:border-gray-700/50"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* 功能图标 - 带闪光效果 */}
            <div className="relative w-full p-8 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent">
              {/* 关闭按钮 - 半透明，调整到右上角 */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20"
                aria-label="关闭"
              >
                <FiX size={18} />
              </button>

              {/* 闪光效果 */}
              <motion.div
                className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-blue-200/80 via-purple-200/80 to-pink-200/80 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }}
              />

              {/* 功能图标 */}
              <motion.div
                className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 shadow-lg flex items-center justify-center mb-4 border border-white/50 dark:border-gray-700/50"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 360 }}
                transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
              >
                {icon}
              </motion.div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2 relative">
                {title}
                <motion.span
                  className="absolute -top-1 -right-6 text-yellow-500"
                  animate={{ rotate: [0, 15, 0, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <FiStar size={16} />
                </motion.span>
              </h2>
            </div>

            {/* 内容区域 */}
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {description}
              </p>

              {/* 徽章 */}
              <div className="flex justify-center mb-6">
                <div className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                  <FiCalendar className="mr-1" size={12} />
                  即将推出
                </div>
              </div>

              {/* 确认按钮 */}
              <motion.button
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
              >
                <FiLock size={16} />
                <span>知道了</span>
              </motion.button>

              {/* 底部提示 */}
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                我们正在努力开发此功能，敬请期待！
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonModal;
