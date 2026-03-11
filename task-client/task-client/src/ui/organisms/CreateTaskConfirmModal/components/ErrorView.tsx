import React from 'react';

interface ErrorViewProps {
  error: string;
  onClose: () => void;
}

/**
 * 错误视图组件
 * 用于显示任务分析过程中的错误信息
 */
export const ErrorView: React.FC<ErrorViewProps> = ({ error, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-medium text-red-600 dark:text-red-400 mb-2">出错了</h3>
        <p className="mb-6 text-gray-700 dark:text-gray-300">{error}</p>
        <div className="flex justify-end">
          <button 
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow transition-colors" 
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
