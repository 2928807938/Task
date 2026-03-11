import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '@/adapters/api';
import {
  TaskComment,
  TaskCommentsResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentStats,
  CommentSearchRequest,
  UserMentionSuggestion
} from '@/types/api-types';
import { useToast } from '@/hooks/use-toast-hook';

/**
 * 任务评论数据管理Hook
 * 提供评论的CRUD操作、实时更新、缓存管理等功能
 */
export const useTaskComments = (taskId: string) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [optimisticComments, setOptimisticComments] = useState<TaskComment[]>([]);

  // 查询键
  const commentsQueryKey = ['taskComments', taskId];
  const statsQueryKey = ['commentStats', taskId];

  /**
   * 获取任务评论列表
   */
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    error: commentsError,
    refetch: refetchComments
  } = useQuery({
    queryKey: commentsQueryKey,
    queryFn: () => commentApi.getTaskComments(taskId),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5分钟内数据不会被认为是过期的
    gcTime: 10 * 60 * 1000, // 10分钟后从缓存中移除
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  /**
   * 获取评论统计信息
   */
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: statsQueryKey,
    queryFn: () => commentApi.getCommentStats(taskId),
    select: (response) => response.data,
    staleTime: 2 * 60 * 1000, // 2分钟内不重新获取
    gcTime: 5 * 60 * 1000, // 5分钟后从缓存中移除
  });

  /**
   * 创建评论
   */
  const createCommentMutation = useMutation({
    mutationFn: (commentData: Omit<CreateCommentRequest, 'taskId'>) =>
      commentApi.createComment(taskId, commentData),
    onMutate: async (newComment) => {
      // 取消相关的查询以避免覆盖我们的乐观更新
      await queryClient.cancelQueries({ queryKey: commentsQueryKey });

      // 获取之前的数据用于回滚
      const previousComments = queryClient.getQueryData<TaskCommentsResponse>(commentsQueryKey);

      // 创建乐观评论
      const optimisticComment: TaskComment = {
        id: `temp-${Date.now()}`,
        content: newComment.content,
        taskId,
        authorId: 'current-user', // 这里应该从用户状态中获取
        authorName: '我', // 这里应该从用户状态中获取
        parentId: newComment.parentId || null,
        level: newComment.parentId ? 1 : 0,
        mentionedUserIds: newComment.mentionedUserIds || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: [],
        replyCount: 0
      };

      // 乐观更新缓存
      if (previousComments) {
        const updatedComments = [...previousComments.comments];
        if (optimisticComment.parentId) {
          // 如果是回复，添加到对应的父评论下
          const updateReplies = (comments: TaskComment[]): TaskComment[] => {
            return comments.map(comment => {
              if (comment.id === optimisticComment.parentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), optimisticComment],
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
          // 如果是顶级评论，直接添加到列表顶部
          updatedComments.unshift(optimisticComment);
        }

        queryClient.setQueryData(commentsQueryKey, {
          ...previousComments,
          comments: updatedComments,
          total: previousComments.total + 1
        });
      }

      return { previousComments, optimisticComment };
    },
    onError: (err, newComment, context) => {
      // 回滚乐观更新
      if (context?.previousComments) {
        queryClient.setQueryData(commentsQueryKey, context.previousComments);
      }
      showToast({
        title: '评论发布失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    },
    onSuccess: (response, variables, context) => {
      // 用服务器返回的真实数据替换乐观更新的数据
      const realComment = response.data;
      if (realComment && context?.optimisticComment) {
        queryClient.setQueryData<TaskCommentsResponse>(commentsQueryKey, (oldData) => {
          if (!oldData) return oldData;
          
          const replaceOptimistic = (comments: TaskComment[]): TaskComment[] => {
            return comments.map(comment => {
              if (comment.id === context.optimisticComment.id) {
                return realComment;
              }
              if (comment.replies && comment.replies.length > 0) {
                return {
                  ...comment,
                  replies: replaceOptimistic(comment.replies)
                };
              }
              return comment;
            });
          };

          return {
            ...oldData,
            comments: replaceOptimistic(oldData.comments)
          };
        });
      }

      // 刷新统计信息
      queryClient.invalidateQueries({ queryKey: statsQueryKey });
      
      showToast({
        title: '评论发布成功',
        variant: 'default'
      });
    },
    onSettled: () => {
      // 无论成功还是失败，都重新获取最新数据
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
    }
  });

  /**
   * 更新评论
   */
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentRequest }) =>
      commentApi.updateComment(taskId, commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsQueryKey });
      queryClient.invalidateQueries({ queryKey: statsQueryKey });
      showToast({
        title: '评论更新成功',
        variant: 'default'
      });
    },
    onError: () => {
      showToast({
        title: '评论更新失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  });

  /**
   * 删除评论
   */
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentApi.deleteComment(taskId, commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: commentsQueryKey });
      const previousComments = queryClient.getQueryData<TaskCommentsResponse>(commentsQueryKey);

      // 乐观删除
      if (previousComments) {
        const removeComment = (comments: TaskComment[]): TaskComment[] => {
          return comments.filter(comment => comment.id !== commentId).map(comment => {
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: removeComment(comment.replies),
                replyCount: Math.max((comment.replyCount || 0) - 1, 0)
              };
            }
            return comment;
          });
        };

        queryClient.setQueryData(commentsQueryKey, {
          ...previousComments,
          comments: removeComment(previousComments.comments),
          total: Math.max(previousComments.total - 1, 0)
        });
      }

      return { previousComments };
    },
    onError: (err, commentId, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(commentsQueryKey, context.previousComments);
      }
      showToast({
        title: '评论删除失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: statsQueryKey });
      showToast({
        title: '评论删除成功',
        variant: 'default'
      });
    }
  });

  /**
   * 搜索评论
   */
  const [searchResults, setSearchResults] = useState<TaskComment[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchComments = useCallback(async (searchRequest: Omit<CommentSearchRequest, 'taskId'>) => {
    setIsSearching(true);
    try {
      const response = await commentApi.searchComments({ ...searchRequest, taskId });
      if (response.data) {
        setSearchResults(response.data.comments);
      }
    } catch (error) {
      showToast({
        title: '搜索失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  }, [taskId, showToast]);

  /**
   * 获取用户@提及建议
   */
  const getUserSuggestions = useCallback(async (projectId: string, query?: string): Promise<UserMentionSuggestion[]> => {
    try {
      const response = await commentApi.getUserMentionSuggestions(projectId, query);
      return response.data || [];
    } catch (error) {
      console.error('Failed to get user suggestions:', error);
      return [];
    }
  }, []);

  /**
   * 手动触发评论数据刷新
   */
  const refreshComments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: commentsQueryKey });
    queryClient.invalidateQueries({ queryKey: statsQueryKey });
  }, [queryClient, commentsQueryKey, statsQueryKey]);

  // 评论相关的便捷方法
  const createComment = useCallback((commentData: Omit<CreateCommentRequest, 'taskId'>) => {
    return createCommentMutation.mutate(commentData);
  }, [createCommentMutation]);

  const updateComment = useCallback((commentId: string, data: UpdateCommentRequest) => {
    return updateCommentMutation.mutate({ commentId, data });
  }, [updateCommentMutation]);

  const deleteComment = useCallback((commentId: string) => {
    return deleteCommentMutation.mutate(commentId);
  }, [deleteCommentMutation]);

  return {
    // 数据
    comments: commentsData?.comments || [],
    commentStats: statsData,
    searchResults,
    
    // 加载状态
    isLoadingComments,
    isLoadingStats,
    isSearching,
    
    // 操作状态
    isCreatingComment: createCommentMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
    
    // 错误状态
    commentsError,
    statsError,
    
    // 操作方法
    createComment,
    updateComment,
    deleteComment,
    searchComments,
    getUserSuggestions,
    refreshComments,
    refetchComments
  };
};

/**
 * 用于获取@提及通知的Hook
 */
export const useMentionNotifications = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['mentionNotifications'],
    queryFn: () => commentApi.getMentionNotifications(),
    select: (response) => response.data,
    staleTime: 1 * 60 * 1000, // 1分钟内不重新获取
    gcTime: 5 * 60 * 1000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationIds: string[]) => 
      commentApi.markMentionNotificationsAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentionNotifications'] });
    },
    onError: () => {
      showToast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  });

  return {
    notifications: notificationsData?.content || [],
    total: notificationsData?.total || 0,
    hasMore: notificationsData?.hasMore || false,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    refetch
  };
};