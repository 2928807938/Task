import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  Filter,
  SortDesc,
  RefreshCw,
  Users,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/ui/atoms/Button';
import { Input } from '@/ui/atoms/Input';
import CommentEditor from '@/ui/molecules/CommentEditor';
import CommentItem from '@/ui/molecules/CommentItem';
import { LoadingSpinner } from '@/ui/molecules/LoadingSpinner';
import { useTaskComments } from '@/hooks/use-task-comments-hook';
import { useRealTimeComments } from '@/hooks/websocket/use-real-time-comments';
import { TaskComment } from '@/types/api-types';

interface TaskCommentSectionProps {
  /** 任务ID */
  taskId: string;
  /** 项目ID */
  projectId: string;
  /** 当前用户ID */
  currentUserId?: string;
  /** 是否显示统计信息 */
  showStats?: boolean;
  /** 是否允许创建评论 */
  allowCreateComment?: boolean;
  /** 是否允许编辑评论 */
  allowEditComment?: boolean;
  /** 是否允许删除评论 */
  allowDeleteComment?: boolean;
  /** 最大嵌套层级 */
  maxNestingLevel?: number;
}

const TaskCommentSection: React.FC<TaskCommentSectionProps> = ({
  taskId,
  projectId,
  currentUserId,
  showStats = true,
  allowCreateComment = true,
  allowEditComment = true,
  allowDeleteComment = true,
  maxNestingLevel = 3
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'mentions' | 'own'>('all');
  const [showSearch, setShowSearch] = useState(false);

  // 使用评论数据管理Hook
  const {
    comments,
    commentStats,
    isLoadingComments,
    isCreatingComment,
    isUpdatingComment,
    isDeletingComment,
    createComment,
    updateComment,
    deleteComment,
    getUserSuggestions,
    refreshComments,
    searchComments,
    searchResults,
    isSearching
  } = useTaskComments(taskId);

  // 使用实时评论更新Hook
  const { updateUserCommentingStatus } = useRealTimeComments(taskId, true);

  // 处理评论创建
  const handleCreateComment = useCallback((content: string, mentionedUserIds: string[]) => {
    createComment({
      content,
      mentionedUserIds
    });
  }, [createComment]);

  // 处理回复
  const handleReply = useCallback((parentId: string, content: string, mentionedUserIds: string[]) => {
    createComment({
      content,
      parentId,
      mentionedUserIds
    });
  }, [createComment]);

  // 处理编辑
  const handleEdit = useCallback((commentId: string, content: string, mentionedUserIds: string[]) => {
    updateComment(commentId, {
      content,
      mentionedUserIds
    });
  }, [updateComment]);

  // 处理删除
  const handleDelete = useCallback((commentId: string) => {
    deleteComment(commentId);
  }, [deleteComment]);

  // 处理搜索
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    await searchComments({
      keyword: query,
      page: 0,
      size: 20
    });
  }, [searchComments]);

  // 过滤和排序评论
  const filteredAndSortedComments = useMemo(() => {
    let result = searchQuery ? searchResults : comments;

    // 应用过滤器
    if (filterBy === 'mentions' && currentUserId) {
      result = result.filter(comment => 
        comment.mentionedUserIds.includes(currentUserId) ||
        (comment.replies && comment.replies.some(reply => 
          reply.mentionedUserIds.includes(currentUserId)
        ))
      );
    } else if (filterBy === 'own' && currentUserId) {
      result = result.filter(comment => 
        comment.authorId === currentUserId ||
        (comment.replies && comment.replies.some(reply => 
          reply.authorId === currentUserId
        ))
      );
    }

    // 应用排序
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          // 这里可以根据点赞数、回复数等排序
          return (b.replyCount || 0) - (a.replyCount || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [comments, searchResults, searchQuery, filterBy, sortBy, currentUserId]);

  // 获取用户建议
  const handleGetUserSuggestions = useCallback(async (query: string) => {
    return await getUserSuggestions(projectId, query);
  }, [getUserSuggestions, projectId]);

  const isAnyOperationInProgress = isCreatingComment || isUpdatingComment || isDeletingComment;

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      {showStats && commentStats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <MessageCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {commentStats.total}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                总评论数
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {commentStats.recent24h}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                24小时内
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {Object.keys(commentStats.byLevel).length}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                参与人数
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 工具栏 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageCircle size={20} />
            讨论 ({commentStats?.total || comments.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* 搜索按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSearch(!showSearch)}
            className={showSearch ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}
          >
            <Search size={16} />
          </Button>

          {/* 筛选下拉 */}
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as any)}
            className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="all">全部评论</option>
            <option value="mentions">提到我的</option>
            <option value="own">我的评论</option>
          </select>

          {/* 排序下拉 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="newest">最新优先</option>
            <option value="oldest">最早优先</option>
            <option value="popular">热门优先</option>
          </select>

          {/* 刷新按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshComments}
            disabled={isLoadingComments}
          >
            <RefreshCw size={16} className={isLoadingComments ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* 搜索栏 */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="relative">
              <Input
                placeholder="搜索评论内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="pr-12"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearch(searchQuery)}
                disabled={isSearching}
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                {isSearching ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Search size={16} />
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 创建评论编辑器 */}
      {allowCreateComment && (
        <CommentEditor
          placeholder="分享你的想法，参与讨论..."
          isSubmitting={isCreatingComment}
          projectId={projectId}
          onGetUserSuggestions={handleGetUserSuggestions}
          onSubmit={handleCreateComment}
          onCommentingStatusChange={updateUserCommentingStatus}
        />
      )}

      {/* 评论列表 */}
      <div className="space-y-4">
        {isLoadingComments ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredAndSortedComments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
              {searchQuery ? '没有找到相关评论' : '还没有讨论'}
            </h3>
            <p className="text-gray-400 dark:text-gray-500">
              {searchQuery 
                ? '试试其他关键词' 
                : allowCreateComment 
                  ? '成为第一个参与讨论的人吧' 
                  : '暂时没有人发表评论'
              }
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredAndSortedComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                projectId={projectId}
                canEdit={allowEditComment}
                canDelete={allowDeleteComment}
                maxNestingLevel={maxNestingLevel}
                onGetUserSuggestions={handleGetUserSuggestions}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isSubmitting={isAnyOperationInProgress}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* 加载更多 */}
      {filteredAndSortedComments.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => {
              // 这里可以实现加载更多逻辑
              console.log('Load more comments');
            }}
            disabled={isLoadingComments}
          >
            {isLoadingComments ? '加载中...' : '加载更多评论'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskCommentSection;