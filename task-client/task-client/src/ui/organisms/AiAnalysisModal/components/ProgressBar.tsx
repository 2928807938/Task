"use client";

import React from "react";
import {motion} from 'framer-motion';

interface ProgressBarProps {
  percentage: number;
  color?: string;
}

/**
 * 进度条组件 -
 */
const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  color = "bg-blue-500"
}) => {
  // 确保百分比在0-100之间
  const safePercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${safePercentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`h-full ${color} rounded-full`}
      />
    </div>
  );
};

export default ProgressBar;
