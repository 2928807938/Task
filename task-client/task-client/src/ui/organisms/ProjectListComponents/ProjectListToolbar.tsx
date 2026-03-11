'use client';

import React, {useState} from 'react';
import {FiChevronDown, FiChevronUp, FiFilter, FiGrid, FiList, FiSearch, FiSliders, FiX} from 'react-icons/fi';
import {AnimatePresence, motion} from 'framer-motion';

interface ProjectListToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortDirection: 'asc' | 'desc';
  toggleSortDirection: () => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

const ProjectListToolbar: React.FC<ProjectListToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  sortDirection,
  toggleSortDirection,
  viewMode,
  setViewMode
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden mb-6" style={{ backdropFilter: 'blur(20px)' }}>
      {/* 顶部搜索栏和操作区 */}
      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 backdrop-blur-sm">
        <div className="flex items-center flex-1 min-w-[280px] max-w-md">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-300 dark:focus:border-blue-700 transition-all"
              placeholder="搜索项目..."
              value={searchQuery}
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value === '') {
                  // 如果清空搜索，立即触发搜索
                }
              }}
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setSearchQuery('')}
              >
                <FiX size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* 视图切换 - 苹果风格分段控件 */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-0.5 rounded-full overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              <span className="flex items-center"><FiGrid className="mr-1.5" size={12} /> 网格</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              <span className="flex items-center"><FiList className="mr-1.5" size={12} /> 列表</span>
            </button>
          </div>

          {/* 筛选和排序 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${showFilters ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              <FiFilter size={12} className="mr-1.5" />
              筛选
              {showFilters ? <FiChevronUp className="ml-1" size={12} /> : <FiChevronDown className="ml-1" size={12} />}
            </button>

            <button
              onClick={toggleSortDirection}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              <FiSliders size={12} className="mr-1.5" />
              {sortDirection === 'asc' ? '升序' : '降序'}
            </button>
          </div>
        </div>
      </div>

      {/* 高级筛选面板 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-gray-200 dark:border-gray-800"
          >
            <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">项目筛选</h3>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-center">
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-10 h-10 text-blue-500 dark:text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">高级筛选功能即将上线</h3>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70">我们正在为您开发更多强大的项目筛选功能，敬请期待！</p>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <button className="px-4 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors flex items-center font-medium" disabled>
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                  我们会通知您功能上线
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectListToolbar;
