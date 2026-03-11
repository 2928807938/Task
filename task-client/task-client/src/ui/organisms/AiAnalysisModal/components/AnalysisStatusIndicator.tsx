"use client";

import React from "react";
import {motion} from 'framer-motion';
import {FiAlertCircle, FiCheckCircle} from "react-icons/fi";

interface AnalysisStatusIndicatorProps {
  isStreaming?: boolean;
  streamingError?: string | null;
  streamingComplete?: boolean;
}

/**
 * 分析状态指示器组件 - 标题栏集成指示器
 */
const AnalysisStatusIndicator: React.FC<AnalysisStatusIndicatorProps> = ({
  isStreaming,
  streamingError,
  streamingComplete
}) => {
  // 只在状态变化时显示动画
  const [showAnimation, setShowAnimation] = React.useState(false);

  // 监听状态变化，触发短暂动画
  React.useEffect(() => {
    if (isStreaming || streamingError || streamingComplete) {
      setShowAnimation(true);

      // 2秒后结束动画，但保持状态内容可见
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isStreaming, streamingError, streamingComplete]);

  // 获取状态指示器的样式
  const getStatusStyles = () => {
    if (streamingError) {
      return {
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-600',
        icon: <FiAlertCircle size={12} className="mr-1" />,
        pulseColor: 'bg-red-500'
      };
    }

    if (streamingComplete) {
      return {
        bgColor: 'bg-green-500/10',
        textColor: 'text-green-600',
        icon: <FiCheckCircle size={12} className="mr-1" />,
        pulseColor: 'bg-green-500'
      };
    }

    return {
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600',
      icon: null,
      pulseColor: 'bg-blue-500'
    };
  };

  // 获取状态文本
  const getStatusText = () => {
    if (streamingError) return `分析出错`;
    if (streamingComplete) return `分析完成`;
    if (isStreaming) return `正在分析`;
    return '';
  };

  const statusText = getStatusText();
  const { bgColor, textColor, icon, pulseColor } = getStatusStyles();

  // 如果没有状态变化，不显示指示器
  if (!isStreaming && !streamingError && !streamingComplete) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: showAnimation ? 0 : 1, y: showAnimation ? -5 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center rounded-full px-2 py-0.5 ${bgColor} border border-gray-200/40`}
    >
      {/* 状态指示器圆点 */}
      <div className="relative mr-1.5">
        <div className={`w-2 h-2 rounded-full ${pulseColor}`}></div>
        {isStreaming && (
          <div className={`absolute inset-0 rounded-full ${pulseColor} animate-ping opacity-60`}></div>
        )}
      </div>

      {/* 状态文本 */}
      <div className={`text-xs font-medium flex items-center ${textColor}`}>
        {icon}
        {statusText}
      </div>
    </motion.div>
  );
};

export default AnalysisStatusIndicator;
