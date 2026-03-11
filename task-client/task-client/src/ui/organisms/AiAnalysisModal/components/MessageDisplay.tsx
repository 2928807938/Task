"use client";

import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {ChatMessage} from '../components/types';
import ChatMessageItem from './ChatMessageItem';
import {useTheme} from '@/ui/theme/themeContext';

interface MessageDisplayProps {
  messages: ChatMessage[];
  onMessageUpdate?: () => void;
  onCreateTask?: () => void; // 创建任务回调
  hasTaskSplitData?: boolean; // 是否有任务拆分数据
  streamingComplete?: boolean; // 分析是否完成
}

/**
 * 消息显示组件 - 负责显示聊天消息列表和自动滚动功能
 * 改进：尊重用户的滚动操作，只在特定情况下自动滚动
 */
const MessageDisplay: React.FC<MessageDisplayProps> = ({
  messages,
  onMessageUpdate,
  onCreateTask,
  hasTaskSplitData,
  streamingComplete
}) => {
  const { theme } = useTheme();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [prevMessagesLength, setPrevMessagesLength] = useState(messages.length);

  // 自动滚动到最新消息的函数
  const scrollMessagesToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  // 检测用户是否主动滚动
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // 检查是否滚动到底部附近（允许一点误差）
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;

      // 如果不在底部，标记用户已滚动
      if (!isAtBottom) {
        setUserHasScrolled(true);
      } else {
        // 如果滚动到底部，重置标记
        setUserHasScrolled(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // 当消息更新时，智能决定是否滚动到底部
  useLayoutEffect(() => {
    // 检查是否有新消息
    const hasNewMessages = messages.length > prevMessagesLength;
    setPrevMessagesLength(messages.length);

    // 在以下情况自动滚动到底部：
    // 1. 初始加载（messages.length === 1）
    // 2. 有新消息且用户没有主动滚动
    // 3. 最新消息是AI发送的（通常是回复）
    const isLatestMessageFromAi = messages.length > 0 && messages[messages.length - 1].isAi;

    if (messages.length === 1 || (hasNewMessages && (!userHasScrolled || isLatestMessageFromAi))) {
      scrollMessagesToBottom();
    }

    if (onMessageUpdate) onMessageUpdate();
  }, [messages, onMessageUpdate, userHasScrolled, prevMessagesLength]);

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto overscroll-contain px-6 py-4"
      style={{
        backgroundColor: theme.colors.card.background,
        contain: 'layout paint',
        scrollBehavior: 'smooth',
        height: '100%',
        maxHeight: 'calc(100vh - 200px)' // 设置最大高度，确保不会超出容器
      }}>
      <div className="max-w-3xl mx-auto space-y-3">
        {messages.map((message, index) => (
          <div key={index} className="will-change-transform">
            <ChatMessageItem
              message={message}
              isComprehensiveAnalysis={message.isComprehensiveAnalysis}
              onCreateTask={onCreateTask}
              hasTaskSplitData={hasTaskSplitData}
              streamingComplete={streamingComplete}
              isLastMessage={index === messages.length - 1}
            />
          </div>
        ))}
      </div>
      <div ref={messagesEndRef} className="h-[1px]" />
    </div>
  );
};

export default MessageDisplay;
