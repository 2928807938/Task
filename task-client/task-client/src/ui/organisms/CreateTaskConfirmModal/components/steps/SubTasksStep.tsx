"use client";

import React, {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiAlertCircle, FiGrid, FiLayers, FiList, FiPlus} from "react-icons/fi";
import {useTheme} from 'next-themes';
import SubTaskItem, {SubTask} from "../SubTaskItem";
import {useRouter} from 'next/navigation';
import {useToast} from '@/ui/molecules/Toast';
import useTaskHook from '@/hooks/use-task-hook';
import {CreateTaskRequest} from '@/types/api-types';

// 导入SubTaskResponse类型
import {SubTaskResponse} from "../../types/types";

// 确保类型兼容的辅助函数
const convertToSubTask = (subTaskResponse: SubTaskResponse): SubTask => {
  return {
    ...subTaskResponse,
    // 将 assigneeId 从 string|number 转换为 string
    assigneeId: subTaskResponse.assigneeId ? String(subTaskResponse.assigneeId) : undefined
  };
};

const convertToSubTaskResponse = (subTask: SubTask): SubTaskResponse => {
  return {
    ...subTask,
    // 确保有 id
    id: subTask.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  };
};

interface SubTasksStepProps {
  subTasks: SubTaskResponse[];
  setSubTasks: (subTasks: SubTaskResponse[]) => void;
  projectId?: string;
  errors?: {[key: string]: string};
  mainTaskName?: string;
  mainTaskDescription?: string;
  mainTaskAssigneeId?: string;
  mainTaskTotalHours?: number;
  mainTaskPriorityScore?: number;
}

