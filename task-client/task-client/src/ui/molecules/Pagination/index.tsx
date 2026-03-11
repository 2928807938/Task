'use client';

import React from 'react';
import {FiChevronLeft, FiChevronRight} from 'react-icons/fi';

export interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  current,
  pageSize,
  total,
  onChange
}) => {
  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);

  // 如果总页数小于等于1，不显示分页
  if (totalPages <= 1) {
    return null;
  }

  // 生成页码数组，最多显示5个页码
  const getPageNumbers = () => {
    const pageNumbers = [];

    // 当总页数小于等于5时，显示所有页码
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 当总页数大于5时，显示当前页码周围的页码
      if (current <= 3) {
        // 当前页码靠近开始
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (current >= totalPages - 2) {
        // 当前页码靠近结束
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // 当前页码在中间
        for (let i = current - 2; i <= current + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }

    return pageNumbers;
  };

  // 处理页码变化
  const handlePageChange = (page: number) => {
    if (page !== current && page >= 1 && page <= totalPages) {
      onChange(page);
    }
  };

  // 分页按钮样式
  const getButtonStyles = (isActive: boolean) => {
    return isActive
      ? 'bg-gray-800 text-white border-gray-800'
      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';
  };

  return (
    <div className="flex items-center justify-center space-x-1">
      {/* 上一页按钮 */}
      <button
        onClick={() => handlePageChange(current - 1)}
        disabled={current === 1}
        className={`flex items-center justify-center w-8 h-8 rounded-md border ${
          current === 1
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        } transition-colors`}
        aria-label="上一页"
      >
        <FiChevronLeft size={16} />
      </button>

      {/* 页码按钮 */}
      {getPageNumbers().map(page => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`flex items-center justify-center w-8 h-8 rounded-md border ${getButtonStyles(
            page === current
          )} transition-colors`}
          aria-label={`第${page}页`}
          aria-current={page === current ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {/* 下一页按钮 */}
      <button
        onClick={() => handlePageChange(current + 1)}
        disabled={current === totalPages}
        className={`flex items-center justify-center w-8 h-8 rounded-md border ${
          current === totalPages
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        } transition-colors`}
        aria-label="下一页"
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
};
