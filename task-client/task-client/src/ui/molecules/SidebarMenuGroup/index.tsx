'use client';

import React, {ReactNode, useState} from 'react';

interface SidebarMenuGroupProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultExpanded?: boolean;
}

const SidebarMenuGroup: React.FC<SidebarMenuGroupProps> = ({
  title,
  icon,
  children,
  defaultExpanded = true
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-2">
      <button
        className="flex items-center justify-between w-full px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          {icon && <span className="w-5 h-5 mr-3">{icon}</span>}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default SidebarMenuGroup;
