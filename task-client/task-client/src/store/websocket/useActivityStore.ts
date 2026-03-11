import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { ActivityEvent } from '@/infrastructure/websocket/types';
import { webSocketManager } from '@/infrastructure/websocket/websocket-manager';

interface ActivityState {
  // 活动数据
  activities: ActivityEvent[];
  activityMap: Map<string, ActivityEvent>;
  
  // 过滤和分组状态
  filteredActivities: ActivityEvent[];
  filters: {
    projectId?: number;
    userId?: number;
    activityType?: string;
    timeRange?: 'today' | 'week' | 'month' | 'all';
  };
  
  // 分页状态
  pageSize: number;
  currentPage: number;
  hasMore: boolean;
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // 统计信息
  totalCount: number;
  unreadCount: number;
  
  // 动作
  addActivity: (activity: ActivityEvent) => void;
  removeActivity: (activityId: string) => void;
  clearActivities: () => void;
  setFilters: (filters: Partial<ActivityState['filters']>) => void;
  applyFilters: () => void;
  loadMore: () => void;
  markAsRead: (activityId: string) => void;
  markAllAsRead: () => void;
  
  // 数据获取动作
  getActivitiesByType: (activityType: string) => ActivityEvent[];
  getActivitiesByUser: (userId: number) => ActivityEvent[];
  getActivitiesByProject: (projectId: number) => ActivityEvent[];
  getRecentActivities: (limit?: number) => ActivityEvent[];
}

/**
 * 实时活动状态管理Store
 */
