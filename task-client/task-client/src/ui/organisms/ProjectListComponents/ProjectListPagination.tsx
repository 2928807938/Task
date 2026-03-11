'use client';

import React from 'react';
import {motion} from 'framer-motion';
import {FiChevronLeft, FiChevronRight} from 'react-icons/fi';

interface ProjectListPaginationProps {
  currentPage: number;
  totalPages: number;
  totalProjects: number;
  filteredCount: number;
  onPageChange: (page: number) => void;
}

const ProjectListPagination: React.FC<ProjectListPaginationProps> = ({
  currentPage,
  totalPages,
  totalProjects,
  filteredCount,
  onPageChange
}) => {
  if (filteredCount === 0) return null;

  // 创建页面数组，用于分页显示
  const getPageNumbers = () => {
    const pages = [];
    // 显示当前页附近的页码

    // 总是显示第一页
    if (currentPage > 3) {
      pages.push(1);
      // 如果当前页不是第2页或第3页，添加省略号
      if (currentPage > 4) {
        pages.push('...');
      }
    }

    // 显示当前页前后的页码
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }

    // 总是显示最后一页
    if (currentPage < totalPages - 2) {
      // 如果当前页不是倒数第2或第3页，添加省略号
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="flex flex-col sm:flex-row justify-between items-center mt-6 mb-4 px-1"
    >
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-0">
        显示 <span className="font-medium text-gray-700 dark:text-gray-300">{filteredCount}</span> 个项目
        {filteredCount !== totalProjects && (
          <span>（共 <span className="font-medium text-gray-700 dark:text-gray-300">{totalProjects}</span> 个）</span>
        )}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center">
          <div className="flex bg-gray-100 dark:bg-gray-800/70 p-1 rounded-lg shadow-sm">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage <= 1}
              className={`p-1.5 rounded-md flex items-center justify-center ${
                currentPage <= 1 
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors'
              }`}
              aria-label="上一页"
            >
              <FiChevronLeft size={16} />
            </button>

            <div className="flex items-center mx-1">
              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400 dark:text-gray-500">
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => onPageChange(Number(page))}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm transition-all duration-200 ${
                      currentPage === page 
                        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-700/80'
                    }`}
                    aria-label={`第 ${page} 页`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className={`p-1.5 rounded-md flex items-center justify-center ${
                currentPage >= totalPages 
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 transition-colors'
              }`}
              aria-label="下一页"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectListPagination;
