'use client';

import React, {useState, useCallback, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {
  FiGrid,
  FiSettings,
  FiMinimize,
  FiMaximize,
  FiSquare,
  FiCheck,
} from 'react-icons/fi';

export type LayoutMode = 'compact' | 'comfortable' | 'spacious';

interface LayoutSwitcherProps {
  className?: string;
  currentMode?: LayoutMode;
  onModeChange?: (mode: LayoutMode) => void;
  showLabel?: boolean;
}

interface LayoutOption {
  id: LayoutMode;
  name: string;
  description: string;
  icon: React.ElementType;
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: 'compact',
    name: '紧凑',
    description: '最大化信息密度，适合处理大量任务',
    icon: FiMinimize,
  },
  {
    id: 'comfortable',
    name: '舒适',
    description: '平衡的信息密度和可读性',
    icon: FiSquare,
  },
  {
    id: 'spacious',
    name: '宽松',
    description: '优化可读性和视觉舒适度',
    icon: FiMaximize,
  },
];

export const LayoutSwitcher: React.FC<LayoutSwitcherProps> = ({
  className = '',
  currentMode = 'comfortable',
  onModeChange,
  showLabel = false,
}) => {
  const [selectedMode, setSelectedMode] = useState<LayoutMode>(currentMode);
  const [isOpen, setIsOpen] = useState(false);

  const handleModeChange = useCallback((mode: LayoutMode) => {
    setSelectedMode(mode);
    onModeChange?.(mode);
    setIsOpen(false);
    localStorage.setItem('dashboard-layout-mode', mode);
  }, [onModeChange]);

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('dashboard-layout-mode') as LayoutMode;
      if (savedMode && LAYOUT_OPTIONS.some((option) => option.id === savedMode)) {
        setSelectedMode(savedMode);
        onModeChange?.(savedMode);
      }
    } catch (error) {
      console.warn('Failed to load layout mode from localStorage:', error);
    }
  }, [onModeChange]);

  const currentOption = LAYOUT_OPTIONS.find((option) => option.id === selectedMode) || LAYOUT_OPTIONS[1];

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-sm"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          border: '1px solid var(--theme-card-border)',
          color: 'var(--theme-neutral-600)',
        }}
        whileHover={{scale: 1.02}}
        whileTap={{scale: 0.98}}
      >
        <currentOption.icon className="h-4 w-4" />
        {showLabel && (
          <>
            <span className="ml-2 text-sm font-medium">{currentOption.name}</span>
            <motion.div
              animate={{rotate: isOpen ? 180 : 0}}
              transition={{duration: 0.2}}
              className="ml-2"
            >
              <FiGrid className="h-3 w-3" />
            </motion.div>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{opacity: 0, y: -10, scale: 0.95}}
              animate={{opacity: 1, y: 0, scale: 1}}
              exit={{opacity: 0, y: -10, scale: 0.95}}
              transition={{duration: 0.15}}
              className="absolute right-0 top-full z-50 mt-2 flex max-h-[min(16rem,calc(100vh-9rem))] w-[300px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[20px] border shadow-xl"
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-card-border)',
                boxShadow: 'var(--theme-shadow-lg)',
              }}
            >
              <div className="border-b px-3.5 py-3" style={{borderColor: 'var(--theme-card-border)'}}>
                <div className="flex items-center">
                  <FiSettings className="mr-2 h-4 w-4" style={{color: 'var(--theme-primary-500)'}} />
                  <h3 className="text-sm font-medium" style={{color: 'var(--foreground)'}}>
                    布局设置
                  </h3>
                </div>
                <p className="mt-1 text-[11px] leading-5" style={{color: 'var(--theme-neutral-500)'}}>
                  选择适合您的工作方式的布局密度
                </p>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pr-1.5">
                {LAYOUT_OPTIONS.map((option, index) => {
                  const isSelected = selectedMode === option.id;
                  const Icon = option.icon;

                  return (
                    <motion.button
                      key={option.id}
                      initial={{opacity: 0, x: -20}}
                      animate={{opacity: 1, x: 0}}
                      transition={{duration: 0.1, delay: index * 0.05}}
                      onClick={() => handleModeChange(option.id)}
                      className={`relative mb-2 flex w-full items-start gap-2.5 rounded-[16px] p-2.5 text-left transition-all duration-200 ${isSelected ? 'shadow-sm' : 'hover:shadow-sm'}`}
                      style={{
                        backgroundColor: isSelected ? 'var(--theme-primary-50)' : 'transparent',
                        border: isSelected ? '1px solid var(--theme-primary-200)' : '1px solid transparent',
                      }}
                      whileHover={{scale: 1.01}}
                      whileTap={{scale: 0.99}}
                    >
                      <div
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: isSelected ? 'var(--theme-primary-100)' : 'var(--theme-neutral-100)',
                        }}
                      >
                        <Icon
                          className="h-3.5 w-3.5"
                          style={{
                            color: isSelected ? 'var(--theme-primary-600)' : 'var(--theme-neutral-500)',
                          }}
                        />
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{scale: 0}}
                          animate={{scale: 1}}
                          className="absolute left-1.5 top-6 flex h-4 w-4 items-center justify-center rounded-full"
                          style={{backgroundColor: 'var(--theme-primary-500)'}}
                        >
                          <FiCheck className="h-2.5 w-2.5 text-white" />
                        </motion.div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h4
                          className="text-sm font-medium"
                          style={{
                            color: isSelected ? 'var(--theme-primary-700)' : 'var(--foreground)',
                          }}
                        >
                          {option.name}布局
                        </h4>
                        <p className="mt-1 text-[11px] leading-4.5" style={{color: 'var(--theme-neutral-500)'}}>
                          {option.description}
                        </p>

                        <div className="mt-2 flex items-center gap-1">
                          {[1, 2, 3].map((item) => (
                            <div
                              key={item}
                              className="rounded-md border"
                              style={{
                                backgroundColor: 'var(--theme-neutral-50)',
                                borderColor: 'var(--theme-neutral-200)',
                                width: option.id === 'compact' ? '14px' : option.id === 'comfortable' ? '16px' : '18px',
                                height: option.id === 'compact' ? '10px' : option.id === 'comfortable' ? '12px' : '14px',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div
                className="border-t px-3.5 py-2 text-center text-[11px]"
                style={{
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-neutral-400)',
                  backgroundColor: 'var(--theme-neutral-25)',
                }}
              >
                您的布局偏好会自动保存
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LayoutSwitcher;
