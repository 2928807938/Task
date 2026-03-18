import React from 'react';
import {motion} from 'framer-motion';
import {FiAlertCircle, FiArrowRight, FiClock} from 'react-icons/fi';
import {TaskTableView} from '@/ui/organisms/TaskTableView';
import {ProjectTask} from '@/types/api-types';
import {useTaskDistributionHook} from '@/hooks/use-task-distribution-hook';
import {useTheme} from '@/ui/theme';

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

interface ProjectTasksPanelProps {
  tasks: ProjectTask[];
  onAddTask: () => void;
  onTaskClick?: (task: ProjectTask) => void; // 添加任务点击处理函数
  isLoading?: boolean;
  error?: Error | null;
  pagination?: PaginationProps;
  projectId?: string; // 添加项目ID以便获取任务分布数据
  /** 项目整体进度（百分比） */
  projectProgress?: number;
  /** 项目任务总数 - 来自项目详情接口 */
  projectTaskCount?: number;
  /** 项目已完成任务数 - 来自项目详情接口 */
  projectCompletedTaskCount?: number;
  /** 概览中的最近任务，迁移到任务模块展示 */
  recentTasks?: ProjectTask[];
  /** 当前视图类型（列表、看板、日历、甘特图） */
  currentView?: 'list' | 'board' | 'calendar' | 'gantt';
  /** 视图类型切换回调 */
  onViewChange?: (view: 'list' | 'board' | 'calendar' | 'gantt') => void;
  /** 任务更新后的回调函数 */
  onTaskUpdate?: () => void;
}

const ProjectTasksPanel: React.FC<ProjectTasksPanelProps> = ({
  tasks,
  onAddTask,
  onTaskClick,
  isLoading = false,
  error = null,
  pagination,
  projectId,
  projectProgress,
  projectTaskCount,
  projectCompletedTaskCount,
  recentTasks = [],
  currentView = 'list',
  onViewChange,
  onTaskUpdate
}) => {
  const { isDark } = useTheme();
  const isDarkMode = isDark;
  
  // 获取任务分布数据
  const { data: taskDistribution, isLoading: isDistributionLoading } = useTaskDistributionHook(projectId);

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

  const formatDate = (value?: string) => {
    if (!value) {
      return '暂无日期';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '暂无日期';
    }

    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="relative">
      <div className={`pointer-events-none absolute inset-x-10 top-0 h-24 rounded-full blur-3xl ${isDarkMode ? 'bg-blue-500/10' : 'bg-blue-200/60'}`} />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative overflow-hidden rounded-[32px] border shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)] ${isDarkMode ? 'border-white/10 bg-slate-900/85' : 'border-slate-200/80 bg-white/95'}`}
      >
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-px ${isDarkMode ? 'bg-white/15' : 'bg-white/90'}`} />
        {/* 错误提示 */}
        {error && (
          <div className={`p-4 border-b flex items-center ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-800/30 text-red-400' 
              : 'bg-red-50 border-red-100 text-red-600'
          }`}>
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            <span>{error.message || '获取任务列表失败，请稍后重试'}</span>
          </div>
        )}


        {/* 任务表格区域（包含内置分页功能） */}
        <div className="overflow-hidden">
          <div className={`border-b px-5 py-5 ${isDarkMode ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200/80 bg-slate-50/80'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isDarkMode ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                  <FiClock size={13} />
                  最近任务
                </div>
                <h3 className={`mt-3 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>把最近推进中的任务先放在上面</h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  先看近期动作，再看完整任务清单，阅读路径会更顺。
                </p>
              </div>

              {recentTasks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${isDarkMode ? 'bg-white/6 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    最近 {recentTasks.length} 条
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${isDarkMode ? 'bg-white/6 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'}`}>
                    全部 {projectTaskCount ?? tasks.length} 条
                  </span>
                </div>
              )}
            </div>

            {recentTasks.length > 0 ? (
              <div className="mt-5 grid gap-3 lg:grid-cols-3">
                {recentTasks.slice(0, 3).map((task, index) => {
                  const dueTime = task.dueDate ? new Date(task.dueDate).getTime() : null;
                  const isOverdue = task.status !== 'COMPLETED' && !!dueTime && dueTime < Date.now();
                  const statusColor = task.statusColor || (isOverdue ? '#EF4444' : '#3B82F6');
                  const priorityColor = task.priorityColor || '#F59E0B';

                  return (
                    <button
                      key={task.id || `${task.title}-${index}`}
                      onClick={() => onTaskClick && onTaskClick(task)}
                      className={`group rounded-[24px] border p-4 text-left transition-all ${
                        isDarkMode
                          ? 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: priorityColor }} />
                            <span
                              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                              style={{ backgroundColor: `${statusColor}1A`, color: statusColor }}
                            >
                              {getStatusLabel(task.status)}
                            </span>
                          </div>
                          <h4 className={`mt-3 line-clamp-2 text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {task.title || '无标题任务'}
                          </h4>
                          <p className={`mt-2 line-clamp-2 text-xs leading-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {task.description || '暂无补充描述'}
                          </p>
                        </div>
                        <FiArrowRight className={`${isDarkMode ? 'text-slate-500' : 'text-slate-400'} transition-transform group-hover:translate-x-0.5`} size={16} />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-2 py-1 text-[11px] font-medium"
                          style={{ backgroundColor: `${priorityColor}15`, color: priorityColor }}
                        >
                          {getPriorityLabel(task.priority)}
                        </span>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${isDarkMode ? 'bg-white/6 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          截止 {formatDate(task.dueDate || task.createdAt)}
                        </span>
                        {task.assignee && (
                          <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${isDarkMode ? 'bg-white/6 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                            {task.assignee}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={`mt-5 rounded-[24px] border border-dashed px-5 py-8 text-center ${isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white/80'}`}>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>最近任务会显示在这里</p>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>创建或同步任务后，这里会优先展示最近推进的工作项。</p>
              </div>
            )}
          </div>

          {/* 传递分页参数给TableView内置的分页组件 */}
          <TaskTableView
            tasks={tasks}
            onTaskClick={onTaskClick || ((task) => console.log('点击任务:', task.title))}
            onAddTask={onAddTask}
            isLoading={isLoading || isDistributionLoading}
            currentPage={pagination?.current || 1}
            totalPages={pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1} /* 使用真实的页数 */
            totalItems={pagination?.total || tasks.length}
            pageSize={pagination?.pageSize || 10}
            onPageChange={pagination?.onChange}
            onPageSizeChange={pagination?.onPageSizeChange}
            taskDistribution={taskDistribution}
            projectId={projectId} // 传递项目ID到TaskTableView组件
            projectProgress={projectProgress} // 传递项目整体进度
            projectTaskCount={projectTaskCount} // 传递项目任务总数
            projectCompletedTaskCount={projectCompletedTaskCount} // 传递项目已完成任务数
            currentView={currentView} // 传递当前视图类型
            onViewChange={onViewChange} // 传递视图切换回调
            onTaskUpdate={onTaskUpdate} // 传递任务更新回调
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectTasksPanel;
