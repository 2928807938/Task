'use client';

import React, {useMemo, useRef, useState} from 'react';
import {FiClock, FiGrid, FiLayers, FiList} from 'react-icons/fi';
import {differenceInDays, format, parseISO} from 'date-fns';
import TaskStatusControl from '@/ui/molecules/TaskStatusControl/index';
import TaskDueDateBadge from '@/ui/atoms/DueDateBadge';
import useTaskHook from '@/hooks/use-task-hook';
import {StatusItem} from '@/types/api-types';
import { TodoTask } from '@/types/dashboard-types';

// 格式化剩余时间
export const formatTimeRemaining = (dateString: string): string => {
  // 检查日期字符串是否为空或格式无效
  if (!dateString) {
    return '无截止日期';
  }
  
  try {
    const dueDate = parseISO(dateString);
    
    // 检查解析后的日期是否有效
    if (isNaN(dueDate.getTime())) {
      return '日期格式无效';
    }
    
    const today = new Date();

    // 使用date-fns的differenceInDays函数计算天数差异，确保与TaskDueDateBadge组件使用相同的计算方法
    const days = differenceInDays(dueDate, today);

    if (days < 0) {
      return `已逾期 ${Math.abs(days)} 天`;
    } else if (days === 0) {
      return '今天截止';
    } else if (days === 1) {
      return '明天截止';
    } else if (days < 7) {
      return `${days} 天后截止`;
    } else {
      // 对格式化前再次检查日期有效性
      return format(dueDate, 'MM月dd日截止');
    }
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '日期格式错误';
  }
};

// 根据优先级获取样式
export const getPriorityStyle = (priority: string) => {
  const priorityLower = priority.toLowerCase();
  if (priorityLower.includes('高') || priorityLower.includes('紧急') || priorityLower.includes('p0') || priorityLower.includes('p1')) {
    return {
      color: 'var(--theme-error-500)',
      backgroundColor: 'var(--theme-error-50)',
      borderColor: 'var(--theme-error-200)'
    };
  } else if (priorityLower.includes('中') || priorityLower.includes('普通') || priorityLower.includes('p2')) {
    return {
      color: 'var(--theme-warning-500)',
      backgroundColor: 'var(--theme-warning-50)',
      borderColor: 'var(--theme-warning-200)'
    };
  } else {
    return {
      color: 'var(--theme-success-500)',
      backgroundColor: 'var(--theme-success-50)',
      borderColor: 'var(--theme-success-200)'
    };
  }
};

// 根据状态获取样式
export const getStatusStyle = (status: string) => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('未开始') || statusLower.includes('待处理') || statusLower.includes('待办')) {
    return {
      color: 'var(--theme-neutral-600)',
      backgroundColor: 'var(--theme-neutral-50)',
      borderColor: 'var(--theme-neutral-200)'
    };
  } else if (statusLower.includes('进行中') || statusLower.includes('处理中')) {
    return {
      color: 'var(--theme-primary-500)',
      backgroundColor: 'var(--theme-primary-50)',
      borderColor: 'var(--theme-primary-200)'
    };
  } else if (statusLower.includes('审核') || statusLower.includes('待验收')) {
    return {
      color: 'var(--theme-warning-500)',
      backgroundColor: 'var(--theme-warning-50)',
      borderColor: 'var(--theme-warning-200)'
    };
  } else if (statusLower.includes('完成') || statusLower.includes('已发布')) {
    return {
      color: 'var(--theme-success-500)',
      backgroundColor: 'var(--theme-success-50)',
      borderColor: 'var(--theme-success-200)'
    };
  } else {
    return {
      color: 'var(--theme-neutral-600)',
      backgroundColor: 'var(--theme-neutral-50)',
      borderColor: 'var(--theme-neutral-200)'
    };
  }
};

