import React, {useEffect, useState} from 'react';
import {ProjectTask} from '@/types/api-types';
import TaskTrend from '@/ui/organisms/TaskTrend';
import AddMemberModal from './AddMemberModal';
import {useQueryClient} from '@tanstack/react-query';
import ProjectStats from '@/ui/organisms/ProjectStats';
import {AnimatePresence, motion} from 'framer-motion';
import Card from '../../molecules/Card';
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
    tasks?: ProjectTask[];
    members?: any[];
    progress?: number;
    taskCount?: number;
    completedTaskCount?: number;
    memberCount?: number;
    taskStatusTrend?: TaskStatusTrend;
  };
  /** 切换到任务标签页的回调函数 */
  onSwitchToTasksTab?: () => void;
  /** 切换到团队标签页的回调函数 */
  onSwitchToTeamTab?: () => void;
  /** 创庺任务的回调函数 */
  onCreateTask?: () => void;
  /** 点击任务的回调函数 */
  onTaskClick?: (taskId: string) => void;
}

// 动画参数
const springTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 1
};

// 按钮组件 - 可在组件内直接使用
const Button: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isDarkMode?: boolean;
}> = ({ onClick, children, icon, variant = 'secondary', size = 'md', isDarkMode = false }) => {
  // 按钮点击动画状态
  const [isPressed, setIsPressed] = useState(false);

  // 尺寸映射
  const sizeMap = {
    sm: 'text-xs px-3 py-1.5 rounded-full',
    md: 'text-sm px-4 py-2 rounded-full',
    lg: 'text-base px-5 py-2.5 rounded-full'
  };

  // 颜色映射 - 支持暗色模式
  const colorMap = {
    primary: isDarkMode 
      ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent' 
      : 'bg-[#0A84FF] hover:bg-[#0071E3] text-white border-transparent',
    secondary: isDarkMode
      ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border-transparent'
      : 'bg-[#0A84FF]/10 hover:bg-[#0A84FF]/20 text-[#0A84FF] hover:text-[#0071E3] border-transparent'
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileTap={{ scale: 0.97 }}
      transition={springTransition}
      className={`
        flex items-center font-medium ${sizeMap[size]} ${colorMap[variant]}
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/40
        active:scale-95
      `}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {children}
    </motion.button>
  );
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
  
  // 不再需要弹出式提示框了
  // 确保 tasks 和 members 是数组，即使是 undefined 也会被初始化为空数组
  const tasks = project.tasks || [];
  const members = project.members || [];

  // 计算项目进度
  const progress = typeof project.progress === 'number' ? project.progress : 0;
  const taskCount = typeof project.taskCount === 'number' ? project.taskCount : tasks.length;
  const completedTaskCount = typeof project.completedTaskCount === 'number' ? project.completedTaskCount : 0;
  // 优先使用接口返回的 memberCount 字段
  const memberCount = typeof project.memberCount === 'number' ? project.memberCount : members.length;

  // 组件挂载状态
  const [isLoaded, setIsLoaded] = useState(false);

  // 模拟骨架屏加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 排序相关状态
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  // 添加成员弹窗状态
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  
  // 导出弹窗状态
  const [showExportModal, setShowExportModal] = useState(false);
  
  // 项目设置弹窗状态
  const [showProjectSettingsModal, setShowProjectSettingsModal] = useState(false);
  
  const queryClient = useQueryClient();

  // 导航到相应页面的处理函数
  const handleViewAllTasks = () => {
    // 切换到任务标签页
    if (onSwitchToTasksTab) {
      onSwitchToTasksTab();
    } else {
      console.log('任务标签页切换回调未提供');
    }
  };

  const handleViewAllMembers = () => {
    // 切换到团队标签页
    if (onSwitchToTeamTab) {
      onSwitchToTeamTab();
    } else {
      console.log('团队标签页切换回调未提供');
    }
  };

  // 创建任务处理函数
  const handleCreateTask = () => {
    if (onCreateTask) {
      onCreateTask();
    }
  };

  // 添加成员处理函数
  const handleAddMember = () => {
    setShowAddMemberModal(true);
  };

  // 不再需要单独的处理函数
  const noop = () => {};

  // 关闭添加成员弹窗
  const handleCloseAddMemberModal = () => {
    setShowAddMemberModal(false);
  };

  // 处理成员添加成功
  const handleMemberAdded = () => {
    // 刷新项目数据
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    setShowAddMemberModal(false);
  };

  // 处理导出报告
  const handleExportReport = () => {
    setShowExportModal(true);
  };

  // 关闭导出弹窗
  const handleCloseExportModal = () => {
    setShowExportModal(false);
  };

  // 处理项目设置
  const handleProjectSettings = () => {
    setShowProjectSettingsModal(true);
  };

  // 关闭项目设置弹窗
  const handleCloseProjectSettingsModal = () => {
    setShowProjectSettingsModal(false);
  };

  // 处理项目更新
  const handleProjectUpdate = (updatedProject: any) => {
    // 刷新项目数据
    queryClient.invalidateQueries({ queryKey: ['project', project.id] });
  };

  // 准备导出数据
  const prepareExportData = (): ExportData => {
    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        progress: progress,
        taskCount: taskCount,
        completedTaskCount: completedTaskCount,
        memberCount: memberCount,
        createdAt: new Date().toISOString(), // 如果有实际数据可以替换
        updatedAt: new Date().toISOString()  // 如果有实际数据可以替换
      },
      tasks: tasks.map(task => ({
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
      members: members.map(member => ({
        id: member.id || '',
        name: member.name || '未命名成员',
        role: member.role || '团队成员',
        email: member.email,
        avatar: member.avatar
      }))
    };
  };

  // 骨架屏组件 - 实现加载效果，支持暗色模式
  const SkeletonCard = () => (
    <div className={`${isDarkMode ? 'bg-gray-800/80' : 'bg-gray-100/80'} backdrop-blur-sm animate-pulse rounded-2xl p-6 h-full border ${isDarkMode ? 'border-gray-700/60' : 'border-gray-100/60'} shadow-sm overflow-hidden`}>
      <div className="flex items-center mb-6">
        <div className={`w-5 h-5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} mr-2`}></div>
        <div className={`h-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/3`}></div>
      </div>
      <div className="space-y-3">
        <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4`}></div>
        <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2`}></div>
        <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-5/6`}></div>
      </div>
    </div>
  );

  return (
    <div className={`mt-4 space-y-6 font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,sans-serif] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <AnimatePresence>
        {/* 骨架屏或内容切换动画 */}
        {!isLoaded ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <SkeletonCard />
            <SkeletonCard />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* 快速操作区 */}
            <div className={`mb-6 rounded-2xl p-5 backdrop-blur-sm border ${
              isDarkMode 
                ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700/30' 
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100/50'
            }`}>
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                <svg className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                快速操作
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 创建任务 */}
                <motion.div
                  className={`${isDarkMode ? 'bg-gray-800 hover:border-gray-700' : 'bg-white hover:border-blue-100'} rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer border border-transparent transition-all`}
                  whileHover={{ boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateTask}
                >
                  <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} flex items-center justify-center mb-2`}>
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>创建任务</span>
                </motion.div>

                {/* 添加成员 */}
                <motion.div
                  className={`${isDarkMode ? 'bg-gray-800 hover:border-gray-700' : 'bg-white hover:border-blue-100'} rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer border border-transparent transition-all`}
                  whileHover={{ boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddMember}
                >
                  <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'} flex items-center justify-center mb-2`}>
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>添加成员</span>
                </motion.div>

                {/* 导出报告 */}
                <motion.div
                  className={`${isDarkMode ? 'bg-gray-800 hover:border-gray-700' : 'bg-white hover:border-blue-100'} rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer border border-transparent transition-all`}
                  whileHover={{ boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportReport}
                >
                  <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'} flex items-center justify-center mb-2`}>
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>导出报告</span>
                  <div className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>
                    生成项目详细报告
                  </div>
                </motion.div>

                {/* 项目设置 */}
                <motion.div
                  className={`${isDarkMode ? 'bg-gray-800 hover:border-gray-700' : 'bg-white hover:border-blue-100'} rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer border border-transparent transition-all relative group`}
                  whileHover={{ boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProjectSettings}
                >
                  <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-2`}>
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>项目设置</span>
                </motion.div>
              </div>
            </div>

            {/* 第一行：网格布局 - 项目统计与任务趋势并排（大屏幕） */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 项目统计卡片 */}
              <Card
                title="项目统计"
                delay={0.1}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>}
                className="h-full"
              >
                <ProjectStats
                  taskCount={taskCount}
                  completedTaskCount={completedTaskCount}
                  memberCount={memberCount}
                  progress={progress}
                />
              </Card>

              {/* 任务趋势卡片 - 直接展示 */}
              <Card
                title="任务趋势"
                delay={0.2}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>}
                className="h-full"
              >
                <TaskTrend
                  projectId={project.id}
                  taskStatusTrend={project.taskStatusTrend}
                  tasks={tasks}
                />
              </Card>
            </div>

            {/* 第二行：最近任务 */}
            <div className="mt-6">
              {/* 最近任务卡片 - 苹果风格优化版 */}
              <Card
                title="最近任务"
                delay={0.3}
                actionText="查看全部"
                onAction={handleViewAllTasks}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>}
                className="h-full"
                headerExtra={
                  <div className="flex items-center space-x-2 overflow-x-auto py-1 max-w-[200px] hide-scrollbar">
                    {/* 从任务列表中提取不同的状态 */}
                    {(() => {
                      // 创建一个对象来存储状态和对应的颜色
                      const statusMap = new Map();

                      // 遍历任务列表，收集所有不同的状态和颜色
                      tasks.forEach(task => {
                        if (task.status && !statusMap.has(task.status)) {
                          statusMap.set(task.status, {
                            color: task.statusColor || '#6B7280',
                            label: task.status
                          });
                        }
                      });

                      // 将Map转换为数组并返回渲染结果
                      return Array.from(statusMap.entries()).map(([status, { color, label }], index) => {
                        // 根据状态生成中文标签
                        const statusLabel = (() => {
                          switch(status.toString().toUpperCase()) {
                            case 'WAITING': return '待处理';
                            case 'IN_PROGRESS': return '进行中';
                            case 'BLOCKED': return '已阻塞';
                            case 'COMPLETED': return '已完成';
                            case 'CANCELLED': return '已取消';
                            case 'OVERDUE': return '已过期';
                            default: return label; // 使用原始标签
                          }
                        })();

                        return (
                          <span key={`status-${index}`} className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center flex-shrink-0`}>
                            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: color }}></span>
                            {statusLabel}
                          </span>
                        );
                      });
                    })()}

                    {/* 如果有高优先级任务，显示高优先级图例 */}
                    {tasks.some(task => (task.priority || '').toString().toUpperCase() === 'HIGH') && (
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center flex-shrink-0`}>
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
                        高优先级
                      </span>
                    )}
                  </div>
                }
              >
                <div className="overflow-hidden rounded-xl">
                  <div className="max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2"
                       style={{ scrollbarWidth: 'thin', msOverflowStyle: 'none' }}
                  >
                    {tasks.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3 pb-2">
                        {tasks.slice(0, 5).map((projectTask, index) => {
                          // 获取任务优先级和状态
                          const priority = (projectTask.priority || 'MEDIUM').toString().toUpperCase();
                          const status = (projectTask.status || 'WAITING').toString().toUpperCase();

                          // 使用接口返回的颜色，或者使用默认值
                          const priorityColor = projectTask.priorityColor || '#3B82F6';
                          const statusColor = projectTask.statusColor || '#6B7280';

                          // 根据优先级生成标签
                          const priorityLabel = (() => {
                            switch(priority) {
                              case 'HIGH': return '高';
                              case 'MEDIUM': return '中';
                              case 'LOW': return '低';
                              default: return '中';
                            }
                          })();

                          // 根据状态生成标签
                          const statusLabel = (() => {
                            switch(status) {
                              case 'WAITING': return '待处理';
                              case 'IN_PROGRESS': return '进行中';
                              case 'BLOCKED': return '已阻塞';
                              case 'COMPLETED': return '已完成';
                              case 'CANCELLED': return '已取消';
                              case 'OVERDUE': return '已过期';
                              default: return status; // 使用原始状态名
                            }
                          })();

                          // 这里不需要重复声明createdDate，已在下方声明

                          // 根据接口返回的颜色生成浅色版本作为背景色
                          const generateLightColor = (hexColor: string): string => {
                            try {
                              // 将十六进制颜色转换为RGB
                              const r = parseInt(hexColor.slice(1, 3), 16);
                              const g = parseInt(hexColor.slice(3, 5), 16);
                              const b = parseInt(hexColor.slice(5, 7), 16);

                              // 返回带透明度的颜色
                              return `rgba(${r}, ${g}, ${b}, 0.1)`;
                            } catch (e) {
                              console.error('Error generating light color:', e);
                              return 'rgba(243, 244, 246, 0.8)'; // 如果出错，返回默认浅灰色
                            }
                          };

                          // 根据接口返回的颜色生成比原始颜色更深一点的边框颜色
                          const generateBorderColor = (hexColor: string): string => {
                            try {
                              // 将十六进制颜色转换为RGB
                              const r = parseInt(hexColor.slice(1, 3), 16);
                              const g = parseInt(hexColor.slice(3, 5), 16);
                              const b = parseInt(hexColor.slice(5, 7), 16);

                              // 返回带透明度的颜色
                              return `rgba(${r}, ${g}, ${b}, 0.3)`;
                            } catch (e) {
                              console.error('Error generating border color:', e);
                              return 'rgba(209, 213, 219, 0.8)'; // 如果出错，返回默认边框色
                            }
                          };
                                                   // 生成背景色和状态样式
                          const statusBgColor = generateLightColor(statusColor);

                          // 计算时间信息
                          const createdDate = projectTask.createdAt ? new Date(projectTask.createdAt) : new Date();
                          const dueDate = projectTask.dueDate ? new Date(projectTask.dueDate) : null;
                          const isPastDue = dueDate && dueDate < new Date();

                          // 格式化日期的函数
                          const formatDate = (date: Date) => {
                            const now = new Date();
                            const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

                            if (diff === 0) {
                              return '今天';
                            } else if (diff === 1) {
                              return '昨天';
                            } else if (diff < 7) {
                              return `${diff}天前`;
                            } else {
                              return date.toLocaleDateString('zh-CN', {
                                month: 'short',
                                day: 'numeric'
                              });
                            }
                          };



                          return (
                            <motion.div
                              key={projectTask.id || index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: 0.05 * index,
                                duration: 0.3,
                                type: 'spring',
                                stiffness: 100
                              }}
                              whileHover={{
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)'
                              }}
                              whileTap={{ y: 0, scale: 0.98 }}
                              onClick={() => onTaskClick?.(projectTask.id)}
                              className={`relative rounded-xl backdrop-blur-sm overflow-hidden border cursor-pointer ${isDarkMode ? 'border-gray-700/60 bg-gray-800/90 hover:border-gray-600/80' : 'border-gray-100/60 bg-white/90 hover:border-gray-200/80'} shadow-sm hover:shadow-md transition-all`}
                            >
                              {/* 左侧优先级标记 */}
                              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: priorityColor }}></div>

                              {/* 任务卡片内容 */}
                              <div className="p-4 pl-5">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    {/* 任务标题 */}
                                    <h3 className={`text-base font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} line-clamp-1 mb-1 pr-2 flex items-center`}>
                                      {projectTask.title || '无标题任务'}
                                      {priority === 'HIGH' && (
                                        <span className={`ml-1.5 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12,2L1,21H23M12,6L19.53,19H4.47" />
                                          </svg>
                                        </span>
                                      )}
                                    </h3>

                                    {/* 任务描述 */}
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-1 mb-2`}>
                                      {projectTask.description || '无描述'}
                                    </p>
                                  </div>

                                  {/* 任务状态标签 */}
                                  <span
                                    style={{
                                      backgroundColor: statusBgColor,
                                      color: statusColor
                                    }}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 mt-1"
                                  >
                                    {statusLabel}
                                  </span>
                                </div>

                                {/* 任务底部信息 */}
                                <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} pt-1 border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
                                  {/* 创建日期 */}
                                  <div className="flex items-center">
                                    <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{formatDate(createdDate)}</span>
                                  </div>

                                  {/* 负责人 */}
                                  {projectTask.assignee && (
                                    <div className="flex items-center">
                                      <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      <span>{projectTask.assignee}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <motion.div
                        className={`flex flex-col items-center justify-center py-12 px-6 ${isDarkMode ? 'text-gray-400 bg-gray-800/50' : 'text-gray-500 bg-gray-50/50'} backdrop-blur-sm rounded-xl border ${isDarkMode ? 'border-gray-700/60' : 'border-gray-100/60'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        <svg className={`w-16 h-16 mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className={`mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center max-w-xs`}>你的项目还没有任务，立即创建一个新任务开始工作吧！</p>
                        <Button
                          onClick={handleCreateTask}
                          size="md"
                          variant="primary"
                          isDarkMode={isDarkMode}
                          icon={
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          }
                        >
                          创建任务
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* 团队成员卡片（全宽） */}
            <div className="mt-6">
              <Card
                title="团队成员"
                delay={0.5}
                actionText="查看全部"
                onAction={handleViewAllMembers}
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>}
              >
                {members.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {members.slice(0, 6).map((member, index) => (
                      <motion.div
                        key={index}
                        className={`flex items-center p-3 rounded-xl transition-colors border border-transparent ${
                          isDarkMode 
                            ? 'hover:bg-gray-800/80 hover:border-gray-700' 
                            : 'hover:bg-gray-50/80 hover:border-gray-100'
                        }`}
                        whileHover={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}
                        transition={springTransition}
                      >
                        <Avatar
                          src={member.avatar}
                          name={member.name || ''}
                          className={`w-10 h-10 rounded-full mr-3 border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} shadow-sm`}
                        />
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{member.name || '未命名成员'}</p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{member.role || '团队成员'}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    className={`flex flex-col items-center justify-center py-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <svg className={`w-12 h-12 mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className={`mb-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>暂无团队成员</p>
                    <Button
                      onClick={handleAddMember}
                      size="md"
                      variant="primary"
                      isDarkMode={isDarkMode}
                      icon={
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      }
                    >
                      添加成员
                    </Button>
                  </motion.div>
                )}
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 添加成员弹窗 */}
      {showAddMemberModal && (
        <AddMemberModal
          isOpen={showAddMemberModal}
          onClose={handleCloseAddMemberModal}
          onMemberAdded={handleMemberAdded}
          projectId={project.id}
        />
      )}

      {/* 导出报告弹窗 */}
      {showExportModal && (
        <ProjectExportModal
          isOpen={showExportModal}
          onClose={handleCloseExportModal}
          projectData={prepareExportData()}
        />
      )}

      {/* 项目设置弹窗 */}
      {showProjectSettingsModal && (
        <ProjectSettingsModal
          isOpen={showProjectSettingsModal}
          onClose={handleCloseProjectSettingsModal}
          project={project}
          onProjectUpdate={handleProjectUpdate}
        />
      )}
    </div>
  );
};



export default ProjectOverviewPanel;
