import httpClientImpl from '@/infrastructure/http/http-client-impl';
import Cookies from 'js-cookie';
import {
    ApiResponse,
    TaskComment,
    TaskCommentsResponse,
    CreateCommentRequest,
    UpdateCommentRequest,
    CommentStats,
    CommentSearchRequest,
    UserMentionSuggestion,
    MentionNotification
} from '@/types/api-types';

/**
 * 获取认证令牌
 */
const getAuthToken = (): string | undefined => {
  return Cookies.get('auth_token');
};

/**
 * 任务评论API服务
 */
export const commentApi = {
  /**
   * 获取任务评论列表（树形结构）
   * @param taskId 任务ID
   * @param page 页码，从0开始
   * @param size 每页大小
   * @returns 评论树列表
   */
  getTaskComments: async (
    taskId: string, 
    page?: number, 
    size?: number
  ): Promise<ApiResponse<TaskCommentsResponse>> => {
    const token = getAuthToken();
    const params = new URLSearchParams();
    
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    
    const queryString = params.toString();
    const endpoint = `/api/client/tasks/${taskId}/comments${queryString ? `?${queryString}` : ''}`;
    
    return httpClientImpl.get<TaskCommentsResponse>(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
  },

  /**
   * 创建任务评论
   * @param taskId 任务ID
   * @param commentData 评论数据
   * @returns 创建的评论
   */
  createComment: async (
    taskId: string,
    commentData: Omit<CreateCommentRequest, 'taskId'>
  ): Promise<ApiResponse<TaskComment>> => {
    const token = getAuthToken();
    const requestData: CreateCommentRequest = { ...commentData, taskId };
    
    return httpClientImpl.post<TaskComment>(`/api/client/tasks/${taskId}/comments`, requestData, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      showNotification: true,
      fallbackMessage: '评论发布操作'
    });
  },

  /**
   * 更新评论
   * @param taskId 任务ID
   * @param commentId 评论ID
   * @param commentData 更新的评论数据
   * @returns 更新后的评论
   */
  updateComment: async (
    taskId: string,
    commentId: string,
    commentData: UpdateCommentRequest
  ): Promise<ApiResponse<TaskComment>> => {
    const token = getAuthToken();
    
    return httpClientImpl.put<TaskComment>(
      `/api/client/tasks/${taskId}/comments/${commentId}`, 
      commentData, 
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        showNotification: true,
        fallbackMessage: '评论更新操作'
      }
    );
  },

  /**
   * 删除评论
   * @param taskId 任务ID
   * @param commentId 评论ID
   * @returns 删除结果
   */
  deleteComment: async (taskId: string, commentId: string): Promise<ApiResponse<void>> => {
    const token = getAuthToken();
    
    return httpClientImpl.delete<void>(`/api/client/tasks/${taskId}/comments/${commentId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      showNotification: true,
      fallbackMessage: '评论删除操作'
    });
  },

  /**
   * 获取评论统计信息
   * @param taskId 任务ID
   * @returns 评论统计信息
   */
  getCommentStats: async (taskId: string): Promise<ApiResponse<CommentStats>> => {
    const token = getAuthToken();
    
    return httpClientImpl.get<CommentStats>(`/api/client/tasks/${taskId}/comments/stats`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
  },

  /**
   * 搜索评论
   * @param searchRequest 搜索请求参数
   * @returns 搜索结果
   */
  searchComments: async (searchRequest: CommentSearchRequest): Promise<ApiResponse<TaskCommentsResponse>> => {
    const token = getAuthToken();
    const { taskId, ...params } = searchRequest;
    
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = `/api/client/tasks/${taskId}/comments/search${queryString ? `?${queryString}` : ''}`;
    
    return httpClientImpl.get<TaskCommentsResponse>(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
  },

  /**
   * 获取项目成员列表（用于@提及建议）
   * @param projectId 项目ID
   * @param query 查询关键词
   * @returns 用户建议列表
   */
  getUserMentionSuggestions: async (
    projectId: string, 
    query?: string
  ): Promise<ApiResponse<UserMentionSuggestion[]>> => {
    const token = getAuthToken();
    const params = new URLSearchParams();
    
    if (query) params.append('query', query);
    
    const queryString = params.toString();
    const endpoint = `/api/client/project/${projectId}/members/suggestions${queryString ? `?${queryString}` : ''}`;
    
    return httpClientImpl.get<UserMentionSuggestion[]>(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
  },

  /**
   * 获取当前用户的@提及通知
   * @param page 页码，从0开始
   * @param size 每页大小
   * @returns @提及通知列表
   */
  getMentionNotifications: async (
    page?: number, 
    size?: number
  ): Promise<ApiResponse<{ content: MentionNotification[]; total: number; hasMore: boolean; }>> => {
    const token = getAuthToken();
    const params = new URLSearchParams();
    
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    
    const queryString = params.toString();
    const endpoint = `/api/client/user/comments/mentions${queryString ? `?${queryString}` : ''}`;
    
    return httpClientImpl.get<{ content: MentionNotification[]; total: number; hasMore: boolean; }>(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
  },

  /**
   * 标记@提及通知为已读
   * @param notificationIds 通知ID列表
   * @returns 操作结果
   */
  markMentionNotificationsAsRead: async (notificationIds: string[]): Promise<ApiResponse<void>> => {
    const token = getAuthToken();
    
    return httpClientImpl.post<void>('/api/client/user/comments/mentions/mark-read', {
      notificationIds
    }, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      showNotification: false // 标记已读通常不需要通知
    });
  },

  /**
   * 获取单个评论详情
   * @param taskId 任务ID
   * @param commentId 评论ID
   * @returns 评论详情
   */
  getComment: async (taskId: string, commentId: string): Promise<ApiResponse<TaskComment>> => {
    const token = getAuthToken();
    
    return httpClientImpl.get<TaskComment>(`/api/client/tasks/${taskId}/comments/${commentId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
  }
};