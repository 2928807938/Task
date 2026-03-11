'use client';

import React from 'react';

interface ViewOption {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface ViewSelectorProps {
  activeView: string;
  onChange: (viewId: string) => void;
  options: ViewOption[];
  className?: string;
}

/**
 * 视图选择器组件
 * 用于在不同视图（卡片、列表、看板等）之间切换
 */
const ViewSelector: React.FC<ViewSelectorProps> = ({
  activeView,
  onChange,
  options,
  className = '',
}) => {
  return (
    <div className={`w-full bg-white dark:bg-neutral-800 rounded-md border border-gray-200 dark:border-neutral-700 flex items-center overflow-hidden ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          className={`px-3 py-2 text-xs flex items-center ${
            activeView === option.id
              ? 'text-blue-600 font-medium bg-blue-50 border-b-2 border-blue-600 dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-neutral-700'
          }`}
          onClick={() => onChange(option.id)}
        >
          {option.icon && <span className="mr-1.5 h-3 w-3">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default ViewSelector;
