import React, {useMemo, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {motion} from 'framer-motion';
import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiPlus,
  FiSettings,
  FiTrendingUp,
  FiUsers
} from 'react-icons/fi';
import {ProjectMember, ProjectTask} from '@/types/api-types';
import TaskTrend from '@/ui/organisms/TaskTrend';
import AddMemberModal from './AddMemberModal';
import Card from '@/ui/molecules/Card';
import {Avatar} from '@/ui/atoms/Avatar';
import {TaskStatusTrend} from '@/types/task-status-trend';
import {useTheme} from '@/ui/theme';
import ProjectExportModal from '@/ui/organisms/ProjectExportModal';
import {ExportData} from '@/types/export-types';
import ProjectSettingsModal from './ProjectSettingsModal';

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
  onSwitchToTasksTab?: () => void;
  onSwitchToTeamTab?: () => void;
  onCreateTask?: () => void;
  onTaskClick?: (taskId: string) => void;
}

const cardMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 }
};

const getRoleLabel = (role?: string) => {
  switch ((role || '').toUpperCase()) {
    case 'OWNER':
      return '项目负责人';
    case 'ADMIN':
      return '管理员';
    case 'MEMBER':
      return '成员';
    default:
      return role || '成员';
  }
};

const getStatusLabel = (status?: string) => {
  switch ((status || '').toUpperCase()) {
    case 'WAITING':
      return '待处理';
    case 'IN_PROGRESS':
      return '进行中';
    case 'BLOCKED':
      return '已阻塞';
    case 'COMPLETED':
      return '已完成';
    case 'CANCELLED':
      return '已取消';
    case 'OVERDUE':
      return '已逾期';
    default:
      return status || '待处理';
  }
};

