"use client";

import React from "react";
import {FiCheckCircle} from "react-icons/fi";
import AccordionPanel from "./AccordionPanel";
import ProgressBar from "@/ui/atoms/ProgressBar";
import {CompletenessAnalysis} from "./types";
import {useTheme} from '@/ui/theme/themeContext';

interface CompletenessFoldablePanelProps {
  completenessData?: CompletenessAnalysis;
  animationDelay?: number;
  isOpen?: boolean; // 控制面板是否展开
  onToggle?: () => void; // 切换面板展开/折叠状态的回调
}

/**
 * 完整度分析折叠面板 - 封装了完整度分析的内容
 */
const CompletenessFoldablePanel: React.FC<CompletenessFoldablePanelProps> = ({
  completenessData,
  animationDelay = 0,
  isOpen = false,
  onToggle
}) => {
  const { theme } = useTheme();
  
  if (!completenessData) {
    return null;
  }

  return (
    <AccordionPanel
      title="完整度分析"
      icon={<FiCheckCircle size={14} />}
      initiallyOpen={isOpen}
      animationDelay={animationDelay}
      onToggle={onToggle}
      iconBgColor={`${theme.colors.success[500]}1A`} // 10% opacity
      iconColor={theme.colors.success[500]}
    >
      {/* 总体完整度 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span 
            className="text-sm font-medium"
            style={{ color: theme.colors.neutral[700] }}
          >
            总体完整度
          </span>
          <span 
            className="text-sm font-medium"
            style={{ color: theme.colors.neutral[700] }}
          >
            {completenessData.overallCompleteness}
          </span>
        </div>
        <ProgressBar
          percentage={parseInt(completenessData.overallCompleteness)}
          color="bg-green-500"
        />
      </div>

      {/* 各方面完整度 */}
      {completenessData.aspects && completenessData.aspects.length > 0 && (
        <div className="space-y-4 mb-6">
          <h4 
            className="text-xs font-medium mb-2"
            style={{ color: theme.colors.neutral[600] }}
          >
            各方面完整度
          </h4>
          {completenessData.aspects.map((aspect, index) => (
            <div 
              key={index} 
              className="border rounded-lg p-3 shadow-sm"
              style={{
                backgroundColor: `${theme.colors.card.background}CC`, // 80% opacity
                borderColor: `${theme.colors.card.border}CC` // 80% opacity
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <span 
                  className="text-sm font-medium"
                  style={{ color: theme.colors.neutral[700] }}
                >
                  {aspect.name}
                </span>
                <span 
                  className="text-xs font-medium py-0.5 px-2 rounded"
                  style={{
                    backgroundColor: `${theme.colors.success[500]}14`, // 8% opacity
                    color: theme.colors.success[700] || theme.colors.success[500]
                  }}
                >
                  {aspect.completeness}
                </span>
              </div>
              <ProgressBar
                percentage={parseInt(aspect.completeness)}
                color={parseInt(aspect.completeness) > 70 ? "bg-green-500" :
                       parseInt(aspect.completeness) > 40 ? "bg-amber-500" : "bg-red-500"}
              />
              {aspect.suggestions && (
                <div 
                  className="mt-2 text-xs p-2 rounded border"
                  style={{
                    color: theme.colors.neutral[600],
                    backgroundColor: `${theme.colors.neutral[50]}CC`, // 80% opacity
                    borderColor: `${theme.colors.card.border}CC` // 80% opacity
                  }}
                >
                  <span 
                    className="font-medium"
                    style={{ color: theme.colors.neutral[700] }}
                  >
                    建议：
                  </span> {aspect.suggestions}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 优化建议 */}
      {completenessData.optimizationSuggestions && completenessData.optimizationSuggestions.length > 0 && (
        <div>
          <h4 
            className="text-xs font-medium mb-2"
            style={{ color: theme.colors.neutral[600] }}
          >
            优化建议
          </h4>
          <div className="space-y-2">
            {completenessData.optimizationSuggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="flex items-start border rounded-lg p-3 shadow-sm"
                style={{
                  backgroundColor: `${theme.colors.card.background}CC`, // 80% opacity
                  borderColor: `${theme.colors.card.border}CC` // 80% opacity
                }}
              >
                <span className="mr-2 flex-shrink-0 mt-0.5">
                  {typeof suggestion.icon === 'string' ? suggestion.icon :
                    <span style={{ color: theme.colors.primary[500] }}>•</span>}
                </span>
                <span 
                  className="text-sm"
                  style={{ color: theme.colors.neutral[700] }}
                >
                  {suggestion.content}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AccordionPanel>
  );
};

export default CompletenessFoldablePanel;
