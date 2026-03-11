"use client";

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import MainLayout from '@/ui/templates/MainLayout';
import {ProjectTask} from '@/types/api-types';
import {useQueryClient} from '@tanstack/react-query';
import useProjectHook from '@/hooks/use-project-hook';
import useTaskHook from '@/hooks/use-task-hook';
import {AiAnalysisModal} from '@/ui/organisms/AiAnalysisModal';
import requirementConversationApi from '@/adapters/api/requirement-conversation-api';
import {AnimatePresence, motion} from 'framer-motion';
import {useTheme} from '@/ui/theme';
import {useToast} from '@/ui/molecules/Toast';
import CreateTaskConfirmModal from '@/ui/organisms/CreateTaskConfirmModal';
import {
    ANALYSIS_COMPLETE_EVENT,
    analysisEventEmitter
} from '@/ui/organisms/CreateTaskConfirmModal/utils/analysisEventEmitter';
import {FiChevronLeft, FiPlus, FiShare2} from 'react-icons/fi';
import TaskDetailModal from '@/ui/organisms/TaskDetailModal';
import SubTaskDetailModal from '@/ui/organisms/SubTaskDetailModal';
import ComingSoonModal from '@/ui/molecules/ComingSoonModal';

// 导入组件和类型
import {
    ProjectDetailHeader,
    ProjectDetailTabs,
    ProjectFilesPanel,
    ProjectOverviewPanel,
    ProjectTasksPanel,
    ProjectTeamPanel,
} from '@/ui/organisms/ProjectDetailComponents';
// 导入TabType类型
import type {TabType} from '@/ui/organisms/ProjectDetailComponents/ProjectDetailTabs';

// 引入成员适配工具函数
import {projectMembersToTeamMembers} from '@/utils/member-utils';

interface ProjectDetailTemplateProps {
  projectId: string;
}

// 自定义媒体查询hook
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // 服务器端渲染时避免执行
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      // 初始化匹配状态
      setMatches(media.matches);

      const listener = () => setMatches(media.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
    return undefined;
  }, [query]); // 只依赖于query变化

  return matches;
};

