import React from 'react';
import {FiX} from 'react-icons/fi';

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/**
 * 模态窗口容器组件 -
 */
const ModalContainer: React.FC<ModalContainerProps> = ({
  isOpen,
  onClose,
  title,
  currentStep,
  totalSteps,
  children,
  footer
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm"
      onClick={(e) => {
        // 当点击的是背景遮罩层（而不是模态窗口本身）时关闭模态窗口
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* 模态窗口容器 -  */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden transition-all">
        {/* 模态窗口头部 */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-gray-100">
          {/* 步骤指示器 */}
          <div className="flex items-center space-x-2">
            {[...Array(totalSteps)].map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index + 1 === currentStep 
                    ? 'bg-blue-500 scale-110' 
                    : index + 1 < currentStep 
                      ? 'bg-blue-300' 
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* 标题 */}
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>

          {/* 关闭按钮 - 更符合网页习惯 */}
          <button
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            onClick={onClose}
            aria-label="关闭"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="px-6 py-5 min-h-[280px] max-h-[calc(70vh-130px)] overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* 底部按钮区域 */}
        <div className="flex justify-between p-5 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm mt-auto">
          {footer}
        </div>
      </div>
    </div>
  );
};

export default ModalContainer;
