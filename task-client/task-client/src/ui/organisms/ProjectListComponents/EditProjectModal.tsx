'use client';

import React, {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {FiX} from 'react-icons/fi';
import {useProjectHook} from '@/hooks/use-project-hook';

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
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description
      });
    }
  }, [project]);

  useEffect(() => {
    if (!mounted || !isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, mounted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const { useUpdateProject } = useProjectHook();
  const updateProjectMutation = useUpdateProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project) return;

    try {
      setIsLoading(true);
      setError(null);

      await updateProjectMutation.mutateAsync({
        id: project.id,
        name: formData.name,
        description: formData.description
      });

      onSuccess(formData.name, formData.description);
      onClose();
    } catch (err) {
      setError('保存失败，请重试');
      console.error('编辑项目出错:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            padding: '24px',
            minHeight: '100vh'
          }}
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
          onClick={handleBackdropClick}
        >
          <motion.div
            className="relative mx-auto w-full max-w-lg overflow-hidden rounded-xl text-left shadow-xl"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              boxShadow: 'var(--theme-shadow-lg)',
              border: '1px solid var(--theme-card-border)',
              maxHeight: 'calc(100vh - 80px)'
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--theme-card-border)' }}>
              <h2
                id="modal-title"
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
                className="rounded-full p-1 transition-colors focus:outline-none"
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
              <div className="space-y-4 px-6 py-4">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium"
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
                    className="w-full rounded-lg px-4 py-2 transition-all focus:border-transparent focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--theme-card-bg)',
                      border: '1px solid var(--theme-neutral-300)',
                      borderColor: error ? 'var(--theme-error-500)' : 'var(--theme-neutral-300)',
                      color: 'var(--foreground)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                    }}
                    placeholder="请输入项目名称"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-1 block text-sm font-medium"
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
                    className="w-full rounded-lg px-4 py-2 transition-all focus:border-transparent focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--theme-card-bg)',
                      border: '1px solid var(--theme-neutral-300)',
                      color: 'var(--foreground)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      resize: 'vertical'
                    }}
                    placeholder="请输入项目描述（可选）"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="text-sm" style={{ color: 'var(--theme-error-500)' }}>
                    {error}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t px-6 py-4" style={{ borderColor: 'var(--theme-card-border)' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="rounded-lg px-4 py-2 font-medium transition-colors"
                  style={{
                    color: 'var(--foreground)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg px-4 py-2 font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    backgroundColor: 'var(--theme-primary-500)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)'
                  }}
                >
                  {isLoading ? '保存中...' : '保存修改'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default EditProjectModal;
