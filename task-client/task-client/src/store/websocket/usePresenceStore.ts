import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { PresenceEvent, PresenceStatus } from '@/infrastructure/websocket/types';
import { webSocketManager } from '@/infrastructure/websocket/websocket-manager';

interface UserPresence {
  userId: number;
  username?: string;
  userAvatar?: string;
  status: string;
  lastActivity?: number;
  currentPage?: string;
  taskId?: number;
  timestamp: number;
}

interface PresenceState {
  // 用户状态数据
  presenceMap: Map<number, UserPresence>;
  onlineUsers: UserPresence[];
  
  // 当前用户状态
  myStatus: string;
  myLastActivity: number;
  
  // 按状态分组的用户
  statusGroups: {
    online: UserPresence[];
    idle: UserPresence[];
    typing: UserPresence[];
    viewing: UserPresence[];
    editing: UserPresence[];
  };
  
  // 按任务分组的用户
  taskUserMap: Map<number, UserPresence[]>;
  
  // 统计信息
  totalOnlineCount: number;
  
  // 动作
  updateUserPresence: (presenceEvent: PresenceEvent) => void;
  removeUser: (userId: number) => void;
  clearAllPresence: () => void;
  setMyStatus: (status: string, taskId?: number) => void;
  
  // 查询方法
  getUserPresence: (userId: number) => UserPresence | undefined;
  isUserOnline: (userId: number) => boolean;
  getUsersByStatus: (status: string) => UserPresence[];
  getUsersInTask: (taskId: number) => UserPresence[];
  getTypingUsers: () => UserPresence[];
  
  // 统计方法
  getOnlineCount: () => number;
  getStatusCount: (status: string) => number;
}

/**
 * 用户在线状态管理Store
 */
export const usePresenceStore = create<PresenceState>()(
  subscribeWithSelector(
    devtools((set, get) => ({
      // 初始状态
      presenceMap: new Map(),
      onlineUsers: [],
      myStatus: PresenceStatus.OFFLINE,
      myLastActivity: Date.now(),
      statusGroups: {
        online: [],
        idle: [],
        typing: [],
        viewing: [],
        editing: []
      },
      taskUserMap: new Map(),
      totalOnlineCount: 0,

      // 更新用户状态
      updateUserPresence: (presenceEvent) => {
        set((state) => {
          const newPresenceMap = new Map(state.presenceMap);
          
          const userPresence: UserPresence = {
            userId: presenceEvent.userId,
            username: presenceEvent.username,
            userAvatar: presenceEvent.userAvatar,
            status: presenceEvent.status,
            lastActivity: presenceEvent.lastActivity,
            currentPage: presenceEvent.currentPage,
            taskId: presenceEvent.taskId,
            timestamp: presenceEvent.timestamp
          };

          // 如果用户离线，延迟移除
          if (presenceEvent.status === PresenceStatus.OFFLINE) {
            // 立即更新状态为离线
            newPresenceMap.set(presenceEvent.userId, userPresence);
            
            // 30秒后完全移除
            setTimeout(() => {
              const currentState = usePresenceStore.getState();
              const updatedMap = new Map(currentState.presenceMap);
              updatedMap.delete(presenceEvent.userId);
              
              set({
                presenceMap: updatedMap,
                ...updateDerivedData(updatedMap)
              });
            }, 30000);
          } else {
            newPresenceMap.set(presenceEvent.userId, userPresence);
          }

          return {
            ...state,
            presenceMap: newPresenceMap,
            ...updateDerivedData(newPresenceMap)
          };
        });
      },

      // 移除用户
      removeUser: (userId) => {
        set((state) => {
          const newPresenceMap = new Map(state.presenceMap);
          newPresenceMap.delete(userId);

          return {
            ...state,
            presenceMap: newPresenceMap,
            ...updateDerivedData(newPresenceMap)
          };
        });
      },

      // 清空所有状态
      clearAllPresence: () => {
        set({
          presenceMap: new Map(),
          onlineUsers: [],
          statusGroups: {
            online: [],
            idle: [],
            typing: [],
            viewing: [],
            editing: []
          },
          taskUserMap: new Map(),
          totalOnlineCount: 0
        });
      },

      // 设置当前用户状态
      setMyStatus: (status, taskId) => {
        set((state) => ({
          ...state,
          myStatus: status,
          myLastActivity: Date.now()
        }));

        // 通过WebSocket更新状态
        try {
          webSocketManager.updateUserStatus(status, taskId);
        } catch (error) {
          console.error('[PresenceStore] Failed to update status:', error);
        }
      },

      // 查询方法
      getUserPresence: (userId) => {
        const state = get();
        return state.presenceMap.get(userId);
      },

      isUserOnline: (userId) => {
        const state = get();
        const presence = state.presenceMap.get(userId);
        return presence ? presence.status !== PresenceStatus.OFFLINE : false;
      },

      getUsersByStatus: (status) => {
        const state = get();
        return Array.from(state.presenceMap.values()).filter(user => user.status === status);
      },

      getUsersInTask: (taskId) => {
        const state = get();
        return state.taskUserMap.get(taskId) || [];
      },

      getTypingUsers: () => {
        const state = get();
        return state.statusGroups.typing;
      },

      // 统计方法
      getOnlineCount: () => {
        const state = get();
        return state.totalOnlineCount;
      },

      getStatusCount: (status) => {
        const state = get();
        return Array.from(state.presenceMap.values()).filter(user => user.status === status).length;
      }
    }), {
      name: 'presence-store'
    })
  )
);

