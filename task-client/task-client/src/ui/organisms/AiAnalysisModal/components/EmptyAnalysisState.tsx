"use client";

import React from "react";
import {motion} from 'framer-motion';
import {HiChartBar} from "react-icons/hi";

/**
 * 空分析状态组件 - 当没有分析数据时显示
 */
const EmptyAnalysisState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-2 shadow-sm">
        <HiChartBar className="h-10 w-10 text-gray-300" />
      </div>
      <h3 className="text-lg font-medium text-gray-700">暂无分析数据</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
        在聊天区域输入您的需求，AI 将为您提供详细的分析结果，包括类型分析、优先级分析等内容。
      </p>
    </motion.div>
  );
};

export default EmptyAnalysisState;
