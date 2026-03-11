"use client";

import React, {ReactNode} from "react";
import {AnimatePresence, motion} from 'framer-motion';
import {FiChevronDown} from "react-icons/fi";
import {useTheme} from '@/ui/theme/themeContext';

interface AccordionPanelProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  initiallyOpen?: boolean;
  animationDelay?: number;
  onToggle?: () => void;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
  style?: React.CSSProperties; // 添加style属性支持
}

/**
 * 折叠面板组件
 */
const AccordionPanel: React.FC<AccordionPanelProps> = ({
  title,
  children,
  icon,
  initiallyOpen = false,
  animationDelay = 0,
  onToggle,
  iconBgColor, // 将作为主题色的备用
  iconColor,   // 将作为主题色的备用
  className = ''
}) => {
  const { theme } = useTheme();
  // 使用外部控制的isOpen状态，而不是内部状态
  const isOpen = initiallyOpen;
  
  // 使用主题色或传入的颜色
  const finalIconBgColor = iconBgColor || `${theme.colors.primary[500]}1A`; // 10% opacity
  const finalIconColor = iconColor || theme.colors.primary[500];

  // 处理面板展开/折叠状态的变化，只调用onToggle回调
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: animationDelay }}
      className={`rounded-lg overflow-hidden border-b mb-2 ${className}`}
      style={{
        backgroundColor: `${theme.colors.card.background}E6`, // 90% opacity
        borderBottomColor: theme.colors.card.border
      }}
    >
      {/* 面板标题区域 */}
      <div
        className={`px-3 py-3 flex justify-between items-center cursor-pointer ${isOpen ? 'border-b' : ''}`}
        style={{
          borderBottomColor: isOpen ? `${theme.colors.card.border}80` : 'transparent' // 50% opacity when open
        }}
        onClick={handleToggle}
      >
        <div className="flex items-center">
          {/* 图标 - 采用更简洁的样式 */}
          {icon && (
            <div className="mr-2 flex-shrink-0">
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: finalIconBgColor }}
              >
                <div 
                  style={{ color: finalIconColor }} 
                  className="text-xs"
                >
                  {icon}
                </div>
              </div>
            </div>
          )}
          <span 
            className="text-xs font-medium"
            style={{ color: theme.colors.neutral[600] }}
          >
            {title}
          </span>
        </div>
        {/* 控制展开/折叠的按钮 */}
        <button
          className="p-0.5 rounded-full transition-colors"
          style={{
            color: theme.colors.neutral[400]
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.neutral[500];
            e.currentTarget.style.backgroundColor = theme.colors.neutral[100];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.neutral[400];
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          <FiChevronDown
            className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
            size={12}
          />
        </button>
      </div>

      {/* 内容区域 - 使用AnimatePresence和motion.div实现平滑动画 */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div 
              className="px-3 py-2 text-xs"
              style={{ color: theme.colors.neutral[600] }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AccordionPanel;