/**
 * 更新派生数据
 */
function updateDerivedData(presenceMap: Map<number, UserPresence>) {
  const allUsers = Array.from(presenceMap.values());
  
  // 过滤在线用户
  const onlineUsers = allUsers.filter(user => user.status !== PresenceStatus.OFFLINE);
  
  // 按状态分组
  const statusGroups = {
    online: allUsers.filter(user => user.status === PresenceStatus.ONLINE),
    idle: allUsers.filter(user => user.status === PresenceStatus.IDLE),
    typing: allUsers.filter(user => user.status === PresenceStatus.TYPING),
    viewing: allUsers.filter(user => user.status === PresenceStatus.VIEWING_TASK),
    editing: allUsers.filter(user => user.status === PresenceStatus.EDITING_TASK)
  };
  
  // 按任务分组
  const taskUserMap = new Map<number, UserPresence[]>();
  allUsers.forEach(user => {
    if (user.taskId) {
      const taskUsers = taskUserMap.get(user.taskId) || [];
      taskUsers.push(user);
      taskUserMap.set(user.taskId, taskUsers);
    }
  });
  
  return {
    onlineUsers,
    statusGroups,
    taskUserMap,
    totalOnlineCount: onlineUsers.length
  };
}

// 定期清理过期状态
let cleanupInterval: NodeJS.Timeout | null = null;

export const startPresenceCleanup = () => {
  if (cleanupInterval) {
    return;
  }

  cleanupInterval = setInterval(() => {
    const state = usePresenceStore.getState();
    const now = Date.now();
    const PRESENCE_TIMEOUT = 5 * 60 * 1000; // 5分钟超时

    const updatedMap = new Map(state.presenceMap);
    let hasChanges = false;

    for (const [userId, presence] of updatedMap.entries()) {
      // 如果用户超过5分钟没有活动，标记为离线
      if (now - presence.timestamp > PRESENCE_TIMEOUT && presence.status !== PresenceStatus.OFFLINE) {
        updatedMap.set(userId, { ...presence, status: PresenceStatus.OFFLINE });
        hasChanges = true;
      }
    }

    if (hasChanges) {
      usePresenceStore.setState({
        presenceMap: updatedMap,
        ...updateDerivedData(updatedMap)
      });
    }
  }, 60000); // 每分钟检查一次
};

export const stopPresenceCleanup = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};

// 初始化状态事件监听
let isPresenceListenerInitialized = false;

export const initializePresenceEventListeners = () => {
  if (isPresenceListenerInitialized) {
    return;
  }

  isPresenceListenerInitialized = true;

  // 监听用户状态事件
  const unsubscribePresence = webSocketManager.onPresence((presenceEvent) => {
    console.log('[PresenceStore] Received presence event:', presenceEvent);
    usePresenceStore.getState().updateUserPresence(presenceEvent);
  });

  // 启动清理定时器
  startPresenceCleanup();

  // 清理函数
  return () => {
    unsubscribePresence();
    stopPresenceCleanup();
    isPresenceListenerInitialized = false;
  };
};