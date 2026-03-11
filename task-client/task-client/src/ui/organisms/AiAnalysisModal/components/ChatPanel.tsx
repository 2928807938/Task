"use client";

import React from "react";
import {motion} from 'framer-motion';
import {FiMessageSquare, FiRefreshCw} from "react-icons/fi";
import MessageDisplay from './MessageDisplay';
import ChatInputArea from './ChatInputArea';
import {ChatMessage} from './types';
import {useTheme} from '@/ui/theme/themeContext';

interface ChatPanelProps {
  messages: ChatMessage[];
  handleSendMessage: (content: string) => void;
  handleClearMessages: () => void;
  isStreaming: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  handleSendMessage,
  handleClearMessages,
  isStreaming
}) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className="flex-1 flex flex-col border-l shadow-inner"
      style={{
        backgroundColor: theme.colors.card.background,
        borderLeftColor: `${theme.colors.card.border}CC` // 80% opacity
      }}
    >
      {/* 聊天标题栏 */}
      <div 
        className="border-b p-5 backdrop-blur-md shadow-sm flex justify-between items-center"
        style={{
          backgroundColor: `${theme.colors.card.background}CC`, // 80% opacity
          borderBottomColor: `${theme.colors.card.border}E6` // 90% opacity
        }}
      >
        <h3 
          className="font-medium flex items-center"
          style={{ color: theme.colors.foreground }}
        >
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center mr-2 border"
            style={{
              backgroundColor: `${theme.colors.primary[500]}14`, // 8% opacity
              borderColor: `${theme.colors.primary[500]}32` // 20% opacity
            }}
          >
            <FiMessageSquare 
              size={16} 
              style={{ color: theme.colors.primary[600] }}
            />
          </div>
          <span>与AI助手对话</span>
        </h3>

        <div className="flex gap-2">
          <motion.button
            className="p-2 rounded-full transition-all"
            style={{
              backgroundColor: theme.colors.neutral[100],
              color: theme.colors.neutral[600]
            }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: theme.colors.neutral[200]
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearMessages}
            disabled={isStreaming}
          >
            <FiRefreshCw 
              className={isStreaming ? 'animate-spin' : ''} 
              size={18}
              style={{
                color: isStreaming ? theme.colors.primary[500] : theme.colors.neutral[600]
              }}
            />
          </motion.button>
        </div>
      </div>

      {/* 消息显示区域 */}
      <MessageDisplay messages={messages} />

      {/* 聊天输入区域 */}
      <ChatInputArea
        onSendMessage={handleSendMessage}
        disabled={isStreaming}
      />
    </div>
  );
};

export default ChatPanel;
