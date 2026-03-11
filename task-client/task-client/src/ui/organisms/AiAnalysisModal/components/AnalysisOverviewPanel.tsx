"use client";

import React from "react";
import {motion} from 'framer-motion';
import {FiAlertTriangle, FiCheckCircle, FiClock, FiFlag} from "react-icons/fi";
import {CompletenessAnalysis} from './types';
import {useTheme} from '@/ui/theme/themeContext';

interface AnalysisOverviewPanelProps {
  analysisData: {
    priorityData?: any;
    priorityLevel?: string;
    completenessAnalysis?: CompletenessAnalysis;
    pertWorkloadData?: {
      optimistic: number;
      most_likely: number;
      pessimistic: number;
      expected: number;
      standard_deviation: number;
    };
    risks?: string[];
    tags?: string[];
  };
}

/**
 * 分析概览面板组件 - 显示分析的核心指标和标签
 */
const AnalysisOverviewPanel: React.FC<AnalysisOverviewPanelProps> = ({ analysisData }) => {
  const { theme } = useTheme();
  
  // 获取完整度百分比值
  const getCompleteness = () => {
    if (!analysisData.completenessAnalysis?.overallCompleteness) return 30;
    return parseInt(analysisData.completenessAnalysis.overallCompleteness);
  };

  // 获取风险等级
  const getRiskLevel = () => {
    if (!analysisData.risks || analysisData.risks.length === 0) return '低';
    return analysisData.risks.length > 2 ? '高' : (analysisData.risks.length > 1 ? '中' : '低');
  };

  // 获取分数
  const getScore = () => {
    return analysisData.priorityData?.priority?.score || 85;
  };

  // 获取优先级文本
  const getPriorityLevel = () => {
    return analysisData.priorityData?.priority?.level || analysisData.priorityLevel || '高优先级';
  };

  // 获取预期工时
  const getExpectedWorkload = () => {
    if (!analysisData.pertWorkloadData) return 0;
    return Math.round(analysisData.pertWorkloadData.expected);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="rounded-xl"
      style={{ backgroundColor: theme.colors.card.background }}
    >
      {/* 标题区 - 所示风格 */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div 
          className="text-base font-medium"
          style={{ color: theme.colors.foreground }}
        >
          分析概览
        </div>
        <div className="flex items-center">
          <span 
            className="text-2xl font-semibold"
            style={{ color: theme.colors.primary[500] }}
          >
            {getScore()}
          </span>
          <span 
            className="ml-0.5 text-sm"
            style={{ color: theme.colors.primary[400] }}
          >
            分
          </span>
        </div>
      </div>

      {/* 指标相关信息 - 所示风格 */}
      <div className="px-4 pt-3 pb-5">
        <div className="grid grid-cols-2 gap-x-6 gap-y-6">
          {/* 优先级别 */}
          <div className="flex items-center">
            <div 
              className="w-[54px] h-[54px] rounded-full flex items-center justify-center mr-3"
              style={{ 
                backgroundColor: `${theme.colors.primary[500]}14` // 8% opacity
              }}
            >
              <FiFlag 
                size={20} 
                style={{ color: theme.colors.primary[500] }}
              />
            </div>
            <div>
              <div 
                className="text-xs"
                style={{ color: theme.colors.neutral[500] }}
              >
                优先级别
              </div>
              <div 
                className="text-base font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {getPriorityLevel()}
              </div>
            </div>
          </div>

          {/* 需求完整度 */}
          <div className="flex items-center">
            <div 
              className="w-[54px] h-[54px] rounded-full flex items-center justify-center mr-3"
              style={{ 
                backgroundColor: `${theme.colors.success[500]}14` // 8% opacity
              }}
            >
              <FiCheckCircle 
                size={20} 
                style={{ color: theme.colors.success[500] }}
              />
            </div>
            <div>
              <div 
                className="text-xs"
                style={{ color: theme.colors.neutral[500] }}
              >
                需求完整度
              </div>
              <div 
                className="text-base font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {getCompleteness()}%
              </div>
            </div>
          </div>

          {/* 风险等级 */}
          <div className="flex items-center">
            <div 
              className="w-[54px] h-[54px] rounded-full flex items-center justify-center mr-3"
              style={{ 
                backgroundColor: `${theme.colors.warning[500]}14` // 8% opacity
              }}
            >
              <FiAlertTriangle 
                size={20} 
                style={{ color: theme.colors.warning[500] }}
              />
            </div>
            <div>
              <div 
                className="text-xs"
                style={{ color: theme.colors.neutral[500] }}
              >
                风险等级
              </div>
              <div className="flex items-center">
                <div 
                  className="text-base font-medium"
                  style={{ color: theme.colors.foreground }}
                >
                  {getRiskLevel()}
                </div>
                {analysisData.risks && analysisData.risks.length > 0 && (
                  <div 
                    className="ml-1.5 text-xs"
                    style={{ color: theme.colors.warning[500] }}
                  >
                    {analysisData.risks.length}项
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 预期工时 */}
          <div className="flex items-center">
            <div 
              className="w-[54px] h-[54px] rounded-full flex items-center justify-center mr-3"
              style={{ 
                backgroundColor: `${theme.colors.info[500]}14` // 8% opacity
              }}
            >
              <FiClock 
                size={20} 
                style={{ color: theme.colors.info[500] }}
              />
            </div>
            <div>
              <div 
                className="text-xs"
                style={{ color: theme.colors.neutral[500] }}
              >
                预期工时
              </div>
              <div 
                className="text-base font-medium"
                style={{ color: theme.colors.foreground }}
              >
                {getExpectedWorkload()} 小时
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisOverviewPanel;
