'use client';

import React from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {motion} from 'framer-motion';
import {FiArrowLeft, FiHome} from 'react-icons/fi';

/**
 * 404页面组件 - 严格遵循苹果设计规范
 *
 * 苹果设计原则：
 * 1. 简约性 - 减少视觉噪音，专注于内容
 * 2. 直接交互 - 清晰的视觉层次和直观的操作
 * 3. 反馈 - 提供微妙但有效的交互反馈
 * 4. 深度 - 通过精细的阴影和半透明效果创造深度
 */
const NotFoundPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f5f5f7] dark:bg-[#1a1a1a] px-6 py-12 transition-colors duration-300">
      {/* 主容器 - 使用苹果设计的卡片式布局 */}
      <motion.div
        className="w-full max-w-xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* 顶部导航 */}
        <motion.div
          className="mb-8 flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
        </motion.div>

        {/* 主内容区 */}
        <motion.div
          className="bg-white dark:bg-[#1c1c1e] rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-800/20 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* 移除顶部状态栏 */}

          <div className="px-8 pt-14 pb-12 sm:px-14 sm:pt-16 sm:pb-16">
            {/* 错误状态图标 */}
            <div className="flex justify-center mb-10">
              <motion.div
                className="w-20 h-20 rounded-full bg-[#f5f5f7] dark:bg-[#2c2c2e] flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
              >
                <span className="text-[#007aff] dark:text-[#0a84ff] text-3xl font-light">404</span>
              </motion.div>
            </div>

            {/* 错误信息 - 优化文本样式 */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-[#1d1d1f] dark:text-white text-[28px] font-semibold tracking-tight mb-3">
                无法找到该页面
              </h1>
              <p className="text-[#6e6e73] dark:text-[#a1a1a6] text-base max-w-md mx-auto leading-relaxed">
                您访问的页面可能已被移除、更改名称或暂时不可用。
              </p>
            </motion.div>

            {/* 操作按钮 - 优化按钮样式 */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={() => router.push('/')}
                className="flex items-center justify-center px-5 py-2 min-w-[110px] bg-[#007aff] dark:bg-[#0a84ff] text-white text-sm font-medium rounded-full focus:outline-none transition-opacity duration-200"
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiHome className="mr-1.5 h-3.5 w-3.5" />
                前往首页
              </motion.button>

              <motion.button
                onClick={() => router.back()}
                className="flex items-center justify-center px-5 py-2 min-w-[110px] bg-[#f5f5f7] dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white text-sm font-medium rounded-full border border-gray-200/60 dark:border-gray-800/60 focus:outline-none transition-opacity duration-200"
                whileHover={{ opacity: 0.9 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                返回上一页
              </motion.button>
            </motion.div>
          </div>
        </motion.div>

        {/* 底部帮助文本 - 优化文本样式 */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>
            <Link href="/contact" className="text-sm text-[#007aff] dark:text-[#2997ff] hover:underline transition-colors">获取支持</Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
