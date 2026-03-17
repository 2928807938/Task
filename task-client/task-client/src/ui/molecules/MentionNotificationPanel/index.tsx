import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  MessageCircle, 
  User, 
  ExternalLink,
  Check,
  CheckCheck,
  X,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/ui/atoms/Button';
import { Avatar } from '@/ui/atoms/Avatar';
import { Input } from '@/ui/atoms/Input';
import { LoadingSpinner } from '@/ui/molecules/LoadingSpinner';
import { useMentionNotifications } from '@/hooks/use-task-comments-hook';
import type { MentionNotification } from '@/types/api-types';
import { getRelativeTime } from '@/utils/date-utils';

interface MentionNotificationPanelProps {
  /** 是否显示面板 */
  isOpen: boolean;
  /** 关闭面板回调 */
  onClose: () => void;
  /** 点击通知项回调 */
  onNotificationClick?: (taskId: string, commentId: string) => void;
}

const MentionNotificationPanel: React.FC<MentionNotificationPanelProps> = ({
  isOpen,
  onClose,
  onNotificationClick
}) => {
  const [showOnlyUnread, setShowOnlyUnread] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 使用@提及通知Hook
  const {
    notifications,
    total,
    hasMore,
    isLoading,
    error,
    markAsRead,
    isMarkingAsRead,
    refetch
  } = useMentionNotifications();

  // 过滤通知
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchQuery || 
      notification.commentContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.mentionerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = !showOnlyUnread || !notification.isRead;
    
    return matchesSearch && matchesFilter;
  });

  // 处理通知点击
  const handleNotificationClick = useCallback((notification: MentionNotification) => {
    onNotificationClick?.(notification.taskId, notification.commentId);
    
    // 标记为已读
    if (!notification.isRead) {
      markAsRead([notification.id]);
    }
  }, [onNotificationClick, markAsRead]);

  // 全部标记为已读
  const handleMarkAllAsRead = useCallback(() => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
  }, [notifications, markAsRead]);

  // 渲染空状态
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Bell className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {showOnlyUnread ? '没有未读提及' : '暂无提及通知'}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-center">
        {showOnlyUnread 
          ? '当有人在任务评论中@你时，通知会显示在这里'
          : '看起来还没有人@你'
        }
      </p>
      {showOnlyUnread && notifications.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOnlyUnread(false)}
          className="mt-2"
        >
          查看所有通知
        </Button>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        >
          {/* 头部 */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  @提及通知
                </h3>
                {total > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    {total}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* 搜索和筛选 */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索通知..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-8 text-sm"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant={showOnlyUnread ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                    className="h-7 px-2 text-xs"
                  >
                    <Filter className="w-3 h-3 mr-1" />
                    {showOnlyUnread ? '未读' : '全部'}
                  </Button>
                </div>
                
                {notifications.some(n => !n.isRead) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={isMarkingAsRead}
                    className="h-7 px-2 text-xs"
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    全部已读
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 通知列表 */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="text-red-500 mb-2">加载失败</div>
                <Button variant="ghost" size="sm" onClick={() => void refetch()}>
                  重试
                </Button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              renderEmptyState()
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredNotifications.map((notification) => (
                  <motion.button
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        name={notification.mentionerName}
                        size="sm"
                        className="flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {notification.mentionerName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            在任务中@了你
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1 truncate">
                          <MessageCircle className="w-3 h-3 inline mr-1" />
                          {notification.taskTitle}
                        </div>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                          "{notification.commentContent}"
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {getRelativeTime(notification.createdAt)}
                          </span>
                          <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* 底部 */}
          {hasMore && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // 这里可以实现加载更多逻辑
                  console.log('Load more notifications');
                }}
                className="w-full text-sm"
              >
                加载更多通知
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MentionNotificationPanel;
