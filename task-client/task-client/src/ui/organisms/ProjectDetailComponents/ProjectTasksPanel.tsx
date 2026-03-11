import React from 'react';
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
  currentView = 'list',
  onViewChange,
  onTaskUpdate
}) => {
  const { isDark } = useTheme();
  const isDarkMode = isDark;
  
  // 获取任务分布数据
  const { data: taskDistribution, isLoading: isDistributionLoading } = useTaskDistributionHook(projectId);

  return (
    <div className="mt-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden`}
      >
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
