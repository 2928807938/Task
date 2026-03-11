'use client';

import React from 'react';
import {FiPlus} from 'react-icons/fi';
import {motion} from 'framer-motion';

interface ProjectListHeaderProps {
  onCreateProject: () => void;
}

const ProjectListHeader: React.FC<ProjectListHeaderProps> = ({ onCreateProject }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-between items-center px-2 py-4 mb-6"
    >
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          项目列表
        </h1>
        <p
          className="text-sm text-gray-500 dark:text-gray-400 mt-1 hidden sm:block"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          管理和跟踪您的所有项目
        </p>
      </div>
      <button
        onClick={onCreateProject}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#007AFF] hover:bg-[#0071E3] active:bg-[#0062C3] text-white transition-all duration-200 font-medium text-sm"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          letterSpacing: '-0.01em',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
      >
        <FiPlus className="w-3.5 h-3.5" />
        <span>新建项目</span>
      </button>
    </motion.div>
  );
};

export default ProjectListHeader;
