import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Edit2, 
  Trash2, 
  MoreHorizontal,
  Reply,
  Heart,
  HeartHandshake
} from 'lucide-react';
import { Avatar } from '@/ui/atoms/Avatar';
import { Button } from '@/ui/atoms/Button';
import { formatDate } from '@/utils/date-utils';
import { TaskComment } from '@/types/api-types';
import CommentEditor from '../CommentEditor';

interface CommentItemProps {
  /** 评论数据 */
  comment: TaskComment;
  /** 当前用户ID */
  currentUserId?: string;
  /** 项目ID */
  projectId?: string;
  /** 是否可以编辑 */
  canEdit?: boolean;
  /** 是否可以删除 */
  canDelete?: boolean;
  /** 最大嵌套层级 */
  maxNestingLevel?: number;
  /** 获取用户建议的函数 */
  onGetUserSuggestions?: (query: string) => Promise<any[]>;
  /** 回复评论 */
  onReply?: (parentId: string, content: string, mentionedUserIds: string[]) => void;
  /** 编辑评论 */
  onEdit?: (commentId: string, content: string, mentionedUserIds: string[]) => void;
  /** 删除评论 */
  onDelete?: (commentId: string) => void;
  /** 点赞评论 */
  onLike?: (commentId: string) => void;
  /** 正在提交状态 */
  isSubmitting?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  projectId,
  canEdit = true,
  canDelete = true,
  maxNestingLevel = 3,
  onGetUserSuggestions,
  onReply,
  onEdit,
  onDelete,
  onLike,
  isSubmitting = false
}) => {
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [showEditEditor, setShowEditEditor] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [isLiked, setIsLiked] = useState(false); // 这里应该从后端获取
  const [likeCount, setLikeCount] = useState(0); // 这里应该从后端获取

  // 判断是否是当前用户的评论
  const isOwnComment = currentUserId === comment.authorId;
  
  // 判断是否可以嵌套回复
  const canNestReply = comment.level < maxNestingLevel;

  // 处理回复提交
  const handleReplySubmit = useCallback((content: string, mentionedUserIds: string[]) => {
    onReply?.(comment.id, content, mentionedUserIds);
    setShowReplyEditor(false);
  }, [comment.id, onReply]);

  // 处理编辑提交
  const handleEditSubmit = useCallback((content: string, mentionedUserIds: string[]) => {
    onEdit?.(comment.id, content, mentionedUserIds);
    setShowEditEditor(false);
  }, [comment.id, onEdit]);

  // 处理删除
  const handleDelete = useCallback(() => {
    if (window.confirm('确定要删除这条评论吗？')) {
      onDelete?.(comment.id);
    }
  }, [comment.id, onDelete]);

  // 处理点赞
  const handleLike = useCallback(() => {
    onLike?.(comment.id);
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  }, [comment.id, onLike, isLiked]);

  // 渲染@提及的用户
  const renderContentWithMentions = useCallback((content: string) => {
    // 简单的@提及渲染，实际应该根据mentionedUserIds来渲染
    return content.replace(/@(\w+)/g, '<span class="text-blue-500 dark:text-blue-400 font-medium">@$1</span>');
  }, []);

  // 格式化时间
  const formattedTime = useMemo(() => {
    return formatDate(comment.createdAt, { format: 'relative' });
  }, [comment.createdAt]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`group relative ${comment.level > 0 ? 'ml-8' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 连接线（用于显示回复层级） */}
      {comment.level > 0 && (
        <div className="absolute left-0 top-0 w-8 h-12 flex items-center justify-center">
          <div className="w-4 h-4 border-l-2 border-b-2 border-gray-200 dark:border-gray-700 rounded-bl-lg" />
        </div>
      )}

      <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* 头像 */}
        <div className="flex-shrink-0">
          <Avatar
            name={comment.authorName}
            src={comment.authorAvatar}
            size="md"
          />
        </div>

        {/* 评论内容 */}
        <div className="flex-1 min-w-0">
          {/* 评论头部信息 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {comment.authorName}
            </span>
            {isOwnComment && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                我
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formattedTime}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                · 已编辑
              </span>
            )}
          </div>

          {/* 评论内容 */}
          {showEditEditor ? (
            <CommentEditor
              placeholder="编辑评论..."
              isReply={true}
              isSubmitting={isSubmitting}
              projectId={projectId}
              onGetUserSuggestions={onGetUserSuggestions}
              onSubmit={handleEditSubmit}
              onCancel={() => setShowEditEditor(false)}
              autoFocus={true}
            />
          ) : (
            <div 
              className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: renderContentWithMentions(comment.content) 
              }}
            />
          )}

          {/* 评论操作栏 */}
          <AnimatePresence>
            {(showActions || showReplyEditor) && !showEditEditor && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 mt-3"
              >
                {/* 点赞按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-1 h-7 px-2 ${
                    isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart size={14} className={isLiked ? 'fill-current' : ''} />
                  {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
                </Button>

                {/* 回复按钮 */}
                {canNestReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyEditor(!showReplyEditor)}
                    className="flex items-center gap-1 h-7 px-2 text-gray-500 hover:text-blue-500"
                  >
                    <Reply size={14} />
                    <span className="text-xs">回复</span>
                  </Button>
                )}

                {/* 编辑按钮 */}
                {isOwnComment && canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditEditor(true)}
                    className="flex items-center gap-1 h-7 px-2 text-gray-500 hover:text-blue-500"
                  >
                    <Edit2 size={14} />
                    <span className="text-xs">编辑</span>
                  </Button>
                )}

                {/* 删除按钮 */}
                {isOwnComment && canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="flex items-center gap-1 h-7 px-2 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                    <span className="text-xs">删除</span>
                  </Button>
                )}

                {/* 更多操作 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 h-7 px-2 text-gray-500"
                >
                  <MoreHorizontal size={14} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 回复编辑器 */}
          <AnimatePresence>
            {showReplyEditor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <CommentEditor
                  placeholder={`回复 ${comment.authorName}...`}
                  isReply={true}
                  parentId={comment.id}
                  isSubmitting={isSubmitting}
                  projectId={projectId}
                  onGetUserSuggestions={onGetUserSuggestions}
                  onSubmit={handleReplySubmit}
                  onCancel={() => setShowReplyEditor(false)}
                  autoFocus={true}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 回复列表 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4">
              {/* 展开/折叠按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-2 h-7 px-2 text-gray-500 hover:text-blue-500 mb-2"
              >
                <MessageCircle size={14} />
                <span className="text-xs">
                  {showReplies ? '收起' : '展开'} {comment.replyCount || comment.replies.length} 条回复
                </span>
              </Button>

              {/* 回复列表 */}
              <AnimatePresence>
                {showReplies && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    {comment.replies.map(reply => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        currentUserId={currentUserId}
                        projectId={projectId}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        maxNestingLevel={maxNestingLevel}
                        onGetUserSuggestions={onGetUserSuggestions}
                        onReply={onReply}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onLike={onLike}
                        isSubmitting={isSubmitting}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CommentItem;