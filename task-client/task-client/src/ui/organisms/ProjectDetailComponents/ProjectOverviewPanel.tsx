import React, {useMemo, useState} from 'react';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {motion} from 'framer-motion';
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiDownload,
  FiPlus,
  FiSettings,
  FiSliders,
  FiUsers
} from 'react-icons/fi';
import {ProjectMember, ProjectTask} from '@/types/api-types';
import AddMemberModal from './AddMemberModal';
import {TaskStatusTrend} from '@/types/task-status-trend';
import {useTheme} from '@/ui/theme';
import ProjectExportModal from '@/ui/organisms/ProjectExportModal';
import {ExportData} from '@/types/export-types';
import ProjectSettingsModal from './ProjectSettingsModal';
import ProjectRecentTasksSection from './ProjectRecentTasksSection';
import TaskTrend from '@/ui/organisms/TaskTrend';
import llmPromptApi from '@/adapters/api/llm-prompt-api';
import PromptCenterModal from '@/ui/organisms/LlmPromptCenter/PromptCenterModal';

interface ProjectOverviewPanelProps {
  project: {
    id: string;
    name: string;
    description?: string;
    visibility?: 'PUBLIC' | 'PRIVATE';
    tasks?: ProjectTask[];
    members?: ProjectMember[];
    progress?: number;
    taskCount?: number;
    completedTaskCount?: number;
    memberCount?: number;
    teamName?: string;
    taskStatusTrend?: TaskStatusTrend;
    createdAt?: string;
    updatedAt?: string;
  };
  recentTasks?: ProjectTask[];
  onSwitchToTasksTab?: () => void;
  onSwitchToTeamTab?: () => void;
  onCreateTask?: () => void;
  onTaskClick?: (taskId: string) => void;
}

const cardMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 }
};

const formatRelativeDate = (value?: string) => {
  if (!value) {
    return '暂无时间';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '暂无时间';
  }

  const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diff <= 0) {
    return '今天';
  }
  if (diff === 1) {
    return '昨天';
  }
  if (diff < 7) {
    return `${diff} 天前`;
  }

  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  });
};

