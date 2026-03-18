'use client';

import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {FiArchive, FiRefreshCw, FiX} from 'react-icons/fi';

interface ArchiveReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isArchiving: boolean;
  projectName: string;
}

const ArchiveReasonModal: React.FC<ArchiveReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isArchiving,
  projectName
}) => {
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleConfirm();
    }
  };

  const handleConfirm = () => {
    const finalReason = reason.trim() || (isArchiving ? '用户手动归档' : '用户手动取消归档');
    onConfirm(finalReason);
    onClose();
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            ref={modalRef}
            className="w-full max-w-md overflow-hidden rounded-xl shadow-xl"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              boxShadow: 'var(--theme-shadow-lg)',
              border: '1px solid var(--theme-card-border)'
            }}
          >
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--theme-card-border)' }}>
              <h3
                className="text-[17px] font-semibold"
                style={{
                  color: 'var(--foreground)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  letterSpacing: '-0.01em'
                }}
              >
                {isArchiving ? '归档项目' : '恢复项目'}
              </h3>
              <motion.button
                whileHover={{ backgroundColor: 'var(--theme-neutral-100)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
              >
                <FiX className="h-5 w-5" style={{ color: 'var(--theme-neutral-400)' }} />
              </motion.button>
            </div>

            <div className="px-5 py-4">
              <div className="mb-4 flex items-center">
                <div
                  className="mr-3 flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isArchiving ? 'var(--theme-warning-100)' : 'var(--theme-primary-100)'
                  }}
                >
                  {isArchiving ? (
                    <FiArchive className="h-5 w-5" style={{ color: 'var(--theme-warning-500)' }} />
                  ) : (
                    <FiRefreshCw className="h-5 w-5" style={{ color: 'var(--theme-primary-500)' }} />
                  )}
                </div>
                <div>
                  <p
                    className="mb-1 text-[15px] font-medium"
                    style={{
                      color: 'var(--foreground)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                    }}
                  >
                    {isArchiving ? '归档' : '恢复'}<span style={{ color: 'var(--theme-primary-500)' }}> {projectName} </span>项目
                  </p>
                  <p
                    className="text-[13px]"
                    style={{
                      color: 'var(--theme-neutral-500)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                    }}
                  >
                    请输入{isArchiving ? '归档' : '恢复'}原因（可选）
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <textarea
                  ref={inputRef}
                  className="h-24 w-full resize-none rounded-lg p-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--theme-card-bg)',
                    border: '1px solid var(--theme-neutral-300)',
                    color: 'var(--foreground)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '14px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--theme-primary-500)';
                    e.target.style.boxShadow = '0 0 0 2px var(--theme-primary-100)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--theme-neutral-300)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder={`请输入${isArchiving ? '归档' : '恢复归档'}的原因...`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className="mt-1 flex justify-end">
                  <span
                    className="text-[12px]"
                    style={{
                      color: 'var(--theme-neutral-500)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif'
                    }}
                  >
                    ⌘+Enter 提交
                  </span>
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <motion.button
                  whileHover={{ backgroundColor: 'var(--theme-neutral-100)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 font-medium transition-colors"
                  style={{
                    color: 'var(--foreground)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '14px'
                  }}
                >
                  取消
                </motion.button>
                <motion.button
                  whileHover={{ opacity: 0.85 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="rounded-lg px-4 py-2 font-medium text-white transition-colors"
                  style={{
                    backgroundColor: isArchiving ? 'var(--theme-warning-500)' : 'var(--theme-primary-500)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '14px',
                    boxShadow: isArchiving
                      ? '0 2px 8px rgba(245, 158, 11, 0.25)'
                      : '0 2px 8px rgba(99, 102, 241, 0.25)'
                  }}
                >
                  确认{isArchiving ? '归档' : '恢复'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ArchiveReasonModal;
