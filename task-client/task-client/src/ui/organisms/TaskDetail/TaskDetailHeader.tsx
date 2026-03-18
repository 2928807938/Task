import React from 'react';
import {FiEdit2, FiX} from 'react-icons/fi';
import {motion} from 'framer-motion';

interface TaskDetailHeaderProps {
  title: string;
  id?: string;
  meta?: string;
  onClose: () => void;
  onEdit?: () => void;
  showEditButton?: boolean;
}

const TaskDetailHeader: React.FC<TaskDetailHeaderProps> = ({
  title,
  id,
  meta,
  onClose,
  onEdit,
  showEditButton = true
}) => {
  return (
    <motion.div
      className="border-b border-card-border/70 bg-white/75 px-5 py-4 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70 sm:px-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-xl">
              {title}
            </h2>
            {id ? (
              <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 text-[11px] font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                #{id}
              </span>
            ) : null}
          </div>
          {meta ? (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{meta}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {showEditButton && onEdit ? (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-100 dark:border-primary-800/70 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50"
              aria-label="编辑任务"
            >
              <FiEdit2 size={16} />
              编辑
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-neutral-400 transition hover:border-card-border hover:bg-neutral-100 hover:text-neutral-700 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-neutral-200"
            aria-label="关闭"
          >
            <FiX size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskDetailHeader;