const ProjectOverviewPanel: React.FC<ProjectOverviewPanelProps> = ({
  project,
  recentTasks = [],
  onSwitchToTasksTab,
  onCreateTask,
  onTaskClick
}) => {
  const { isDark } = useTheme();
  const isDarkMode = isDark;
  const queryClient = useQueryClient();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProjectSettingsModal, setShowProjectSettingsModal] = useState(false);
  const [showPromptCenterModal, setShowPromptCenterModal] = useState(false);

  const {data: projectPromptSummaryResponse} = useQuery({
    queryKey: ['llm-prompt-list', 'project', project.id, {pageNumber: 0, pageSize: 50}],
    queryFn: async () => llmPromptApi.getProjectPrompts(project.id, {pageNumber: 0, pageSize: 50}),
    enabled: Boolean(project.id),
    staleTime: 30_000,
  });

  const tasks = useMemo(() => (Array.isArray(project.tasks) ? project.tasks : []), [project.tasks]);
  const members = useMemo(() => (Array.isArray(project.members) ? project.members : []), [project.members]);
  const taskCount = typeof project.taskCount === 'number' ? project.taskCount : tasks.length;
  const completedTaskCount = typeof project.completedTaskCount === 'number'
    ? project.completedTaskCount
    : tasks.filter((task) => task.status === 'COMPLETED').length;
  const memberCount = typeof project.memberCount === 'number' ? project.memberCount : members.length;
  const progress = typeof project.progress === 'number'
    ? Math.max(0, Math.min(project.progress, 100))
    : (taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0);

  const overdueCount = useMemo(() => {
    const now = Date.now();
    return tasks.filter((task) => {
      if (task.status === 'COMPLETED') {
        return false;
      }
      if (task.status === 'OVERDUE') {
        return true;
      }
      if (!task.dueDate) {
        return false;
      }
      return new Date(task.dueDate).getTime() < now;
    }).length;
  }, [tasks]);

  const inProgressCount = useMemo(() => {
    return tasks.filter((task) => task.status === 'IN_PROGRESS').length;
  }, [tasks]);

  const pendingCount = Math.max(taskCount - completedTaskCount - inProgressCount, 0);

  const prepareExportData = (): ExportData => ({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      progress,
      taskCount,
      completedTaskCount,
      memberCount,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    },
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title || '无标题任务',
      description: task.description,
      status: task.status || 'WAITING',
      priority: task.priority || 'MEDIUM',
      assignee: task.assignee,
      createdAt: task.createdAt,
      dueDate: task.dueDate,
      completedAt: task.completedAt || undefined,
      statusColor: task.statusColor,
      priorityColor: task.priorityColor
    })),
    members: members.map((member) => ({
      id: member.id || '',
      name: member.name || '未命名成员',
      role: member.role || 'MEMBER',
      email: member.email,
      avatar: member.avatar
    })),
    statistics: {
      totalTasks: taskCount,
      completedTasks: completedTaskCount,
      inProgressTasks: inProgressCount,
      pendingTasks: pendingCount,
      overdueTasks: overdueCount,
      completionRate: progress
    }
  });

  const workspaceStats = [
    {
      label: '总任务数',
      value: `${taskCount}`,
      hint: completedTaskCount > 0 ? `已完成 ${completedTaskCount} 个` : '等待开始拆分任务'
    },
    {
      label: '当前进行任务',
      value: `${inProgressCount}`,
      hint: pendingCount > 0 ? `还有 ${pendingCount} 个待处理` : '当前节奏稳定'
    },
    {
      label: '团队成员',
      value: `${memberCount}`,
      hint: memberCount > 0 ? `人均 ${Math.max(1, Math.round(taskCount / memberCount))} 个任务` : '等待添加成员'
    }
  ];

  const projectPromptSummary = useMemo(() => {
    const projectPromptList = projectPromptSummaryResponse?.data?.content || [];
    const enabledCount = projectPromptList.filter((prompt) => prompt.status === 'ENABLED').length;
    const sceneSet = new Set<string>();
    const hasAllScenes = projectPromptList.some((prompt) => prompt.allSceneEnabled);

    projectPromptList.forEach((prompt) => {
      prompt.sceneKeys.forEach((sceneKey) => sceneSet.add(sceneKey));
    });

    return {
      total: projectPromptSummaryResponse?.data?.total || 0,
      enabled: enabledCount,
      scenes: hasAllScenes ? '全部' : `${sceneSet.size}`,
    };
  }, [projectPromptSummaryResponse?.data?.content, projectPromptSummaryResponse?.data?.total]);

  const actionItems = [
    {
      title: '创建任务',
      description: '补充项目的下一步工作项',
      icon: <FiPlus size={18} />,
      onClick: () => onCreateTask?.(),
      tone: isDarkMode ? 'bg-blue-500/12 text-blue-300' : 'bg-blue-50 text-blue-600'
    },
    {
      title: '添加成员',
      description: '邀请协作者加入当前项目',
      icon: <FiUsers size={18} />,
      onClick: () => setShowAddMemberModal(true),
      tone: isDarkMode ? 'bg-violet-500/12 text-violet-300' : 'bg-violet-50 text-violet-600'
    },
    {
      title: '导出报告',
      description: '下载当前项目的进展摘要',
      icon: <FiDownload size={18} />,
      onClick: () => setShowExportModal(true),
      tone: isDarkMode ? 'bg-emerald-500/12 text-emerald-300' : 'bg-emerald-50 text-emerald-600'
    },
    {
      title: '项目设置',
      description: '调整项目信息和协作偏好',
      icon: <FiSettings size={18} />,
      onClick: () => setShowProjectSettingsModal(true),
      tone: isDarkMode ? 'bg-amber-500/12 text-amber-300' : 'bg-amber-50 text-amber-600'
    },
    {
      title: '分析偏好',
      description: `已配置 ${projectPromptSummary.total} 条 · 启用 ${projectPromptSummary.enabled} 条 · 覆盖 ${projectPromptSummary.scenes} 个场景`,
      icon: <FiSliders size={18} />,
      onClick: () => setShowPromptCenterModal(true),
      tone: isDarkMode ? 'bg-indigo-500/12 text-indigo-300' : 'bg-indigo-50 text-indigo-600',
      featured: true,
      fullWidth: true
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        {...cardMotion}
        transition={{ duration: 0.25 }}
        className={`overflow-hidden rounded-[28px] border p-5 sm:p-6 ${
          isDarkMode
            ? 'border-white/10 bg-slate-900/80'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr),minmax(420px,0.85fr)] xl:items-stretch">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isDarkMode ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                  <FiBarChart2 size={14} />
                  项目工作台
                </div>
                <h3 className={`mt-3 text-xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  项目工作台
                </h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  集中查看项目状态，并快速执行常用操作。
                </p>
              </div>

              <button
                onClick={onSwitchToTasksTab}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'bg-white/6 text-slate-200 hover:bg-white/10'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                查看任务
                <FiArrowRight size={14} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${isDarkMode ? 'bg-white/6 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                进行中 {inProgressCount}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${isDarkMode ? 'bg-white/6 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                待处理 {pendingCount}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${overdueCount > 0 ? 'bg-red-500/10 text-red-500' : isDarkMode ? 'bg-white/6 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                已逾期 {overdueCount}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${isDarkMode ? 'bg-white/6 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                最近更新 {formatRelativeDate(project.updatedAt)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {workspaceStats.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-2xl border p-4 ${
                    isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/80'
                  }`}
                >
                  <div className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.label}
                  </div>
                  <div className={`mt-2 text-3xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {item.value}
                  </div>
                  <div className={`mt-1 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {item.hint}
                  </div>
                </div>
              ))}
            </div>

            <div className={`rounded-2xl border p-4 ${isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/80'}`}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    整体完成度
                  </div>
                  <div className={`mt-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    已完成 {completedTaskCount} / {taskCount} 个任务
                  </div>
                </div>
                <div className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{progress}%</div>
              </div>
              <div className={`mt-3 h-2 overflow-hidden rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid h-full auto-rows-fr gap-3 sm:grid-cols-2">
            {actionItems.map((item) => (
              <button
                key={item.title}
                onClick={item.onClick}
                className={[
                  'group relative flex h-full min-h-[108px] items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                  item.fullWidth ? 'sm:col-span-2' : '',
                  item.featured
                    ? isDarkMode
                      ? 'border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-slate-900 to-slate-900 hover:border-indigo-400/40'
                      : 'border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-sky-50 hover:border-indigo-300 hover:bg-white hover:shadow-[0_18px_40px_rgba(79,70,229,0.12)]'
                    : isDarkMode
                      ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                ].join(' ')}
              >
                {item.featured && (
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_35%)] opacity-70" />
                )}
                <div className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tone}`}>
                  {item.icon}
                </div>
                <div className="relative min-w-0 flex-1">
                  <div className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</div>
                  <div className={`mt-1 text-sm leading-6 ${item.featured ? (isDarkMode ? 'text-slate-300' : 'text-slate-600') : (isDarkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                    {item.description}
                  </div>
                  {item.featured && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isDarkMode ? 'bg-white/10 text-slate-200' : 'bg-white text-indigo-700 shadow-sm'}`}>
                        项目级
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isDarkMode ? 'bg-white/10 text-slate-200' : 'bg-white text-indigo-700 shadow-sm'}`}>
                        支持预览
                      </span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        {...cardMotion}
        transition={{ duration: 0.28, delay: 0.08 }}
      >
        <ProjectRecentTasksSection
          recentTasks={recentTasks}
          totalTasks={taskCount}
          isDarkMode={isDarkMode}
          onTaskClick={(task) => {
            if (task.id) {
              onTaskClick?.(task.id);
            }
          }}
        />
      </motion.div>

      <motion.div
        {...cardMotion}
        transition={{ duration: 0.3, delay: 0.12 }}
        className={`overflow-hidden rounded-[28px] border ${
          isDarkMode
            ? 'border-white/10 bg-slate-900/80'
            : 'border-slate-200 bg-white'
        }`}
      >
        <div className={`border-b px-5 py-4 ${isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200/80 bg-slate-50/80'}`}>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isDarkMode ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
            <FiActivity size={13} />
            任务趋势
          </div>
          <h3 className={`mt-3 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>任务趋势</h3>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            查看任务状态变化趋势，了解当前项目整体进展。
          </p>
        </div>
        <div className="p-5">
          <TaskTrend
            tasks={tasks}
            projectId={project.id}
            taskStatusTrend={project.taskStatusTrend}
            hideTitle
          />
        </div>
      </motion.div>

      {showAddMemberModal && (
        <AddMemberModal
          isOpen={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          onMemberAdded={() => {
            setShowAddMemberModal(false);
            void queryClient.invalidateQueries({ queryKey: ['project', project.id] });
          }}
          projectId={project.id}
        />
      )}

      {showExportModal && (
        <ProjectExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          projectData={prepareExportData()}
        />
      )}

      {showProjectSettingsModal && (
        <ProjectSettingsModal
          isOpen={showProjectSettingsModal}
          onClose={() => setShowProjectSettingsModal(false)}
          project={{
            id: project.id,
            name: project.name,
            description: project.description,
            visibility: project.visibility
          }}
          onProjectUpdate={() => {
            void queryClient.invalidateQueries({ queryKey: ['project', project.id] });
          }}
        />
      )}

      <PromptCenterModal
        isOpen={showPromptCenterModal}
        onClose={() => setShowPromptCenterModal(false)}
        scope="project"
        projectId={project.id}
        title={`项目分析提示词 · ${project.name}`}
        description="适合项目管理员维护统一术语、背景约束与输出风格。"
      />
    </div>
  );
};

export default ProjectOverviewPanel;
