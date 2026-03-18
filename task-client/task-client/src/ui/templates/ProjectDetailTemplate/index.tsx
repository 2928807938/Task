"use client";

import React, {useEffect, useMemo, useState} from 'react';
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
import type {TaskSplitData} from '@/ui/organisms/CreateTaskConfirmModal/types/types';
import {
    ANALYSIS_COMPLETE_EVENT,
    analysisEventEmitter
} from '@/ui/organisms/CreateTaskConfirmModal/utils/analysisEventEmitter';
import {FiShare2} from 'react-icons/fi';
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

const ProjectDetailTemplate: React.FC<ProjectDetailTemplateProps> = ({ projectId }) => {
  const queryClient = useQueryClient(); // 获取 queryClient 实例
  const [selectedTab, setSelectedTab] = useState<TabType>('overview');
  const [isAiAnalysisModalOpen, setIsAiAnalysisModalOpen] = useState(false);
  const [isPreparingAiAnalysis, setIsPreparingAiAnalysis] = useState(false);
  const [conversationListId, setConversationListId] = useState<string | null>(null);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [taskAnalysisData, setTaskAnalysisData] = useState<TaskSplitData | null>(null);
  const [taskPage, setTaskPage] = useState(1);
  const [taskPageSize, setTaskPageSize] = useState(10);
  // 当前视图状态
  const [currentView, setCurrentView] = useState<'list' | 'board' | 'calendar' | 'gantt'>('list');
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
    const handleAnalysisComplete = (data: TaskSplitData & { content?: string }) => {
      console.log('收到分析完成事件:', data);
      
      // 解析分析数据
      let parsedData: TaskSplitData = data;
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
  const { useGetProjectTasks } = useTaskHook();

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

  const allProjectTasks = useMemo<ProjectTask[]>(() => {
    if (Array.isArray(projectDetail?.tasks) && projectDetail.tasks.length > 0) {
      return projectDetail.tasks;
    }

    if (shouldUseSubTasks()) {
      return subTasksData?.content || [];
    }

    return tasksData?.content || [];
  }, [projectDetail?.tasks, subTasksData?.content, tasksData?.content, currentView]);

  const recentProjectTasks = useMemo<ProjectTask[]>(() => {
    return [...allProjectTasks]
      .sort((left, right) => {
        const leftValue = new Date(left.dueDate || left.createdAt || 0).getTime();
        const rightValue = new Date(right.dueDate || right.createdAt || 0).getTime();
        return rightValue - leftValue;
      })
      .slice(0, 5);
  }, [allProjectTasks]);

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
    const unsubscribe = analysisEventEmitter.on(ANALYSIS_COMPLETE_EVENT, () => {
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
        <div className={`-m-4 min-h-full sm:-m-6 md:-m-8 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
            <div className="sticky top-0 z-30 space-y-4 pb-1">
              <ProjectDetailHeader
                projectName={localProjectName}
                projectDescription={localProjectDescription}
                onAddTask={handleAddTask}
                projectId={projectId}
                projectDetail={projectDetail}
                onProjectUpdated={(updatedName, updatedDescription) => {
                  setLocalProjectName(updatedName);
                  setLocalProjectDescription(updatedDescription);
                }}
                onShare={() => setIsShareModalOpen(true)}
              />

              <div className={`rounded-[24px] border p-3 shadow-sm backdrop-blur ${isDarkMode ? 'border-white/10 bg-slate-900/80' : 'border-slate-200/80 bg-white/90'}`}>
                <ProjectDetailTabs
                  selectedTab={selectedTab}
                  onTabChange={(tab) => {
                    setSelectedTab(tab);
                  }}
                />
              </div>
            </div>

            <div className="pb-6">
              <AnimatePresence mode="wait">
                {selectedTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30
                    }}
                  >
                    <ProjectOverviewPanel
                      project={projectDetail}
                      recentTasks={recentProjectTasks}
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
                      type: 'spring',
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
                      projectProgress={projectDetail?.progress}
                      projectTaskCount={projectDetail?.taskCount}
                      projectCompletedTaskCount={projectDetail?.completedTaskCount}
                      onTaskUpdate={() => {
                        if (shouldUseSubTasks()) {
                          if (refetchSubTasks) {
                            refetchSubTasks();
                          }
                        } else {
                          if (refetchTasks) {
                            refetchTasks();
                          }
                        }
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
                      type: 'spring',
                      stiffness: 300,
                      damping: 30
                    }}
                  >
                    <ProjectTeamPanel
                      members={projectMembersToTeamMembers(projectDetail?.members || [])}
                      tasks={allProjectTasks}
                      taskStatusTrend={projectDetail?.taskStatusTrend}
                      onAddMember={() => console.log('添加成员')}
                      projectId={projectId}
                      onRemoveMember={() => {
                        if (projectDetail) {
                          setTimeout(() => {
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
                      type: 'spring',
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
              initialData={taskAnalysisData ?? undefined}
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
                  onTaskUpdated={() => {
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
                  onTaskUpdated={() => {
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
