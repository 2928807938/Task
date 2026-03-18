'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

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
  onPageChange,
}) => {
  if (filteredCount === 0) return null;

  const getPageNumbers = () => {
    const pages: Array<number | string> = [];

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page += 1) {
      pages.push(page);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);
    return pages;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="surface-card mt-6 flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="text-sm text-[var(--theme-neutral-500)]">
        当前页展示 <span className="font-semibold text-[var(--foreground)]">{filteredCount}</span> 个项目，
        共 <span className="font-semibold text-[var(--foreground)]">{totalProjects}</span> 个项目。
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--theme-card-border)] bg-white/75 text-[var(--foreground)] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/5"
            aria-label="上一页"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>

          <div className="app-segmented">
            {getPageNumbers().map((page, index) => (
              page === '...'
                ? <span key={`ellipsis-${index}`} className="px-2 text-sm text-[var(--theme-neutral-400)]">...</span>
                : (
                  <button
                    key={page}
                    onClick={() => onPageChange(Number(page))}
                    className={`app-segmented-item min-w-[2.5rem] ${currentPage === page ? 'app-segmented-item-active' : ''}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
            ))}
          </div>

          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--theme-card-border)] bg-white/75 text-[var(--foreground)] shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/5"
            aria-label="下一页"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectListPagination;
