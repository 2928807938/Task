'use client';

import React from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {
  FiClock, 
  FiCalendar, 
  FiUser, 
  FiTag, 
  FiFileText,
  FiCheckCircle
} from 'react-icons/fi';
import {ProjectTask} from '@/types/api-types';
import {useTheme} from '@/ui/theme';
import TaskPriorityBadge from '@/ui/atoms/TaskPriorityBadge';
import {Avatar} from '@/ui/atoms/Avatar';

interface SubTaskDetailContentProps {
  task: ProjectTask;
}


/**
 * 子任务详情内容组件 - 简洁的编辑界面
 * 
 * 功能：
 * - 统一的信息展示和编辑
 * - 真实的API调用和数据更新
 * - 简洁明了的界面设计
 */
const SubTaskDetailContent: React.FC<SubTaskDetailContentProps> = ({ task }) => {
  const { isDark } = useTheme();



  // 渲染信息项
  const renderInfoItem = (
    icon: React.ReactNode,
    label: string,
    renderDisplay: () => React.ReactNode,
    colorScheme: string = 'blue'
  ) => {
    const colorSchemes = {
      blue: isDark ? 'from-blue-500/20 to-cyan-500/10' : 'from-blue-50 to-cyan-50',
      green: isDark ? 'from-green-500/20 to-emerald-500/10' : 'from-green-50 to-emerald-50',
      red: isDark ? 'from-red-500/20 to-orange-500/10' : 'from-red-50 to-orange-50',
      purple: isDark ? 'from-purple-500/20 to-pink-500/10' : 'from-purple-50 to-pink-50',
      slate: isDark ? 'from-slate-500/20 to-gray-500/10' : 'from-slate-50 to-gray-50'
    };

    return (
      <motion.div
        layout
        className={`
          relative p-4 rounded-xl border transition-all duration-200
          ${isDark 
            ? 'bg-gradient-to-r ' + colorSchemes[colorScheme as keyof typeof colorSchemes] + ' border-gray-700/40' 
            : 'bg-gradient-to-r ' + colorSchemes[colorScheme as keyof typeof colorSchemes] + ' border-gray-200/60'
          }
        `}
      >
        <div className="flex items-center space-x-3">
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}
          `}>
            {React.cloneElement(icon as React.ReactElement, {
              className: `w-4 h-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`
            })}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {label}
            </h4>
            
            <div>
              {renderDisplay()}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 基本信息区域 */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          基本信息
        </h3>
        
        <div className="space-y-3">
          {/* 任务描述 */}
          {renderInfoItem(
            <FiFileText />,
            '任务描述',
            () => (
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} ${!task.description ? 'italic text-gray-400' : ''}`}>
                {task.description || '暂无描述'}
              </p>
            ),
            'slate'
          )}

          {/* 负责人 */}
          {renderInfoItem(
            <FiUser />,
            '负责人',
            () => (
              <div className="flex items-center space-x-2">
                {task.assigneeAvatar && (
                  <Avatar 
                    name={task.assignee || '未分配'} 
                    src={task.assigneeAvatar}
                    size="sm" 
                  />
                )}
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {task.assignee || '未分配'}
                </span>
              </div>
            ),
            'blue'
          )}

          {/* 优先级 */}
          {renderInfoItem(
            <FiTag />,
            '优先级',
            () => (
              <TaskPriorityBadge 
                priority={task.priority}
                priorityColor={task.priorityColor}
                size="sm"
              />
            ),
            'purple'
          )}
        </div>
      </div>

      {/* 时间设置区域 */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          时间设置
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 开始时间 */}
          {renderInfoItem(
            <FiClock />,
            '开始时间',
            () => (
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {task.startTime 
                  ? new Date(task.startTime).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : '未设置'
                }
              </p>
            ),
            'green'
          )}

          {/* 截止时间 */}
          {renderInfoItem(
            <FiCalendar />,
            '截止时间',
            () => (
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {task.dueDate 
                  ? new Date(task.dueDate).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : '未设置'
                }
              </p>
            ),
            'red'
          )}
        </div>
      </div>

      {/* 任务完成状态 */}
      {task.completedAt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            p-4 rounded-xl border
            ${isDark 
              ? 'bg-gradient-to-r from-emerald-500/20 to-green-500/10 border-emerald-700/40' 
              : 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/60'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center
              ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}
            `}>
              <FiCheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h4 className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                任务已完成
              </h4>
              <p className={`text-xs mt-1 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                完成时间: {new Date(task.completedAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SubTaskDetailContent;