// 任务项组件 -
export function TaskItem({ task, onTaskClick }: { task: TodoTask; onTaskClick?: (taskId: string) => void }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { useGetTaskStatuses } = useTaskHook();

  // 用于手动控制加载状态
  const [isManuallyLoading, setIsManuallyLoading] = useState(false);

  // 当前选中的任务ID（用于状态加载）
  const [selectedTaskId, setSelectedTaskId] = useState(task.id);

  // 使用封装的API获取任务状态列表
  const {
    data: taskStatusesData,
    isLoading: isQueryLoading,
    refetch: refetchTaskStatuses,
    isSuccess,
    isError,
    error
  } = useGetTaskStatuses(selectedTaskId, {
    // 全部设置为不自动加载，只在用户点击时才加载
    enabled: false,
    // 不缓存数据，确保每次点击都会重新获取最新状态
    staleTime: 0,
    // 禁用窗口聚焦时的自动重新获取
    refetchOnWindowFocus: false,
  });

  // 计算有效的加载状态（手动加载状态或查询加载状态）
  const isLoading = isManuallyLoading || isQueryLoading;

  // 处理状态列表数据
  // 强化数据解析逻辑，确保能正确处理多种可能的响应格式
  const processStatusData = (data: any): StatusItem[] => {
    if (!data) return [];

    // 如果是数组，直接使用
    if (Array.isArray(data)) {
      return data;
    }

    // 如果是对象且有items属性，使用items
    if (typeof data === 'object' && data.items && Array.isArray(data.items)) {
      return data.items;
    }

    // 如果是对象且有data属性，检查data是否是数组
    if (typeof data === 'object' && data.data) {
      if (Array.isArray(data.data)) {
        return data.data;
      }

      // 如果data是对象且有items属性
      if (typeof data.data === 'object' && data.data.items && Array.isArray(data.data.items)) {
        return data.data.items;
      }
    }

    // 如果所有尝试都失败，返回空数组
    console.warn('无法解析状态数据，使用默认值');
    return [];
  };

  // 默认状态列表，当API返回的数据为空时使用
  const defaultStatusItems = [
    { id: 'pending', name: '待处理', color: '#8E8E93' },
    { id: 'in_progress', name: '进行中', color: '#007AFF' },
    { id: 'completed', name: '已完成', color: '#34C759' },
    { id: 'canceled', name: '已取消', color: '#FF3B30' }
  ];

  // 处理API返回的状态数据
  const processedStatusItems = processStatusData(taskStatusesData);

  // 如果处理后的状态列表为空，使用默认状态列表
  const statusItems = processedStatusItems.length > 0 ? processedStatusItems : defaultStatusItems;

  // 创建一个函数来获取特定任务的状态列表
  const fetchTaskStatuses = async (taskId: string) => {
    // 设置当前选中的任务ID
    setSelectedTaskId(taskId);
    // 触发数据刷新
    return refetchTaskStatuses();
  };

  // 状态控件点击时的处理函数
  const handleBeforeToggle = async (taskId: string) => {
    // 先立即设置加载状态，确保用户看到加载指示器
    setIsManuallyLoading(true);

    try {
      // 触发数据刷新，传入当前任务ID
      const result = await fetchTaskStatuses(taskId);

      // 添加延迟，确保加载状态能够被用户清晰地看到
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      // 显示错误提示或者在控制台输出错误信息
    } finally {
      // 清除手动加载状态
      setIsManuallyLoading(false);
    }
  };

  const handleViewTaskDetail = (id: string) => {
    // 调用父组件传递的回调函数
    if (onTaskClick) {
      onTaskClick(id);
    }
  };

  // 临期标签点击时的状态切换控制器引用
  const statusControlRef = useRef<HTMLDivElement | null>(null);

  // 使用新封装的任务状态更新Hook
  const { mutate: updateTaskStatus, isPending: isStatusUpdating } = useTaskHook().useUpdateTaskStatus();

  // 处理任务状态变更
  const handleStatusChange = async (taskId: string, newStatusId: string) => {
    setIsUpdating(true);

    try {
      // 调用新封装的API更新状态
      updateTaskStatus(
        { taskId, statusId: newStatusId },
        {
          onSuccess: () => {
            // 成功后可以执行的操作，如刷新列表等
          },
          onError: (error) => {
            // 这里可以添加错误处理，如显示错误 Toast
          },
          onSettled: () => {
            // 无论成功或失败，都会执行的操作
            setIsUpdating(false);
          }
        }
      );
    } catch (error) {
      console.error('更新状态错误:', error);
      setIsUpdating(false);
    }
  };

  // 已将截止日期状态逻辑移到TaskDueDateBadge组件中

  // 根据任务优先级确定左侧边框样式
  const getBorderStyle = () => {
    return task.priorityColor ? {
      borderLeft: `3px solid ${task.priorityColor}`
    } : {};
  };

  // 检查任务是否过期
  const dueDateObj = parseISO(task.dueDate);
  const today = new Date();
  // 使用date-fns的differenceInDays函数计算天数差异，确保与TaskDueDateBadge组件使用相同的计算方法
  const diffDays = differenceInDays(dueDateObj, today);
  const isOverdue = diffDays < 0;

  return (
    <div
      className={`mb-2 cursor-pointer group ${isOverdue ? 'relative overflow-visible' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        // 只有在点击的元素不是TaskStatusControl时才触发详情查看
        const isStatusControlClicked = (e.target as Element).closest?.('.task-status-control') !== null;

        if (!isStatusControlClicked) {
          handleViewTaskDetail(task.id);
        }
      }}
    >
      {/* 为过期任务添加特殊视觉效果 */}
      {isOverdue && (
        <div className="absolute -right-1 -top-1 w-4 h-4 rounded-full flex items-center justify-center z-10 animate-pulse" style={{ backgroundColor: 'var(--theme-warning-500)' }}>
          <span className="text-white text-[8px] font-bold">!</span>
        </div>
      )}
      <div
        className="p-3.5 border rounded-lg flex flex-col transition-all"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
          boxShadow: 'var(--theme-shadow-sm)',
          ...getBorderStyle()
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--theme-primary-500)';
          e.currentTarget.style.backgroundColor = 'var(--theme-card-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--theme-card-border)';
          e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)';
        }}
      >
        <div className="flex justify-between items-start pl-1">
          {/* 任务标题 */}
          <div className="flex-1">
            <h4 className="font-medium text-[14px] leading-tight mb-1.5 truncate" style={{ color: 'var(--foreground)' }}>{task.title}</h4>

            {/* 任务元数据 */}
            <div className="flex items-center space-x-3 text-[10px] mb-2 opacity-80" style={{ color: 'var(--theme-neutral-500)' }}>
              {/* 项目名称 */}
              <span className="flex items-center">
                <FiLayers className="h-2.5 w-2.5 mr-0.5 opacity-70" />
                <span className="truncate max-w-[120px]">{task.projectName}</span>
              </span>

              {/* 截止日期 */}
              <span className="flex items-center">
                <FiClock className="h-2.5 w-2.5 mr-0.5 opacity-70" />
                {formatTimeRemaining(task.dueDate)}
              </span>

              {/* 使用专用组件显示截止日期状态标签 - 只用于显示 */}
              <TaskDueDateBadge
                dueDate={task.dueDate}
                size="sm"
                showDays={true}
                className="ml-0.5"
              />
            </div>
          </div>

          {/* 优先级标签 */}
          <div
            className="text-[10px] px-1.5 py-0.5 rounded-full border inline-flex items-center whitespace-nowrap"
            style={{
              color: task.priorityColor,
              backgroundColor: `${task.priorityColor}15`, // 15是透明度，相当于rgba中的0.1
              borderColor: `${task.priorityColor}30`, // 30是透明度，相当于rgba中的0.2
            }}
          >
            <div className="h-1.5 w-1.5 rounded-full mr-1 opacity-70" style={{ backgroundColor: task.priorityColor }}></div>
            {task.priorityName}
          </div>
        </div>

        {/* 底部信息栏 */}
        <div className="flex items-center justify-between pl-1">
          {/* 任务状态 */}
          <div ref={statusControlRef}>
            <TaskStatusControl
              currentStatusId={task.statusId}
              currentStatusName={task.statusName}
              currentStatusColor={task.statusColor}
              onStatusChange={(newStatusId) => handleStatusChange(task.id, newStatusId)}
              showIcon={true}
              size="small"
              statusList={statusItems}
              isLoading={isLoading}
              onBeforeToggle={(id) => {
                handleBeforeToggle(id || task.id);
              }} // 在打开下拉菜单前获取状态列表
              taskId={task.id}
            />
          </div>
          {/* 负责人 */}
          <div className="flex items-center text-[10px]" style={{ color: 'var(--theme-neutral-500)' }}>
            <div className="w-4 h-4 rounded-full flex items-center justify-center mr-1 overflow-hidden" 
              style={{ backgroundColor: 'var(--theme-neutral-200)' }}>
              {task.assigneeName && (
                <span className="text-[8px] font-medium" style={{ color: 'var(--theme-neutral-700)' }}>
                  {task.assigneeName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="opacity-80">{task.assigneeName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 主组件 -
export function MyTasksPanel({ tasks, onTaskClick }: { tasks: TodoTask[]; onTaskClick?: (taskId: string) => void }) {
  const [viewMode, setViewMode] = useState<'list' | 'group'>('list');
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'project'>('status');

  // 使用记忆化计算，根据视图模式和分组选项对任务进行分组
  const groupedTasks = useMemo(() => {
    if (viewMode !== 'group') return {};

    // 确定分组的键
    const getGroupKey = (task: TodoTask): string => {
      switch(groupBy) {
        case 'status':
          return task.statusName;
        case 'priority':
          return task.priorityName;
        case 'project':
          return task.projectName;
        default:
          return task.statusName;
      }
    };

    // 根据选定的键对任务进行分组
    return tasks.reduce((acc, task) => {
      const key = getGroupKey(task);
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {} as Record<string, TodoTask[]>);
  }, [tasks, viewMode, groupBy]);

  // 分组选项
  const groupOptions = [
    { value: 'status', label: '状态' },
    { value: 'priority', label: '优先级' },
    { value: 'project', label: '项目' }
  ];

  return (
    <div className="rounded-[28px] border px-5 pb-6 pt-5 shadow-sm"
      style={{ 
        backgroundColor: 'var(--theme-card-bg)',
        borderColor: 'var(--theme-card-border)',
        boxShadow: '0 18px 42px rgba(15, 23, 42, 0.06)'
      }}
    >
      {/* 面板头部 */}
      <div className="flex justify-between items-center mb-3.5">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>我的任务</h2>
          <p className="text-xs mt-0.5 opacity-80" style={{ color: 'var(--theme-neutral-500)' }}>近期需要完成的任务和活动</p>
        </div>

        {/* 视图切换器 */}
        <div className="flex items-center space-x-3">
          <div className="rounded-md overflow-hidden p-0.5 flex border" 
            style={{ 
              backgroundColor: 'var(--theme-neutral-100)',
              borderColor: 'var(--theme-card-border)'
            }}>
            <button
              onClick={() => setViewMode('list')}
              className="p-1.5 rounded-md transition-all active:scale-95"
              style={viewMode === 'list' ? {
                backgroundColor: 'var(--theme-card-bg)',
                color: 'var(--theme-primary-500)',
                boxShadow: 'var(--theme-shadow-sm)'
              } : {
                color: 'var(--theme-neutral-500)',
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'list') {
                  e.currentTarget.style.backgroundColor = 'var(--theme-card-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'list') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              aria-label="列表视图"
            >
              <div className="flex items-center px-1.5">
                <FiList className="w-3 h-3 mr-1.5" />
                <span className="text-xs">列表</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode('group')}
              className="p-1.5 rounded-md transition-all active:scale-95"
              style={viewMode === 'group' ? {
                backgroundColor: 'var(--theme-card-bg)',
                color: 'var(--theme-primary-500)',
                boxShadow: 'var(--theme-shadow-sm)'
              } : {
                color: 'var(--theme-neutral-500)',
              }}
              onMouseEnter={(e) => {
                if (viewMode !== 'group') {
                  e.currentTarget.style.backgroundColor = 'var(--theme-card-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (viewMode !== 'group') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              aria-label="分组视图"
            >
              <div className="flex items-center px-1.5">
                <FiGrid className="w-3 h-3 mr-1.5" />
                <span className="text-xs">分组</span>
              </div>
            </button>
          </div>

          {/* 分组选项选择器 */}
          {viewMode === 'group' && (
            <div className="rounded-md overflow-hidden p-0.5 flex border"
              style={{ 
                backgroundColor: 'var(--theme-neutral-100)',
                borderColor: 'var(--theme-card-border)'
              }}>
              {groupOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGroupBy(option.value as any)}
                  className="p-1 rounded-md transition-all text-xs active:scale-95"
                  style={groupBy === option.value ? {
                    backgroundColor: 'var(--theme-card-bg)',
                    color: 'var(--theme-primary-500)',
                    boxShadow: 'var(--theme-shadow-sm)'
                  } : {
                    color: 'var(--theme-neutral-500)',
                  }}
                  onMouseEnter={(e) => {
                    if (groupBy !== option.value) {
                      e.currentTarget.style.backgroundColor = 'var(--theme-card-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (groupBy !== option.value) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 面板内容 - 确保固定高度 */}
      {viewMode === 'list' ? (
        <div className="space-y-2 h-[350px] overflow-y-auto hide-scrollbar pr-1 pb-4 flex flex-col">
          {tasks.length > 0 ? (
            <div className="flex-1">
              {tasks.map(task => (
                <TaskItem key={task.id} task={task} onTaskClick={onTaskClick} />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-6 w-full rounded-lg border border-dashed" 
                style={{ 
                  color: 'var(--theme-neutral-500)', 
                  borderColor: 'var(--theme-neutral-200)', 
                  backgroundColor: 'var(--theme-card-hover)' 
                }}>
                <FiLayers className="h-6 w-6 mx-auto mb-2 opacity-60" style={{ color: 'var(--theme-neutral-300)' }} />
                <p className="text-xs">暂无任务</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5 h-[350px] overflow-y-auto hide-scrollbar pr-1 pb-4 flex flex-col">
          {Object.keys(groupedTasks).length > 0 ? (
            <div className="flex-1">
              {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                <div key={groupName} className="space-y-3 mb-5">
                  <div className="flex items-center space-x-2 mb-3 pb-1 border-b" style={{ borderColor: 'var(--theme-card-border)' }}>
                    <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{groupName}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full border" 
                      style={{ 
                        backgroundColor: 'var(--theme-neutral-100)', 
                        color: 'var(--theme-neutral-500)', 
                        borderColor: 'var(--theme-card-border)' 
                      }}>
                      {groupTasks.length}
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-1">
                    {groupTasks.map(task => (
                      <TaskItem key={task.id} task={task} onTaskClick={onTaskClick} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-6 w-full rounded-lg border border-dashed" 
                style={{ 
                  color: 'var(--theme-neutral-500)', 
                  borderColor: 'var(--theme-neutral-200)', 
                  backgroundColor: 'var(--theme-card-hover)' 
                }}>
                <FiLayers className="h-6 w-6 mx-auto mb-2 opacity-60" style={{ color: 'var(--theme-neutral-300)' }} />
                <p className="text-xs">暂无任务</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MyTasksPanel;
