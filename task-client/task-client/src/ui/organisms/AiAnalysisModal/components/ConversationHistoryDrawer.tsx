"use client";

import React from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiClock, FiLoader, FiMessageSquare, FiPlus, FiRefreshCw, FiX} from 'react-icons/fi';
import type {RequirementConversationHistorySummary} from '@/adapters/api/requirement-conversation-api';
import {useTheme} from '@/ui/theme/themeContext';

interface ConversationHistoryDrawerProps {
  isOpen: boolean;
  histories: RequirementConversationHistorySummary[];
  activeConversationListId?: string | null;
  loading?: boolean;
  loadingConversationListId?: string | null;
  error?: string | null;
  onClose: () => void;
  onRefresh: () => void;
  onCreateNew: () => void;
  onSelect: (history: RequirementConversationHistorySummary) => void;
}

const formatDateTime = (value?: string) => {
  if (!value) {
    return '--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusMeta = (status?: string) => {
  if (status === 'SUCCESS' || status === 'COMPLETED') {
    return { label: '已完成', color: '#16A34A', background: 'rgba(22, 163, 74, 0.10)' };
  }

  if (status === 'PROCESSING' || status === 'RUNNING') {
    return { label: '进行中', color: '#2563EB', background: 'rgba(37, 99, 235, 0.10)' };
  }

  if (status === 'FAILED' || status === 'ERROR') {
    return { label: '失败', color: '#DC2626', background: 'rgba(220, 38, 38, 0.10)' };
  }

  return { label: '未知', color: '#6B7280', background: 'rgba(107, 114, 128, 0.10)' };
};

const ConversationHistoryDrawer: React.FC<ConversationHistoryDrawerProps> = ({
  isOpen,
  histories,
  activeConversationListId,
  loading = false,
  loadingConversationListId,
  error,
  onClose,
  onRefresh,
  onCreateNew,
  onSelect,
}) => {
  const { theme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="absolute right-0 top-0 h-full w-full max-w-[420px] border-l shadow-2xl"
            style={{
              backgroundColor: `${theme.colors.card.background}F2`,
              borderLeftColor: theme.colors.card.border,
            }}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{ borderBottomColor: theme.colors.card.border }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${theme.colors.primary[500]}14`, color: theme.colors.primary[600] }}
                >
                  <FiClock size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: theme.colors.foreground }}>历史对话</div>
                  <div className="text-xs" style={{ color: theme.colors.neutral[500] }}>按项目查看并恢复历史分析快照</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="rounded-full p-2 transition-all"
                  style={{ backgroundColor: theme.colors.neutral[100], color: theme.colors.neutral[600] }}
                  onClick={onRefresh}
                  type="button"
                  title="刷新列表"
                >
                  <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  className="rounded-full p-2 transition-all"
                  style={{ backgroundColor: `${theme.colors.primary[500]}14`, color: theme.colors.primary[600] }}
                  onClick={onCreateNew}
                  type="button"
                  title="新建对话"
                >
                  <FiPlus size={16} />
                </button>
                <button
                  className="rounded-full p-2 transition-all"
                  style={{ backgroundColor: theme.colors.neutral[100], color: theme.colors.neutral[600] }}
                  onClick={onClose}
                  type="button"
                  title="关闭"
                >
                  <FiX size={16} />
                </button>
              </div>
            </div>

            <div className="h-[calc(100%-74px)] overflow-y-auto px-4 py-4">
              {loading && histories.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex items-center gap-2 text-sm" style={{ color: theme.colors.neutral[500] }}>
                    <FiLoader className="animate-spin" />
                    <span>正在加载历史对话...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <div className="text-sm font-medium" style={{ color: theme.colors.foreground }}>历史对话加载失败</div>
                  <div className="text-sm" style={{ color: theme.colors.neutral[500] }}>{error}</div>
                  <button
                    className="rounded-full px-4 py-2 text-sm"
                    style={{ backgroundColor: theme.colors.primary[600], color: '#fff' }}
                    onClick={onRefresh}
                    type="button"
                  >
                    重新加载
                  </button>
                </div>
              ) : histories.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: theme.colors.neutral[100], color: theme.colors.neutral[500] }}
                  >
                    <FiMessageSquare size={22} />
                  </div>
                  <div className="text-sm font-medium" style={{ color: theme.colors.foreground }}>暂无历史对话</div>
                  <div className="text-sm" style={{ color: theme.colors.neutral[500] }}>发送需求并完成分析后，这里会展示项目下的历史会话。</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {histories.map((history) => {
                    const isActive = String(history.conversationListId) === String(activeConversationListId || '');
                    const isLoadingDetail = String(history.conversationListId) === String(loadingConversationListId || '');
                    const statusMeta = getStatusMeta(history.analysisCompleteStatus);

                    return (
                      <button
                        key={String(history.conversationListId)}
                        className="w-full rounded-2xl border p-4 text-left transition-all"
                        style={{
                          borderColor: isActive ? theme.colors.primary[400] : theme.colors.card.border,
                          backgroundColor: isActive ? `${theme.colors.primary[500]}10` : theme.colors.card.background,
                          boxShadow: isActive ? `0 8px 24px -18px ${theme.colors.primary[500]}` : 'none',
                        }}
                        onClick={() => onSelect(history)}
                        type="button"
                        disabled={isLoadingDetail}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold" style={{ color: theme.colors.foreground }}>
                              {history.title || history.rootMainTask || `会话 ${history.conversationListId}`}
                            </div>
                            <div className="mt-1 truncate text-xs" style={{ color: theme.colors.neutral[500] }}>
                              主任务：{history.rootMainTask || '未命名'}
                            </div>
                          </div>
                          <div
                            className="rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{ color: statusMeta.color, backgroundColor: statusMeta.background }}
                          >
                            {statusMeta.label}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs" style={{ color: theme.colors.neutral[500] }}>
                          <span>第 {history.currentTurnNo || 0} 轮</span>
                          <span>更新于 {formatDateTime(history.updatedAt)}</span>
                        </div>

                        {isLoadingDetail && (
                          <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: theme.colors.primary[600] }}>
                            <FiLoader className="animate-spin" />
                            <span>正在恢复该历史会话...</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConversationHistoryDrawer;
