"use client";

import React from "react";
import {FiCheckCircle} from "react-icons/fi";
import {HiSparkles} from "react-icons/hi";
import AccordionPanel from "./AccordionPanel";
import {useTheme} from '@/ui/theme/themeContext';

interface KeyFindingsPanelProps {
  keyFindings?: string[];
  isOpen?: boolean; // 控制面板是否展开
  onToggle?: () => void; // 切换面板展开/折叠状态的回调
}

/**
 * 关键发现面板组件 - 显示分析的关键发现
 */
const KeyFindingsPanel: React.FC<KeyFindingsPanelProps> = ({ keyFindings, isOpen = false, onToggle }) => {
  const { theme } = useTheme();
  
  if (!keyFindings || keyFindings.length === 0) {
    return null;
  }

  return (
    <AccordionPanel
      title="关键发现"
      icon={<HiSparkles size={14} />}
      initiallyOpen={isOpen}
      animationDelay={0.4}
      onToggle={onToggle}
      iconBgColor={`${theme.colors.primary[500]}1A`} // 10% opacity
      iconColor={theme.colors.primary[500]}
    >
      <ul className="space-y-2">
        {keyFindings.map((finding, index) => (
          <li key={index} className="flex items-start text-sm">
            <span 
              className="mr-2 mt-0.5 flex-shrink-0"
              style={{ color: theme.colors.primary[500] }}
            >
              <FiCheckCircle size={14} />
            </span>
            <span style={{ color: theme.colors.neutral[700] }}>{finding}</span>
          </li>
        ))}
      </ul>
    </AccordionPanel>
  );
};

export default KeyFindingsPanel;
