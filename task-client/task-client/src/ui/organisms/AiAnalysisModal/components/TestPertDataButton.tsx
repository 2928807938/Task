"use client";

import React from 'react';
import {FiDatabase} from 'react-icons/fi';

interface TestPertDataButtonProps {
  onInjectData: () => void;
  projectId: string;
}

// 定义PERT数据类型
export interface PertData {
  optimistic: number;
  most_likely: number;
  pessimistic: number;
  expected: number;
  standard_deviation: number;
}

const TestPertDataButton: React.FC<TestPertDataButtonProps> = ({ onInjectData, projectId }) => {
  return (
    <button
      className="px-3 py-1.5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700
                text-sm flex items-center gap-1.5 transition-colors"
      onClick={onInjectData}
    >
      <FiDatabase size={14} />
      <span>加载PERT示例</span>
    </button>
  );
};

export default TestPertDataButton;