const getPriorityLabel = (priority?: string) => {
  switch ((priority || '').toUpperCase()) {
    case 'HIGH':
      return '高优先级';
    case 'LOW':
      return '低优先级';
    case 'MEDIUM':
    default:
      return '中优先级';
  }
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
  onSwitchToTasksTab,
  onSwitchToTeamTab,
  onCreateTask,
  onTaskClick
}) => {
  const { isDark } = useTheme();
  const isDarkMode = isDark;
  const queryClient = useQueryClient();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProjectSettingsModal, setShowProjectSettingsModal] = useState(false);

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

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((left, right) => {
        const leftValue = new Date(left.dueDate || left.createdAt || 0).getTime();
        const rightValue = new Date(right.dueDate || right.createdAt || 0).getTime();
        return rightValue - leftValue;
      })
      .slice(0, 5);
  }, [tasks]);

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
                  统计和操作合并到一个区域里
                </h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  减少重复信息，先看关键状态，再直接执行下一步操作。
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
                className={`group flex h-full min-h-[108px] items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                  isDarkMode
                    ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05]'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.tone}`}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</div>
                  <div className={`mt-1 line-clamp-2 text-sm leading-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <Card
        title="任务趋势"
        delay={0.15}
        icon={<FiTrendingUp size={18} />}
        className={isDarkMode ? 'bg-slate-900/80' : 'bg-white'}
      >
        <TaskTrend
          tasks={tasks}
          projectId={project.id}
          taskStatusTrend={project.taskStatusTrend}
        />
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
        <Card
          title="最近任务"
          delay={0.2}
          actionText={taskCount > 0 ? '查看全部' : undefined}
          onAction={taskCount > 0 ? onSwitchToTasksTab : undefined}
          icon={<FiCheckCircle size={18} />}
          className={isDarkMode ? 'bg-slate-900/80' : 'bg-white'}
          headerExtra={
            taskCount > 0 ? (
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isDarkMode ? 'bg-white/6 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                共 {taskCount} 个任务
              </span>
            ) : null
          }
        >
          {recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map((task, index) => {
                const dueTime = task.dueDate ? new Date(task.dueDate).getTime() : null;
                const isOverdue = task.status !== 'COMPLETED' && !!dueTime && dueTime < Date.now();
                const statusColor = task.statusColor || (isOverdue ? '#EF4444' : '#3B82F6');
                const priorityColor = task.priorityColor || '#F59E0B';

                return (
                  <button
                    key={task.id || `${task.title}-${index}`}
                    onClick={() => task.id && onTaskClick?.(task.id)}
                    className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                      isDarkMode
                        ? 'border-white/8 bg-white/[0.03] hover:bg-white/[0.05]'
                        : 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="mt-0.5 h-10 w-1 shrink-0 rounded-full" style={{ backgroundColor: priorityColor }} />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`line-clamp-1 text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {task.title || '无标题任务'}
                        </h3>
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor: `${statusColor}1A`,
                            color: statusColor
                          }}
                        >
                          {getStatusLabel(task.status)}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            backgroundColor: `${priorityColor}1A`,
                            color: priorityColor
                          }}
                        >
                          {getPriorityLabel(task.priority)}
                        </span>
                      </div>

                      <p className={`mt-1 line-clamp-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {task.description?.trim() || '还没有补充任务描述。'}
                      </p>

                      <div className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="inline-flex items-center gap-1.5">
                          <FiUsers size={13} />
                          {task.assignee || '暂未分配负责人'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <FiClock size={13} />
                          {task.dueDate ? `截止 ${formatRelativeDate(task.dueDate)}` : `创建于 ${formatRelativeDate(task.createdAt)}`}
                        </span>
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 font-medium text-red-500">
                            需要优先处理
                          </span>
                        )}
                      </div>
                    </div>

                    <FiArrowRight className={`mt-1 shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} transition-transform group-hover:translate-x-0.5`} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/70'}`}>
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${isDarkMode ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                <FiCheckCircle size={24} />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>还没有任务</h3>
              <p className={`mt-2 max-w-md text-sm leading-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                从第一条任务开始，把目标拆成可执行步骤。新建任务后，这里会自动展示最新的工作进展。
              </p>
              <button
                onClick={() => onCreateTask?.()}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <FiPlus size={15} />
                创建第一条任务
              </button>
            </div>
          )}
        </Card>

        <Card
          title="团队成员"
          delay={0.25}
          actionText={memberCount > 0 ? '管理团队' : undefined}
          onAction={memberCount > 0 ? onSwitchToTeamTab : undefined}
          icon={<FiUsers size={18} />}
          className={isDarkMode ? 'bg-slate-900/80' : 'bg-white'}
          headerExtra={
            memberCount > 0 ? (
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isDarkMode ? 'bg-white/6 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                {memberCount} 位成员
              </span>
            ) : null
          }
        >
          {members.length > 0 ? (
            <div className="space-y-3">
              {members.slice(0, 6).map((member, index) => (
                <div
                  key={member.id || `${member.name}-${index}`}
                  className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${
                    isDarkMode ? 'border-white/8 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/80'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      src={member.avatar}
                      name={member.name || '成员'}
                      className="h-10 w-10 rounded-full border border-white/60 shadow-sm"
                    />
                    <div className="min-w-0">
                      <div className={`truncate text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {member.name || '未命名成员'}
                      </div>
                      <div className={`truncate text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {member.email || '未提供邮箱'}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {getRoleLabel(member.role)}
                    </div>
                    <div className={`mt-1 text-[11px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {member.taskCount ? `负责 ${member.taskCount} 个任务` : '待分配任务'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-12 text-center ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/70'}`}>
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${isDarkMode ? 'bg-violet-500/10 text-violet-300' : 'bg-violet-50 text-violet-600'}`}>
                <FiUsers size={24} />
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>团队协作还没开始</h3>
              <p className={`mt-2 max-w-md text-sm leading-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                邀请成员加入项目后，可以更快地分配任务、同步状态和明确负责人。
              </p>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
              >
                <FiPlus size={15} />
                添加团队成员
              </button>
            </div>
          )}
        </Card>
      </div>

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
    </div>
  );
};

export default ProjectOverviewPanel;
