'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/adapters/api';
import { useIsAuthenticated } from '@/hooks/use-user-hook';
import { dashboardQueryConfig } from '@/infrastructure/http/react-query-config';
import {
  TodoTask,
  CollaborationActivity,
  DashboardData,
  DashboardOptions,
  TaskClassificationResult,
  DashboardHookResult
} from '@/types/dashboard-types';

/**
 * Dashboard数据管理Hook
 * 统一处理数据获取、任务分类和状态管理
 */
export const useDashboardData = (options: DashboardOptions = {}): DashboardHookResult => {
  const {
    enableAutoRefresh = false,
    refreshInterval = 5 * 60 * 1000, // 5分钟
    staleTime = Infinity
  } = options;

  const { isAuthenticated } = useIsAuthenticated();
  const [processedData, setProcessedData] = useState<DashboardData>({
    tasks: [],
    activities: [],
    upcomingTasks: [],
    myTasks: []
  });

  // 使用React Query获取仪表盘数据 - 使用优化的配置
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboardData,
    isRefetching,
    isFetching
  } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: async () => {
      console.log('[useDashboardData] Fetching dashboard data...');
      const response = await api.dashboard.getDashboardData();
      return response;
    },
    enabled: isAuthenticated,
    
    // 使用专门为Dashboard优化的配置，覆盖用户自定义选项
    ...dashboardQueryConfig,
    
    // 用户自定义选项优先级更高
    refetchInterval: enableAutoRefresh ? refreshInterval : false,
    staleTime: staleTime !== Infinity ? staleTime : dashboardQueryConfig.staleTime,
    
    // 优化的select函数，只在数据实际改变时触发组件重渲染
    select: useCallback((data) => {
      // 数据预处理和缓存优化
      if (!data) return data;
      
      // 只返回组件需要的数据字段，减少不必要的重渲染
      return {
        success: data.success,
        data: data.data,
        timestamp: data.timestamp
      };
    }, []),
    
    // 启用查询结构共享，优化内存使用
    structuralSharing: true,
    
    // 网络模式优化 - 即使网络不稳定也能显示缓存数据
    networkMode: 'always',
  });

  // 任务分类逻辑 - 将任务分为临期任务和普通任务
  const classifyTasks = useCallback((tasks: TodoTask[]) => {
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(now.getDate() + 7);

    // 找出所有临期任务（有截止日期且在7天内的任务）以及所有逾期任务
    const upcoming = tasks.filter(task => {
      if (!task.dueDate) return false;

      const dueDate = new Date(task.dueDate);
      // 包含逾期任务（dueDate < now）和临期任务（dueDate <= sevenDaysLater）
      return dueDate <= sevenDaysLater;
    });

    // 记录所有临期任务和逾期任务的ID
    const upcomingTaskIds = new Set(upcoming.map(task => task.id));

    // 我的任务列表排除已经在临期任务中的任务
    const myTasksList = tasks.filter(task => !upcomingTaskIds.has(task.id));

    return {
      upcomingTasks: upcoming,
      myTasks: myTasksList
    };
  }, []);

  // 处理API返回的数据
  const processApiData = useCallback((data: any) => {
    try {
      let tasks: TodoTask[] = [];
      let activities: CollaborationActivity[] = [];

      // 处理任务数据
      if (data && data.tasks) {
        const items = Array.isArray(data.tasks) ? data.tasks :
                     (data.tasks.items && Array.isArray(data.tasks.items)) ? data.tasks.items :
                     [];

        if (items.length > 0) {
          // 映射数据到组件需要的格式
          tasks = items.map((task: any) => ({
            id: task.id || '',
            title: task.title || '',
            description: task.description || '',
            projectId: task.projectId || '',
            projectName: task.projectName || '',
            statusId: task.statusId || task.status || '',
            statusName: task.statusName || task.status || '',
            statusColor: task.statusColor || '#999999',
            priorityId: task.priorityId || task.priority || '',
            priorityName: task.priorityName || task.priority || '',
            priorityColor: task.priorityColor || '#999999',
            priorityScore: task.priorityScore || '',
            dueDate: task.dueDate || '',
            createdAt: task.createdAt || '',
            updatedAt: task.updatedAt || '',
            assigneeId: task.assigneeId || '',
            assigneeName: task.assigneeName || task.assignee || '',
            creatorId: task.creatorId || '',
            creatorName: task.creatorName || task.creator || '',
            progress: task.progress || '',
          }));
        }
      }

      // 处理协作动态信息
      if (data.activities && Array.isArray(data.activities)) {
        activities = data.activities.map((activity: any) => ({
          id: activity.id || '',
          type: activity.type || '',
          userId: activity.userId || '',
          username: activity.username || '',
          projectId: activity.projectId || '',
          projectName: activity.projectName || '',
          content: activity.content || '',
          timestamp: activity.timestamp || '',
          taskId: activity.taskId || '',
          taskTitle: activity.taskTitle || '',
          userName: activity.userName || activity.username || '',
        }));
      }

      // 对任务进行分类
      const { upcomingTasks, myTasks } = classifyTasks(tasks);

      return {
        tasks,
        activities,
        upcomingTasks,
        myTasks
      };
    } catch (error) {
      console.error('[useDashboardData] Error processing data:', error);
      return {
        tasks: [],
        activities: [],
        upcomingTasks: [],
        myTasks: []
      };
    }
  }, [classifyTasks]);

  // 当API数据更新时，处理并更新状态
  useEffect(() => {
    if (dashboardData && !isDashboardLoading) {
      if (dashboardData.success && dashboardData.data) {
        console.log('[useDashboardData] Processing dashboard data...');
        const processed = processApiData(dashboardData.data);
        setProcessedData(processed);
      } else {
        console.warn('[useDashboardData] Dashboard data not successful or empty');
        setProcessedData({
          tasks: [],
          activities: [],
          upcomingTasks: [],
          myTasks: []
        });
      }
    }
  }, [dashboardData, isDashboardLoading, processApiData]);

  // 手动刷新数据
  const refreshData = useCallback(async () => {
    console.log('[useDashboardData] Manual refresh initiated...');
    try {
      await refetchDashboardData();
    } catch (error) {
      console.error('[useDashboardData] Refresh failed:', error);
      throw error;
    }
  }, [refetchDashboardData]);

  // 优化的衍生状态计算 - 使用更精细的依赖来减少重新计算
  const derivedState = useMemo(() => {
    const tasksCount = processedData.tasks.length;
    const upcomingCount = processedData.upcomingTasks.length;
    const myTasksCount = processedData.myTasks.length;
    const activitiesCount = processedData.activities.length;
    
    return {
      hasData: tasksCount > 0,
      totalTasks: tasksCount,
      upcomingTasksCount: upcomingCount,
      myTasksCount: myTasksCount,
      activitiesCount: activitiesCount,
      isLoading: isDashboardLoading,
      isRefreshing: isRefetching,
      isFetching: isFetching,
      error: dashboardError,
      
      // 额外的性能指标
      lastUpdated: processedData.tasks.length > 0 ? new Date() : null,
      dataFreshness: staleTime !== Infinity ? 'configurable' : 'static' as const,
    };
  }, [
    processedData.tasks.length,
    processedData.upcomingTasks.length,
    processedData.myTasks.length,
    processedData.activities.length,
    isDashboardLoading,
    isRefetching,
    isFetching,
    dashboardError,
    staleTime
  ]);

  return {
    // 数据
    ...processedData,
    
    // 状态
    ...derivedState,
    
    // 操作
    refreshData,
    
    // 工具方法
    classifyTasks,
    processApiData
  };
};