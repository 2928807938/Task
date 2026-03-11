'use client';

import React from 'react';
import {FiFilter, FiSearch, FiX} from 'react-icons/fi';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  className?: string;
}

/**
 * 通用搜索栏组件
 * 用于统一展示搜索和筛选功能
 */
const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = '搜索...',
  value,
  onChange,
  onSearch,
  showFilters = false,
  onToggleFilters,
  className = '',
}) => {
  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // 清除搜索内容
  const handleClear = () => {
    onChange('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex-1 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>

        <input
          type="text"
          value={value}
          onChange={handleChange}
          className="w-full p-2 pl-10 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
          placeholder={placeholder}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-10 flex items-center pr-1"
          >
            <FiX className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
          </button>
        )}

        {onToggleFilters && (
          <button
            type="button"
            onClick={onToggleFilters}
            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${showFilters ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
          >
            <FiFilter className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
