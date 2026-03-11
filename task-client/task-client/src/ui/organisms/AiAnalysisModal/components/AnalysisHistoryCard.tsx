"use client";

import React from 'react';
import {motion} from 'framer-motion';

import {AnalysisHistory} from './types/history';

interface AnalysisHistoryCardProps {
  history: AnalysisHistory;
  isActive: boolean;
  onSelectHistory: (history: AnalysisHistory) => void;
  onRename: () => void;
  onDelete: () => void;
}

const AnalysisHistoryCard: React.FC<AnalysisHistoryCardProps> = ({
  history,
  isActive,
  onSelectHistory,
  onRename,
  onDelete,
}) => {
  // 格式化时间 - iOS风格
  const formatTime = (date: string | number) => {
    const dateObj = new Date(date);
    const today = new Date();
    const isToday = dateObj.getFullYear() === today.getFullYear() &&
                    dateObj.getMonth() === today.getMonth() &&
                    dateObj.getDate() === today.getDate();

    const hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    // iOS通常使用12小时制
    const period = hours >= 12 ? '下午' : '上午';
    const hour12 = hours % 12 || 12;
    const timeStr = `${period} ${hour12}:${minutes}`;

    if (isToday) {
      return timeStr;
    } else {
      // 注意月份需要+1，因为getMonth()返回0-11
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      return `${month}月${day}日 ${timeStr}`;
    }
  };

  // 获取日期分组
  const getTimeGroup = (date: string | number) => {
    const dateObj = new Date(date);
    const today = new Date();

    // 判断是否为今天
    const isToday = dateObj.getFullYear() === today.getFullYear() &&
                    dateObj.getMonth() === today.getMonth() &&
                    dateObj.getDate() === today.getDate();

    if (isToday) {
      return '今天';
    } else {
      // 显示日期格式 MM-DD
      return `${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    }
  };

  const timeGroup = getTimeGroup(history.createdAt);

  // 生成分析类型标签
  const getAnalysisTypes = () => {
    const types = [];
    const data = history.analysisData;

    // 优先级分析
    if (data?.priorityLevel || data?.priorityScore || data?.priorityAnalysis || data?.priorityData) {
      types.push({ id: 'priority', label: '优先级', color: 'orange' });
    }

    // 完整度分析
    if (data?.completenessAnalysis) {
      types.push({ id: 'completeness', label: '完整度', color: 'blue' });
    }

    // 关键发现
    if (data?.keyFindings && data.keyFindings.length > 0) {
      types.push({ id: 'keyFindings', label: '关键发现', color: 'purple' });
    }

    // 风险分析
    if (data?.risks && data.risks.length > 0) {
      types.push({ id: 'risks', label: '风险', color: 'red' });
    }

    // 建议分析
    if (data?.suggestions && data.suggestions.length > 0) {
      types.push({ id: 'suggestions', label: '建议', color: 'green' });
    }

    // 工作量分析
    if (data?.workloadData || data?.pertWorkloadData) {
      types.push({ id: 'workload', label: '工作量', color: 'cyan' });
    }

    // 任务拆分
    if (data?.taskSplitData) {
      types.push({ id: 'taskSplit', label: '任务拆分', color: 'yellow' });
    }

    // 如果有标签
    if (data?.tags && data.tags.length > 0) {
      types.push({ id: 'tags', label: '标签', color: 'gray' });
    }

    return types;
  };

  const analysisTypes = getAnalysisTypes();

  // 获取优先级
  const priorityLevel = history.analysisData?.priorityLevel || '';

  return (
    <motion.div
      className={`relative border-b ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500 border-b-blue-100' : 'bg-white border-gray-200'}`}
      whileTap={{ opacity: 0.8 }}
      onClick={() => onSelectHistory(history)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* iOS风格中选中项通过左边框和背景色区分，上面已添加 */}

      <div className="px-4 py-3">
        {/* 分组标签 */}
        <div className="text-[13px] font-normal text-gray-400 mb-0.5">{timeGroup}</div>

        {/* 标题 - iOS风格 */}
        <h3 className="text-[17px] font-medium text-gray-900 leading-tight truncate">
          {history.title}
        </h3>

        {/* 分析数据指标区 - iOS 风格 */}
        <div className="mt-3 mb-3 flex items-center space-x-3">
          {/* 优先级 */}
          <div className="flex items-center">
            <div className="flex items-center px-2 py-1 bg-orange-50 rounded-md shadow-sm">
              <svg className="h-3.5 w-3.5 text-orange-500 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-[13px] text-orange-700 font-medium">
                {history.analysisData?.priorityData?.priority?.level || history.analysisData?.priorityLevel || '中优先级'}
              </div>
            </div>
          </div>

          {/* 完整度 */}
          <div className="flex items-center">
            <div className="flex items-center px-2 py-1 bg-blue-50 rounded-md shadow-sm">
              <svg className="h-3.5 w-3.5 text-blue-500 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9 9-4.03 9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.5 12l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-[13px] text-blue-700 font-medium">
                {history.analysisData?.completenessAnalysis?.overallCompleteness
                  ? (parseInt(history.analysisData.completenessAnalysis.overallCompleteness) + '%')
                  : '60%'}
              </div>
            </div>
          </div>

          {/* 风险等级 */}
          <div className="flex items-center">
            <div className="flex items-center px-2 py-1 bg-red-50 rounded-md shadow-sm">
              <svg className="h-3.5 w-3.5 text-red-500 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9v4M12 17.01l.01-.011M12 5.07l9 15.48a1 1 0 01-.86 1.5H3.86a1 1 0 01-.86-1.5l9-15.48a1 1 0 011.7 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-[13px] text-red-700 font-medium">
                {history.analysisData?.risks && history.analysisData.risks.length > 0
                  ? (history.analysisData.risks.length > 2 ? '高' : (history.analysisData.risks.length > 1 ? '中' : '低'))
                  : '低'}
              </div>
            </div>
          </div>
        </div>

        {/* 时间显示 - iOS 风格 */}
        <div className="flex justify-end mt-2">
          <span className="text-[13px] text-gray-400 tracking-wide">
            {formatTime(history.createdAt)}
          </span>
        </div>
      </div>

      {/* 操作按钮区 - iOS 风格 */}
      <div className="absolute top-3.5 right-3 flex items-center space-x-4">
        <button
          className="text-blue-500 opacity-90 active:opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            onRename();
          }}
          aria-label="编辑"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.5 19.5L9 18l10.5-10.5-4.5-4.5L4.5 13.5l-1.5 6h1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          className="text-blue-500 opacity-90 active:opacity-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="删除"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7h16M5 7v11a2 2 0 002 2h10a2 2 0 002-2V7M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default AnalysisHistoryCard;
