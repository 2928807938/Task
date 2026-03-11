'use client';

import React, {useCallback, useMemo, useRef, useState} from 'react';
import {FiAlertTriangle, FiClock, FiLayers} from 'react-icons/fi';
import {addDays, differenceInDays, format, isBefore, isThisWeek, isToday, isTomorrow, parseISO} from 'date-fns';
import {zhCN} from 'date-fns/locale';
import {formatTimeRemaining, TodoTask} from './MyTasksPanel';
import TaskStatusControl from '@/ui/molecules/TaskStatusControl/index';
import TaskDueDateBadge from '@/ui/atoms/DueDateBadge';
import useTaskHook from '@/hooks/use-task-hook';
import {taskApi} from '@/adapters/api/task-api';

// 临期任务面板组件
export function UpcomingTasksPanel({ tasks, onTaskClick }: { tasks: TodoTask[]; onTaskClick?: (taskId: string) => void }) {
  // 定义临期任务的类型
  type UpcomingTaskType = 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'future';

  // 使用封装的API获取任务状态列表和更新任务状态
  const { useGetTaskStatuses, useUpdateTaskStatus } = useTaskHook();

  // 使用更新任务状态的Hook
  const { mutate: updateTaskStatus, isPending: isStatusUpdating } = useUpdateTaskStatus();

  // 当前正在更新的任务ID
  const [taskUpdating, setTaskUpdating] = useState('');

  // 当前选中的任务ID（用于状态加载）
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // 用于手动控制加载状态
  const [isManuallyLoading, setIsManuallyLoading] = useState(false);

  // 状态控制器引用
  const statusControlRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // 使用封装的API获取任务状态列表
  const getTaskStatuses = useCallback((taskId: string) => {
    // 直接调用 API 获取状态列表，确保传递正确的 taskId
    return taskApi.getTaskStatuses(taskId);
  }, []);

  // 保存状态列表数据
  const [statusListData, setStatusListData] = useState<any>(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  // 创建一个函数来获取特定任务的状态列表
  const fetchTaskStatuses = async (taskId: string) => {
    // 设置当前选中的任务ID
    setSelectedTaskId(taskId);
    setIsQueryLoading(true);

    try {
      // 直接调用API获取状态列表，确保传递正确的 taskId
      const response = await getTaskStatuses(taskId);
      if (response.code === '200' || response.code.startsWith('2')) {
        setStatusListData(response.data);
        return response;
      } else {
        console.error(`获取任务 ${taskId} 状态列表失败:`, response.message);
        return null;
      }
    } catch (error) {
      console.error(`获取任务 ${taskId} 状态列表异常:`, error);
      return null;
    } finally {
      setIsQueryLoading(false);
    }
  };

  // 计算有效的加载状态（手动加载状态或查询加载状态）
  const isLoading = isManuallyLoading || isQueryLoading;

  // 使用获取到的状态列表数据或默认列表
  const statusItems = Array.isArray(statusListData) ? statusListData : [
    { id: 'pending', name: '待处理', color: '#8E8E93' },
    { id: 'in_progress', name: '进行中', color: '#007AFF' },
    { id: 'completed', name: '已完成', color: '#34C759' },
    { id: 'canceled', name: '已取消', color: '#FF3B30' }
  ];

  // 状态控件点击时的处理函数
  const handleBeforeToggle = async (taskId: string) => {
    if (!taskId) {
      console.error('未提供有效的任务ID');
      return;
    }

    // 设置加载状态
    setIsManuallyLoading(true);

    try {
      // 直接调用获取状态列表的函数，传入当前任务ID
      const result = await fetchTaskStatuses(taskId);
    } catch (err) {
      console.error(`获取任务 ${taskId} 状态列表失败:`, err);
    } finally {
      // 清除加载状态
      setIsManuallyLoading(false);
    }
  };

  // 对任务进行分类和排序
  const { categorizedTasks, hasOverdueTasks } = useMemo(() => {
    // 首先过滤掉没有截止日期的任务
    const filteredTasks = tasks.filter(task => task.dueDate);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const next7Days = addDays(today, 7);
    const next14Days = addDays(today, 14);

    // 初始化不同类型的任务数组
    const result: Record<UpcomingTaskType, TodoTask[]> = {
      overdue: [], // 逾期任务
      today: [],   // 今天到期
      tomorrow: [], // 明天到期
      upcoming: [], // 7天内到期
      future: []    // 更远的任务
    };

    // 分类任务
    filteredTasks.forEach(task => {
      const dueDate = parseISO(task.dueDate);

      if (isBefore(dueDate, today) && !isToday(dueDate)) {
        // 已逾期任务
        result.overdue.push(task);
      } else if (isToday(dueDate)) {
        // 今天到期
        result.today.push(task);
      } else if (isTomorrow(dueDate)) {
        // 明天到期
        result.tomorrow.push(task);
      } else if (isBefore(dueDate, next7Days)) {
        // 7天内到期
        result.upcoming.push(task);
      } else if (isBefore(dueDate, next14Days)) {
        // 更远的任务，当前限制为14天内
        result.future.push(task);
      }
    });

    // 对每个类别内部按截止日期排序
    Object.keys(result).forEach(key => {
      result[key as UpcomingTaskType].sort((a, b) => {
        const dateA = parseISO(a.dueDate);
        const dateB = parseISO(b.dueDate);
        return dateA.getTime() - dateB.getTime();
      });
    });

    return {
      categorizedTasks: result,
      hasOverdueTasks: result.overdue.length > 0
    };
  }, [tasks]);

  // 获取所有任务总数
  const totalTaskCount = useMemo(() => {
    return Object.values(categorizedTasks).reduce((sum, tasks) => sum + tasks.length, 0);
  }, [categorizedTasks]);

  // 组合不同类型的任务，按照重要性顺序显示
  const sortedTasks = useMemo(() => {
    return [
      ...categorizedTasks.overdue,
      ...categorizedTasks.today,
      ...categorizedTasks.tomorrow,
      ...categorizedTasks.upcoming,
      ...categorizedTasks.future
    ]; // 显示所有任务，不限制数量
  }, [categorizedTasks]);

  // 获取任务的日期标签和样式
  const getDateInfo = (dateString: string) => {
    const dueDate = parseISO(dateString);
    const today = new Date();
    let label = '';
    let bgColor = '';
    let textColor = '';
    let borderColor = '';
    let icon = null;
    let urgency = 0; // 0-正常, 1-警告, 2-紧急

    if (isBefore(dueDate, today) && !isToday(dueDate)) {
      // 已逾期
      label = '已逾期';
      bgColor = '#FFF0F0';
      textColor = '#FF3B30';
      borderColor = '#FFCCCC';
      icon = <FiAlertTriangle className="h-2.5 w-2.5 mr-1 opacity-70" />;
      urgency = 2;
    } else if (isToday(dueDate)) {
      // 今天到期
      label = '今天';
      bgColor = '#FFF4EB';
      textColor = '#FF9500';
      borderColor = '#FFE5CC';
      urgency = 1;
    } else if (isTomorrow(dueDate)) {
      // 明天到期
      label = '明天';
      bgColor = '#F2FAFF';
      textColor = '#007AFF';
      borderColor = '#CCE4FF';
    } else if (isThisWeek(dueDate, { locale: zhCN })) {
      // 本周内
      label = format(dueDate, 'eeee', { locale: zhCN }); // 周几
      bgColor = '#F5F9FF';
      textColor = '#007AFF';
      borderColor = 'rgba(0,122,255,0.1)';
    } else {
      // 更远的日期
      label = format(dueDate, 'MM月dd日');
      bgColor = '#F5F5F7';
      textColor = '#8E8E93';
      borderColor = '#E5E5EA';
    }

    return { label, bgColor, textColor, borderColor, icon, urgency };
  };

  // 查看所有临期任务
  const handleViewAllUpcoming = () => {
    // 实际项目中应该跳转到任务列表页面，并按截止日期筛选
  };

  // 查看任务详情
  const handleViewTaskDetail = (id: string) => {
    // 调用父组件传递的回调函数
    onTaskClick?.(id);
  };

  // 处理任务状态变更
  const handleStatusChange = (taskId: string, newStatusId: string) => {
    // 设置更新状态
    setTaskUpdating(taskId);

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
            setTaskUpdating('');
          }
        }
      );
    } catch (error) {
      console.error('临期任务面板 - 更新状态错误:', error);
      setTaskUpdating('');
    }
  };

  return (
    <div className="rounded-xl shadow-sm border overflow-hidden h-full" 
      style={{ 
        backgroundColor: 'var(--theme-card-bg)', 
        borderColor: 'var(--theme-card-border)',
        boxShadow: 'var(--theme-shadow-sm)'
      }}>
      {/* 苹果风格的标题栏 - 更紧凑简洁 */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--theme-card-border)' }}>
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-2 w-5 h-5 rounded-full flex items-center justify-center" 
            style={{ backgroundColor: 'var(--theme-error-100)' }}>
            <FiClock className="h-3 w-3" style={{ color: 'var(--theme-error-500)' }} />
          </div>
          <h2 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>临期任务</h2>
        </div>

        {/* 逾期任务标识 - 集成到标题栏中 */}
        {hasOverdueTasks && (
          <div 
            className="flex items-center px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--theme-error-100)',
              color: 'var(--theme-error-500)'
            }}
          >
            <FiAlertTriangle className="h-2.5 w-2.5 mr-1" />
            <span className="text-xs font-medium">{categorizedTasks.overdue.length}</span>
          </div>
        )}
      </div>

      {/* 任务列表区域 */}
      <div className="px-2 pt-2 pb-1">
        <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 hide-scrollbar">
          {sortedTasks.map(task => {
            const dateInfo = getDateInfo(task.dueDate);
            // 进度条计算逾期任务显示很短的进度条
            let progressPercent = 100;
            const dueDate = parseISO(task.dueDate);
            const now = new Date();

            if (dateInfo.urgency === 2) { // 逾期
              progressPercent = 5;
            } else if (isToday(dueDate)) { // 今天
              const hoursLeft = 24 - now.getHours();
              progressPercent = Math.max(10, Math.min(40, (hoursLeft / 24) * 100));
            } else {
              const diffDays = differenceInDays(dueDate, now);
              progressPercent = diffDays <= 3 ? 40 + ((diffDays / 3) * 30) : Math.min(95, 70 + (Math.log10(diffDays) * 10));
            }

            return (
              <div
                key={task.id}
                onClick={(e) => {
                  const isStatusControlClicked = (
                    (e.target as HTMLElement).closest('.status-control') !== null ||
                    (e.target as HTMLElement).classList.contains('status-control')
                  );
                  if (!isStatusControlClicked) handleViewTaskDetail(task.id);
                }}
                className="cursor-pointer group"
              >
                <div
                  className="relative overflow-hidden rounded-lg border"
                  style={{
                    borderColor: dateInfo.urgency === 2 ? 'var(--theme-error-200)' : 
                                dateInfo.urgency === 1 ? 'var(--theme-warning-200)' : 'var(--theme-card-border)',
                    backgroundColor: dateInfo.urgency === 2 ? 'var(--theme-error-50)' : 
                                    dateInfo.urgency === 1 ? 'var(--theme-warning-50)' : 'var(--theme-card-bg)',
                  }}
                >
                  {/* 任务信息 */}
                  <div className="px-3 pt-2 pb-1.5">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-xs leading-tight pr-1 flex-1 line-clamp-1" style={{ color: 'var(--foreground)' }}>{task.title}</h4>
                      <TaskDueDateBadge
                        dueDate={task.dueDate}
                        size="sm"
                        showDays={true}
                        className="flex-shrink-0 ml-1"
                      />
                    </div>

                    {/* 项目信息 */}
                    <div className="flex items-center text-[10px]" style={{ color: 'var(--theme-neutral-500)' }}>
                      <FiLayers className="h-2.5 w-2.5 mr-1 opacity-70" />
                      <span className="truncate max-w-[100px]">{task.projectName}</span>
                      {task.priorityName && (
                        <>
                          <span className="mx-1" style={{ color: 'var(--theme-neutral-300)' }}>·</span>
                          <span style={{ color: task.priorityColor || 'var(--theme-neutral-500)' }}>{task.priorityName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 底部状态栏 */}
                  <div className="grid grid-cols-2 items-center text-[10px] px-3 py-1.5 border-t"
                    style={{
                      borderColor: dateInfo.urgency === 2 ? 'var(--theme-error-200)' : dateInfo.urgency === 1 ? 'var(--theme-warning-200)' : 'var(--theme-neutral-200)',
                      backgroundColor: dateInfo.urgency === 2 ? 'var(--theme-error-50)' : dateInfo.urgency === 1 ? 'var(--theme-warning-50)' : 'var(--theme-neutral-50)',
                    }}
                  >
                    {/* 剩余时间 */}
                    <div className="flex items-center">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center mr-1.5 flex-shrink-0"
                        style={{
                          backgroundColor: dateInfo.urgency === 2 ? 'var(--theme-error-100)' : dateInfo.urgency === 1 ? 'var(--theme-warning-100)' : 'var(--theme-neutral-100)',
                        }}
                      >
                        <FiClock className="h-2.5 w-2.5" style={{
                          color: dateInfo.urgency === 2 ? 'var(--theme-error-500)' : dateInfo.urgency === 1 ? 'var(--theme-warning-500)' : 'var(--theme-neutral-500)'
                        }} />
                      </div>
                      <span className="font-medium" style={{
                        color: dateInfo.urgency === 2 ? 'var(--theme-error-500)' : dateInfo.urgency === 1 ? 'var(--theme-warning-500)' : 'var(--theme-neutral-500)'
                      }}>
                        {formatTimeRemaining(task.dueDate)}
                      </span>
                    </div>

                    {/* 任务状态 */}
                    <div className="flex justify-end">
                      <div ref={(el) => { statusControlRefs.current[task.id] = el; return undefined; }}>
                        <TaskStatusControl
                          currentStatusId={task.statusId}
                          currentStatusName={task.statusName}
                          currentStatusColor={task.statusColor}
                          onStatusChange={(newStatusId) => handleStatusChange(task.id, newStatusId)}
                          showIcon={true}
                          size="small"
                          statusList={statusItems}
                          isLoading={isLoading}
                          onBeforeToggle={(id) => handleBeforeToggle(id || task.id)}
                          taskId={task.id}
                          className="status-control"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="absolute bottom-0 left-0 h-0.5"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: dateInfo.urgency === 2 ? 'var(--theme-error-500)' : dateInfo.urgency === 1 ? 'var(--theme-warning-500)' : 'var(--theme-success-500)',
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* 空状态 */}
          {sortedTasks.length === 0 && (
            <div className="text-center py-5">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center" 
                style={{ backgroundColor: 'var(--theme-neutral-100)' }}>
                <FiClock className="h-4 w-4" style={{ color: 'var(--theme-neutral-500)' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>暂无临期任务</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--theme-neutral-500)' }}>即将到期的任务将在这里显示</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpcomingTasksPanel;
