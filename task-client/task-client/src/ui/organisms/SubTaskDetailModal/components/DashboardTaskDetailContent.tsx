'use client';

import React, {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {
  FiCheck,
  FiClock, 
  FiCalendar, 
  FiActivity,
  FiChevronRight,
  FiAlertCircle,
  FiFileText,
  FiUser,
  FiTag,
  FiEdit3
} from 'react-icons/fi';
import {ProjectTask, StatusItem, PriorityItem} from '@/types/api-types';
import {useTheme} from '@/ui/theme';
import {taskApi} from '@/adapters/api/task-api';
import useTaskHook from '@/hooks/use-task-hook';
import {Avatar} from '@/ui/atoms/Avatar';
import DatePicker from '@/ui/molecules/DatePicker';

interface DashboardTaskDetailContentProps {
  task: ProjectTask;
  onTaskUpdate?: (updatedTask: ProjectTask) => void;
  projectId?: string;
  isEditing?: boolean;
  projectMembers?: Array<{ id: string; name: string; avatar?: string }>;
}

interface EditingState {
  field: string | null;
  value: any;
}

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Dashboard 任务详情内容组件 - 苹果风格设计
 * 
 * 设计原则：
 * - 极简主义，减少视觉噪音
 * - 清晰的信息层级
 * - 一致的交互反馈
 * - 优雅的动画过渡
 * - 参数校验和错误处理
 */
const DashboardTaskDetailContent: React.FC<DashboardTaskDetailContentProps> = ({
  task,
  onTaskUpdate,
  projectId,
  isEditing = false,
  projectMembers = []
}) => {
  const { isDark } = useTheme();
  const [editing, setEditing] = useState<EditingState>({ field: null, value: null });
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const [priorityItems, setPriorityItems] = useState<PriorityItem[]>([]);
  const [isLoadingPriorities, setIsLoadingPriorities] = useState(false);

  // 使用统一的 editTask 接口
  const { useEditTask } = useTaskHook();
  const { mutate: editTask, isPending: isTaskEditing } = useEditTask();

  // 获取任务状态列表 - 参考外面列表的实现
  const fetchTaskStatuses = async (taskId: string) => {
    if (!taskId) {
      console.error('未提供有效的任务ID');
      return;
    }

    setIsLoadingStatuses(true);
    try {
      const result = await taskApi.getTaskStatuses(taskId);
      if (result.code === '200' || result.code.startsWith('2')) {
        // 处理不同的响应格式
        let statusList: StatusItem[] = [];
        if (Array.isArray(result.data)) {
          statusList = result.data;
        } else if (result.data && typeof result.data === 'object' && 'items' in result.data && Array.isArray((result.data as any).items)) {
          statusList = (result.data as any).items;
        }
        setStatusItems(statusList);
      } else {
        console.error(`获取任务 ${taskId} 状态列表失败:`, result.message);
      }
    } catch (error) {
      console.error(`获取任务 ${taskId} 状态列表异常:`, error);
    } finally {
      setIsLoadingStatuses(false);
    }
  };

  // 获取任务优先级列表
  const fetchTaskPriorities = async (projectId: string) => {
    if (!projectId) {
      console.error('未提供有效的项目ID');
      return;
    }

    setIsLoadingPriorities(true);
    try {
      const result = await taskApi.getProjectPriorityList(projectId);
      if (result.code === '200' || result.code.startsWith('2')) {
        // 处理不同的响应格式
        let priorityList: PriorityItem[] = [];
        if (Array.isArray(result.data)) {
          priorityList = result.data;
        } else if (result.data && typeof result.data === 'object' && 'items' in result.data && Array.isArray((result.data as any).items)) {
          priorityList = (result.data as any).items;
        }
        setPriorityItems(priorityList);
      } else {
        console.error(`获取项目 ${projectId} 优先级列表失败:`, result.message);
      }
    } catch (error) {
      console.error(`获取项目 ${projectId} 优先级列表异常:`, error);
    } finally {
      setIsLoadingPriorities(false);
    }
  };

  // 在组件加载时获取状态和优先级列表
  useEffect(() => {
    if (task?.id) {
      fetchTaskStatuses(task.id);
    }
    if (projectId) {
      fetchTaskPriorities(projectId);
    }
  }, [task?.id, projectId]);

  // 参数校验函数
  const validateField = (field: string, value: any): ValidationError | null => {
    switch (field) {
      case 'title':
        if (!value || value.trim() === '') {
          return { field, message: '任务标题不能为空' };
        }
        if (value.length > 100) {
          return { field, message: '任务标题不能超过100个字符' };
        }
        break;
      case 'description':
        if (value && value.length > 1000) {
          return { field, message: '任务描述不能超过1000个字符' };
        }
        break;
      case 'statusId':
        if (!value || value.trim() === '') {
          return { field, message: '请选择任务状态' };
        }
        if (!statusItems.find(status => status.id === value)) {
          return { field, message: '选择的状态无效' };
        }
        break;
      case 'priority':
        if (!value || value.trim() === '') {
          return { field, message: '请选择任务优先级' };
        }
        if (!priorityItems.find(priority => priority.id === value)) {
          return { field, message: '选择的优先级无效' };
        }
        break;
      case 'assigneeId':
        if (!value || value.trim() === '') {
          return { field, message: '请选择负责人' };
        }
        if (!projectMembers.find(member => member.id === value)) {
          return { field, message: '选择的负责人无效' };
        }
        break;
      case 'startTime':
        if (value && isNaN(new Date(value).getTime())) {
          return { field, message: '开始时间格式无效' };
        }
        // 检查开始时间不能晚于截止时间
        if (value && task.dueDate) {
          const startDate = new Date(value);
          const dueDate = new Date(task.dueDate);
          if (startDate > dueDate) {
            return { field, message: '开始时间不能晚于截止时间' };
          }
        }
        break;
      case 'dueDate':
        if (value && isNaN(new Date(value).getTime())) {
          return { field, message: '截止时间格式无效' };
        }
        // 检查截止时间不能早于开始时间
        if (value && task.startTime) {
          const startDate = new Date(task.startTime);
          const dueDate = new Date(value);
          if (dueDate < startDate) {
            return { field, message: '截止时间不能早于开始时间' };
          }
        }
        break;
    }
    return null;
  };

  // 苹果风格：自动保存编辑器
  const handleFieldChange = async (field: string, newValue: any) => {
    // 实时更新编辑状态
    setEditing({ field, value: newValue });
    
    // 清除之前的验证错误
    setValidationError(null);
    
    // 防抖保存 - 延迟500ms后自动保存
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      await saveFieldValue(field, newValue);
    }, 500);
  };
  
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  // 当编辑模式切换时，清除当前编辑状态
  React.useEffect(() => {
    if (!isEditing) {
      setEditing({ field: null, value: null });
      setValidationError(null);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    }
  }, [isEditing]);

  // 保存字段值 - 苹果风格自动保存
  const saveFieldValue = async (field: string, value: any) => {
    if (!field || !task?.id) return;

    // 参数校验
    const error = validateField(field, value);
    if (error) {
      setValidationError(error);
      return;
    }

    try {
      // 清除验证错误
      setValidationError(null);

      // 统一使用 editTask 接口处理所有字段更新
      // 处理优先级字段：从priorityItems中根据priority名称查找priorityId
      let currentPriorityId = '';
      if (task.priority && priorityItems.length > 0) {
        const priorityItem = priorityItems.find(p => p.name === task.priority);
        currentPriorityId = priorityItem?.id || '';
      }
      
      // 处理状态字段：优先使用statusId，否则通过status名称查找
      let currentStatusId = task.statusId || '';
      if (!currentStatusId && task.status && statusItems.length > 0) {
        const statusItem = statusItems.find(s => s.name === task.status);
        currentStatusId = statusItem?.id || task.status || '';
      }

      const editTaskData = {
        taskId: task.id,
        title: field === 'title' ? value : (task.title || ''),
        description: field === 'description' ? value : (task.description || ''),
        statusId: field === 'statusId' ? value : currentStatusId,
        priorityId: field === 'priority' ? value : currentPriorityId,
        assigneeId: field === 'assigneeId' ? value : (task.assigneeId || ''),
        dueDate: field === 'dueDate' ? value : (task.dueDate || '')
      };

      editTask(editTaskData, {
        onSuccess: (data) => {
          if (data) {
            onTaskUpdate?.(data);
          }
          // 苹果风格：保存成功后不清除编辑状态，保持编辑模式
        },
        onError: (error) => {
          console.error('更新任务失败:', error);
          setValidationError({
            field: field,
            message: error instanceof Error ? error.message : '更新失败'
          });
        }
      });
    } catch (error) {
      console.error('更新任务失败:', error);
      setValidationError({
        field: field,
        message: error instanceof Error ? error.message : '更新失败'
      });
    }
  };

  // 格式化日期显示
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未设置';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      const diffTime = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return '今天';
      if (diffDays === 1) return '明天';
      if (diffDays === -1) return '昨天';
      if (diffDays > 0 && diffDays <= 7) return `${diffDays}天后`;
      if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)}天前`;
      
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '日期格式错误';
    }
  };

  // 获取日期状态颜色
  const getDateStatusColor = (dateString: string | null) => {
    if (!dateString) return isDark ? 'text-gray-500' : 'text-gray-400';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'text-red-500'; // 已过期
      if (diffDays <= 1) return 'text-orange-500'; // 紧急
      if (diffDays <= 3) return 'text-yellow-500'; // 即将到期
      return isDark ? 'text-gray-300' : 'text-gray-600'; // 正常
    } catch {
      return isDark ? 'text-gray-500' : 'text-gray-400';
    }
  };

  // 渲染表单行组件 - 苹果风格设计
  const FormRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    field: string;
    value: any;
    renderValue: () => React.ReactNode;
    renderEditor: () => React.ReactNode;
    isLast?: boolean;
    disabled?: boolean;
  }> = ({ icon, label, field, value, renderValue, renderEditor, isLast = false, disabled = false }) => {
    const isFieldEditing = editing.field === field;
    const hasError = validationError?.field === field;
    const isFieldUpdating = isTaskEditing;
    const isFieldDisabled = disabled || isLoadingStatuses || isLoadingPriorities || isFieldUpdating;
    
    // 苹果风格：在全局编辑模式下显示编辑界面，否则显示只读内容
    const shouldShowEditor = isEditing && (isFieldEditing || !isFieldEditing);
    const canEdit = isEditing && !isFieldDisabled;

    return (
      <motion.div
        layout
        className={`
          relative overflow-hidden rounded-[24px] border transition-all duration-200 ease-out
          ${hasError
            ? 'border-red-200 bg-red-50/70 dark:border-red-800/40 dark:bg-red-900/10'
            : isEditing
              ? 'border-primary-200 bg-primary-50/40 dark:border-primary-800/40 dark:bg-primary-900/10'
              : 'border-card-border/70 bg-white/82 dark:border-slate-800/80 dark:bg-slate-950/72'
          }
          ${isFieldDisabled ? 'opacity-60' : 'shadow-sm'}
        `}
      >
        <div className="px-4 py-4 sm:px-5">
          <div className="grid gap-4 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-center">
            {/* 图标 */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-50 dark:bg-slate-900/70">
                {icon}
              </div>

              {/* 标签 */}
              <div>
                <span className={`text-sm font-semibold ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                  {label}
                </span>
              </div>
            </div>

            {/* 内容区域 - 苹果风格编辑模式 */}
            <div className="min-w-0">
              {canEdit ? (
                // 编辑模式：直接显示编辑控件
                <div className="space-y-1">
                  {renderEditor()}
                  {/* 实时保存提示 */}
                  {isFieldUpdating && (
                    <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span>保存中...</span>
                    </div>
                  )}
                </div>
              ) : (
                // 只读模式：显示值内容
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {renderValue()}
                  </div>
                  {/* 非编辑模式下不显示箭头，保持简洁 */}
                </div>
              )}
            </div>
          </div>
          
          {/* 错误消息显示 */}
          <AnimatePresence>
            {hasError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="px-4 pb-4 sm:px-5"
              >
                <div className="flex items-center space-x-2 text-sm text-red-500">
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{validationError?.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 基本信息区域 */}
      {/* 任务标题 */}
      <FormRow
        icon={<FiEdit3 className="w-5 h-5 text-blue-500" />}
        label="标题"
        field="title"
        value={task.title}
        renderValue={() => (
          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {task.title || '未设置标题'}
          </span>
        )}
        renderEditor={() => (
          <input
            type="text"
            value={editing.field === 'title' ? editing.value : (task.title || '')}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="输入任务标题"
            className={`
              w-full px-4 py-2.5 rounded-xl border-0 text-sm font-medium
              transition-all duration-200 ease-out
              ${isDark 
                ? 'bg-gray-800 text-white focus:bg-gray-750 placeholder-gray-500' 
                : 'bg-white text-gray-900 focus:bg-gray-50 placeholder-gray-400'
              }
              focus:ring-2 focus:ring-blue-500/50 focus:outline-none
              shadow-sm
            `}
          />
        )}
      />

      {/* 任务描述 */}
      <FormRow
        icon={<FiFileText className="w-5 h-5 text-purple-500" />}
        label="描述"
        field="description"
        value={task.description}
        renderValue={() => (
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} ${!task.description ? 'italic text-gray-400' : ''}`}>
            {task.description || '暂无描述'}
          </span>
        )}
        renderEditor={() => (
          <textarea
            rows={3}
            value={editing.field === 'description' ? editing.value : (task.description || '')}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="输入任务描述"
            className={`
              w-full px-4 py-2.5 rounded-xl border-0 text-sm
              transition-all duration-200 ease-out resize-none
              ${isDark 
                ? 'bg-gray-800 text-white focus:bg-gray-750 placeholder-gray-500' 
                : 'bg-white text-gray-900 focus:bg-gray-50 placeholder-gray-400'
              }
              focus:ring-2 focus:ring-blue-500/50 focus:outline-none
              shadow-sm
            `}
          />
        )}
      />

      {/* 负责人 */}
      <FormRow
        icon={<FiUser className="w-5 h-5 text-green-500" />}
        label="负责人"
        field="assigneeId"
        value={task.assigneeId}
        renderValue={() => (
          <div className="flex items-center space-x-3">
            {task.assigneeAvatar && (
              <Avatar 
                name={task.assignee || '未分配'} 
                src={task.assigneeAvatar}
                size="sm" 
              />
            )}
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {task.assignee || '未分配'}
            </span>
          </div>
        )}
        renderEditor={() => (
          <div className="relative">
            <select
              value={editing.field === 'assigneeId' ? editing.value : (task.assigneeId || '')}
              onChange={(e) => handleFieldChange('assigneeId', e.target.value)}
              className={`
                w-full px-4 py-2.5 rounded-xl border-0 text-sm font-medium
                transition-all duration-200 ease-out
                ${isDark 
                  ? 'bg-gray-800 text-white focus:bg-gray-750' 
                  : 'bg-white text-gray-900 focus:bg-gray-50'
                }
                focus:ring-2 focus:ring-blue-500/50 focus:outline-none
                shadow-sm appearance-none
              `}
            >
              <option value="">选择负责人</option>
              {projectMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      />

      {/* 优先级 */}
      <FormRow
        icon={<FiTag className="w-5 h-5 text-orange-500" />}
        label="优先级"
        field="priority"
        value={task.priority}
        renderValue={() => (
          <div className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: task.priorityColor || '#F59E0B' }}
            />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {task.priority || '未知优先级'}
            </span>
          </div>
        )}
        renderEditor={() => {
          // 查找当前优先级对应的ID
          const currentPriorityId = priorityItems.find(p => p.name === task.priority)?.id || '';
          return (
            <div className="relative">
              <select
                value={editing.field === 'priority' ? editing.value : currentPriorityId}
                onChange={(e) => handleFieldChange('priority', e.target.value)}
                disabled={isLoadingPriorities}
                className={`
                  w-full px-4 py-2.5 rounded-xl border-0 text-sm font-medium
                  transition-all duration-200 ease-out
                  ${isDark 
                    ? 'bg-gray-800 text-white focus:bg-gray-750' 
                    : 'bg-white text-gray-900 focus:bg-gray-50'
                  }
                  focus:ring-2 focus:ring-blue-500/50 focus:outline-none
                  shadow-sm appearance-none
                  ${isLoadingPriorities ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <option value="">{isLoadingPriorities ? '加载中...' : '选择优先级'}</option>
                {priorityItems.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {isLoadingPriorities ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
          );
        }}
        disabled={isLoadingPriorities}
      />

      {/* 任务状态 */}
      <FormRow
        icon={<FiActivity className="w-5 h-5 text-blue-500" />}
        label="状态"
        field="statusId"
        value={task.statusId}
        renderValue={() => (
          <div className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: task.statusColor || '#3B82F6' }}
            />
            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {(task as any).statusName || task.status || '未知状态'}
            </span>
          </div>
        )}
        renderEditor={() => {
          // 查找当前状态对应的ID，优先使用statusId，否则通过status名称查找
          const currentStatusId = task.statusId || statusItems.find(s => s.name === task.status)?.id || '';
          return (
            <div className="relative">
              <select
                value={editing.field === 'statusId' ? editing.value : currentStatusId}
                onChange={(e) => handleFieldChange('statusId', e.target.value)}
                disabled={isLoadingStatuses}
                className={`
                  w-full px-4 py-2.5 rounded-xl border-0 text-sm font-medium
                  transition-all duration-200 ease-out
                  ${isDark 
                    ? 'bg-gray-800 text-white focus:bg-gray-750' 
                    : 'bg-white text-gray-900 focus:bg-gray-50'
                  }
                  focus:ring-2 focus:ring-blue-500/50 focus:outline-none
                  shadow-sm appearance-none
                  ${isLoadingStatuses ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <option value="">{isLoadingStatuses ? '加载中...' : '选择状态'}</option>
                {statusItems.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {isLoadingStatuses ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>
          );
        }}
        disabled={isLoadingStatuses}
      />

      {/* 开始时间 */}
      <FormRow
        icon={<FiClock className="w-5 h-5 text-green-500" />}
        label="开始"
        field="startTime"
        value={task.startTime}
        renderValue={() => (
          <span className={`text-sm font-medium ${getDateStatusColor(task.startTime)}`}>
            {formatDate(task.startTime)}
          </span>
        )}
        renderEditor={() => {
          // 确保正确回显当前值或任务原始值
          const currentValue = editing.field === 'startTime' ? editing.value : task.startTime;
          const currentDate = currentValue ? new Date(currentValue) : null;
          
          return (
            <div className="w-full">
              <DatePicker
                selectedDate={currentDate}
                onChange={(date) => handleFieldChange('startTime', date ? date.toISOString() : null)}
                position="top"
                showTimePicker={true}
                is24Hour={true}
                className="w-full"
              />
            </div>
          );
        }}
      />

      {/* 截止时间 */}
      <FormRow
        icon={<FiCalendar className="w-5 h-5 text-orange-500" />}
        label="截止"
        field="dueDate"
        value={task.dueDate}
        renderValue={() => (
          <span className={`text-sm font-medium ${getDateStatusColor(task.dueDate)}`}>
            {formatDate(task.dueDate)}
          </span>
        )}
        renderEditor={() => {
          // 确保正确回显当前值或任务原始值
          const currentValue = editing.field === 'dueDate' ? editing.value : task.dueDate;
          const currentDate = currentValue ? new Date(currentValue) : null;
          
          return (
            <div className="w-full">
              <DatePicker
                selectedDate={currentDate}
                onChange={(date) => handleFieldChange('dueDate', date ? date.toISOString() : null)}
                position="top"
                showTimePicker={true}
                is24Hour={true}
                minDate={new Date()} // 截止时间不能早于当前日期
                className="w-full"
              />
            </div>
          );
        }}
        isLast={true}
      />
    </div>
  );
};

export default DashboardTaskDetailContent;
