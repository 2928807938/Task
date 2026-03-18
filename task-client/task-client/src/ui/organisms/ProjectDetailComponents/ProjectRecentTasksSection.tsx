import React from 'react';
import {FiArrowRight, FiClock} from 'react-icons/fi';
import {ProjectTask} from '@/types/api-types';

interface ProjectRecentTasksSectionProps {
  recentTasks: ProjectTask[];
  totalTasks?: number;
  isDarkMode: boolean;
  onTaskClick?: (task: ProjectTask) => void;
}

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

const ProjectRecentTasksSection: React.FC<ProjectRecentTasksSectionProps> = ({
  recentTasks,
  totalTasks,
  isDarkMode,
  onTaskClick
}) => {
  return (
    <div className={`rounded-[28px] border p-5 sm:p-6 ${isDarkMode ? 'border-white/10 bg-slate-900/80' : 'border-slate-200 bg-white'}`}>
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
              全部 {totalTasks ?? recentTasks.length} 条
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
  );
};

export default ProjectRecentTasksSection;
