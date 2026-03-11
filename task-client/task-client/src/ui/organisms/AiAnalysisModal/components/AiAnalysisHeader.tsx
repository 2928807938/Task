"use client";

import React from "react";
import {FiCheckCircle, FiPlus, FiX} from "react-icons/fi";
import {HiChartBar} from "react-icons/hi";
import {motion} from 'framer-motion';
import AnalysisStatusIndicator from './AnalysisStatusIndicator';
import {useTheme} from '@/ui/theme/themeContext';

// 定义组件的Props接口
interface AiAnalysisHeaderProps {
  // 状态相关
  isStreaming?: boolean;
  streamingError?: string | null;
  streamingComplete?: boolean;
  hasTaskSplitData?: boolean; // 是否有任务拆分数据

  // 操作回调
  onClose: () => void;
  onNewConversation: () => void;
  onCreateTask?: () => void; // 添加创建任务回调
}

/**
 * AI分析弹窗的头部组件
 * 包含标题、状态指示器、新建对话按钮和关闭按钮
 */
const AiAnalysisHeader: React.FC<AiAnalysisHeaderProps> = ({
  isStreaming,
  streamingError,
  streamingComplete,
  hasTaskSplitData,
  onClose,
  onNewConversation,
  onCreateTask
}) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className="flex justify-between items-center px-8 py-4 border-b sticky top-0 z-10"
      style={{
        backgroundColor: theme.colors.card.background,
        borderBottomColor: theme.colors.card.border
      }}
    >
      <div className="flex items-center">
        {/* Logo和标题 */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3 shadow-sm">
          <HiChartBar className="w-4 h-4 text-white" />
        </div>
        <h2 
          className="text-lg font-medium"
          style={{ color: theme.colors.foreground }}
        >
          智能任务助手
        </h2>

        {/* 状态指示器集成到标题旁边 */}
        <div className="ml-3">
          <AnalysisStatusIndicator
            isStreaming={isStreaming}
            streamingError={streamingError}
            streamingComplete={streamingComplete}
          />
        </div>
      </div>

      {/* 右侧按钮区域 - 重新排列按钮顺序 */}
      <div className="flex items-center gap-3">
        {/* 创建任务按钮 - 更加突出，添加文字 */}
        {onCreateTask && hasTaskSplitData && streamingComplete && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onCreateTask();
            }}
            className="flex items-center gap-1.5 py-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-all shadow-sm"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <FiCheckCircle className="w-4 h-4" />
            创建任务
          </motion.button>
        )}

        {/* 新建对话按钮 */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onNewConversation();
          }}
          className="p-2.5 rounded-full transition-all duration-200 shadow-sm backdrop-blur-sm"
          style={{
            backgroundColor: `${theme.colors.neutral[100]}B3`, // 70% opacity
            color: theme.colors.neutral[500]
          }}
          title="新建对话"
          whileHover={{ 
            scale: 1.05,
            backgroundColor: `${theme.colors.neutral[200]}CC` // 80% opacity
          }}
          whileTap={{ scale: 0.95 }}
        >
          <FiPlus className="w-5 h-5" />
        </motion.button>

        {/* 历史记录按钮已移除 */}

        {/* 关闭按钮 */}
        <motion.button
          whileHover={{ 
            scale: 1.05,
            backgroundColor: `${theme.colors.neutral[100]}CC` // 80% opacity
          }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full transition-colors"
          style={{
            color: theme.colors.neutral[500]
          }}
          onClick={onClose}
        >
          <FiX size={20} />
        </motion.button>
      </div>
    </div>
  );
};

export default AiAnalysisHeader;
