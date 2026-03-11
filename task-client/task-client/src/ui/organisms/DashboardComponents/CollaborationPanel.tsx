'use client';

import React from 'react';
import {
    FiCalendar,
    FiCheckCircle,
    FiEdit,
    FiFile,
    FiLayers,
    FiMessageSquare,
    FiStar,
    FiUser,
    FiVideo
} from 'react-icons/fi';
import {formatDistanceToNow, parseISO} from 'date-fns';
import {zhCN} from 'date-fns/locale';

// 协作活动类型
export type CollaborationActivity = {
  id: string;
  type: 'comment' | 'mention' | 'assignment' | 'file' | 'meeting' | 'completion' | 'update';
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content?: string;
  timestamp: string;
};

// 格式化时间为"几分钟前"、"几小时前"等
export const formatTimeAgo = (dateString: string): string => {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
};

// 获取活动图标
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'comment':
      return <FiMessageSquare className="h-4 w-4" style={{ color: 'var(--theme-primary-500)' }} />;
    case 'mention':
      return <FiUser className="h-4 w-4" style={{ color: 'var(--theme-warning-500)' }} />;
    case 'assignment':
      return <FiStar className="h-4 w-4" style={{ color: 'var(--theme-error-500)' }} />;
    case 'file':
      return <FiFile className="h-4 w-4" style={{ color: 'var(--theme-success-500)' }} />;
    case 'meeting':
      return <FiVideo className="h-4 w-4" style={{ color: 'var(--theme-info-500)' }} />;
    case 'completion':
      return <FiCheckCircle className="h-4 w-4" style={{ color: 'var(--theme-success-500)' }} />;
    case 'update':
      return <FiEdit className="h-4 w-4" style={{ color: 'var(--theme-primary-500)' }} />;
    default:
      return <FiCalendar className="h-4 w-4" style={{ color: 'var(--theme-primary-500)' }} />;
  }
};

// 活动项组件
export function ActivityItem({ activity }: { activity: CollaborationActivity }) {
  // 获取活动描述
  const getActivityDescription = () => {
    switch (activity.type) {
      case 'comment':
        return `在任务 "${activity.taskTitle}" 中发表评论`;
      case 'mention':
        return `在任务 "${activity.taskTitle}" 中提到了你`;
      case 'assignment':
        return `将任务 "${activity.taskTitle}" 分配给你`;
      case 'file':
        return `在任务 "${activity.taskTitle}" 中上传了文件`;
      case 'meeting':
        return `为项目 "${activity.projectName}" 安排了会议`;
      case 'completion':
        return `完成了任务 "${activity.taskTitle}"`;
      case 'update':
        return `更新了任务 "${activity.taskTitle}"`;
      default:
        return `与任务 "${activity.taskTitle}" 有互动`;
    }
  };

  // 点击查看详情
  const handleViewDetail = () => {
    // 实际项目中应该跳转到相关任务或显示详情弹窗
  };

  return (
    <div
      className="flex p-3 rounded-lg transition-all cursor-pointer border border-transparent group"
      onClick={handleViewDetail}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--theme-card-hover)';
        e.currentTarget.style.borderColor = 'var(--theme-card-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div className="mr-3 p-1.5 rounded-full flex-shrink-0 border w-9 h-9 flex items-center justify-center transition-all"
        style={{ 
          backgroundColor: 'var(--theme-neutral-50)', 
          borderColor: 'var(--theme-card-border)' 
        }}>
        {getActivityIcon(activity.type)}
      </div>

      <div className="flex-grow">
        <div className="flex items-center mb-1.5">
          <div className="h-5 w-5 rounded-full overflow-hidden mr-1.5 flex-shrink-0" 
            style={{ border: '1px solid var(--theme-card-border)' }}>
            {activity.userAvatar ? (
              <img src={activity.userAvatar} alt={activity.userName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-white text-[10px] font-medium" 
                style={{ background: 'linear-gradient(to bottom right, var(--theme-primary-500), var(--theme-primary-700))' }}>
                {activity.userName.substring(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="font-medium text-xs" style={{ color: 'var(--foreground)' }}>{activity.userName}</div>
          <div className="text-[10px] ml-1.5" style={{ color: 'var(--theme-neutral-500)' }}>
            {formatTimeAgo(activity.timestamp)}
          </div>
        </div>

        <div className="text-xs leading-relaxed mb-1.5" style={{ color: 'var(--foreground)' }}>
          {getActivityDescription()}
        </div>

        {activity.content && (
          <div className="text-xs mt-1 p-2.5 rounded-lg border" 
            style={{ 
              color: 'var(--theme-neutral-600)', 
              backgroundColor: 'var(--theme-neutral-50)', 
              borderColor: 'var(--theme-card-border)' 
            }}>
            {activity.content}
          </div>
        )}

        <div className="text-[10px] mt-2 flex items-center opacity-80" style={{ color: 'var(--theme-neutral-500)' }}>
          <div className="flex items-center px-1.5 py-0.5 rounded-full border" 
            style={{ backgroundColor: 'var(--theme-neutral-50)', borderColor: 'var(--theme-card-border)' }}>
            <span className="flex items-center">
              <FiLayers className="h-2.5 w-2.5 mr-1 opacity-70" />
              {activity.projectName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 主组件
export function CollaborationPanel({ activities }: { activities: CollaborationActivity[] }) {
  const handleCreateMeeting = () => {
    // 实际项目中应该跳转到会议创建页面或打开创建会议的模态框
  };

  const handleStartDiscussion = () => {
    // 实际项目中应该跳转到讨论创建页面或打开创建讨论的模态框
  };

  return (
    <div className="rounded-lg shadow-sm border pt-5 px-5 pb-6" 
      style={{ 
        backgroundColor: 'var(--theme-card-bg)', 
        borderColor: 'var(--theme-card-border)',
        boxShadow: 'var(--theme-shadow-sm)'
      }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>协作动态</h2>
          <p className="text-xs mt-0.5 opacity-80" style={{ color: 'var(--theme-neutral-500)' }}>团队最近的活动和交流</p>
        </div>

        <button className="p-1.5 rounded-full transition-colors" 
          style={{ color: 'var(--theme-neutral-400)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-neutral-100)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="刷新">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <polyline points="23 20 23 14 17 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
        </button>
      </div>

      <div className="space-y-2 mt-3 max-h-[270px] overflow-y-auto pr-1 hide-scrollbar">
        {activities.map(activity => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
        {activities.length === 0 && (
          <div className="text-center py-8 px-4 rounded-lg border border-dashed" 
            style={{ 
              color: 'var(--theme-neutral-500)', 
              borderColor: 'var(--theme-neutral-200)', 
              backgroundColor: 'var(--theme-card-hover)' 
            }}>
            <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" 
              style={{ backgroundColor: 'var(--theme-neutral-100)' }}>
              <FiMessageSquare className="h-6 w-6" style={{ color: 'var(--theme-neutral-300)' }} />
            </div>
            <p className="text-xs font-medium" style={{ color: 'var(--theme-neutral-600)' }}>暂无协作动态</p>
            <p className="text-[10px] mt-1" style={{ color: 'var(--theme-neutral-400)' }}>团队活动将在这里显示</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CollaborationPanel;
