'use client';

import React, {ReactNode, useState} from 'react';
import {FiChevronDown, FiChevronRight} from 'react-icons/fi';
import SidebarMenuItem, {MenuItemProps} from '../SidebarMenuItem';

interface SidebarSubmenuProps {
  icon: ReactNode;
  title: string;
  badge?: {
    text: string;
    color: 'red' | 'green' | 'blue' | 'yellow' | 'purple';
  };
  children: MenuItemProps[];
  defaultOpen?: boolean;
  collapsed?: boolean;
}

const SidebarSubmenu: React.FC<SidebarSubmenuProps> = ({
  icon,
  title,
  badge,
  children,
  defaultOpen = false,
  collapsed = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // 如果侧边栏已折叠，则不显示子菜单
  if (collapsed) {
    return (
      <div
        className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span className="w-5 h-5">{icon}</span>
        </div>

        {badge && (
          <div className={`bg-${badge.color}-500 text-white text-xs font-medium px-2 py-0.5 rounded-full`}>
            {badge.text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div
        className="flex items-center justify-between px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span className="w-5 h-5 mr-3">{icon}</span>
          <span>{title}</span>
        </div>

        <div className="flex items-center">
          {badge && (
            <div className={`bg-${badge.color}-500 text-white text-xs font-medium px-2 py-0.5 rounded-full mr-2`}>
              {badge.text}
            </div>
          )}
          <span className="transition-transform duration-200">
            {isOpen ? <FiChevronDown /> : <FiChevronRight />}
          </span>
        </div>
      </div>

      <div
        className={`pl-4 space-y-1 overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {children.map((item, index) => (
          <SidebarMenuItem
            key={index}
            {...item}
            isSubmenuItem
          />
        ))}
      </div>
    </div>
  );
};

export default SidebarSubmenu;
