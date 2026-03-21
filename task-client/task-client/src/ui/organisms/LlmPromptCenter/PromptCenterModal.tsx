'use client';

import React, {useEffect} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiX} from 'react-icons/fi';

import LlmPromptCenter, {PromptCenterScope} from '@/ui/organisms/LlmPromptCenter';

interface PromptCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  scope: PromptCenterScope;
  projectId?: string;
  title?: string;
  description?: string;
}

const PromptCenterModal: React.FC<PromptCenterModalProps> = ({
  isOpen,
  onClose,
  scope,
  projectId,
  title,
  description,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          className="fixed inset-0 z-[65] bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
        >
          <motion.div
            initial={{opacity: 0, y: 18, scale: 0.985}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: 14, scale: 0.985}}
            transition={{type: 'spring', stiffness: 220, damping: 24}}
            className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-slate-100 shadow-[0_30px_90px_rgba(15,23,42,0.24)] dark:border-white/10 dark:bg-slate-950"
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-white/10">
              <div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">{title || (scope === 'user' ? '我的分析提示词' : '项目分析提示词')}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description || '支持列表管理、场景绑定、生效预览和命中日志审计。'}</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white p-2 text-slate-500 transition hover:bg-slate-100 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
                aria-label="关闭提示词中心"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <LlmPromptCenter
                scope={scope}
                projectId={projectId}
                title={title}
                description={description}
                compact
                showScopeBadge={false}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromptCenterModal;
