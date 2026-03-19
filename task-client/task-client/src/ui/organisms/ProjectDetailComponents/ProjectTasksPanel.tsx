import React, {useEffect, useMemo, useState} from 'react';
import {motion} from 'framer-motion';
import {FiAlertCircle} from 'react-icons/fi';
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
  onTaskClick?: (task: ProjectTask) => void;
  isLoading?: boolean;
  error?: Error | null;
  pagination?: PaginationProps;
  projectId?: string;
  projectProgress?: number;
  projectTaskCount?: number;
  projectCompletedTaskCount?: number;
  currentView?: 'list' | 'board' | 'calendar' | 'gantt';
  onViewChange?: (view: 'list' | 'board' | 'calendar' | 'gantt') => void;
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
  currentView = 'list',
  onViewChange,
  onTaskUpdate
}) => {
  const { isDark } = useTheme();
  const isDarkMode = isDark;
  const { data: taskDistribution, isLoading: isDistributionLoading } = useTaskDistributionHook(projectId);

  const [deletedTaskIds, setDeletedTaskIds] = useState<string[]>([]);
  const [locallyCompletedTaskIds, setLocallyCompletedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    const taskIdSet = new Set(tasks.map(task => task.id));
    setDeletedTaskIds(prev => prev.filter(id => taskIdSet.has(id)));
    setLocallyCompletedTaskIds(prev => prev.filter(id => taskIdSet.has(id)));
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    return tasks
      .filter(task => !deletedTaskIds.includes(task.id))
      .map(task => {
        if (!locallyCompletedTaskIds.includes(task.id) || task.status === 'COMPLETED') {
          return task;
        }

        return {
          ...task,
          status: 'COMPLETED' as const,
          progress: 100,
          completedAt: new Date().toISOString()
        };
      });
  }, [deletedTaskIds, locallyCompletedTaskIds, tasks]);

  const baseCompletedCount = projectCompletedTaskCount ?? tasks.filter(task => task.status === 'COMPLETED').length;
  const localCompletedGain = tasks.filter(
    task => locallyCompletedTaskIds.includes(task.id) && task.status !== 'COMPLETED' && !deletedTaskIds.includes(task.id)
  ).length;
  const localDeletedCompletedCount = tasks.filter(
    task => deletedTaskIds.includes(task.id) && (task.status === 'COMPLETED' || locallyCompletedTaskIds.includes(task.id))
  ).length;
  const adjustedCompletedCount = Math.max(baseCompletedCount + localCompletedGain - localDeletedCompletedCount, 0);
  const adjustedTaskCount = Math.max((projectTaskCount ?? tasks.length) - deletedTaskIds.length, 0);

  const handleLocalComplete = (taskId: string) => {
    setLocallyCompletedTaskIds(prev => prev.includes(taskId) ? prev : [...prev, taskId]);
    onTaskUpdate?.();
  };

  const handleLocalDelete = (taskId: string) => {
    setDeletedTaskIds(prev => prev.includes(taskId) ? prev : [...prev, taskId]);
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

        {error && (
          <div className={`flex items-center border-b p-4 ${
            isDarkMode
              ? 'border-red-800/30 bg-red-900/20 text-red-400'
              : 'border-red-100 bg-red-50 text-red-600'
          }`}>
            <FiAlertCircle className="mr-2 flex-shrink-0" />
            <span>{error.message || '获取任务列表失败，请稍后重试'}</span>
          </div>
        )}

        <div className="overflow-hidden">
          <TaskTableView
            tasks={visibleTasks}
            onTaskClick={onTaskClick || ((task) => console.log('点击任务:', task.title))}
            onAddTask={onAddTask}
            isLoading={isLoading || isDistributionLoading}
            currentPage={pagination?.current || 1}
            totalPages={pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1}
            totalItems={Math.max((pagination?.total || tasks.length) - deletedTaskIds.length, 0)}
            pageSize={pagination?.pageSize || 10}
            onPageChange={pagination?.onChange}
            onPageSizeChange={pagination?.onPageSizeChange}
            taskDistribution={taskDistribution}
            projectId={projectId}
            projectProgress={projectProgress}
            projectTaskCount={adjustedTaskCount}
            projectCompletedTaskCount={adjustedCompletedCount}
            currentView={currentView}
            onViewChange={onViewChange}
            onTaskUpdate={onTaskUpdate}
            onTaskComplete={handleLocalComplete}
            onTaskDelete={handleLocalDelete}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectTasksPanel;
