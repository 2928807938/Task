'use client';

import React, {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiAlertTriangle, FiX} from 'react-icons/fi';
import {useProjectHook} from '@/hooks/use-project-hook';

// 符合苹果设计规范的颜色常量
const APPLE_COLORS = {
  red: {
    default: '#FF3B30',
    hover: '#FF453A',
    active: '#D70015'
  },
  gray: {
    50: '#F9F9F9',
    100: '#F2F2F7',
    200: '#E5E5EA',
    300: '#D1D1D6',
    400: '#C7C7CC',
    500: '#AEAEB2',
    600: '#8E8E93'
  },
  text: {
    primary: '#000000',
    secondary: '#3A3A3C',
    tertiary: '#8E8E93'
  }
};

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
  } | null;
  onSuccess: () => void;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSuccess
}) => {
  // 确认名称状态
  const [confirmName, setConfirmName] = useState('');
  // 加载和错误状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 使用项目 API 删除项目
  const { useDeleteProject } = useProjectHook();
  const deleteProjectMutation = useDeleteProject();

  // 判断是否可以删除（项目名称是否匹配）
  const canDelete = project?.name === confirmName;

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project || !canDelete) return;

    try {
      setIsLoading(true);
      setError(null);

      // 调用项目 API 删除项目
      await deleteProjectMutation.mutateAsync(project.id);

      // 调用 onSuccess 回调函数刷新项目列表
      onSuccess();
      onClose();
    } catch (err) {
      setError('删除失败，请重试');
      console.error('删除项目出错:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 点击背景关闭弹框
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 处理输入框变更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmName(e.target.value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          />

          {/* 弹框内容 */}
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <motion.div
              className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md"
              style={{
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1), 0 1px 6px rgba(0, 0, 0, 0.05)',
                borderWidth: '0.5px',
                borderColor: APPLE_COLORS.gray[200],
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* 弹框头部 - 苹果样式 */}
              <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b" style={{ borderColor: APPLE_COLORS.gray[200] }}>
                <h2
                  className="text-[17px] font-semibold flex items-center gap-2.5"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    letterSpacing: '-0.022em',
                    color: APPLE_COLORS.text.primary
                  }}
                >
                  <span style={{ color: APPLE_COLORS.red.default }} className="flex-shrink-0">
                    <FiAlertTriangle className="h-5 w-5" />
                  </span>
                  <span>删除项目</span>
                </h2>
                <button
                  type="button"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
                  style={{ color: APPLE_COLORS.gray[500] }}
                  onClick={onClose}
                  aria-label="关闭"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* 表单 */}
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-5 space-y-4">
                  {/* 警告说明 - 苹果样式 */}
                  <div className="rounded-xl p-3.5 mb-5"
                       style={{
                         backgroundColor: 'rgba(255, 59, 48, 0.08)',
                         border: '1px solid rgba(255, 59, 48, 0.15)'
                       }}>
                    <div className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full"
                            style={{ backgroundColor: 'rgba(255, 59, 48, 0.12)' }}>
                        <FiAlertTriangle style={{ color: APPLE_COLORS.red.default }} className="h-3.5 w-3.5" />
                      </span>
                      <p className="ml-2.5 text-[13px] leading-5"
                         style={{
                           fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                           letterSpacing: '-0.01em',
                           color: APPLE_COLORS.text.secondary
                         }}>
                        <span style={{ color: APPLE_COLORS.red.default }} className="font-semibold">警告：</span>
                        删除项目操作不可逆。该项目下的所有任务数据将被永久删除，且无法恢复。
                      </p>
                    </div>
                  </div>

                  {/* 确认文字 - 苹果样式 */}
                  <div className="mb-1.5">
                    <label htmlFor="confirm-project-name" className="block text-[15px] mb-2"
                       style={{
                         fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                         letterSpacing: '-0.01em',
                         color: APPLE_COLORS.text.secondary,
                         fontWeight: 450
                       }}>
                      请输入项目名称进行确认：
                    </label>
                    <div className="flex items-center gap-2 mb-3"
                         style={{
                           padding: '8px 12px',
                           borderRadius: '8px',
                           backgroundColor: APPLE_COLORS.gray[50],
                           border: `1px solid ${APPLE_COLORS.gray[200]}`
                         }}>
                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-full"
                           style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#007AFF" className="w-3 h-3">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-[13px] flex-1"
                            style={{
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                              color: APPLE_COLORS.text.secondary
                            }}>
                        <span className="font-semibold" style={{ color: APPLE_COLORS.text.primary }}>{project?.name}</span>
                      </span>
                    </div>
                  </div>

                  {/* 输入确认 - 苹果样式 */}
                  <div className="relative">
                    <input
                      id="confirm-project-name"
                      type="text"
                      value={confirmName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border transition-all text-[15px]"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        letterSpacing: '-0.01em',
                        borderColor: canDelete ? '#4CD964' : APPLE_COLORS.gray[300],
                        boxShadow: canDelete ? '0 0 0 1px #4CD964' : 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
                        color: APPLE_COLORS.text.primary
                      }}
                      placeholder="输入项目名称以确认"
                      autoFocus
                    />
                    {canDelete && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 错误提示*/}
                  {error && (
                    <div className="mt-2 rounded-lg px-3 py-2 flex items-center"
                         style={{ backgroundColor: 'rgba(255, 59, 48, 0.08)' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                           stroke={APPLE_COLORS.red.default} className="w-5 h-5 mr-2 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      <span className="text-[13px]"
                            style={{
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                              color: APPLE_COLORS.red.default
                            }}>
                        {error}
                      </span>
                    </div>
                  )}
                </div>

                {/* 表单底部按钮*/}
                <div className="px-6 py-5 border-t flex justify-end space-x-3"
                     style={{ borderColor: APPLE_COLORS.gray[200] }}>
                  {/* 取消按钮 - 苹果风格次要按钮 */}
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-5 py-[10px] rounded-full border transition-all text-[13px] font-medium disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      letterSpacing: '-0.01em',
                      borderColor: APPLE_COLORS.gray[300],
                      color: '#007AFF',
                      backgroundColor: 'rgba(0, 0, 0, 0.01)'
                    }}
                  >
                    取消
                  </button>

                  {/* 删除按钮 - 苹果风格危险按钮 */}
                  <button
                    type="submit"
                    disabled={isLoading || !canDelete}
                    className="px-5 py-[10px] rounded-full transition-all text-[13px] font-medium disabled:opacity-50 flex items-center justify-center min-w-[96px]"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      letterSpacing: '-0.01em',
                      backgroundColor: canDelete ? APPLE_COLORS.red.default : 'rgba(255, 59, 48, 0.5)',
                      color: '#FFFFFF'
                    }}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : '删除项目'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteProjectModal;
