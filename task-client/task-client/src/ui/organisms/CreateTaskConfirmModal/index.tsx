"use client";

import React, {useCallback, useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {useTheme} from 'next-themes';
import {useQueryClient} from '@tanstack/react-query';

// 导入苹果风格组件
import {BasicInfoStep, SubTasksStep, TimeAndPriorityStep} from './components/steps';
import TaskFormHeader from './components/TaskFormHeader';
import GlobalStyles from '@/ui/atoms/GlobalStyles';

// 导入自定义hooks和工具函数
import {useTaskAnalysis, useTaskForm} from './hooks';
import {AnalysisLoadingView, ErrorView} from './components';

// 导入API服务
import {taskApi} from '@/adapters/api/task-api';
import {CreateTaskRequest, MainTask, SubTaskItem} from '@/types/api-types';

// 导入关闭模态框事件
import {closeAiAnalysisModal} from './utils/closeModalEvent';

// 导入统一类型定义
import {CreateTaskConfirmModalProps, CreateTaskData} from './types/types';

// 注：转移到了 utils/taskDataUtils.ts 中
// 这里只是占位提示，实际上下面会引入这些工具函数

/* ------------------------------------------------------------
 * 主组件
 * ---------------------------------------------------------- */
const CreateTaskConfirmModal: React.FC<CreateTaskConfirmModalProps> = ({
  isOpen,
  onClose,
  projectId,
  initialData = {},
  onAnalysisComplete,
  onConfirm
}) => {
  /* ---------- 主题 ---------- */
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  /* ---------- 查询客户端用于缓存管理 ---------- */
  const queryClient = useQueryClient();

  // 添加视图状态控制，确保加载视图完全关闭后再显示表单视图
  const [showLoadingView, setShowLoadingView] = useState(true); // 默认显示加载视图
  const [showFormView, setShowFormView] = useState(false);
  const [loadingExitComplete, setLoadingExitComplete] = useState(false);

  /* ---------- 使用自定义Hooks替代内联逻辑 ---------- */
  // 分析状态hook - 处理SSE和数据流
  const {
    streamingData,
    streamingComplete,
    streamingError,
    isLoading,
    parallelismScore,
    parallelTips,
    restartAnalysis // 新增重新分析方法
  } = useTaskAnalysis({
    isOpen,
    projectId,
    initialData,
    onAnalysisComplete: (data) => {
      // 处理关闭弹框的标识
      if (data && data.closeModal) {
        // 关闭弹框
        setShowLoadingView(false);
        // 如果有外部回调，也调用它
        if (onAnalysisComplete) {
          onAnalysisComplete(data);
        }
        // 如果没有有效数据，也关闭整个模态框
        if (!data.content || data.content === '{}') {
          onClose();
        }
      } else if (onAnalysisComplete) {
        // 正常处理
        onAnalysisComplete(data);
      }
    }
  });

  // 创建任务状态
  const [createTaskLoading, setCreateTaskLoading] = useState(false);
  const [createTaskError, setCreateTaskError] = useState<string | null>(null);

  // 创建任务函数
  const createTask = async (taskData: CreateTaskData) => {
    if (!projectId) {
      console.error('创建任务失败: 缺少项目ID');
      setCreateTaskError('创建任务失败: 缺少项目ID');
      return;
    }

    setCreateTaskLoading(true);
    setCreateTaskError(null);

    try {
      // 转换为API请求格式
      const mainTask: MainTask = {
        name: taskData.name,
        description: taskData.description,
        assigneeId: taskData.assigneeId?.toString() || '',
        totalHours: taskData.totalHours,
        priorityScore: taskData.priorityScore,
        endTime: taskData.endTime // 添加截止时间字段
      };

      let subTaskItems: SubTaskItem[] | undefined;

      if (taskData.subTasks && taskData.subTasks.length > 0) {
        subTaskItems = taskData.subTasks.map(st => ({
          name: st.name,
          description: st.description || '',
          assigneeId: st.assigneeId?.toString() || '',
          hours: st.hours || 0,
          priorityScore: st.priorityScore || 0,
          dependencies: st.dependencies || []
        }));
      }

      const requestData: CreateTaskRequest = {
        projectId,
        mainTask,
        subTasks: subTaskItems
      };

      const response = await taskApi.createTask(requestData);

      // 使任务列表相关的查询缓存失效，确保列表刷新
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'taskTree'] });

      // 如果有外部传入的onConfirm回调，则调用
      if (onConfirm) {
        await onConfirm(taskData);
      }

      // 关闭模态框
      onClose();

      // 确保弹窗关闭 - 增加一个延时关闭，防止首次关闭不生效
      window.dispatchEvent(new CustomEvent('forceCloseModal'));

      // 同时关闭AI分析模态框
      closeAiAnalysisModal();

      // 再决定性的尝试一次
      setTimeout(() => {
        if (isOpen) {
          onClose();
          window.dispatchEvent(new CustomEvent('forceCloseModal'));
        }
      }, 300);
    } catch (error) {
      console.error('创建任务失败:', error);
      setCreateTaskError('创建任务失败，请稍后重试');
    } finally {
      setCreateTaskLoading(false);
    }
  };

  // 表单状态hook - 处理表单状态和验证
  const {
    taskName, setTaskName,
    taskDescription, setTaskDescription,
    assigneeId, setAssigneeId,
    totalHours, setTotalHours,
    priorityScore, setPriorityScore,
    subTasks, setSubTasks,
    includeSubTasks, setIncludeSubTasks,
    dueDate, setDueDate,
    errors, setErrors,
    isFormValid,
    isSubmitting, // 解构提交中状态
    handleConfirm: submitForm
  } = useTaskForm({
    streamingData,
    streamingComplete,
    onConfirm: createTask,
    onClose
  });

  // 已移至useTaskAnalysis自定义hook中

  // 所有表单处理逻辑和SSE处理逻辑已移至自定义hooks

  /* ---------- 视图状态管理 ---------- */
  // 使用useCallback封装视图退出完成回调
  const handleExitComplete = useCallback(() => {
    setLoadingExitComplete(true);
  }, []);

  // 简化状态管理逻辑，避免循环依赖
  useEffect(() => {
    // 模态框初始化或关闭时重置状态
    if (!isOpen) {
      setShowLoadingView(true);
      setShowFormView(false);
      setLoadingExitComplete(false);
      return;
    }

    // 检查是否有有效的初始数据
    const hasValidInitialData = initialData && (
      (initialData.mainTask && initialData.mainTask.name) || 
      (initialData.main_task && initialData.main_task.name) || 
      (initialData.subTasks && initialData.subTasks.length > 0) ||
      (initialData.sub_tasks && initialData.sub_tasks.length > 0)
    );

    // 如果有有效初始数据，直接显示表单视图
    if (hasValidInitialData && !showFormView) {
      console.log('有初始数据，直接显示表单', initialData);
      setShowLoadingView(false);
      setShowFormView(true);
      setLoadingExitComplete(true);
      return;
    }

    // 当数据加载完成时处理视图切换
    if (streamingData && streamingComplete && showLoadingView) {
      setShowLoadingView(false);
    }
  }, [isOpen, initialData, streamingData, streamingComplete, showLoadingView, showFormView]);

  // 单独监听加载视图退出完成事件
  useEffect(() => {
    if (loadingExitComplete && !showFormView && isOpen) {
      setShowFormView(true);
    }
  }, [loadingExitComplete, showFormView, isOpen]);

  // 添加监听强制关闭事件
  useEffect(() => {
    const handleForceClose = () => {
      onClose();
    };

    window.addEventListener('forceCloseModal', handleForceClose);
    return () => window.removeEventListener('forceCloseModal', handleForceClose);
  }, [onClose]);

  /* ---------- 初始渲染和错误处理 ---------- */
  if (!isOpen) return null;
  if (streamingError) {
    return <ErrorView error={streamingError} onClose={onClose} />;
  }


  /* ----------------------------------------------------------
   * 渲染主弹窗
   * -------------------------------------------------------- */
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* 加载视图 */}
          <AnimatePresence
            mode="wait"
            onExitComplete={handleExitComplete}
          >
            {showLoadingView && (
              <motion.div
                key="loading-view"
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }} // 减少退出动画时间，加快关闭速度
              >
                <AnalysisLoadingView onClose={() => {
                  setShowLoadingView(false);
                  // 如果没有有效数据，关闭整个模态框
                  if (!streamingData || Object.keys(streamingData).length === 0) {
                    onClose();
                  }
                }} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 表单内容视图 - 只在加载完成并且加载视图退出后显示 */}
          <AnimatePresence>
            {showFormView && !showLoadingView && (
              <motion.div
                key="form-view"
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-md overflow-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ paddingTop: '2vh', paddingBottom: '2vh' }}
              >
                <motion.div
                  className="bg-white dark:bg-gray-900 rounded-lg w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col my-2 max-h-[90vh] overflow-hidden"
                  initial={{ scale: 0.95, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.95, y: 10, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{
                    boxShadow: isDarkMode ?
                      '0 10px 20px -8px rgba(0, 0, 0, 0.4), 0 6px 12px -6px rgba(0, 0, 0, 0.2)' :
                      '0 10px 20px -8px rgba(0, 0, 0, 0.12), 0 6px 12px -6px rgba(0, 0, 0, 0.06)'
                  }}
                  onClick={e => {
                    e.stopPropagation(); // 阻止事件冒泡到背景
                  }}
                >
                  {/* 全局样式 */}
                  <GlobalStyles />

                  {/* 头部 */}
                  <TaskFormHeader
                    title={streamingData && streamingComplete ? "创建新任务" : "创建任务"}
                    subTasksCount={subTasks.length}
                    includeSubTasks={includeSubTasks}
                    onClose={() => {
                      onClose();
                    }}
                  />

                  {/* 内容区域 - 使用条件渲染区分加载状态和表单内容 */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex-1 overflow-y-auto relative"
                  >
                    {/* 表单内容总是显示，但在加载状态下被禁用 */}
                    {/* 内容区域 - 始终显示，但在加载时透明度降低 */}
                    <div
                      className={`flex-1 overflow-y-auto px-3 py-2 space-y-3 ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                      {/* 并行度提示 */}
                      {parallelismScore !== null && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="p-3 rounded-lg bg-blue-50/80 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 backdrop-blur-sm shadow-sm"
                        >
                          <div className="font-medium text-xs mb-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H7a1 1 0 00-1 1v3a1 1 0 001 1h2v3a1 1 0 001 1h3a1 1 0 100-2h-1a1 1 0 00-1-1v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            并行度：{parallelismScore}/100
                          </div>
                          <p className="leading-relaxed">{parallelTips}</p>
                        </motion.div>
                      )}

                      {/* 苹果风格分区：主任务信息 */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-gray-50/90 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-200/80 dark:border-gray-700/40 backdrop-blur-sm shadow-sm"
                      >
                        <h3 className="text-sm font-medium mb-2 text-gray-800 dark:text-gray-200">主任务信息</h3>

                        {/* 基本信息表单 */}
                        <BasicInfoStep
                          taskName={taskName}
                          setTaskName={(newName) => {
                            // 当任务名称变化时重新分析
                            setTaskName(newName);
                            // 仅在名称有效且变化时重新分析
                            if (newName && newName !== taskName) {
                              restartAnalysis(taskDescription || newName);
                            }
                          }}
                          taskDescription={taskDescription}
                          setTaskDescription={(newDesc) => {
                            // 当任务描述变化时重新分析
                            setTaskDescription(newDesc);
                            // 仅在描述有效且变化时重新分析
                            if (newDesc && newDesc !== taskDescription && newDesc.length > 10) {
                              restartAnalysis(newDesc);
                            }
                          }}
                          assigneeId={assigneeId}
                          setAssigneeId={setAssigneeId}
                          errors={errors}
                          projectId={projectId}
                        />

                        {/* 时间和优先级表单 */}
                        <TimeAndPriorityStep
                          totalHours={totalHours}
                          setTotalHours={setTotalHours}
                          priorityScore={priorityScore}
                          setPriorityScore={setPriorityScore}
                          dueDate={dueDate}
                          setDueDate={setDueDate}
                          errors={errors}
                        />
                      </motion.div>

                      {/* 苹果风格分区：子任务管理 */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-gray-50/90 dark:bg-gray-800/60 rounded-lg border border-gray-200/80 dark:border-gray-700/40 backdrop-blur-sm shadow-sm overflow-hidden"
                      >
                        <div className="p-3">
                          {/* 子任务列表 */}
                          {(
                            <>
                              <SubTasksStep
                                subTasks={subTasks}
                                setSubTasks={setSubTasks}
                                projectId={projectId}
                                errors={errors}
                                mainTaskName={taskName}
                                mainTaskDescription={taskDescription}
                                mainTaskAssigneeId={assigneeId}
                                mainTaskTotalHours={totalHours}
                                mainTaskPriorityScore={priorityScore}
                              />
                            </>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* 底部操作区 - 只显示创建任务按钮 */}
                  <div className="p-2 border-t border-gray-100 dark:border-gray-800/70 backdrop-blur-sm">
                    {createTaskError && (
                      <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-xs">
                        {createTaskError}
                      </div>
                    )}
                    {/* 苹果风格创建任务主按钮 */}
                    <div className="flex justify-center mb-1">
                      <button
                        onClick={submitForm}
                        disabled={isSubmitting || isLoading || createTaskLoading || !isFormValid}
                        className={`
                          w-full md:w-32 px-3 py-1.5 rounded-full font-medium text-xs
                          transition-all duration-300 ease-in-out transform
                          flex items-center justify-center space-x-1
                          focus:outline-none focus:ring-1 focus:ring-blue-300/50 dark:focus:ring-blue-800/50
                          ${isSubmitting || isLoading || createTaskLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-102 active:scale-98'}
                          ${!isFormValid ? 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:shadow-md'}
                        `}
                      >
                        {isSubmitting || isLoading || createTaskLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>处理中...</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            <span>创建任务</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateTaskConfirmModal;
