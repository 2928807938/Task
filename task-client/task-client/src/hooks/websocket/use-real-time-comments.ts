import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { webSocketManager } from '@/infrastructure/websocket/websocket-manager';
import { 
  ActivityEvent, 
  CommentEvent, 
  CommentActivityEvent,
  ActivityType 
} from '@/infrastructure/websocket/types';
import { TaskComment, TaskCommentsResponse } from '@/types/api-types';

/**
 * 实时评论更新Hook
 * 监听WebSocket评论相关事件，更新本地缓存
 */
export const useRealTimeComments = (taskId: string, enabled: boolean = true) => {
  const queryClient = useQueryClient();
  const commentsQueryKey = ['taskComments', taskId];
  const statsQueryKey = ['commentStats', taskId];
  
  // 存储事件监听器清理函数
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  // 处理评论创建事件
  const handleCommentCreated = useCallback((event: CommentActivityEvent) => {
    if (event.taskId?.toString() !== taskId) return;

    // 更新评论列表缓存
    queryClient.setQueryData<TaskCommentsResponse>(commentsQueryKey, (oldData) => {
      if (!oldData) return oldData;

      // 创建新评论对象
      const newComment: TaskComment = {
        id: event.commentId,
        content: event.commentContent || '',
        taskId: taskId,
        authorId: event.userId.toString(),
        authorName: event.username,
        authorAvatar: event.userAvatar,
        parentId: event.parentCommentId || null,
        level: event.parentCommentId ? 1 : 0,
        mentionedUserIds: event.mentionedUserIds || [],
        createdAt: new Date(event.timestamp).toISOString(),
        updatedAt: new Date(event.timestamp).toISOString(),
        replies: [],
        replyCount: 0
      };

      const updatedComments = [...oldData.comments];

      if (newComment.parentId) {
        // 如果是回复，添加到对应的父评论下
        const updateReplies = (comments: TaskComment[]): TaskComment[] => {
          return comments.map(comment => {
            if (comment.id === newComment.parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), newComment],
                replyCount: (comment.replyCount || 0) + 1
              };
            }
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateReplies(comment.replies)
              };
            }
            return comment;
          });
        };
        updatedComments.splice(0, updatedComments.length, ...updateReplies(updatedComments));
      } else {
        // 如果是顶级评论，添加到列表顶部
        updatedComments.unshift(newComment);
      }

      return {
        ...oldData,
        comments: updatedComments,
        total: oldData.total + 1
      };
    });

    // 刷新统计信息
    queryClient.invalidateQueries({ queryKey: statsQueryKey });

    console.log(`[RealTimeComments] Comment created in task ${taskId}:`, event.commentId);
  }, [taskId, queryClient, commentsQueryKey, statsQueryKey]);

  // 处理评论更新事件
  const handleCommentUpdated = useCallback((event: CommentActivityEvent) => {
    if (event.taskId?.toString() !== taskId) return;

    queryClient.setQueryData<TaskCommentsResponse>(commentsQueryKey, (oldData) => {
      if (!oldData) return oldData;

      const updateComment = (comments: TaskComment[]): TaskComment[] => {
        return comments.map(comment => {
          if (comment.id === event.commentId) {
            return {
              ...comment,
              content: event.commentContent || comment.content,
              mentionedUserIds: event.mentionedUserIds || comment.mentionedUserIds,
              updatedAt: new Date(event.timestamp).toISOString()
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateComment(comment.replies)
            };
          }
          return comment;
        });
      };

      return {
        ...oldData,
        comments: updateComment(oldData.comments)
      };
    });

    console.log(`[RealTimeComments] Comment updated in task ${taskId}:`, event.commentId);
  }, [taskId, queryClient, commentsQueryKey]);

  // 处理评论删除事件
  const handleCommentDeleted = useCallback((event: CommentActivityEvent) => {
    if (event.taskId?.toString() !== taskId) return;

    queryClient.setQueryData<TaskCommentsResponse>(commentsQueryKey, (oldData) => {
      if (!oldData) return oldData;

      const removeComment = (comments: TaskComment[]): TaskComment[] => {
        return comments.filter(comment => comment.id !== event.commentId).map(comment => {
          if (comment.replies && comment.replies.length > 0) {
            const filteredReplies = removeComment(comment.replies);
            const removedCount = (comment.replies.length - filteredReplies.length);
            return {
              ...comment,
              replies: filteredReplies,
              replyCount: Math.max((comment.replyCount || 0) - removedCount, 0)
            };
          }
          return comment;
        });
      };

      return {
        ...oldData,
        comments: removeComment(oldData.comments),
        total: Math.max(oldData.total - 1, 0)
      };
    });

    // 刷新统计信息
    queryClient.invalidateQueries({ queryKey: statsQueryKey });

    console.log(`[RealTimeComments] Comment deleted in task ${taskId}:`, event.commentId);
  }, [taskId, queryClient, commentsQueryKey, statsQueryKey]);

  // 处理用户@提及事件
  const handleUserMentioned = useCallback((event: ActivityEvent) => {
    if (event.taskId?.toString() !== taskId) return;
    
    // 更新@提及通知
    queryClient.invalidateQueries({ queryKey: ['mentionNotifications'] });

    console.log(`[RealTimeComments] User mentioned in task ${taskId}:`, event);
  }, [taskId, queryClient]);

  // 统一处理活动事件
  const handleActivityEvent = useCallback((event: ActivityEvent) => {
    const commentEvent = event as CommentActivityEvent;
    
    switch (event.activityType) {
      case ActivityType.COMMENT_CREATED:
      case ActivityType.COMMENT_REPLY_CREATED:
        handleCommentCreated(commentEvent);
        break;
      case ActivityType.COMMENT_UPDATED:
        handleCommentUpdated(commentEvent);
        break;
      case ActivityType.COMMENT_DELETED:
        handleCommentDeleted(commentEvent);
        break;
      case ActivityType.USER_MENTIONED:
        handleUserMentioned(event);
        break;
    }
  }, [handleCommentCreated, handleCommentUpdated, handleCommentDeleted, handleUserMentioned]);

  // 设置WebSocket监听器
  useEffect(() => {
    if (!enabled || !webSocketManager.isConnected()) {
      return;
    }

    console.log(`[RealTimeComments] Setting up real-time comment listeners for task ${taskId}`);

    // 监听活动事件
    const unsubscribeActivity = webSocketManager.onActivity(handleActivityEvent);
    cleanupFunctionsRef.current.push(unsubscribeActivity);

    // 订阅任务特定的频道
    const taskSubscriptionId = webSocketManager.subscribeToTask(parseInt(taskId));
    if (taskSubscriptionId) {
      cleanupFunctionsRef.current.push(() => {
        webSocketManager.unsubscribeFromTask(parseInt(taskId));
      });
    }

    // 返回清理函数
    return () => {
      console.log(`[RealTimeComments] Cleaning up real-time comment listeners for task ${taskId}`);
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current = [];
    };
  }, [enabled, taskId, handleActivityEvent]);

  // 手动刷新评论数据
  const refreshComments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: commentsQueryKey });
    queryClient.invalidateQueries({ queryKey: statsQueryKey });
  }, [queryClient, commentsQueryKey, statsQueryKey]);

  // 发送用户正在输入评论的状态
  const updateUserCommentingStatus = useCallback((isCommenting: boolean, commentId?: string) => {
    if (!webSocketManager.isConnected()) return;

    webSocketManager.updateUserStatus(
      isCommenting ? 'commenting' : 'viewing_task',
      parseInt(taskId)
    );
  }, [taskId]);

  return {
    refreshComments,
    updateUserCommentingStatus
  };
};