const SubTasksStep: React.FC<SubTasksStepProps> = ({
  subTasks,
  setSubTasks,
  projectId,
  errors,
  mainTaskName,
  mainTaskDescription,
  mainTaskAssigneeId,
  mainTaskTotalHours,
  mainTaskPriorityScore
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const router = useRouter();
  const { addToast } = useToast();
  const { mutateAsync: createTask } = useTaskHook().useCreateTask();

  // 加载状态
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 创建滚动容器的ref
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // 视图模式（列表/网格）
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // 提示信息
  const [showHelpTip, setShowHelpTip] = useState<boolean>(false);

  /**
   * 创建任务的处理方法
   * 调用 /api/client/task/create 接口创建任务
   */
  const handleCreateTask = async () => {
    if (!projectId) {
      addToast('缺少项目 ID', 'error');
      return;
    }

    if (!mainTaskName || !mainTaskDescription) {
      addToast('主任务信息不完整', 'error');
      return;
    }

    // 子任务验证
    if (subTasks.length > 0) {
      const invalidSubTasks: string[] = [];
      subTasks.forEach((subTask, index) => {
        const issues: string[] = [];
        if (!subTask.name?.trim()) {
          issues.push('名称');
        }
        if (!subTask.assigneeId) {
          issues.push('负责人');
        }
        if (!subTask.hours || subTask.hours <= 0) {
          issues.push('工时');
        }
        
        if (issues.length > 0) {
          invalidSubTasks.push(`子任务 ${index + 1}: 缺少${issues.join('、')}`);
        }
      });
      
      if (invalidSubTasks.length > 0) {
        addToast(`子任务验证失败：${invalidSubTasks.join('；')}`, 'error', 5000);
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // 构建任务创建请求数据
      const taskRequestData: CreateTaskRequest = {
        projectId,
        mainTask: {
          name: mainTaskName,
          description: mainTaskDescription,
          assigneeId: String(mainTaskAssigneeId || '0'),
          totalHours: mainTaskTotalHours || 0,
          priorityScore: mainTaskPriorityScore || 50
        },
        subTasks: subTasks.map(subTask => ({
          id: subTask.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // 确保子任务有id字段
          name: subTask.name,
          description: subTask.description || '',
          assigneeId: String(subTask.assigneeId || '0'),
          hours: Number(subTask.hours || 4),
          priorityScore: Number(subTask.priorityScore || 50),
          dependencies: subTask.dependencies || []
        }))
      };

      // 调用创建任务API
      const response = await createTask(taskRequestData);

      // 获取任务ID和子任务ID
      const taskId = response ? response.taskId : 0;
      const subTaskIds = response?.subTaskIds || [];

      // 显示成功提示
      addToast(`任务「${mainTaskName}」创建成功！`, 'success');

      // 初始化两个组件的缓存数据
      // 1. 清空当前组件的子任务数据
      setSubTasks([]);

      // 2. 清空 AiAnalysisModal 组件的数据 - 通过空数据触发事件
      try {
        // 引入 AiAnalysisModal 的事件发射器
        const { analysisEventEmitter, RESET_ANALYSIS_DATA_EVENT } = require('../../utils/analysisEventEmitter');
        // 发送空数据触发初始化
        analysisEventEmitter.emit(RESET_ANALYSIS_DATA_EVENT, {});
      } catch (err) {
        console.log('获取事件发射器失败', err);
      }

      // 延迟关闭，让用户看到成功消息并跳转到任务列表页面
      setTimeout(() => {
        // 跳转到项目任务列表页面
        router.push(`/projects/${projectId}?tab=tasks&highlight=${taskId}`);
      }, 1500);
    } catch (error) {
      // 处理错误，显示错误提示
      let errorMessage = '创建任务失败';
      if (error instanceof Error) {
        errorMessage = `${errorMessage}: ${error.message}`;
      } else if (typeof error === 'object' && error !== null && (error as any).message) {
        errorMessage = `${errorMessage}: ${(error as any).message}`;
      }

      addToast(errorMessage, 'error', 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 检查子任务对象的字段完整性
  React.useEffect(() => {
    if (subTasks && subTasks.length > 0) {
      subTasks.forEach((task, index) => {
        const missingFields = [];
        // 检查SubTaskItem组件中使用的必要字段
        if (!task.id) missingFields.push('id');
        if (!task.name) missingFields.push('name');
        if (!task.priorityScore) missingFields.push('priorityScore');
        if (!task.description && task.description !== '') missingFields.push('description');
      });
    }
  }, [subTasks]);

  // 检查子任务依赖关系和数据
  React.useEffect(() => {
    if (subTasks && subTasks.length > 0) {
      let hasDependencies = false;

      subTasks.forEach((task, index) => {
        if (task.dependencies && task.dependencies.length > 0) {
          hasDependencies = true;
        }
      });
    }
  }, [subTasks]);

  // 子任务变化时滚动到底部
  React.useEffect(() => {
    if (scrollContainerRef.current && subTasks.length > 0) {
      const scrollContainer = scrollContainerRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [subTasks]);

  // 更新子任务
  const updateSubTask = (index: number, updatedSubTask: SubTask) => {
    const newSubTasks = [...subTasks];
    // 将SubTask转换为SubTaskResponse - 使用辅助函数保证类型兼容
    newSubTasks[index] = convertToSubTaskResponse(updatedSubTask);
    setSubTasks(newSubTasks);
  };

  // 移除子任务
  const removeSubTask = (index: number) => {
    const newSubTasks = [...subTasks];
    newSubTasks.splice(index, 1);
    setSubTasks(newSubTasks);
  };

  // 添加新子任务
  const addNewSubTask = () => {
    // 生成唯一的ID
    const newId = `T${subTasks.length + 1}`;
    const newSubTask: SubTaskResponse = {
      id: newId, // 使用符合预期格式的ID，如T1, T2等
      name: `子任务 ${subTasks.length + 1}`,
      description: "",
      priorityScore: 50,
      dependencies: [] // 确保dependencies数组存在
    };

    setSubTasks([...subTasks, newSubTask]);
  };

  return (
    <div className="space-y-5">
      {/* 子任务错误显示 */}
      {errors?.subTasks && (
        <div className="mb-4 flex items-start px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
          <FiAlertCircle className="flex-shrink-0 text-red-500 mr-2 mt-0.5" size={14} />
          <div className="flex-1">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              {errors.subTasks}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 mr-2">
            <FiLayers className="text-blue-500 dark:text-blue-400" size={18} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">子任务管理</h3>


        </div>

        <div className="flex items-center gap-2">
          {/* 视图切换 */}
          <div className={`flex rounded-lg overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 py-1.5 text-xs flex items-center gap-1 ${viewMode === 'list' ? (isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800') : (isDarkMode ? 'bg-transparent text-gray-400' : 'bg-transparent text-gray-500')}`}
            >
              <FiList size={12} />
              列表
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 py-1.5 text-xs flex items-center gap-1 ${viewMode === 'grid' ? (isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800') : (isDarkMode ? 'bg-transparent text-gray-400' : 'bg-transparent text-gray-500')}`}
            >
              <FiGrid size={12} />
              网格
            </button>
          </div>
        </div>
      </div>

      {/* 空状态展示*/}
      {subTasks.length === 0 ? (
        <motion.div
          className={`flex flex-col items-center justify-center p-10 border border-dashed ${isDarkMode ? 'border-gray-700/50 bg-gray-800/30' : 'border-gray-200 bg-gray-50/60'} rounded-xl backdrop-blur-sm`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-b from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 shadow-inner">
              <FiList className="text-blue-500 dark:text-blue-400" size={32} />
            </div>
            <p className="text-gray-600 dark:text-gray-300 font-medium text-lg mb-2">无子任务</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">子任务可以让您将大型任务分解为更小的、可管理的任务，提高工作效率</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-4 px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg flex items-center text-sm font-medium shadow-sm mx-auto"
              onClick={addNewSubTask}
            >
              <FiPlus className="mr-1.5" size={16} />
              添加子任务
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <>


          {/* 子任务列表容器 - 苹果风格卡片组 */}
          <div
            ref={scrollContainerRef}
            className={`space-y-3 ${viewMode === 'grid' ? '' : 'max-h-[calc(100vh-400px)] overflow-y-auto pr-2'}`}
          >
            <AnimatePresence>
              {viewMode === 'list' ? (
                // 列表视图
                subTasks.map((subTask, index) => (
                  <motion.div
                    key={subTask.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.05
                    }}
                  >
                    <SubTaskItem
                      subTask={{
                        ...convertToSubTask(subTask),
                        // 确保依赖关系数据存在
                        dependencies: subTask.dependencies || []
                      }}
                      index={index}
                      updateSubTask={updateSubTask}
                      removeSubTask={removeSubTask}
                      projectId={projectId}
                      allSubTasks={subTasks.map(convertToSubTask)}
                      isMobile={false}
                    />
                  </motion.div>
                ))
              ) : (
                // 网格视图 - 每行2个
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subTasks.map((subTask, index) => (
                    <motion.div
                      key={subTask.id || index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.05
                      }}
                    >
                      <SubTaskItem
                        subTask={{
                          ...convertToSubTask(subTask),
                          // 确保依赖关系数据存在
                          dependencies: subTask.dependencies || []
                        }}
                        index={index}
                        updateSubTask={updateSubTask}
                        removeSubTask={removeSubTask}
                        projectId={projectId}
                        allSubTasks={subTasks.map(convertToSubTask)}
                        isMobile={true}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
};

export default SubTasksStep;
