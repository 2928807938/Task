import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Button } from '@/ui/atoms/Button';
import MentionNotificationPanel from '@/ui/molecules/MentionNotificationPanel';
import { useMentionNotifications } from '@/hooks/use-task-comments-hook';

interface NotificationButtonProps {
  /** 点击通知时的回调 */
  onNotificationClick?: (taskId: string, commentId: string) => void;
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 按钮变体 */
  variant?: 'ghost' | 'outline' | 'primary' | 'secondary' | 'danger';
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  onNotificationClick,
  size = 'md',
  variant = 'ghost'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 使用@提及通知Hook
  const { notifications, isLoading } = useMentionNotifications();

  // 计算未读通知数量
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // 点击外部关闭面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ESC键关闭面板
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (taskId: string, commentId: string) => {
    setIsOpen(false);
    onNotificationClick?.(taskId, commentId);
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant={variant}
        size={size}
        onClick={handleButtonClick}
        className={`relative ${
          isOpen ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
        }`}
      >
        <Bell className={`${
          size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
        }`} />
        
        {/* 未读通知徽章 */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white dark:border-gray-800"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 加载指示器 */}
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className={`border-2 border-blue-500 border-t-transparent rounded-full ${
              size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
            }`} />
          </motion.div>
        )}
      </Button>

      {/* 通知面板 */}
      <div ref={panelRef}>
        <MentionNotificationPanel
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onNotificationClick={handleNotificationClick}
        />
      </div>
    </div>
  );
};

export default NotificationButton;
