'use client';

import React from 'react';

interface ViewModeToggleProps {
  activeMode: 'grid' | 'list';
  onChange: (mode: 'grid' | 'list') => void;
  className?: string;
}

/**
 * 视图模式切换组件
 * 用于在网格模式和列表模式之间切换
 */
const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  activeMode,
  onChange,
  className = '',
}) => {
  return (
    <div className={`inline-flex rounded-full border border-gray-200 bg-white p-0.5 ${className}`}>
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`flex items-center justify-center rounded-full p-1.5 text-xs font-medium transition-all ${
          activeMode === 'grid'
            ? 'bg-blue-500 text-white'
            : 'bg-transparent text-gray-500 hover:bg-gray-100'
        }`}
        title="网格视图"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`flex items-center justify-center rounded-full p-1.5 text-xs font-medium transition-all ${
          activeMode === 'list'
            ? 'bg-blue-500 text-white'
            : 'bg-transparent text-gray-500 hover:bg-gray-100'
        }`}
        title="列表视图"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default ViewModeToggle;
