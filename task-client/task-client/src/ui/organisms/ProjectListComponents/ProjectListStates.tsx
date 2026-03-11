'use client';

import React from 'react';
import {FiAlertTriangle, FiLoader, FiPlus} from 'react-icons/fi';
import {motion} from 'framer-motion';

// 组件类型定义
interface LoadingStateProps {
  message?: string;
  viewMode?: 'grid' | 'list';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = '正在加载项目...', viewMode = 'list' }) => {
  return (
    <div className="w-full">
      {/* 工具栏加载状态 */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm">
          <div className="flex items-center flex-1 min-w-[280px] max-w-md">
            <div className="relative flex-1">
              <div className="w-full h-10 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-32 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="w-24 h-9 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="w-24 h-9 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        // 表格模式加载效果
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/90 dark:bg-gray-900/90 rounded-2xl overflow-hidden border border-gray-100/60 dark:border-gray-800/60 shadow-sm backdrop-blur-sm"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-100/60 dark:bg-gray-800/40 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                  <th className="px-6 py-3 text-center">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </th>
                  <th className="px-6 py-3 text-center">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </th>
                  <th className="px-6 py-3 text-center">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </th>
                  <th className="px-6 py-3 text-center">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </th>
                  <th className="px-6 py-3 text-center">
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {/* 项目行骨架屏 */}
                {[...Array(7)].map((_, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    {/* 项目名称和描述 */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
                        <div className="ml-4">
                          <div className="h-4 w-36 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </td>

                    {/* 状态 */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                    </td>

                    {/* 进度 */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full animate-pulse mr-2"></div>
                        <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    </td>

                    {/* 创建时间 */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    </td>

                    {/* 成员 */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <div className="flex -space-x-2">
                          {[...Array(3)].map((_, j) => (
                            <div key={j} className="h-6 w-6 rounded-full bg-gray-200 animate-pulse"></div>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* 操作按钮 */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="h-4 w-10 bg-gray-200 rounded animate-pulse mx-auto"></div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        // 网格模式加载效果
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-sm overflow-hidden border border-gray-100/60 dark:border-gray-700/60 h-full backdrop-blur-sm"
            >
              {/* 项目头部背景 */}
              <div className="h-24 relative flex items-center justify-center bg-gray-100/80 animate-pulse rounded-t-2xl backdrop-blur-sm"></div>

              <div className="p-4">
                {/* 项目标题 */}
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-6 animate-pulse"></div>

                {/* 项目描述 */}
                <div className="space-y-2 mb-6">
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse mt-2"></div>
                </div>

                {/* 进度条 */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1.5">
                    <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse"></div>
                </div>

                {/* 项目底部信息 */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 底部加载指示器 */}
      <div className="flex justify-center items-center mt-6 mb-4">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-blue-500 dark:text-blue-400"
          >
            <FiLoader size={16} />
          </motion.div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
        </div>
      </div>

    </div>
  );
};

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = '加载数据时发生错误',
  onRetry
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
    >
      <div className="w-20 h-20 mb-6 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <FiAlertTriangle className="text-red-500 dark:text-red-400 text-3xl" />
      </div>

      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
        出现错误
      </h3>

      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700"
            onClick={onRetry}
          >
            重新尝试
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

interface EmptyStateProps {
  onClearFilters: () => void;
  onCreateProject: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onClearFilters, onCreateProject }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-900/90 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-10 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
          className="w-24 h-24 bg-blue-50/70 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6 shadow-sm"
        >
          <svg
            className="w-12 h-12 text-blue-400 dark:text-blue-300"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.9995 16.8001L7.19961 12.0001L8.59961 10.6001L10.9996 13.0001L14.9996 9.00015L16.3996 10.4001L11.9995 16.8001Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z"
              fill="currentColor"
            />
          </svg>
        </motion.div>
        <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-3">没有找到项目</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md leading-relaxed">尝试调整您的筛选条件或创建一个新项目来开始您的工作。</p>
        <div className="flex flex-wrap justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClearFilters}
            className="px-5 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
            <span>清除筛选</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCreateProject}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-full transition-colors duration-200 shadow-sm flex items-center space-x-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>新建项目</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
