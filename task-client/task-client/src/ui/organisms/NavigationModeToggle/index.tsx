'use client';

import React from 'react';
import {FiGrid, FiMenu} from 'react-icons/fi';
import {NavigationMode} from '@/hooks/use-navigation-mode';

interface NavigationModeToggleProps {
  mode: NavigationMode;
  onChange: (mode: NavigationMode) => void;
  className?: string;
  compact?: boolean;
}

const options: Array<{id: NavigationMode; label: string; icon: React.ElementType}> = [
  {id: 'radial', label: '环形导航', icon: FiGrid},
  {id: 'sidebar', label: '侧边导航', icon: FiMenu},
];

const NavigationModeToggle: React.FC<NavigationModeToggleProps> = ({mode, onChange, className = '', compact = false}) => {
  return (
    <div className={`app-segmented ${className}`} role="tablist" aria-label="导航模式切换">
      {options.map((option) => {
        const Icon = option.icon;
        const active = mode === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            role="tab"
            aria-selected={active}
            aria-pressed={active}
            className={`app-segmented-item flex items-center ${compact ? 'gap-1.5 px-2.5' : 'gap-2'} ${active ? 'app-segmented-item-active' : ''}`}
          >
            <Icon className="h-4 w-4" />
            {!compact && <span className="whitespace-nowrap">{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default NavigationModeToggle;
