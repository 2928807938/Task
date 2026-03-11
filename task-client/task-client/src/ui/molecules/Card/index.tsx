import React, {ReactNode, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiChevronDown, FiChevronUp} from 'react-icons/fi';

interface CardProps {
  title: string;
  cardId?: string;
  delay?: number;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  icon?: ReactNode;
  headerExtra?: ReactNode; // 标题旁边的额外内容
  children: ReactNode;
  collapsible?: boolean; // 是否可折叠
  defaultCollapsed?: boolean; // 默认是否折叠
}

const Card: React.FC<CardProps> = ({
  title,
  cardId,
  delay = 0,
  actionText,
  onAction,
  className = '',
  icon,
  headerExtra,
  children,
  collapsible = false,
  defaultCollapsed = false
}) => {
  // 折叠状态
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // 切换折叠状态
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: delay
      }}
      whileHover={{
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        transition: { duration: 0.2 }
      }}
      className={`
        backdrop-filter backdrop-blur-sm rounded-2xl 
        overflow-hidden transition-all duration-300
        ${className}
      `}
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        border: '1px solid var(--theme-card-border)',
        boxShadow: 'var(--theme-shadow-sm)'
      }}
      id={cardId}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="w-5 h-5" style={{ color: 'var(--theme-neutral-500)' }}>
                {icon}
              </div>
            )}
            <div className="flex items-center">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h2>
              {headerExtra && <div className="ml-3">{headerExtra}</div>}
            </div>
          </div>

          <div className="flex items-center">
            {actionText && onAction && (
              <button
                className="text-sm font-medium flex items-center px-3 py-1 rounded-full transition-colors mr-2"
                style={{
                  color: 'var(--theme-primary-600)',
                  backgroundColor: 'rgba(var(--theme-primary-500-rgb), 0.1)'
                }}
                onClick={onAction}
              >
                {actionText}
                <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {collapsible && (
              <button
                className="p-1 rounded-full transition-colors"
                style={{
                  color: 'var(--theme-neutral-500)',
                  backgroundColor: 'var(--theme-card-hover)'
                }}
                onClick={toggleCollapse}
                aria-label={isCollapsed ? "展开" : "折叠"}
              >
                {isCollapsed ? <FiChevronDown size={18} /> : <FiChevronUp size={18} />}
              </button>
            )}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>

        {isCollapsed && (
          <div className="flex justify-center py-2 text-sm" style={{ color: 'var(--theme-neutral-400)' }}>
            点击展开查看详细内容
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Card;
