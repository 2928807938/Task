"use client";

import React from "react";
import {FiFlag} from "react-icons/fi";
import AccordionPanel from "./AccordionPanel";
import ProgressBar from "@/ui/atoms/ProgressBar";
import {useTheme} from '@/ui/theme/themeContext';

interface PriorityAnalysisPanelProps {
  priorityData?: any;
  priorityLevel?: string;
  priorityScore?: number;
  priorityLevelColors: Record<string, string>;
  isOpen?: boolean; // 控制面板是否展开
  onToggle?: () => void; // 切换面板展开/折叠状态的回调
}

/**
 * 优先级分析面板组件 - 显示优先级分析结果
 */
const PriorityAnalysisPanel: React.FC<PriorityAnalysisPanelProps> = ({
  priorityData,
  priorityLevel,
  priorityScore,
  priorityLevelColors,
  isOpen = false,
  onToggle
}) => {
  const { theme } = useTheme();
  
  if (!priorityData || typeof priorityData !== 'object') {
    return null;
  }

  return (
    <AccordionPanel
      title="优先级分析"
      icon={<FiFlag size={14} />}
      initiallyOpen={isOpen}
      animationDelay={0.1}
      onToggle={onToggle}
      iconBgColor={`${theme.colors.primary[500]}1A`} // 10% opacity
      iconColor={theme.colors.primary[500]}
    >
      {/* 优先级信息 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <span 
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{
                backgroundColor: priorityData.priority?.level
                  ? (priorityLevelColors[priorityData.priority.level] || theme.colors.primary[500])
                  : theme.colors.primary[500]
              }}
            ></span>
            <span 
              className="font-medium"
              style={{ color: theme.colors.foreground }}
            >
              {priorityData.priority?.level
                ? priorityData.priority.level
                : priorityLevel}
            </span>
          </div>
          <span 
            className="text-sm font-medium"
            style={{ color: theme.colors.foreground }}
          >
            {priorityData.priority?.score
              ? `${priorityData.priority.score}分`
              : `${priorityScore}分`}
          </span>
        </div>
        <ProgressBar
          percentage={priorityData.priority?.score
            ? priorityData.priority.score
            : priorityScore || 0}
          color={priorityLevelColors[priorityLevel || ''] || 'bg-blue-500'}
        />
      </div>

      {/* 优先级评估理由 */}
      {priorityData.priority?.analysis && (
        <div>
          <h4 
            className="text-xs font-medium mb-2"
            style={{ color: theme.colors.neutral[600] }}
          >
            评估理由
          </h4>
          <p 
            className="text-sm leading-relaxed rounded-lg p-3 backdrop-blur-sm border"
            style={{
              color: theme.colors.foreground,
              backgroundColor: `${theme.colors.neutral[50]}CC`, // 80% opacity
              borderColor: `${theme.colors.card.border}CC` // 80% opacity
            }}
          >
            {priorityData.priority.analysis}
          </p>
        </div>
      )}
    </AccordionPanel>
  );
};

export default PriorityAnalysisPanel;
