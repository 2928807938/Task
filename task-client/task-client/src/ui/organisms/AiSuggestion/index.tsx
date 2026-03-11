"use client";

import React from 'react';
import {FiInfo} from 'react-icons/fi';
import Badge from '@/ui/atoms/Badge/index';

const AiSuggestion: React.FC = () => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">AI 建议</h2>

      <div className="bg-orange-50 rounded-lg p-4 mb-4 border border-orange-100">
        <div className="flex items-center mb-2">
          <FiInfo className="text-orange-500 mr-2 text-xl" />
          <h3 className="font-medium text-orange-700">任务优化建议</h3>
        </div>
        <p className="text-sm text-orange-600">
          根据AI分析，您可能需要优化当前任务分配，建议优先完成以下几个关键任务。
        </p>
        <div className="flex justify-between mt-3">
          <button className="bg-white text-orange-600 px-3 py-1 rounded text-sm hover:bg-orange-50 transition-colors border border-orange-100">
            查看详情
          </button>
          <button className="text-gray-500 px-3 py-1 rounded text-sm hover:bg-gray-100 transition-colors">
            忽略
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Badge color="red" className="mr-2" />
            <span className="text-sm">紧急任务</span>
          </div>
          <span className="text-sm font-medium">5 个</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Badge color="yellow" className="mr-2" />
            <span className="text-sm">重要任务</span>
          </div>
          <span className="text-sm font-medium">8 个</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Badge color="blue" className="mr-2" />
            <span className="text-sm">普通任务</span>
          </div>
          <span className="text-sm font-medium">19 个</span>
        </div>
      </div>
    </div>
  );
};

export default AiSuggestion;
