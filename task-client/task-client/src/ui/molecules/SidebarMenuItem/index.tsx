'use client';

import React, {ReactNode} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

export interface MenuItemProps {
  icon: ReactNode;
  title: string;
  path: string;
  badge?: {
    text: string;
    color: 'red' | 'green' | 'blue' | 'yellow' | 'purple';
  };
  isActive?: boolean;
  isSubmenuItem?: boolean;
  onClick?: () => void;
}

const SidebarMenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  path,
  badge,
  isActive,
  isSubmenuItem = false,
  onClick
}) => {
  const pathname = usePathname();
  const currentActive = isActive !== undefined ? isActive : pathname === path;

  const badgeColors = {
    red: 'bg-error-500 dark:bg-error-600',
    green: 'bg-success-500 dark:bg-success-600',
    blue: 'bg-primary-500 dark:bg-primary-600',
    yellow: 'bg-warning-500 dark:bg-warning-600',
    purple: 'bg-purple-500 dark:bg-purple-600'
  };

  return (
    <Link
      href={path}
      className={`
        flex items-center justify-between px-1.5 py-1 rounded transition-all duration-200
        ${isSubmenuItem ? 'pl-6' : 'pl-1.5'}
        ${currentActive 
          ? 'bg-primary-600 dark:bg-primary-700 text-white' 
          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
        }
        ${isSubmenuItem && !currentActive ? 'text-neutral-500 dark:text-neutral-500' : ''}
        relative group
      `}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-center">
        <span className={`${isSubmenuItem ? 'w-3 h-3 mr-1' : 'w-3.5 h-3.5 mr-1.5'}`}>
          {icon}
        </span>
        <span className={`${isSubmenuItem ? 'text-xs' : 'text-xs'}`}>{title}</span>
      </div>

      {badge && (
        <div className={`${badgeColors[badge.color]} text-white text-[10px] font-medium px-1 py-0 rounded-full leading-tight`}>
          {badge.text}
        </div>
      )}

      {currentActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-400 dark:bg-primary-500 rounded-r"></div>
      )}
    </Link>
  );
};

export default SidebarMenuItem;
