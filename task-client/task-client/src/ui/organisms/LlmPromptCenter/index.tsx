'use client';

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {AnimatePresence, motion} from 'framer-motion';
import {
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiEye,
  FiFilter,
  FiLayers,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiSliders,
  FiTrash2,
  FiX,
  FiZap,
} from 'react-icons/fi';

import llmPromptApi from '@/adapters/api/llm-prompt-api';
import {useToast} from '@/ui/molecules/Toast';
import {ConfirmDialog} from '@/ui/molecules/ConfirmDialog';
import {
  LLM_PROMPT_SCENE_OPTIONS,
  LlmPromptConfig,
  LlmPromptHitLog,
  LlmPromptPageRequest,
  LlmPromptPreview,
  LlmPromptStatus,
  SaveLlmPromptRequest,
} from '@/types/llm-prompt-types';

export type PromptCenterScope = 'user' | 'project';

interface LlmPromptCenterProps {
  scope: PromptCenterScope;
  projectId?: string;
  title?: string;
  description?: string;
  showScopeBadge?: boolean;
  compact?: boolean;
}

const DEFAULT_SCENE_KEY = LLM_PROMPT_SCENE_OPTIONS[0]?.key ?? '任务拆分';
const LIST_PAGE_SIZE = 6;
const LOG_PAGE_SIZE = 5;

const DEFAULT_FORM_STATE: SaveLlmPromptRequest = {
  promptName: '',
  promptContent: '',
  allSceneEnabled: false,
  sceneKeys: [DEFAULT_SCENE_KEY],
  status: 'ENABLED',
  priority: 0,
};

const PANEL_CLASS = 'rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900/80';

const SCOPE_META: Record<PromptCenterScope, {badge: string; title: string; description: string}> = {
  user: {
    badge: '用户级提示词',
    title: '我的分析提示词',
    description: '沉淀个人分析偏好。根据文档规则，分析前会先检查用户级提示词，再补充项目级上下文。',
  },
  project: {
    badge: '项目级提示词',
    title: '项目分析提示词',
    description: '为当前项目统一术语、背景和输出偏好，帮助团队获得更一致的分析结果。',
  },
};

const STATUS_META: Record<LlmPromptStatus, {label: string; className: string}> = {
  ENABLED: {
    label: '使用中',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  },
  DISABLED: {
    label: '已停用',
    className: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  },
};

const FILTER_STATUS_OPTIONS: Array<{label: string; value: 'ALL' | LlmPromptStatus}> = [
  {label: '全部状态', value: 'ALL'},
  {label: '使用中', value: 'ENABLED'},
  {label: '已停用', value: 'DISABLED'},
];

function formatDateTime(value?: string | null) {
  if (!value) {
    return '暂无记录';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPromptExcerpt(content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '暂无内容';
  }

  return normalized.length > 110 ? `${normalized.slice(0, 110)}...` : normalized;
}

function toSaveRequest(prompt: LlmPromptConfig): SaveLlmPromptRequest {
  return {
    promptName: prompt.promptName,
    promptContent: prompt.promptContent,
    allSceneEnabled: prompt.allSceneEnabled,
    sceneKeys: prompt.sceneKeys,
    status: prompt.status,
    priority: prompt.priority,
  };
}

function getSceneSummary(prompt: Pick<LlmPromptConfig, 'allSceneEnabled' | 'sceneKeys'>) {
  if (prompt.allSceneEnabled) {
    return '全部场景';
  }

  if (!prompt.sceneKeys.length) {
    return '未绑定场景';
  }

  return prompt.sceneKeys.join(' · ');
}

function computeCoveredScenes(prompts: LlmPromptConfig[]) {
  if (prompts.some((prompt) => prompt.allSceneEnabled)) {
    return '全部';
  }

  const sceneSet = new Set<string>();
  prompts.forEach((prompt) => {
    prompt.sceneKeys.forEach((sceneKey) => sceneSet.add(sceneKey));
  });

  return `${sceneSet.size}`;
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">{helper}</div>
    </div>
  );
}

function SceneChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <span
      className={[
        'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition',
        active
          ? 'bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/8 dark:text-slate-300 dark:hover:bg-white/12',
      ].join(' ')}
    >
      {label}
    </span>
  );

  if (!onClick) {
    return content;
  }

  return (
    <button type="button" onClick={onClick}>
      {content}
    </button>
  );
}

