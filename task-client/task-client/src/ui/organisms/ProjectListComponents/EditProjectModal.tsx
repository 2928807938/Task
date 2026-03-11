'use client';

import React, {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiX} from 'react-icons/fi';
import {useProjectHook} from '@/hooks/use-project-hook';
import {useToast} from '@/ui/molecules/Toast';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    description: string;
  } | null;
  onSuccess: (updatedName: string, updatedDescription: string) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSuccess
}) => {
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });



  const { addToast } = useToast();

  // 加载和错误状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 当项目数据变化时更新表单
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description
      });
    }
  }, [project]);

  // 处理表单字段变更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 使用项目 API 更新项目
  const { useUpdateProject } = useProjectHook();
  const updateProjectMutation = useUpdateProject();

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) return;

    try {
      setIsLoading(true);
      setError(null);

      // 调用项目 API 更新项目信息
      await updateProjectMutation.mutateAsync({
        id: project.id,
        name: formData.name,
        description: formData.description
      });

      // 调用 onSuccess 回调函数并传递更新后的数据
      onSuccess(formData.name, formData.description);
      onClose();
    } catch (err) {
      setError('保存失败，请重试');
      console.error('编辑项目出错:', err);
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



  return (
    <>
      <AnimatePresence>
        {isOpen && (
        <div
          className="fixed inset-0 z-[9999]"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            height: '100vh'
          }}
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
          onClick={handleBackdropClick}
        >
          <motion.div
            className="relative overflow-hidden rounded-xl text-left shadow-xl w-full max-w-lg mx-auto my-auto"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              boxShadow: 'var(--theme-shadow-lg)',
              border: '1px solid var(--theme-card-border)',
              maxHeight: 'calc(100vh - 100px)',
              marginTop: '0',
              position: 'relative',
              top: '40px'
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()} // 阻止点击事件冒泡
          >
            {/* 弹框头部 */}
            <div className="flex justify-between items-center px-6 py-4 border-b" style={{ borderColor: 'var(--theme-card-border)' }}>
              <h2
                className="text-lg font-medium"
                style={{ 
                  color: 'var(--foreground)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' 
                }}
              >
                编辑项目
              </h2>
              <button
                type="button"
                className="focus:outline-none rounded-full p-1 transition-colors"
                style={{ color: 'var(--theme-neutral-400)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-neutral-100)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={onClose}
              >
                <span className="sr-only">关闭</span>
                <FiX className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* 表单内容 */}
              <div className="px-6 py-4 space-y-4">
                {/* 项目名称 */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-1"
                    style={{ 
                      color: 'var(--foreground)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' 
                    }}
                  >
                    项目名称
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ 
                      backgroundColor: 'var(--theme-card-bg)',
                      border: '1px solid var(--theme-neutral-300)',
                      color: 'var(--foreground)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' 
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--theme-primary-500)';
                      e.target.style.boxShadow = '0 0 0 2px var(--theme-primary-100)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--theme-neutral-300)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* 项目描述 */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium mb-1"
                    style={{ 
                      color: 'var(--foreground)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' 
                    }}
                  >
                    项目描述
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                    style={{ 
                      backgroundColor: 'var(--theme-card-bg)',
                      border: '1px solid var(--theme-neutral-300)',
                      color: 'var(--foreground)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' 
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--theme-primary-500)';
                      e.target.style.boxShadow = '0 0 0 2px var(--theme-primary-100)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--theme-neutral-300)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>



                {/* 错误提示 */}
                {error && (
                  <div className="text-sm" style={{ color: 'var(--theme-error-500)' }}>{error}</div>
                )}
              </div>

              {/* 表单底部按钮 */}
              <div className="px-6 py-4 border-t flex justify-end space-x-3" style={{ borderColor: 'var(--theme-card-border)' }}>
                {/* 取消按钮 - 苹果风格次要按钮 */}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                  style={{ 
                    color: 'var(--foreground)',
                    backgroundColor: 'var(--theme-neutral-100)',
                    border: '1px solid var(--theme-neutral-200)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = 'var(--theme-neutral-200)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = 'var(--theme-neutral-100)';
                    }
                  }}
                >
                  取消
                </button>

                {/* 保存按钮 - 苹果风格主要按钮 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-lg text-white transition-all duration-200 text-sm font-medium disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                  style={{
                    backgroundColor: 'var(--theme-primary-500)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    letterSpacing: '-0.01em',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = 'var(--theme-primary-600)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = 'var(--theme-primary-500)';
                    }
                  }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : '保存'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    </>
  );
};

export default EditProjectModal;