export const useActivityStore = create<ActivityState>()(
  subscribeWithSelector(
    devtools((set, get) => ({
      // 初始状态
      activities: [],
      activityMap: new Map(),
      filteredActivities: [],
      filters: { timeRange: 'all' },
      pageSize: 20,
      currentPage: 1,
      hasMore: true,
      isLoading: false,
      error: null,
      totalCount: 0,
      unreadCount: 0,

      // 添加新活动
      addActivity: (activity) => {
        set((state) => {
          // 防止重复添加
          if (activity.id && state.activityMap.has(activity.id)) {
            return state;
          }

          // 确保活动有ID
          const activityWithId = {
            ...activity,
            id: activity.id || `activity_${Date.now()}_${Math.random()}`
          };

          const newActivityMap = new Map(state.activityMap);
          newActivityMap.set(activityWithId.id, activityWithId);

          // 保持最新的1000条活动记录
          const newActivities = [activityWithId, ...state.activities].slice(0, 1000);
          
          // 按时间排序
          newActivities.sort((a, b) => b.timestamp - a.timestamp);

          const newState = {
            ...state,
            activities: newActivities,
            activityMap: newActivityMap,
            totalCount: state.totalCount + 1,
            unreadCount: state.unreadCount + 1
          };

          // 重新应用过滤器
          return {
            ...newState,
            filteredActivities: applyFiltersToActivities(newActivities, state.filters)
          };
        });
      },

      // 移除活动
      removeActivity: (activityId) => {
        set((state) => {
          const newActivityMap = new Map(state.activityMap);
          newActivityMap.delete(activityId);

          const newActivities = state.activities.filter(activity => activity.id !== activityId);

          return {
            ...state,
            activities: newActivities,
            activityMap: newActivityMap,
            filteredActivities: applyFiltersToActivities(newActivities, state.filters),
            totalCount: Math.max(0, state.totalCount - 1)
          };
        });
      },

      // 清空所有活动
      clearActivities: () => {
        set({
          activities: [],
          activityMap: new Map(),
          filteredActivities: [],
          totalCount: 0,
          unreadCount: 0,
          currentPage: 1,
          hasMore: true
        });
      },

      // 设置过滤条件
      setFilters: (filters) => {
        set((state) => {
          const newFilters = { ...state.filters, ...filters };
          return {
            ...state,
            filters: newFilters,
            filteredActivities: applyFiltersToActivities(state.activities, newFilters),
            currentPage: 1
          };
        });
      },

      // 应用过滤器
      applyFilters: () => {
        set((state) => ({
          ...state,
          filteredActivities: applyFiltersToActivities(state.activities, state.filters)
        }));
      },

      // 加载更多
      loadMore: () => {
        set((state) => ({
          ...state,
          currentPage: state.currentPage + 1
        }));
      },

      // 标记为已读
      markAsRead: (activityId) => {
        set((state) => {
          const activity = state.activityMap.get(activityId);
          if (activity && !activity.metadata?.read) {
            const updatedActivity = {
              ...activity,
              metadata: { ...activity.metadata, read: true }
            };

            const newActivityMap = new Map(state.activityMap);
            newActivityMap.set(activityId, updatedActivity);

            const newActivities = state.activities.map(a => 
              a.id === activityId ? updatedActivity : a
            );

            return {
              ...state,
              activities: newActivities,
              activityMap: newActivityMap,
              filteredActivities: applyFiltersToActivities(newActivities, state.filters),
              unreadCount: Math.max(0, state.unreadCount - 1)
            };
          }
          return state;
        });
      },

      // 全部标记为已读
      markAllAsRead: () => {
        set((state) => {
          const newActivityMap = new Map();
          const newActivities = state.activities.map(activity => {
            const updatedActivity = {
              ...activity,
              metadata: { ...activity.metadata, read: true }
            };
            newActivityMap.set(activity.id, updatedActivity);
            return updatedActivity;
          });

          return {
            ...state,
            activities: newActivities,
            activityMap: newActivityMap,
            filteredActivities: applyFiltersToActivities(newActivities, state.filters),
            unreadCount: 0
          };
        });
      },

      // 数据查询方法
      getActivitiesByType: (activityType) => {
        const state = get();
        return state.activities.filter(activity => activity.activityType === activityType);
      },

      getActivitiesByUser: (userId) => {
        const state = get();
        return state.activities.filter(activity => activity.userId === userId);
      },

      getActivitiesByProject: (projectId) => {
        const state = get();
        return state.activities.filter(activity => activity.projectId === projectId);
      },

      getRecentActivities: (limit = 10) => {
        const state = get();
        return state.activities.slice(0, limit);
      }
    }), {
      name: 'activity-store'
    })
  )
);

/**
 * 应用过滤器到活动列表
 */
function applyFiltersToActivities(activities: ActivityEvent[], filters: ActivityState['filters']): ActivityEvent[] {
  let filtered = [...activities];

  // 按项目ID过滤
  if (filters.projectId) {
    filtered = filtered.filter(activity => activity.projectId === filters.projectId);
  }

  // 按用户ID过滤
  if (filters.userId) {
    filtered = filtered.filter(activity => activity.userId === filters.userId);
  }

  // 按活动类型过滤
  if (filters.activityType) {
    filtered = filtered.filter(activity => activity.activityType === filters.activityType);
  }

  // 按时间范围过滤
  if (filters.timeRange && filters.timeRange !== 'all') {
    const now = Date.now();
    const ranges = {
      today: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };
    const range = ranges[filters.timeRange];
    if (range) {
      filtered = filtered.filter(activity => now - activity.timestamp <= range);
    }
  }

  return filtered;
}

// 初始化活动事件监听
let isActivityListenerInitialized = false;

export const initializeActivityEventListeners = () => {
  if (isActivityListenerInitialized) {
    return;
  }

  isActivityListenerInitialized = true;

  // 监听实时活动事件
  const unsubscribeActivity = webSocketManager.onActivity((activity) => {
    console.log('[ActivityStore] Received activity event:', activity);
    useActivityStore.getState().addActivity(activity);
  });

  // 清理函数
  return () => {
    unsubscribeActivity();
    isActivityListenerInitialized = false;
  };
};