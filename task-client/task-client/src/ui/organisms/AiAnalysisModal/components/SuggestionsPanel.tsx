"use client";

import React from "react";
import {HiLightBulb} from "react-icons/hi";
import AccordionPanel from "./AccordionPanel";
import {useTheme} from '@/ui/theme/themeContext';

interface Suggestion {
  type: string;
  title: string;
  icon: string;
  color: string;
  description: string;
}

interface SuggestionsPanelProps {
  suggestions?: Suggestion[];
  isOpen?: boolean; // 控制面板是否展开
  onToggle?: () => void; // 切换面板展开/折叠状态的回调
}

/**
 * 建议面板组件 - 显示AI分析的建议
 */
const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ suggestions, isOpen = false, onToggle }) => {
  const { theme } = useTheme();
  
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <AccordionPanel
      title="建议"
      icon={<HiLightBulb size={14} />}
      initiallyOpen={isOpen}
      animationDelay={0.3}
      onToggle={onToggle}
      iconBgColor={`${theme.colors.warning[500]}1A`} // 10% opacity
      iconColor={theme.colors.warning[500]}
    >
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="p-3 rounded-lg text-sm border"
            style={{ 
              backgroundColor: `${theme.colors.neutral[50]}CC`, // 80% opacity
              borderColor: `${theme.colors.card.border}CC` // 80% opacity
            }}
          >
            <div className="flex items-center mb-1.5">
              <span className="mr-2 text-lg">{suggestion.icon}</span>
              <span 
                className="font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {suggestion.title}
              </span>
            </div>
            <p 
              className="ml-7"
              style={{ color: theme.colors.neutral[700] }}
            >
              {suggestion.description}
            </p>
          </div>
        ))}
      </div>
    </AccordionPanel>
  );
};

export default SuggestionsPanel;
