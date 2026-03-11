'use client';

import React, {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiAlertTriangle, FiX} from 'react-icons/fi';
import {useProjectHook} from '@/hooks/use-project-hook';

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
            className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          />

          {/* 弹框内容 */}
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <motion.div
              className="relative transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* 弹框头部 */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <h2
                  className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
                >
                  <FiAlertTriangle className="text-red-500" />
                  删除项目
                </h2>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">关闭</span>
                  <FiX className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* 表单 */}
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-5 space-y-4">
                  {/* 警告说明 */}
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 mb-4">
                    <p className="text-sm text-red-600 dark:text-red-400"
                       style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                      警告：删除项目操作不可逆。该项目下的所有任务数据将被永久删除，且无法恢复。
                    </p>
                  </div>

                  {/* 确认文字 */}
                  <p className="text-sm text-gray-600 dark:text-gray-400"
                     style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                    请输入项目名称 <span className="font-semibold">{project?.name}</span> 以确认删除：
                  </p>

                  {/* 输入确认 */}
                  <div>
                    <input
                      type="text"
                      value={confirmName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-all"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                      placeholder="输入项目名称以确认"
                    />
                  </div>

                  {/* 错误提示 */}
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                </div>

                {/* 表单底部按钮 */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3">
                  {/* 取消按钮 - 苹果风格次要按钮 */}
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                  >
                    取消
                  </button>

                  {/* 删除按钮 - 苹果风格危险按钮 */}
                  <button
                    type="submit"
                    disabled={isLoading || !canDelete}
                    className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center min-w-[80px]"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      letterSpacing: '-0.01em',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-gray-200 border-t-white rounded-full animate-spin"></div>
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
