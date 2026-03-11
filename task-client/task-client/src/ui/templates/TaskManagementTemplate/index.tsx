'use client';

import React, {useCallback, useMemo, useState} from 'react';
import {Task, TaskPriority, TaskStatus} from '@/core/domain/entities/task';
import TaskCardGrid from '../../organisms/TaskCardGrid';
import TaskList from '../../organisms/TaskList';
import TaskBoard from '../../organisms/TaskBoard';
import TaskAnalytics from '../../organisms/TaskAnalytics';
import TaskToolbar from '../../organisms/TaskToolbar';
import ViewSelector from '../../molecules/ViewSelector';
import ViewModeToggle from '../../molecules/ViewModeToggle';
import {FiColumns, FiGrid, FiList, FiPieChart} from 'react-icons/fi';

interface TaskManagementTemplateProps {
  initialTasks?: Task[];
  onAddTask?: () => void;
  onEditTask?: (taskId: string) => void;
}

const TaskManagementTemplate: React.FC<TaskManagementTemplateProps> = ({
  initialTasks = [],
  onAddTask,
  onEditTask,
}) => {
  const [tasks] = useState<Task[]>(initialTasks);
  const [activeView, setActiveView] = useState<'card' | 'list' | 'kanban' | 'analytics'>('card');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at_desc');

  // 处理搜索条件变化
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // 切换筛选器显示状态
  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  // 切换视图
  const handleViewChange = useCallback((view: 'card' | 'list' | 'kanban' | 'analytics') => {
    setActiveView(view);
  }, []);

  // 切换视图模式（网格/列表）
  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  // 处理任务点击
  const handleTaskClick = useCallback((taskId: string) => {
    if (onEditTask) {
      onEditTask(taskId);
    }
  }, [onEditTask]);

  // 获取任务统计信息
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    const inProgress = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
    const waiting = tasks.filter(task => task.status === TaskStatus.WAITING).length;
    const overdue = tasks.filter(task => task.status === TaskStatus.OVERDUE).length;
    const highPriority = tasks.filter(task => task.priority === TaskPriority.HIGH).length;

    return { total, completed, inProgress, waiting, overdue, highPriority };
  }, [tasks]);

  // 准备筛选器所需的计数数据
  const statusCounts = useMemo(() => ({
    all: tasks.length,
    [TaskStatus.COMPLETED]: tasks.filter(task => task.status === TaskStatus.COMPLETED).length,
    [TaskStatus.IN_PROGRESS]: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
    [TaskStatus.WAITING]: tasks.filter(task => task.status === TaskStatus.WAITING).length,
    [TaskStatus.OVERDUE]: tasks.filter(task => task.status === TaskStatus.OVERDUE).length
  }), [tasks]);

  const priorityCounts = useMemo(() => ({
    all: tasks.length,
    [TaskPriority.HIGH]: tasks.filter(task => task.priority === TaskPriority.HIGH).length,
    [TaskPriority.MEDIUM]: tasks.filter(task => task.priority === TaskPriority.MEDIUM).length,
    [TaskPriority.LOW]: tasks.filter(task => task.priority === TaskPriority.LOW).length
  }), [tasks]);

  // 筛选任务 - 使用useMemo优化性能
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 搜索条件匹配
      const matchesSearch = searchTerm === '' ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // 状态筛选
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

      // 优先级筛选
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // 排序任务
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      // 根据排序选项进行排序
      if (sortBy === 'created_at_desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'created_at_asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'due_date_asc') {
        // 没有截止日期的排在后面
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'due_date_desc') {
        // 没有截止日期的排在后面
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (sortBy === 'priority_desc') {
        // 优先级映射：HIGH > MEDIUM > LOW
        const priorityMap: {[key: string]: number} = {
          [TaskPriority.HIGH]: 3,
          [TaskPriority.MEDIUM]: 2,
          [TaskPriority.LOW]: 1
        };
        return priorityMap[b.priority] - priorityMap[a.priority];
      } else if (sortBy === 'priority_asc') {
        const priorityMap: {[key: string]: number} = {
          [TaskPriority.HIGH]: 3,
          [TaskPriority.MEDIUM]: 2,
          [TaskPriority.LOW]: 1
        };
        return priorityMap[a.priority] - priorityMap[b.priority];
      }
      return 0;
    });
  }, [filteredTasks, sortBy]);

  // 清除筛选条件
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSortBy('created_at_desc');
    setShowFilters(false);
  }, []);

  return (
    <div className="w-full mx-auto px-2">
      {/* 页面标题 */}
      <div className="mb-3">
        <h1 className="text-xl font-bold text-gray-800">任务管理</h1>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mb-4">
        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div className="text-gray-500 text-xs">总任务数</div>
          <div className="text-2xl font-semibold text-gray-800">{stats.total}</div>
          <div className="text-xs text-gray-400">共 {stats.total} 个待处理任务</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div className="text-gray-500 text-xs">进行中</div>
          <div className="text-2xl font-semibold text-blue-600">{stats.inProgress}</div>
          <div className="text-xs text-gray-400">占比 {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}%</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div className="text-gray-500 text-xs">已完成</div>
          <div className="text-2xl font-semibold text-green-600">{stats.completed}</div>
          <div className="text-xs text-gray-400">占比 {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200">
          <div className="text-gray-500 text-xs">逾期任务</div>
          <div className="text-2xl font-semibold text-red-600">{stats.overdue}</div>
          <div className="text-xs text-gray-400">占比 {stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0}%</div>
        </div>
      </div>

      {/* 任务工具栏组件 */}
      <TaskToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        onAddTask={onAddTask || (() => {})}
        className="mb-4"
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        sortBy={sortBy}
        onStatusFilterChange={setStatusFilter}
        onPriorityFilterChange={setPriorityFilter}
        onSortChange={setSortBy}
        statusCounts={statusCounts}
        priorityCounts={priorityCounts}
      />

      {/* 主要内容区域 */}
      <div className="w-full bg-white rounded-md shadow-sm border border-gray-200">
        {/* 视图切换器 */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ViewSelector
              activeView={activeView}
              onChange={(viewId) => handleViewChange(viewId as 'card' | 'list' | 'kanban' | 'analytics')}
              options={[
                { id: 'card', icon: <FiGrid />, label: '卡片视图' },
                { id: 'list', icon: <FiList />, label: '列表视图' },
                { id: 'kanban', icon: <FiColumns />, label: '看板视图' },
                { id: 'analytics', icon: <FiPieChart />, label: '统计分析' },
              ]}
            />

            {/* 只在卡片视图下显示样式切换，集成到视图选择器旁边 */}
            {activeView === 'card' && (
              <ViewModeToggle
                activeMode={viewMode}
                onChange={handleViewModeChange}
              />
            )}
          </div>
        </div>

        {/* 视图内容区域 */}
        <div className="p-3">

        {/* 各视图内容 */}
        {activeView === 'card' && (
          <TaskCardGrid
            tasks={sortedTasks}
            onTaskClick={handleTaskClick}
            onAddTask={onAddTask}
            viewMode={viewMode}
          />
        )}

        {activeView === 'list' && (
          <TaskList
            tasks={sortedTasks}
            onEdit={handleTaskClick}
            onDelete={(taskId: string) => console.log(`删除任务 ID: ${taskId}`)}
            onAddTask={onAddTask}
          />
        )}

        {activeView === 'kanban' && (
          <TaskBoard
            tasks={sortedTasks}
            onTaskClick={handleTaskClick}
            onAddTask={onAddTask}
            onStatusChange={(taskId: string, newStatus: TaskStatus) => {
              // 实际应用中这里应该调用更新任务状态的API
            }}
          />
        )}

        {activeView === 'analytics' && (
          <TaskAnalytics tasks={sortedTasks} />
        )}

        {/* 显示结果数量 */}
        {sortedTasks.length !== tasks.length && (
          <div className="mt-3 text-xs text-gray-500">
            显示 {sortedTasks.length} 个任务（共 {tasks.length} 个）
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="ml-2 text-blue-500 hover:text-blue-700 hover:underline"
              >
                清除筛选
              </button>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TaskManagementTemplate;