/**
 * 全局评论事件监听Hook
 * 用于监听所有项目的评论事件，更新相关缓存
 */
export const useGlobalCommentEvents = (projectId?: string, enabled: boolean = true) => {
  const queryClient = useQueryClient();

  const handleGlobalCommentEvent = useCallback((event: ActivityEvent) => {
    // 只处理当前项目的事件
    if (projectId && event.projectId.toString() !== projectId) {
      return;
    }

    const commentEvent = event as CommentActivityEvent;

    // 根据事件类型更新相关查询缓存
    switch (event.activityType) {
      case ActivityType.COMMENT_CREATED:
      case ActivityType.COMMENT_REPLY_CREATED:
      case ActivityType.COMMENT_UPDATED:
      case ActivityType.COMMENT_DELETED:
        // 刷新相关任务的评论缓存
        if (commentEvent.taskId) {
          queryClient.invalidateQueries({ 
            queryKey: ['taskComments', commentEvent.taskId.toString()] 
          });
          queryClient.invalidateQueries({ 
            queryKey: ['commentStats', commentEvent.taskId.toString()] 
          });
        }
        // 刷新项目活动缓存
        queryClient.invalidateQueries({ 
          queryKey: ['projectActivity', projectId] 
        });
        break;
      case ActivityType.USER_MENTIONED:
        // 刷新@提及通知
        queryClient.invalidateQueries({ queryKey: ['mentionNotifications'] });
        break;
    }
  }, [projectId, queryClient]);

  useEffect(() => {
    if (!enabled || !webSocketManager.isConnected()) {
      return;
    }

    console.log(`[GlobalCommentEvents] Setting up global comment event listener for project ${projectId}`);

    const unsubscribe = webSocketManager.onActivity(handleGlobalCommentEvent);

    return () => {
      console.log(`[GlobalCommentEvents] Cleaning up global comment event listener for project ${projectId}`);
      unsubscribe();
    };
  }, [enabled, projectId, handleGlobalCommentEvent]);
};