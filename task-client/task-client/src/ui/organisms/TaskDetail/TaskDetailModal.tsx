import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiAlertCircle} from 'react-icons/fi';
import {ProjectTask} from '@/types/api-types';
// 导入新的苹果风格任务编辑器
import TaskEditor from './TaskEditor';

// 导入自定义组件
import TaskDetailHeader from './TaskDetailHeader';
import TaskDetailTabs from './TaskDetailTabs';
import TaskDetailContent from './TaskDetailContent';
import SubtasksList from './SubtasksList';
import TaskCommentSection from '@/ui/organisms/TaskCommentSection';
// 导入useTaskApi hook
import useTaskHook from '@/hooks/use-task-hook';

interface TaskComment {
  id: string;
  content: string;
  author?: string;
  avatarUrl?: string;
  createdAt?: string;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string; // 使用taskId替代taskData
  projectId?: string;
  onTaskUpdated?: (updatedTask: ProjectTask) => void;
  projectMembers?: Array<{ id: string; name: string; avatar?: string }>;
  currentUserId?: string; // 当前用户ID，用于评论系统
}

/**
 * 任务详情模态框组件，遵循苹果设计规范
 */
const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  taskId,
  projectId = '',
  onTaskUpdated,
  projectMembers = [],
  currentUserId
}) => {
  // 使用useTaskApi hook获取useGetTaskWithSubtasks
  const { useGetTaskWithSubtasks } = useTaskHook();

  // 在组件内部获取任务详情
  const {
    data: taskData,
    isLoading,
    error
  } = useGetTaskWithSubtasks(taskId, {
    enabled: isOpen && !!taskId, // 只在模态框打开且taskId存在时获取数据
    staleTime: 30000 // 缓存30秒，避免重复请求
  });

  // 状态管理
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments'>('details');
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  // 新增：跟踪正在编辑的子任务
  const [editingSubtask, setEditingSubtask] = useState<ProjectTask | null>(null);

  // 引用弹窗内容区域，用于实现平滑滚动
  const contentRef = useRef<HTMLDivElement>(null);

  // 重置Tab状态
  useEffect(() => {
    if (isOpen) {
      setActiveTab('details');
      // 清空编辑状态
      setIsEditorOpen(false);
      setEditingSubtask(null);
    }
  }, [isOpen]);

  // 在弹窗打开时禁用背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // 添加键盘事件监听器，支持ESC键关闭弹窗
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'auto';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // 处理任务更新 - 支持部分更新
  const handleTaskUpdated = (updatedTask: ProjectTask | Partial<ProjectTask>) => {
    // 如果是完整的任务对象（来自编辑器），直接调用回调
    if ('id' in updatedTask && updatedTask.id) {
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask as ProjectTask);
      }
      // 关闭编辑器
      setIsEditorOpen(false);
      // 清空编辑中的子任务
      setEditingSubtask(null);
    } else {
      // 如果是部分更新（来自内联编辑），构造完整的任务对象
      if (taskData?.mainTask && onTaskUpdated) {
        const fullUpdatedTask: ProjectTask = {
          ...taskData.mainTask,
          ...updatedTask
        };
        onTaskUpdated(fullUpdatedTask);
      }
    }
  };

  // 处理子任务的编辑
  const handleEditSubtask = (subtask: ProjectTask) => {
    setEditingSubtask(subtask);
    setIsEditorOpen(true);
  };

  // 渲染加载状态
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center p-8 h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-500 dark:text-gray-400">加载任务详情...</p>
    </div>
  );

  // 渲染错误状态
  const renderError = () => (
    <div className="flex flex-col items-center justify-center p-8 h-64">
      <div className="text-red-500 mb-4 text-4xl">
        <FiAlertCircle />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">加载失败</h3>
      <p className="text-gray-500 dark:text-gray-400 text-center">
        {error?.message || '获取任务详情失败，请稍后重试'}
      </p>
    </div>
  );

  // 格式化评论数据
  const formatComments = (comments: any[] = []): TaskComment[] => {
    return comments.map(comment => ({
      id: comment.id || `comment-${Math.random().toString(36).substring(2, 9)}`,
      content: comment.content || '',
      author: comment.author || comment.createdBy || '匿名用户',
      createdAt: comment.createdAt || new Date().toISOString()
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-slate-950/38 p-4 backdrop-blur-md sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
          onClick={onClose}
        >
          <motion.div
            className="flex max-h-[92vh] w-full max-w-[880px] flex-col overflow-hidden rounded-[30px] border border-card-border/70 bg-white/88 shadow-[0_28px_90px_rgba(15,23,42,0.22)] backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-950/82"
            initial={{ scale: 0.98, opacity: 0, y: 5 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            {/* 编辑器模式 - 可能是主任务或子任务 */}
            {isEditorOpen && (editingSubtask || taskData?.mainTask) ? (
              <>
                <TaskDetailHeader
                  title={editingSubtask ? "编辑子任务" : "编辑任务"}
                  onClose={() => {
                    setIsEditorOpen(false);
                    setEditingSubtask(null);
                  }}
                  showEditButton={false}
                />
                <div className="flex-1 overflow-y-auto bg-neutral-50/70 p-4 dark:bg-slate-950/70">
                  {/* 确保task属性总是有一个有效的ProjectTask对象 */}
                  {(editingSubtask || taskData?.mainTask) && (
                    <TaskEditor
                      task={editingSubtask || taskData!.mainTask}
                      projectId={projectId}
                      onCancel={() => {
                        setIsEditorOpen(false);
                        setEditingSubtask(null);
                      }}
                      onSave={handleTaskUpdated}
                      projectMembers={projectMembers}
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                {/* 加载状态 */}
                {isLoading ? (
                  <>
                    <TaskDetailHeader title="加载中..." onClose={onClose} showEditButton={false} />
                    <div className="flex-1 overflow-y-auto">
                      {renderLoading()}
                    </div>
                  </>
                ) : error ? (
                  <>
                    <TaskDetailHeader title="错误" onClose={onClose} showEditButton={false} />
                    <div className="flex-1 overflow-y-auto">
                      {renderError()}
                    </div>
                  </>
                ) : taskData?.mainTask ? (
                  <>
                    {/* 标题栏 */}
                    <TaskDetailHeader
                      title="任务详情"
                      id={taskData.mainTask.id}
                      meta={`创建于 ${new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' }).format(new Date(taskData.mainTask.createdAt || Date.now()))}`}
                      onClose={onClose}
                      onEdit={() => setIsEditorOpen(true)}
                      showEditButton={!!projectId}
                    />

                    {/* 标签页导航 */}
                    <TaskDetailTabs
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                      subtasksCount={taskData.subTasks?.length || 0}
                      commentsCount={0} // 这里可以从评论统计中获取
                    />

                    {/* 内容区域 */}
                    <div ref={contentRef} className="flex-1 overflow-y-auto bg-neutral-50/70 dark:bg-slate-950/70">
                      <AnimatePresence mode="wait">
                        {activeTab === 'details' ? (
                          <motion.div
                            key="details"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <TaskDetailContent
                              task={taskData.mainTask}
                              completedTaskCount={taskData.completedTaskCount}
                              totalTaskCount={taskData.totalTaskCount}
                              overallProgress={taskData.overallProgress}
                              onTaskUpdate={handleTaskUpdated}
                              projectMembers={projectMembers}
                            />

                          </motion.div>
                        ) : activeTab === 'subtasks' ? (
                          <motion.div
                            key="subtasks"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="p-6"
                          >
                            <SubtasksList
                              subtasks={taskData.subTasks || []}
                              onToggleStatus={(taskId, status) => {
                                // 这里可以添加切换任务状态的实现
                              }}
                              onViewSubtask={(task) => {
                                // 这里可以添加查看子任务的实现
                              }}
                              onEditSubtask={handleEditSubtask}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="comments"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="p-6"
                          >
                            <TaskCommentSection
                              taskId={taskId}
                              projectId={projectId}
                              currentUserId={currentUserId}
                              showStats={true}
                              allowCreateComment={true}
                              allowEditComment={true}
                              allowDeleteComment={true}
                              maxNestingLevel={3}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 不再需要底部信息栏，因为创建日期已在任务详情中显示 */}
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    没有任务数据
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailModal;