function EmptyPanel({title, description}: {title: string; description: string}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm dark:bg-slate-950 dark:text-slate-300">
        <FiLayers className="h-5 w-5" />
      </div>
      <div className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{title}</div>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

function PreviewTextBlock({
  title,
  content,
  accent,
}: {
  title: string;
  content?: string | null;
  accent?: 'blue' | 'violet' | 'emerald';
}) {
  const accentClassName = accent === 'emerald'
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
    : accent === 'violet'
      ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
      : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300';

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${accentClassName}`}>{title}</span>
      </div>
      <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">{content?.trim() || '暂无内容'}</pre>
    </div>
  );
}

function PromptEditorModal({
  open,
  formState,
  editingPrompt,
  submitting,
  onClose,
  onChange,
  onToggleScene,
  onSubmit,
}: {
  open: boolean;
  formState: SaveLlmPromptRequest;
  editingPrompt: LlmPromptConfig | null;
  submitting: boolean;
  onClose: () => void;
  onChange: (patch: Partial<SaveLlmPromptRequest>) => void;
  onToggleScene: (sceneKey: string) => void;
  onSubmit: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{opacity: 0, y: 20, scale: 0.98}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: 16, scale: 0.98}}
            transition={{type: 'spring', stiffness: 220, damping: 24}}
            className="w-full max-w-3xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200/80 px-6 py-5 dark:border-white/10">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                  <FiSliders size={13} />
                  {editingPrompt ? '编辑提示词' : '新建提示词'}
                </div>
                <h3 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                  {editingPrompt ? editingPrompt.promptName : '创建新的分析提示词'}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  保留系统硬约束，只配置场景偏好、术语、风险偏好和输出风格。
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
                aria-label="关闭提示词编辑器"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-6 overflow-y-auto px-6 py-6">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">提示词名称</div>
                  <input
                    value={formState.promptName}
                    onChange={(event) => onChange({promptName: event.target.value})}
                    placeholder="例如：偏重排期可执行性的个人规则"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                  />
                </label>

                <label className="block">
                  <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">优先级</div>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={formState.priority}
                    onChange={(event) => onChange({priority: Number(event.target.value) || 0})}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                  />
                </label>
              </div>

              <label className="block">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">提示词正文</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">{formState.promptContent.length} / 10000</span>
                </div>
                <textarea
                  value={formState.promptContent}
                  onChange={(event) => onChange({promptContent: event.target.value})}
                  rows={8}
                  placeholder="例如：优先指出需求边界不清、依赖未交代和里程碑风险；输出风格尽量简洁直接。"
                  className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                />
              </label>

              <div className="rounded-[24px] border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-xl bg-white p-2 text-amber-500 shadow-sm dark:bg-slate-950/70">
                    <FiAlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-amber-900 dark:text-amber-200">硬约束提醒</div>
                    <p className="mt-1 text-sm leading-6 text-amber-800/90 dark:text-amber-100/80">
                      不建议写入“忽略系统规则”“改成 Markdown 输出”“覆盖 JSON 结构”等危险语句；预览区会展示被过滤的片段。
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">生效场景</div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">建议按分析场景绑定，避免所有请求都带入同一套规则。</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onChange({allSceneEnabled: !formState.allSceneEnabled, sceneKeys: !formState.allSceneEnabled ? [] : formState.sceneKeys.length ? formState.sceneKeys : [DEFAULT_SCENE_KEY]})}
                    className={[
                      'inline-flex items-center rounded-full px-3 py-2 text-xs font-semibold transition',
                      formState.allSceneEnabled
                        ? 'bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15',
                    ].join(' ')}
                  >
                    全场景生效
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {LLM_PROMPT_SCENE_OPTIONS.map((option) => {
                    const active = formState.sceneKeys.includes(option.key);
                    return (
                      <SceneChip
                        key={option.key}
                        label={option.label}
                        active={formState.allSceneEnabled || active}
                        onClick={formState.allSceneEnabled ? undefined : () => onToggleScene(option.key)}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">启用状态</div>
                  <div className="flex gap-2">
                    {(['ENABLED', 'DISABLED'] as LlmPromptStatus[]).map((status) => {
                      const active = formState.status === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => onChange({status})}
                          className={[
                            'flex-1 rounded-2xl border px-4 py-3 text-sm font-medium transition',
                            active
                              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300',
                          ].join(' ')}
                        >
                          {STATUS_META[status].label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">规则建议</div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                    多写“关注什么”和“如何表达”，少写“扮演谁”和“覆盖系统规则”。
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200/80 px-6 py-4 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
              >
                取消
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {submitting ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiSave className="h-4 w-4" />}
                {editingPrompt ? '保存修改' : '创建提示词'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const LlmPromptCenter: React.FC<LlmPromptCenterProps> = ({
  scope,
  projectId,
  title,
  description,
  showScopeBadge = true,
  compact = false,
}) => {
  const {addToast} = useToast();
  const queryClient = useQueryClient();
  const scopeMeta = SCOPE_META[scope];
  const baseQueryKey = useMemo(() => ['llm-prompt-list', scope, projectId ?? 'self'], [projectId, scope]);
  const baseHitLogKey = useMemo(() => ['llm-prompt-hit-log', scope, projectId ?? 'self'], [projectId, scope]);

  const [pageNumber, setPageNumber] = useState(0);
  const [draftPromptName, setDraftPromptName] = useState('');
  const [promptNameFilter, setPromptNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | LlmPromptStatus>('ALL');
  const [previewSceneKey, setPreviewSceneKey] = useState(DEFAULT_SCENE_KEY);
  const [logSceneKey, setLogSceneKey] = useState<'ALL' | string>('ALL');
  const [previewResult, setPreviewResult] = useState<LlmPromptPreview | null>(null);
  const [isPreviewPending, setIsPreviewPending] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deletingPrompt, setDeletingPrompt] = useState<LlmPromptConfig | null>(null);
  const [statusChangingPrompt, setStatusChangingPrompt] = useState<{prompt: LlmPromptConfig; nextStatus: LlmPromptStatus} | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<LlmPromptConfig | null>(null);
  const [formState, setFormState] = useState<SaveLlmPromptRequest>(DEFAULT_FORM_STATE);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPromptNameFilter(draftPromptName.trim());
      setPageNumber(0);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [draftPromptName]);

  const promptPageRequest = useMemo<LlmPromptPageRequest>(() => ({
    pageNumber,
    pageSize: LIST_PAGE_SIZE,
    promptName: promptNameFilter || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  }), [pageNumber, promptNameFilter, statusFilter]);

  const promptListQuery = useQuery({
    queryKey: [...baseQueryKey, promptPageRequest],
    queryFn: async () => {
      return scope === 'user'
        ? llmPromptApi.getCurrentUserPrompts(promptPageRequest)
        : llmPromptApi.getProjectPrompts(projectId || '', promptPageRequest);
    },
    enabled: scope === 'user' || Boolean(projectId),
  });

  const hitLogQuery = useQuery({
    queryKey: [...baseHitLogKey, logSceneKey],
    queryFn: async () => {
      const request = {
        pageNumber: 0,
        pageSize: LOG_PAGE_SIZE,
        sceneKey: logSceneKey === 'ALL' ? undefined : logSceneKey,
      };

      return scope === 'user'
        ? llmPromptApi.getCurrentUserHitLogs(request)
        : llmPromptApi.getProjectHitLogs(projectId || '', request);
    },
    enabled: scope === 'user' || Boolean(projectId),
  });

  const persistPrompt = useCallback(async (request: SaveLlmPromptRequest, promptId?: string) => {
    if (scope === 'user') {
      return promptId
        ? llmPromptApi.updateCurrentUserPrompt(promptId, request)
        : llmPromptApi.createCurrentUserPrompt(request);
    }

    return promptId
      ? llmPromptApi.updateProjectPrompt(projectId || '', promptId, request)
      : llmPromptApi.createProjectPrompt(projectId || '', request);
  }, [projectId, scope]);

  const runPreview = useCallback(async (sceneKey: string) => {
    setIsPreviewPending(true);

    try {
      const response = scope === 'user'
        ? await llmPromptApi.previewCurrentUserPrompt({sceneKey})
        : await llmPromptApi.previewProjectPrompt(projectId || '', {sceneKey});

      if (!response.success || !response.data) {
        addToast(response.message || '生效预览失败，请稍后重试', 'error');
        setPreviewResult(null);
        return;
      }

      setPreviewResult(response.data);
    } catch {
      addToast('生效预览失败，请稍后重试', 'error');
      setPreviewResult(null);
    } finally {
      setIsPreviewPending(false);
    }
  }, [addToast, projectId, scope]);

  const saveMutation = useMutation({
    mutationFn: async (request: SaveLlmPromptRequest) => {
      return persistPrompt(request, editingPrompt?.id);
    },
    onSuccess: async (response) => {
      if (!response.success || !response.data) {
        addToast(response.message || '保存提示词失败，请稍后重试', 'error');
        return;
      }

      addToast(editingPrompt ? '提示词已更新' : '提示词已创建', 'success');
      setEditorOpen(false);
      setEditingPrompt(null);
      setFormState(DEFAULT_FORM_STATE);
      await Promise.all([
        queryClient.invalidateQueries({queryKey: baseQueryKey}),
        queryClient.invalidateQueries({queryKey: baseHitLogKey}),
      ]);
      await runPreview(previewSceneKey);
    },
    onError: () => addToast('保存提示词失败，请稍后重试', 'error')
  });

  const quickUpdateMutation = useMutation({
    mutationFn: async ({prompt, nextStatus}: {prompt: LlmPromptConfig; nextStatus: LlmPromptStatus}) => {
      return persistPrompt({...toSaveRequest(prompt), status: nextStatus}, prompt.id);
    },
    onSuccess: async (response) => {
      if (!response.success || !response.data) {
        addToast(response.message || '更新提示词状态失败', 'error');
        return;
      }

      addToast('提示词状态已更新', 'success');
      await Promise.all([
        queryClient.invalidateQueries({queryKey: baseQueryKey}),
        queryClient.invalidateQueries({queryKey: baseHitLogKey}),
      ]);
      await runPreview(previewSceneKey);
    },
    onError: () => addToast('更新提示词状态失败', 'error')
  });

  const deleteMutation = useMutation({
    mutationFn: async (promptId: string) => {
      return scope === 'user'
        ? llmPromptApi.deleteCurrentUserPrompt(promptId)
        : llmPromptApi.deleteProjectPrompt(projectId || '', promptId);
    },
    onSuccess: async (response) => {
      if (!response.success) {
        addToast(response.message || '删除提示词失败，请稍后重试', 'error');
        return;
      }

      addToast('提示词已删除', 'success');
      await Promise.all([
        queryClient.invalidateQueries({queryKey: baseQueryKey}),
        queryClient.invalidateQueries({queryKey: baseHitLogKey}),
      ]);
      await runPreview(previewSceneKey);
    },
    onError: () => addToast('删除提示词失败，请稍后重试', 'error')
  });

  const promptPage = promptListQuery.data?.data;
  const promptList = useMemo(() => promptPage?.content || [], [promptPage?.content]);
  const hitLogPage = hitLogQuery.data?.data;
  const hitLogs = useMemo(() => hitLogPage?.content || [], [hitLogPage?.content]);

  const metrics = useMemo(() => {
    const enabledCount = promptList.filter((prompt) => prompt.status === 'ENABLED').length;
    const hitCount = hitLogPage?.total ?? 0;

    return {
      totalCount: String(promptPage?.total ?? 0),
      enabledCount: String(enabledCount),
      coveredScenes: computeCoveredScenes(promptList),
      hitCount: String(hitCount),
    };
  }, [hitLogPage?.total, promptList, promptPage?.total]);

  const handleRefreshAll = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({queryKey: baseQueryKey}),
      queryClient.invalidateQueries({queryKey: baseHitLogKey}),
    ]);
    await runPreview(previewSceneKey);
  }, [baseHitLogKey, baseQueryKey, previewSceneKey, queryClient, runPreview]);

  const handleOpenCreate = () => {
    setEditingPrompt(null);
    setFormState(DEFAULT_FORM_STATE);
    setEditorOpen(true);
  };

  const handleOpenEdit = (prompt: LlmPromptConfig) => {
    setEditingPrompt(prompt);
    setFormState(toSaveRequest(prompt));
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditingPrompt(null);
    setFormState(DEFAULT_FORM_STATE);
  };

  const handleToggleScene = (sceneKey: string) => {
    setFormState((currentState) => {
      const sceneKeys = currentState.sceneKeys.includes(sceneKey)
        ? currentState.sceneKeys.filter((item) => item !== sceneKey)
        : [...currentState.sceneKeys, sceneKey];

      return {
        ...currentState,
        sceneKeys,
      };
    });
  };

  const handleSubmit = () => {
    if (!formState.promptName.trim()) {
      addToast('请先填写提示词名称', 'warning');
      return;
    }

    if (!formState.promptContent.trim()) {
      addToast('请先填写提示词正文', 'warning');
      return;
    }

    if (!formState.allSceneEnabled && formState.sceneKeys.length === 0) {
      addToast('至少选择一个生效场景，或直接开启全场景生效', 'warning');
      return;
    }

    const normalizedForm = {
      ...formState,
      promptName: formState.promptName.trim(),
      promptContent: formState.promptContent.trim(),
      sceneKeys: formState.allSceneEnabled ? [] : formState.sceneKeys,
    };

    setFormState(normalizedForm);
    saveMutation.mutate(normalizedForm);
  };

  const handleDelete = (prompt: LlmPromptConfig) => {
    setDeletingPrompt(prompt);
  };

  const handleConfirmDelete = () => {
    if (!deletingPrompt) {
      return;
    }

    deleteMutation.mutate(deletingPrompt.id, {
      onSettled: () => setDeletingPrompt(null)
    });
  };


  const handleToggleStatus = (prompt: LlmPromptConfig) => {
    setStatusChangingPrompt({
      prompt,
      nextStatus: prompt.status === 'ENABLED' ? 'DISABLED' : 'ENABLED'
    });
  };

  const handleConfirmStatusChange = () => {
    if (!statusChangingPrompt) {
      return;
    }

    quickUpdateMutation.mutate(statusChangingPrompt, {
      onSettled: () => setStatusChangingPrompt(null)
    });
  };

  useEffect(() => {
    if (scope === 'user' || projectId) {
      void runPreview(previewSceneKey);
    }
  }, [previewSceneKey, projectId, runPreview, scope]);

  const pageTitle = title || scopeMeta.title;
  const pageDescription = description || scopeMeta.description;

  return (
    <div className={compact ? 'space-y-5' : 'space-y-6'}>
      <div className={`${PANEL_CLASS} overflow-hidden p-5 sm:p-6`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            {showScopeBadge && (
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                <FiZap size={13} />
                {scopeMeta.badge}
              </div>
            )}
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{pageTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">{pageDescription}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <SceneChip label="先用户级，再项目级" />
              <SceneChip label="按场景绑定" />
              <SceneChip label="支持预览与审计" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px] xl:max-w-[420px]">
            <MetricCard label="配置数量" value={metrics.totalCount} helper="当前筛选结果中的总记录数" />
            <MetricCard label="启用中" value={metrics.enabledCount} helper="当前页内可参与分析的规则" />
            <MetricCard label="覆盖场景" value={metrics.coveredScenes} helper="根据当前页提示词统计" />
            <MetricCard label="命中日志" value={metrics.hitCount} helper="最近审计记录总数" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(350px,0.9fr)]">
        <div className="space-y-6">
          <div className={`${PANEL_CLASS} p-5 sm:p-6`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  <FiFilter size={13} />
                  提示词列表
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">管理当前层级的分析规则</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">支持名称筛选、启停切换、场景绑定和优先级排序。</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => void handleRefreshAll()}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  <FiRefreshCw className={isPreviewPending || promptListQuery.isFetching || hitLogQuery.isFetching ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                  刷新
                </button>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  <FiPlus className="h-4 w-4" />
                  新建提示词
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
              <label className="block">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">名称筛选</div>
                <input
                  value={draftPromptName}
                  onChange={(event) => setDraftPromptName(event.target.value)}
                  placeholder="搜索提示词名称"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                />
              </label>

              <label className="block">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">状态</div>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'ALL' | LlmPromptStatus)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                >
                  {FILTER_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 space-y-4">
              {promptListQuery.isLoading ? (
                Array.from({length: 3}).map((_, index) => (
                  <div key={`prompt-skeleton-${index}`} className="animate-pulse rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="h-4 w-40 rounded bg-slate-200 dark:bg-white/10" />
                    <div className="mt-3 h-3 w-full rounded bg-slate-200 dark:bg-white/10" />
                    <div className="mt-2 h-3 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
                  </div>
                ))
              ) : promptList.length > 0 ? (
                promptList.map((prompt) => {
                  const statusMeta = STATUS_META[prompt.status];
                  return (
                    <div key={prompt.id} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-semibold text-slate-900 dark:text-white">{prompt.promptName}</h4>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusMeta.className}`}>{statusMeta.label}</span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-white/8 dark:text-slate-300">优先级 {prompt.priority}</span>
                            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">v{prompt.version}</span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{formatPromptExcerpt(prompt.promptContent)}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {prompt.allSceneEnabled ? (
                              <SceneChip label="全部场景" />
                            ) : prompt.sceneKeys.length > 0 ? (
                              prompt.sceneKeys.map((sceneKey) => <SceneChip key={`${prompt.id}-${sceneKey}`} label={sceneKey} />)
                            ) : (
                              <SceneChip label="未绑定场景" />
                            )}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                            <span>作用范围：{scope === 'user' ? '当前用户' : `项目 ${projectId}`}</span>
                            <span>更新时间：{formatDateTime(prompt.updatedAt || prompt.createdAt)}</span>
                            <span>场景摘要：{getSceneSummary(prompt)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(prompt)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                          >
                            <FiEdit3 className="h-4 w-4" />
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(prompt)}
                            disabled={quickUpdateMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                          >
                            <FiCheckCircle className="h-4 w-4" />
                            {prompt.status === 'ENABLED' ? '停用' : '启用'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(prompt)}
                            disabled={deleteMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15"
                          >
                            <FiTrash2 className="h-4 w-4" />
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyPanel
                  title="还没有提示词配置"
                  description={scope === 'user' ? '先创建一条用户级规则，例如“优先指出需求中的边界风险”。' : '先为项目定义统一术语、业务目标或输出偏好。'}
                />
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
              <span>
                第 {pageNumber + 1} / {Math.max(promptPage?.pages || 1, 1)} 页 · 共 {promptPage?.total || 0} 条
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPageNumber((current) => Math.max(current - 1, 0))}
                  disabled={pageNumber <= 0}
                  className="rounded-full border border-slate-200 px-3.5 py-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  上一页
                </button>
                <button
                  type="button"
                  onClick={() => setPageNumber((current) => current + 1)}
                  disabled={Boolean(promptPage && pageNumber >= Math.max(promptPage.pages - 1, 0))}
                  className="rounded-full border border-slate-200 px-3.5 py-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  下一页
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${PANEL_CLASS} p-5 sm:p-6`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                  <FiEye size={13} />
                  生效预览
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">先看本次真正会带进模型的内容</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">这里不是原文简单拼接，而是按场景筛选后的命中结果、上下文和有效提示词画像。</p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <label className="block flex-1">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">分析场景</div>
                <select
                  value={previewSceneKey}
                  onChange={(event) => setPreviewSceneKey(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                >
                  {LLM_PROMPT_SCENE_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => void runPreview(previewSceneKey)}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {isPreviewPending ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiActivity className="h-4 w-4" />}
                重新预览
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {previewResult ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricCard label="命中提示词" value={String(previewResult.hitPromptIds.length)} helper="本场景下参与分析的规则数" />
                    <MetricCard label="分析请求ID" value={previewResult.analysisRequestId.slice(0, 8)} helper="用于关联命中日志与审计" />
                    <MetricCard label="当前场景" value={previewResult.sceneKey} helper="与筛选规则绑定一致" />
                  </div>

                  <div className="grid gap-4">
                    {previewResult.userPrompts.length > 0 && (
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">命中的用户级提示词</div>
                        <div className="mt-3 space-y-3">
                          {previewResult.userPrompts.map((prompt) => (
                            <div key={`user-${prompt.id || prompt.promptName}`} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/50">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{prompt.promptName}</span>
                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">用户级</span>
                              </div>
                              <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">{prompt.normalizedContent || '暂无归一化内容'}</pre>
                              {prompt.filteredLines.length > 0 && (
                                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100/80">
                                  <div className="font-semibold">已过滤内容</div>
                                  <ul className="mt-2 list-disc space-y-1 pl-5">
                                    {prompt.filteredLines.map((line, index) => <li key={`user-filter-${index}`}>{line}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {previewResult.projectPrompts.length > 0 && (
                      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">命中的项目级提示词</div>
                        <div className="mt-3 space-y-3">
                          {previewResult.projectPrompts.map((prompt) => (
                            <div key={`project-${prompt.id || prompt.promptName}`} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/50">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{prompt.promptName}</span>
                                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">项目级</span>
                              </div>
                              <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">{prompt.normalizedContent || '暂无归一化内容'}</pre>
                              {prompt.filteredLines.length > 0 && (
                                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100/80">
                                  <div className="font-semibold">已过滤内容</div>
                                  <ul className="mt-2 list-disc space-y-1 pl-5">
                                    {prompt.filteredLines.map((line, index) => <li key={`project-filter-${index}`}>{line}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <PreviewTextBlock title="用户提示词上下文" content={previewResult.userPromptContext} accent="blue" />
                    <PreviewTextBlock title="项目提示词上下文" content={previewResult.projectPromptContext} accent="violet" />
                    <PreviewTextBlock title="有效提示词画像" content={previewResult.effectivePromptProfile} accent="emerald" />
                    <PreviewTextBlock title="最终提示词预览" content={previewResult.finalPromptPreview} accent="blue" />
                  </div>
                </>
              ) : (
                <EmptyPanel title="暂无预览结果" description="选择一个分析场景后点击重新预览，即可查看本次真正生效的提示词上下文。" />
              )}
            </div>
          </div>

          <div className={`${PANEL_CLASS} p-5 sm:p-6`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <FiClock size={13} />
                  命中日志
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">最近的提示词审计记录</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">便于回看为什么同样输入会得到不同结果。</p>
              </div>

              <label className="block min-w-[180px]">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">筛选场景</div>
                <select
                  value={logSceneKey}
                  onChange={(event) => setLogSceneKey(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                >
                  <option value="ALL">全部场景</option>
                  {LLM_PROMPT_SCENE_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 space-y-3">
              {hitLogQuery.isLoading ? (
                Array.from({length: 3}).map((_, index) => (
                  <div key={`log-skeleton-${index}`} className="animate-pulse rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="h-4 w-44 rounded bg-slate-200 dark:bg-white/10" />
                    <div className="mt-3 h-3 w-full rounded bg-slate-200 dark:bg-white/10" />
                  </div>
                ))
              ) : hitLogs.length > 0 ? (
                hitLogs.map((hitLog: LlmPromptHitLog) => (
                  <div key={hitLog.id} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{hitLog.sceneKey}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 dark:bg-white/8 dark:text-slate-300">
                            命中 {hitLog.hitPromptIds.length} 条
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">请求 ID：{hitLog.analysisRequestId}</div>
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{formatDateTime(hitLog.createdAt)}</div>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {hitLog.finalPromptPreview?.trim() || '该条日志未保留最终提示词预览。'}
                    </p>
                  </div>
                ))
              ) : (
                <EmptyPanel title="暂无命中日志" description="当分析请求实际命中用户级或项目级提示词后，这里会出现对应审计记录。" />
              )}
            </div>
          </div>
        </div>
      </div>

      <PromptEditorModal
        open={editorOpen}
        formState={formState}
        editingPrompt={editingPrompt}
        submitting={saveMutation.isPending}
        onClose={handleCloseEditor}
        onChange={(patch) => setFormState((currentState) => ({...currentState, ...patch}))}
        onToggleScene={handleToggleScene}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingPrompt)}
        title="删除提示词"
        message={deletingPrompt ? `确认删除提示词“${deletingPrompt.promptName}”吗？删除后不可恢复。` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingPrompt(null)}
        confirmText={deleteMutation.isPending ? '删除中...' : '确认删除'}
        confirmClassName="bg-red-500 hover:bg-red-600 text-white"
        cancelText="取消"
        cancelClassName="bg-gray-100 hover:bg-gray-200 text-gray-700"
      />


      <ConfirmDialog
        isOpen={Boolean(statusChangingPrompt)}
        title={statusChangingPrompt?.nextStatus === 'ENABLED' ? '启用提示词' : '停用提示词'}
        message={statusChangingPrompt ? `确认${statusChangingPrompt.nextStatus === 'ENABLED' ? '启用' : '停用'}提示词“${statusChangingPrompt.prompt.promptName}”吗？` : ''}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setStatusChangingPrompt(null)}
        confirmText={quickUpdateMutation.isPending ? '处理中...' : (statusChangingPrompt?.nextStatus === 'ENABLED' ? '确认启用' : '确认停用')}
        confirmClassName={statusChangingPrompt?.nextStatus === 'ENABLED' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-amber-500 hover:bg-amber-600 text-white'}
        cancelText="取消"
        cancelClassName="bg-gray-100 hover:bg-gray-200 text-gray-700"
      />
    </div>
  );
};

export default LlmPromptCenter;
