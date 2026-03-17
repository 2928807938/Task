import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AtSign, Loader2, X } from 'lucide-react';
import { Button } from '@/ui/atoms/Button';
import { Avatar } from '@/ui/atoms/Avatar';
import { UserMentionSuggestion } from '@/types/api-types';

interface CommentEditorProps {
  /** 占位符文本 */
  placeholder?: string;
  /** 是否为回复模式 */
  isReply?: boolean;
  /** 父评论ID */
  parentId?: string;
  /** 是否正在提交 */
  isSubmitting?: boolean;
  /** 最大字符数 */
  maxLength?: number;
  /** 项目ID，用于获取@提及建议 */
  projectId?: string;
  /** 获取用户建议的函数 */
  onGetUserSuggestions?: (query: string) => Promise<UserMentionSuggestion[]>;
  /** 提交回调 */
  onSubmit?: (content: string, mentionedUserIds: string[]) => void;
  /** 取消回调 */
  onCancel?: () => void;
  /** 自动聚焦 */
  autoFocus?: boolean;
  /** 用户正在输入状态回调 */
  onCommentingStatusChange?: (isCommenting: boolean) => void;
}

const CommentEditor: React.FC<CommentEditorProps> = ({
  placeholder = '写下你的想法...',
  isReply = false,
  parentId,
  isSubmitting = false,
  maxLength = 2000,
  projectId,
  onGetUserSuggestions,
  onSubmit,
  onCancel,
  autoFocus = false,
  onCommentingStatusChange
}) => {
  const [content, setContent] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState<UserMentionSuggestion[]>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<UserMentionSuggestion[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartPos, setMentionStartPos] = useState(-1);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionSuggestionsRef = useRef<HTMLDivElement>(null);

  // 自动调整textarea高度
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(textarea.scrollHeight, 80)}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [content, adjustTextareaHeight]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // 处理@提及功能
  const handleTextChange = useCallback(async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length > maxLength) return;

    setContent(newContent);
    
    // 触发正在输入状态
    onCommentingStatusChange?.(newContent.length > 0);

    // 检查是否触发@提及
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newContent.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([^@\s]*)$/);

    if (mentionMatch && onGetUserSuggestions && projectId) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setMentionStartPos(cursorPos - mentionMatch[0].length);
      setShowMentionSuggestions(true);
      setSelectedSuggestionIndex(0);

      try {
        const suggestions = await onGetUserSuggestions(query);
        setMentionSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to get mention suggestions:', error);
        setMentionSuggestions([]);
      }
    } else {
      setShowMentionSuggestions(false);
      setMentionSuggestions([]);
    }
  }, [maxLength, onGetUserSuggestions, projectId, onCommentingStatusChange]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionSuggestions && mentionSuggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            Math.min(prev + 1, mentionSuggestions.length - 1)
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (mentionSuggestions[selectedSuggestionIndex]) {
            insertMention(mentionSuggestions[selectedSuggestionIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowMentionSuggestions(false);
          break;
      }
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      // Cmd/Ctrl + Enter 快速提交
      e.preventDefault();
      handleSubmit();
    }
  }, [showMentionSuggestions, mentionSuggestions, selectedSuggestionIndex]);

  // 插入@提及
  const insertMention = useCallback((user: UserMentionSuggestion) => {
    const textarea = textareaRef.current;
    if (!textarea || mentionStartPos === -1) return;

    const beforeMention = content.substring(0, mentionStartPos);
    const afterMention = content.substring(textarea.selectionStart);
    const mentionText = `@${user.name} `;
    
    const newContent = beforeMention + mentionText + afterMention;
    setContent(newContent);

    // 添加到已提及用户列表
    if (!mentionedUsers.find(u => u.id === user.id)) {
      setMentionedUsers(prev => [...prev, user]);
    }

    setShowMentionSuggestions(false);
    setMentionSuggestions([]);

    // 设置光标位置
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = mentionStartPos + mentionText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }
    }, 0);
  }, [content, mentionStartPos, mentionedUsers]);

  // 移除已提及的用户
  const removeMentionedUser = useCallback((userId: string) => {
    setMentionedUsers(prev => prev.filter(user => user.id !== userId));
    
    // 从内容中移除@提及
    const userToRemove = mentionedUsers.find(u => u.id === userId);
    if (userToRemove) {
      const mentionText = `@${userToRemove.name}`;
      setContent(prev => prev.replace(new RegExp(mentionText, 'g'), '').replace(/\s+/g, ' ').trim());
    }
  }, [mentionedUsers]);

  // 提交评论
  const handleSubmit = useCallback(() => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isSubmitting) return;

    onSubmit?.(trimmedContent, mentionedUsers.map(user => user.id));
    
    // 重置表单
    setContent('');
    setMentionedUsers([]);
    setShowMentionSuggestions(false);
  }, [content, isSubmitting, onSubmit, mentionedUsers]);

  // 取消编辑
  const handleCancel = useCallback(() => {
    setContent('');
    setMentionedUsers([]);
    setShowMentionSuggestions(false);
    onCancel?.();
  }, [onCancel]);

  const remainingChars = maxLength - content.length;
  const isSubmitDisabled = !content.trim() || isSubmitting || content.length > maxLength;

  return (
    <motion.div
      className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* 已提及的用户标签 */}
      <AnimatePresence>
        {mentionedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-3 pb-1 border-b border-gray-100 dark:border-gray-700"
          >
            <div className="flex flex-wrap gap-2">
              {mentionedUsers.map(user => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                >
                  <Avatar name={user.name} src={user.avatar} size="xs" />
                  <span>{user.name}</span>
                  <button
                    type="button"
                    onClick={() => removeMentionedUser(user.id)}
                    className="ml-1 hover:text-blue-800 dark:hover:text-blue-200"
                  >
                    <X size={10} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 编辑区域 */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-4 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          style={{ minHeight: '80px', maxHeight: '200px' }}
          disabled={isSubmitting}
        />

        {/* @提及建议浮层 */}
        <AnimatePresence>
          {showMentionSuggestions && mentionSuggestions.length > 0 && (
            <motion.div
              ref={mentionSuggestionsRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute z-50 top-full left-4 right-4 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {mentionSuggestions.map((user, index) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => insertMention(user)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    index === selectedSuggestionIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <Avatar name={user.name} src={user.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </div>
                  </div>
                  <AtSign size={14} className="text-gray-400" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部工具栏 */}
      <div className="flex items-center justify-between p-3 pt-2 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            提示：使用 @ 来提及其他用户，{process.platform === 'darwin' ? 'Cmd' : 'Ctrl'} + Enter 快速发送
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* 字符数统计 */}
          <div className={`text-xs ${
            remainingChars < 50 
              ? 'text-red-500 dark:text-red-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {remainingChars}
          </div>
          
          {/* 取消按钮 */}
          {isReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              取消
            </Button>
          )}
          
          {/* 提交按钮 */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {isReply ? '回复' : '发布'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentEditor;