const ProjectDetailTemplate: React.FC<ProjectDetailTemplateProps> = ({ projectId }) => {
  const router = useRouter();
  const queryClient = useQueryClient(); // 获取 queryClient 实例
  const [selectedTab, setSelectedTab] = useState<TabType>('overview');
  const [isAiAnalysisModalOpen, setIsAiAnalysisModalOpen] = useState(false);
  const [isPreparingAiAnalysis, setIsPreparingAiAnalysis] = useState(false);
  const [conversationListId, setConversationListId] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [taskAnalysisData, setTaskAnalysisData] = useState<any>(null);
  const [taskPage, setTaskPage] = useState(1);
  const [taskPageSize, setTaskPageSize] = useState(10);
  // 当前视图状态
  const [currentView, setCurrentView] = useState<'list' | 'board' | 'calendar' | 'gantt'>('list');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const { isDark } = useTheme();
  const isDarkMode = isDark;
  const { addToast } = useToast();

  // 任务详情弹窗状态
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskClickSource, setTaskClickSource] = useState<'overview' | 'tasks' | null>(null);

  // 分享模态框状态
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 监听分析完成事件
  useEffect(() => {
    // 添加分析完成事件监听器
    const handleAnalysisComplete = (data: any) => {
      console.log('收到分析完成事件:', data);
      
      // 解析分析数据
      let parsedData = data;
      if (data.content && typeof data.content === 'string') {
        try {
          parsedData = JSON.parse(data.content);
          console.log('解析后的数据:', parsedData);
        } catch (e) {
          console.error('解析分析数据失败:', e);
          parsedData = data;
        }
      }
      
      // 保存分析数据
      setTaskAnalysisData(parsedData);
      // 打开任务确认弹窗
      setIsCreateTaskModalOpen(true);
    };

    // 添加事件监听
    const unsubscribe = analysisEventEmitter.on(ANALYSIS_COMPLETE_EVENT, handleAnalysisComplete);

    // 组件卸载时移除监听
    return () => {
      unsubscribe();
    };
  }, []);

  // 处理关闭任务确认弹窗
  const handleTaskModalClose = () => {
    setIsCreateTaskModalOpen(false);
  };

  // 声明控制是否应该刷新任务列表的状态变量
  const [shouldRefreshTasks, setShouldRefreshTasks] = useState(false);

  // 添加本地状态管理项目信息，用于直接更新而不发起API请求
  const [localProjectName, setLocalProjectName] = useState<string>('');
  const [localProjectDescription, setLocalProjectDescription] = useState<string>('');

  const { useGetProjectDetail } = useProjectHook();

  // 使用React Query的useGetProjectDetail hook获取项目详情
  const {
    data: projectDetail,
    isLoading,
    error,
    refetch: refetchProjectDetail
  } = useGetProjectDetail(projectId);

  // 当项目详情数据加载完成后，初始化本地状态
  useEffect(() => {
    if (projectDetail) {
      setLocalProjectName(projectDetail.name || '');
      setLocalProjectDescription(projectDetail.description || '');
    }
  }, [projectDetail]);

  // 使用任务API获取项目任务列表和任务详情
  const { useGetProjectTasks, useGetTaskWithSubtasks } = useTaskHook();

  // 判断当前视图是否应该显示子任务
  const shouldUseSubTasks = () => {
    // 看板视图、日历视图和甘特图视图应显示子任务
    return ['board', 'calendar', 'gantt'].includes(currentView);
  };

  // 获取项目主任务列表（用于列表视图）
  const {
    data: tasksData,
    isLoading: isTasksLoading,
    error: tasksError,
    refetch: refetchTasks
  } = useGetProjectTasks(
    projectId,           // 项目ID
    undefined,           // 优先级筛选
    taskPage,            // 页码
    taskPageSize,        // 每页数量
    'main',              // 任务类型：只查询主任务
    {                    // React Query 选项
      // 当在任务标签页且项目 ID 存在，并且当前是列表视图时启用
      enabled: selectedTab === 'tasks' && !!projectId && !shouldUseSubTasks(),
      staleTime: 30000   // 缓存30秒
    }
  );

  // 获取项目子任务列表（用于看板视图、日历视图和甘特图视图）
  const {
    data: subTasksData,
    isLoading: isSubTasksLoading,
    error: subTasksError,
    refetch: refetchSubTasks
  } = useGetProjectTasks(
    projectId,           // 项目ID
    undefined,           // 优先级筛选
    1,                   // 页码（这些视图不分页）
    200,                 // 每页数量（显示更多任务）
    'sub',               // 任务类型：只查询子任务
    {                    // React Query 选项
      // 当在任务标签页且项目 ID 存在，并且当前是看板视图、日历视图或甘特图视图时启用
      enabled: selectedTab === 'tasks' && !!projectId && shouldUseSubTasks(),
      staleTime: 30000   // 缓存30秒
    }
  );

  // 注意：currentView已在上方声明

  // 不再在这里获取任务详情，改为在TaskDetailModal组件内部获取

  // 只在首次加载或明确需要刷新时进行数据获取
  // 注意：不再每次切换标签页就自动刷新，避免不必要的请求

  useEffect(() => {
    if (selectedTab === 'tasks' && shouldRefreshTasks) {
      // 刷新项目详情
      refetchProjectDetail();
      // 根据当前视图刷新相应的任务列表
      if (currentView === 'board') {
        if (refetchSubTasks) {
          refetchSubTasks();
        }
      } else {
        if (refetchTasks) {
          refetchTasks();
        }
      }
      setShouldRefreshTasks(false); // 刷新后重置标志
    }
  }, [selectedTab, shouldRefreshTasks, refetchTasks, refetchSubTasks, refetchProjectDetail, currentView]);

  // 监听分析完成事件 - 优化逻辑避免重复请求
  useEffect(() => {
    // 添加事件监听
    const unsubscribe = analysisEventEmitter.on(ANALYSIS_COMPLETE_EVENT, (data) => {
      // 切换到任务标签页并标记需要刷新
      setSelectedTab('tasks');
      setShouldRefreshTasks(true);
    });

    // 组件卸载时移除监听
    return () => {
      unsubscribe();
    };
  }, []);

  // 处理任务分页变化
  const handleTaskPageChange = (page: number) => {
    setTaskPage(page);
  };

  // 处理每页显示条数变化
  const handleTaskPageSizeChange = (size: number) => {
    setTaskPageSize(size);
    setTaskPage(1); // 更改每页条数时，重置为第一页
  };

  // 处理添加任务
  const handleAddTask = async () => {
    if (isPreparingAiAnalysis) {
      return;
    }

    // 清除任务分配相关的缓存数据
    queryClient.removeQueries({ queryKey: ['taskAssignStream'] });
    queryClient.removeQueries({ queryKey: ['assignTask'] });
    queryClient.removeQueries({ queryKey: ['assignMessages'] });
    queryClient.removeQueries({ queryKey: ['assignResult'] });

    // 如果还有其他缓存键，也一并清除
    if (projectId) {
      queryClient.removeQueries({ queryKey: ['projectTasks', projectId] });
      queryClient.removeQueries({ queryKey: ['taskAssign', projectId] });
    }

    setIsPreparingAiAnalysis(true);
    try {
      const listResponse = await requirementConversationApi.createRequirementConversationList();

      if (!listResponse.success || listResponse.data === null || listResponse.data === undefined) {
        addToast(listResponse.message || '创建需求会话失败，请稍后重试', 'error');
        return;
      }

      const newConversationListId = String(listResponse.data).trim();
      if (!/^\d+$/.test(newConversationListId)) {
        addToast('需求会话ID无效，请稍后重试', 'error');
        return;
      }

      setConversationListId(newConversationListId);
      // 只有拿到 conversation_list_id 后才打开 AI 分析弹窗
      setIsAiAnalysisModalOpen(true);
    } catch (error) {
      console.error('创建需求会话列表异常:', error);
      addToast('创建需求会话失败，请稍后重试', 'error');
    } finally {
      setIsPreparingAiAnalysis(false);
    }
  };

  // 处理直接创建任务（不通过AI分析）
  const handleDirectCreateTask = () => {
    // 直接打开创建任务弹窗
    setIsCreateTaskModalOpen(true);
  };

  // 判断是否应该使用子任务详情弹窗
  const shouldUseSubTaskModal = (view: string): boolean => {
    return ['board', 'calendar', 'gantt'].includes(view);
  };

  // 处理点击任务
  const handleTaskClick = (taskIdOrTask: string | ProjectTask, source: 'overview' | 'tasks' = 'tasks') => {
    const taskId = typeof taskIdOrTask === 'string' ? taskIdOrTask : taskIdOrTask.id;
    setSelectedTaskId(taskId);
    setTaskClickSource(source);
    setIsTaskDetailModalOpen(true);
  };

  // 关闭任务详情弹窗
  const handleCloseTaskDetail = () => {
    setIsTaskDetailModalOpen(false);
    // 延迟清空选中的任务ID，确保动画完成后再清空
    setTimeout(() => {
      setSelectedTaskId(null);
      setTaskClickSource(null);
    }, 300);
  };

  // 当AI分析模态框关闭时处理页面状态
  const handleAiAnalysisClose = () => {
    setIsAiAnalysisModalOpen(false);
    setConversationListId(null);

    // 无论当前在哪个标签页，都切换到任务标签页并标记需要刷新
    setSelectedTab('tasks');

    // 标记需要刷新任务列表，然后由useEffect统一处理
    // 避免直接调用refetchTasks导致多次请求
    setShouldRefreshTasks(true);
  };

  // 渲染错误状态
  const renderErrorState = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="mb-6 text-6xl" style={{ color: 'var(--theme-error-500)' }}>
          <span role="img" aria-label="error">⚠️</span>
        </div>
        <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>获取项目数据失败</h2>
        <p className="mb-8 text-center max-w-md" style={{ color: 'var(--theme-neutral-600)' }}>
          {error instanceof Error ? error.message : '发生未知错误，请稍后重试。'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-md font-medium transition-colors"
          style={{
            backgroundColor: 'var(--theme-neutral-100)',
            color: 'var(--foreground)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-neutral-200)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--theme-neutral-100)';
          }}
        >
          重新加载
        </button>
      </div>
    );
  };

  // 渲染加载状态 - 苹果风格骨架屏
  const renderLoadingState = () => {
    return (
      <div className="animate-pulse">
        {/* 头部骨架屏 */}
        <div className="sticky top-0 z-10 border-b" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="h-6 w-16 rounded" style={{ backgroundColor: 'var(--theme-neutral-200)' }}></div>
            <div className="h-6 w-16 rounded" style={{ backgroundColor: 'var(--theme-neutral-200)' }}></div>
          </div>
          <div className="px-6 pb-4">
            <div className="h-7 w-48 rounded mb-2" style={{ backgroundColor: 'var(--theme-neutral-200)' }}></div>
            <div className="h-5 w-64 rounded" style={{ backgroundColor: 'var(--theme-neutral-200)' }}></div>
          </div>
        </div>

        {/* 标签骨架屏 */}
        <div className="px-4 py-2">
          <div className="flex w-full rounded-lg p-1" style={{ backgroundColor: 'var(--theme-neutral-100)' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 py-1.5 mx-1 h-8 rounded-md" style={{ backgroundColor: 'var(--theme-neutral-200)' }}></div>
            ))}
          </div>
        </div>

        {/* 内容骨架屏 */}
        <div className="p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4 p-4 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--theme-card-bg)' }}>
              <div className="h-6 w-32 rounded mb-3" style={{ backgroundColor: 'var(--theme-neutral-200)' }}></div>
              <div className="h-4 w-full rounded mb-2" style={{ backgroundColor: 'var(--theme-neutral-200)' }}></div>
              <div className="h-4 w-3/4 rounded" style={{ backgroundColor: 'var(--theme-neutral-200)' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 滚动状态监听 - 确保在组件顶层调用useState
  const [isScrolled, setIsScrolled] = useState(false);

  // 监听滚动事件，用于切换简洁模式
  useEffect(() => {
    // 只在客户端执行
    if (typeof window !== 'undefined') {
      // 初始检查滚动位置
      setIsScrolled(window.scrollY > 60);

      const handleScroll = () => {
        setIsScrolled(window.scrollY > 60);
      };

      // 设置CSS变量到根元素，确保全局可用
      const updateHeaderHeight = () => {
        const height = window.scrollY > 60 ? '80px' : '140px';
        document.documentElement.style.setProperty('--project-header-height', height);
      };

      // 初始设置
      updateHeaderHeight();
      
      const scrollHandler = () => {
        setIsScrolled(window.scrollY > 60);
        updateHeaderHeight();
      };

      window.addEventListener('scroll', scrollHandler);
      return () => {
        window.removeEventListener('scroll', scrollHandler);
        // 清理CSS变量
        document.documentElement.style.removeProperty('--project-header-height');
      };
    }
  }, []);

  // 渲染加载状态
  if (isLoading) {
    return (
      <MainLayout title="项目详情">
        {renderLoadingState()}
      </MainLayout>
    );
  }

  // 渲染错误状态
  if (error || !projectDetail) {
    return (
      <MainLayout title="项目详情">
        {renderErrorState()}
      </MainLayout>
    );
  }

  return (
    <MainLayout title={projectDetail?.name || "项目详情"}>
      <>
        {/* 全尺寸头部容器 - 作为一个整体吸顶，使用毛玻璃效果 */}
        <div
          className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 backdrop-blur-md ${
            isDarkMode 
              ? 'bg-gray-900/90 border-b border-gray-800' 
              : 'bg-white/90 border-b border-gray-200'
          }`}
          id="projectDetailHeader"
          style={{
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            backdropFilter: 'saturate(180%) blur(20px)',
            // 设置CSS变量供搜索框使用，根据滚动状态调整高度
            '--project-header-height': isScrolled ? '80px' : '140px'
          } as React.CSSProperties}
        >
          {/* 简洁模式头部 - 在滚动时显示 */}
          {isScrolled && (
            <div className="compact-header px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push('/projects')}
                  className={`flex items-center text-sm ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                >
                  <FiChevronLeft className="mr-1" size={16} />
                  <span className="font-medium truncate max-w-[200px]">{projectDetail?.name}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleAddTask}
                  className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } transition-colors shadow-sm`}
                >
                  <FiPlus className="mr-1" size={12} />
                  <span>添加任务</span>
                </button>
              </div>
            </div>
          )}

          {/* 常规头部 - 在非滚动状态显示 */}
          <div className={`header-content transition-all duration-300 ${isScrolled ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[500px] opacity-100'}`}>
            <ProjectDetailHeader
              projectName={localProjectName}
              projectDescription={localProjectDescription}
              onAddTask={handleAddTask}
              projectId={projectId}
              projectDetail={projectDetail}
              onProjectUpdated={(updatedName, updatedDescription) => {
                // 编辑项目成功后直接更新本地状态，而不是刷新数据
                setLocalProjectName(updatedName);
                setLocalProjectDescription(updatedDescription);
              }}
              onShare={() => setIsShareModalOpen(true)}
            />

            {/* 项目详情标签页 - 始终显示 */}
            <ProjectDetailTabs
              selectedTab={selectedTab}
              onTabChange={(tab) => {
                setSelectedTab(tab);
                // 当切换到任务标签页时，会自动触发useGetProjectTasks查询
                // 因为我们设置了enabled依赖于标签页值
              }}
            />
          </div>

          {/* 标签页导航 - 在简洁模式下显示 */}
          {isScrolled && (
            <div className="tabs-container px-4 py-1">
              <ProjectDetailTabs
                selectedTab={selectedTab}
                onTabChange={(tab) => {
                  setSelectedTab(tab);
                }}
                isCompact={true}
              />
            </div>
          )}
        </div>

        {/* 内容区域 - 添加适当的顶部内边距，避免被固定头部遮挡 */}
        <div className={`flex-1 content-area ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} style={{
          paddingTop: isScrolled ? '80px' : '140px', // 根据头部高度动态调整
          transition: 'padding-top 0.3s ease'
        }}>
          <div className={`container mx-auto p-4 ${isMobile ? 'px-2' : ''}`}>
            <AnimatePresence mode="wait">
              {selectedTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                >
                  <ProjectOverviewPanel
                    project={projectDetail}
                    onSwitchToTasksTab={() => setSelectedTab('tasks')}
                    onSwitchToTeamTab={() => setSelectedTab('team')}
                    onCreateTask={handleAddTask}
                    onTaskClick={(taskId) => handleTaskClick(taskId, 'overview')}
                  />
                </motion.div>
              )}

            {selectedTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                <ProjectTasksPanel
                  tasks={shouldUseSubTasks() ? subTasksData?.content || [] : tasksData?.content || []}
                  onAddTask={handleAddTask}
                  onTaskClick={handleTaskClick}
                  isLoading={shouldUseSubTasks() ? isSubTasksLoading : isTasksLoading}
                  error={shouldUseSubTasks() ? subTasksError as Error : tasksError as Error}
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  pagination={{
                    current: taskPage,
                    pageSize: taskPageSize,
                    total: tasksData?.total || 0,
                    onChange: handleTaskPageChange,
                    onPageSizeChange: handleTaskPageSizeChange
                  }}
                  projectId={projectId}
                  projectProgress={projectDetail?.progress} // 传递项目进度
                  projectTaskCount={projectDetail?.taskCount} // 传递项目任务总数
                  projectCompletedTaskCount={projectDetail?.completedTaskCount} // 传递项目已完成任务数
                  onTaskUpdate={() => {
                    // 任务更新后刷新任务列表
                    if (shouldUseSubTasks()) {
                      if (refetchSubTasks) {
                        refetchSubTasks();
                      }
                    } else {
                      if (refetchTasks) {
                        refetchTasks();
                      }
                    }
                    // 同时刷新项目详情（更新进度等信息）
                    refetchProjectDetail();
                  }}
                />
              </motion.div>
            )}

            {selectedTab === 'team' && (
              <motion.div
                key="team"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                <ProjectTeamPanel
                  members={projectMembersToTeamMembers(projectDetail?.members || [])}
                  onAddMember={() => console.log('添加成员')}
                  projectId={projectId}
                  onRemoveMember={(memberId) => {
                    // 刷新项目详情数据以更新成员列表
                    if (projectDetail) {
                      // 使用延迟时间，确保后端已处理完毕
                      setTimeout(() => {
                        // 使用不会触发额外提示的方式刷新数据
                        queryClient.refetchQueries({ queryKey: ['project', projectId], exact: true });
                      }, 500);
                    }
                  }}
                  onSwitchToTeamTab={() => setSelectedTab('team')}
                />
              </motion.div>
            )}

            {selectedTab === 'files' && (
              <motion.div
                key="files"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
              >
                <ProjectFilesPanel
                  files={[]}
                  onUploadFile={() => console.log('上传文件')}
                  onCreateFolder={() => console.log('创建文件夹')}
                />
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>

        {/* AI分析弹窗 */}
        <AiAnalysisModal
          isOpen={isAiAnalysisModalOpen}
          onClose={handleAiAnalysisClose}
          projectId={projectId}
          conversationListId={conversationListId}
        />

        {/* 创建任务弹窗 */}
        <AnimatePresence>
          {isCreateTaskModalOpen && (
            <CreateTaskConfirmModal
              isOpen={isCreateTaskModalOpen}
              onClose={handleTaskModalClose}
              projectId={projectId}
              initialData={taskAnalysisData}
              onConfirm={() => {
                // 标记需要刷新任务列表
                setShouldRefreshTasks(true);
              }}
            />
          )}
        </AnimatePresence>

        {/* 分享功能即将推出模态框 */}
        <ComingSoonModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title="项目分享"
          description="项目分享功能正在开发中，您将能够与团队成员共享项目，分配访问权限，并通过链接邀请新成员加入。"
          icon={<FiShare2 size={42} className="text-blue-500" />}
        />

        <AnimatePresence>
          {isTaskDetailModalOpen && selectedTaskId && (
            <>
              {/* 根据当前视图和点击来源选择合适的任务详情弹窗 */}
              {shouldUseSubTaskModal(currentView) || taskClickSource === 'overview' ? (
                <SubTaskDetailModal
                  isOpen={isTaskDetailModalOpen}
                  onClose={handleCloseTaskDetail}
                  taskId={selectedTaskId}
                  projectId={projectId}
                  onTaskUpdated={(updatedTask) => {
                    // 标记需要刷新任务列表
                    setShouldRefreshTasks(true);
                  }}
                  projectMembers={projectDetail?.members ? projectMembersToTeamMembers(projectDetail.members) : []}
                  isSubTaskFocused={shouldUseSubTasks()}
                  currentView={currentView}
                />
              ) : (
                <TaskDetailModal
                  isOpen={isTaskDetailModalOpen}
                  onClose={handleCloseTaskDetail}
                  taskId={selectedTaskId}
                  projectId={projectId}
                  onTaskUpdated={(updatedTask) => {
                    // 标记需要刷新任务列表
                    setShouldRefreshTasks(true);
                  }}
                  projectMembers={projectDetail?.members ? projectMembersToTeamMembers(projectDetail.members) : []}
                />
              )}
            </>
          )}
        </AnimatePresence>
      </>
    </MainLayout>
  );
};

export default ProjectDetailTemplate;
