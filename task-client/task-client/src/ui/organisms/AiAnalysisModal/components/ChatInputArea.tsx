"use client";

import React, {useState} from "react";
import {FiSend} from "react-icons/fi";
import {motion} from 'framer-motion';
import {useTheme} from '@/ui/theme/themeContext';

interface ChatInputAreaProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

/**
 * 聊天输入区域组件
 * 负责用户输入消息并发送给AI
 */
const ChatInputArea: React.FC<ChatInputAreaProps> = ({ onSendMessage, disabled }) => {
  const { theme } = useTheme();
  const [userInput, setUserInput] = useState("");

  const handleSend = () => {
    if (userInput.trim() && !disabled) {
      onSendMessage(userInput);
      setUserInput('');
    }
  };

  return (
    <div 
      className="border-t px-8 py-5"
      style={{
        backgroundColor: theme.colors.card.background,
        borderTopColor: theme.colors.card.border
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div 
          className="flex items-center rounded-lg border pl-4 pr-2 py-2"
          style={{
            backgroundColor: theme.colors.neutral[50],
            borderColor: theme.colors.card.border
          }}
        >
          <input
            type="text"
            placeholder="发送消息..."
            className="flex-1 bg-transparent border-none focus:outline-none text-sm"
            style={{ color: theme.colors.foreground }}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              // 只在Shift+Enter时允许换行，否则需要特殊处理
              if (e.key === 'Enter') {
                // 如果按下了Shift，则允许换行，不做特殊处理
                if (e.shiftKey) {
                  return;
                }

                // 如果组件被禁用，不做处理
                if (disabled) {
                  return;
                }

                // 检查是否处于输入法组合状态(isComposing)
                // 在使用输入法时，按回车通常是为了确认输入的文字而非发送消息
                if (e.nativeEvent.isComposing || e.keyCode === 229) {
                  return;
                }

                // 阻止默认的回车行为
                e.preventDefault();

                // 只有当有输入内容时才发送
                if (userInput.trim()) {
                  handleSend();
                }
              }
            }}
            disabled={disabled}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="ml-2 p-2 rounded-md transition-colors"
            style={{
              backgroundColor: disabled 
                ? theme.colors.neutral[200] 
                : theme.colors.primary[500],
              color: disabled 
                ? theme.colors.neutral[400] 
                : '#FFFFFF',
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
            onClick={handleSend}
            disabled={disabled || !userInput.trim()}
          >
            <FiSend size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatInputArea;
