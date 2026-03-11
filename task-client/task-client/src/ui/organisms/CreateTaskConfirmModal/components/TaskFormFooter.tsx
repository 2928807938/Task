"use client";

import React from "react";
import {motion} from 'framer-motion';

interface TaskFormFooterProps {
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  hideConfirmWhenLoading?: boolean; // 在加载状态下是否隐藏确认按钮
}

/**
 * 任务表单底部组件 -
 *
 * 遵循苹果设计规范的模态框底部按钮
 */
const TaskFormFooter: React.FC<TaskFormFooterProps> = ({
  onCancel,
  onConfirm,
  confirmText = "确认",
  cancelText = "取消",
  isLoading = false,
  hideConfirmWhenLoading = false
}) => {
  return (
    <div className="p-6 border-t border-gray-100 flex justify-end space-x-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onCancel();
        }}
        disabled={isLoading}
      >
        {cancelText}
      </motion.button>
      {/* 当加载状态并设置了hideConfirmWhenLoading时隐藏确认按钮 */}
      {(!isLoading || !hideConfirmWhenLoading) && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-5 py-2.5 rounded-lg ${isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white font-medium text-sm transition-colors flex items-center justify-center min-w-[100px]`}
          onClick={(e) => {
            e.preventDefault(); // 防止事件冒泡
            e.stopPropagation(); // 阻止事件传播
            if (!isLoading) {
              onConfirm(); // 只在非加载状态时触发
            }
          }}
          disabled={isLoading}
        >

        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {confirmText}
      </motion.button>
      )}
    </div>
  );
};

export default TaskFormFooter;
