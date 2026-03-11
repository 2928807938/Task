'use client';

import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiArchive, FiRefreshCw, FiX} from 'react-icons/fi';

interface ArchiveReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isArchiving: boolean; // true为归档，false为取消归档
  projectName: string;
}

const ArchiveReasonModal: React.FC<ArchiveReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isArchiving,
  projectName
}) => {
  const [reason, setReason] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 模态框关闭时清空原因
  useEffect(() => {
    if (isOpen) {
      setReason('');
      // 自动聚焦到输入框
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // 点击外部关闭模态框
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

  // 处理ESC键关闭模态框
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

  // 处理回车键提交表单
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleConfirm();
    }
  };

  const handleConfirm = () => {
    // 如果没有输入原因，使用默认原因
    const finalReason = reason.trim() || (isArchiving ? '用户手动归档' : '用户手动取消归档');
    onConfirm(finalReason);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
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
            {/* 模态框标题栏*/}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--theme-card-border)' }}>
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
                className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" style={{ color: 'var(--theme-neutral-400)' }} />
              </motion.button>
            </div>

            {/* 模态框内容 */}
            <div className="px-5 py-4">
              <div className="flex items-center mb-4">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full mr-3"
                  style={{
                    backgroundColor: isArchiving
                      ? 'var(--theme-warning-100)'
                      : 'var(--theme-primary-100)'
                  }}
                >
                  {isArchiving ? (
                    <FiArchive className="w-5 h-5" style={{ color: 'var(--theme-warning-500)' }} />
                  ) : (
                    <FiRefreshCw className="w-5 h-5" style={{ color: 'var(--theme-primary-500)' }} />
                  )}
                </div>
                <div>
                  <p
                    className="text-[15px] font-medium mb-1"
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

              {/* 原因输入框*/}
              <div className="mb-4">
                <textarea
                  ref={inputRef}
                  className="w-full h-24 p-3 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-colors"
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
                <div className="flex justify-end mt-1">
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

              {/* 按钮组 - 确认和取消按钮 */}
              <div className="flex justify-end gap-3 mt-2">
                <motion.button
                  whileHover={{ backgroundColor: 'var(--theme-neutral-100)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg font-medium transition-colors"
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
                  className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
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
    </AnimatePresence>
  );
};

export default ArchiveReasonModal;
