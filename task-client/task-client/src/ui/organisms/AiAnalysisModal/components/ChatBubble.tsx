"use client";

import React from "react";
import {motion} from 'framer-motion';
import {HiSparkles} from "react-icons/hi";
import {useTheme} from '@/ui/theme/themeContext';

interface ChatBubbleProps {
  isAi: boolean;
  children: React.ReactNode;
}

/**
 * 聊天气泡组件 -
 */
const ChatBubble: React.FC<ChatBubbleProps> = ({ isAi, children }) => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isAi ? "justify-start" : "justify-end"} mb-4`}
    >
      {isAi && (
        <div className="flex-shrink-0 self-start mt-1.5 mr-3">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: theme.colors.primary[500] }}
          >
            <HiSparkles className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
      <div
        className={`${
          isAi
            ? "flex-1 max-w-[85%] border" 
            : "max-w-[75%]"
        } px-4 py-3 rounded-xl`}
        style={{
          backgroundColor: isAi 
            ? theme.colors.neutral[50] 
            : theme.colors.primary[500],
          borderColor: isAi ? theme.colors.card.border : 'transparent'
        }}
      >
        <div 
          className="leading-relaxed"
          style={{ 
            color: isAi ? theme.colors.foreground : '#FFFFFF' 
          }}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
