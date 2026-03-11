import {useEffect, useMemo, useRef, useState} from 'react';
import {transformInitialData} from '../utils/taskDataUtils';
// 从统一类型定义文件导入
import {CreateTaskData, SubTaskWithOrder, UseTaskFormProps} from '../types/types';

/**
 * 将日期格式化为带有时区偏移量的ISO-8601字符串
 * 适配后端的OffsetDateTime格式
 * @param dateString 日期字符串
 * @returns 带有时区偏移量的ISO-8601格式字符串，或undefined如果输入无效
 */
const formatDateWithOffset = (dateString?: string): string | undefined => {
  if (!dateString) return undefined;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return undefined;

  // 获取本地时间的ISO字符串（不含时区信息）
  const localISOString = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, -1);

  // 计算时区偏移量
  const offset = -date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offset) / 60);
  const offsetMinutes = Math.abs(offset) % 60;
  const offsetSign = offset >= 0 ? '+' : '-';

  // 格式化时区偏移量
  const offsetString = `${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMinutes.toString().padStart(2, '0')}`;

  // 组合成完整的ISO-8601字符串
  return `${localISOString}${offsetString}`;
};

export const useTaskForm = ({
  streamingData,
  streamingComplete,
  onConfirm,
  onClose
}: UseTaskFormProps) => {
  // 表单状态
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [totalHours, setTotalHours] = useState(0);
  const [priorityScore, setPriorityScore] = useState(50);
  const [subTasks, setSubTasks] = useState<SubTaskWithOrder[]>([]);
  const [includeSubTasks, setIncludeSubTasks] = useState(false);
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);

  // 表单错误状态
  const [errors, setErrors] = useState<{
    taskName?: string;
    taskDescription?: string;
    dueDate?: string;
    subTasks?: string;
  }>({});

  const dataProcessedRef = useRef(false);

  // 处理流式数据完成后初始化表单
  useEffect(() => {
    if (streamingData && streamingComplete && !dataProcessedRef.current) {
      dataProcessedRef.current = true;

      // 转换API数据为表单可用格式
      const d = transformInitialData(streamingData);

      // 更新所有表单字段
      setTaskName(d.mainTaskName);
      setTaskDescription(d.mainTaskDescription);
      // 确保assigneeId始终以字符串形式存储，避免精度丢失
  setAssigneeId(d.mainTaskAssigneeId ? String(d.mainTaskAssigneeId) : undefined);
      setTotalHours(d.mainTaskTotalHours);
      setPriorityScore(d.mainTaskPriorityScore);

      // 只有在有子任务时才设置子任务相关状态
      if (d.subTasks && d.subTasks.length > 0) {
        // 确保所有子任务的assigneeId都是字符串类型
        const processedSubTasks = d.subTasks.map(task => ({
          ...task,
          assigneeId: task.assigneeId ? String(task.assigneeId) : undefined
        })) as SubTaskWithOrder[];
        setSubTasks(processedSubTasks);
        setIncludeSubTasks(true);
      } else {
        console.log('ℹ️ 没有子任务数据');
      }

      // 清除可能存在的错误
      setErrors({});
    }
  }, [streamingComplete, streamingData]);

  // 处理确认提交
  const handleConfirm = async () => {
    // 如果已经在提交中，防止重复提交
    if (isSubmitting) {
      return;
    }

    // 基础表单验证
    const newErrors: {[key: string]: string} = {};
    if (!taskName.trim()) {
      newErrors.taskName = '任务名称不能为空';
    }
    if (!taskDescription.trim()) {
      newErrors.taskDescription = '任务描述不能为空';
      console.warn('❌ 验证失败：任务描述不能为空');
    }
    if (!dueDate) {
      newErrors.dueDate = '截止日期不能为空';
      console.warn('❌ 验证失败：截止日期不能为空');
    }

    // 子任务验证
    if (includeSubTasks && subTasks.length > 0) {
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
        newErrors.subTasks = invalidSubTasks.join('；');
        console.warn('❌ 子任务验证失败：', invalidSubTasks);
      }
    }

    if (Object.keys(newErrors).length > 0) {
      console.error('❌ 表单验证失败，错误项：', newErrors);
      setErrors(newErrors);
      return;
    }

    // 设置提交中状态
    setIsSubmitting(true);

    const payload: CreateTaskData = {
      name: taskName,
      description: taskDescription,
      assigneeId: assigneeId ? String(assigneeId) : undefined, // 确保发送字符串类型
      totalHours,
      priorityScore,
      endTime: formatDateWithOffset(dueDate), // 添加截止时间字段，使用带时区偏移量的ISO-8601格式
      subTasks: includeSubTasks ? subTasks.map(st => ({
        id: st.id,
        name: st.name,
        description: st.description,
        assigneeId: st.assigneeId ? String(st.assigneeId) : undefined, // 确保所有子任务assigneeId都是字符串
        hours: st.hours,
        priorityScore: st.priorityScore,
        dependencies: st.dependencies
      })) : undefined
    };

    try {
      await onConfirm(payload);
      // 重置提交状态，确保UI状态正确
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      // 重置提交状态，允许重试
      setIsSubmitting(false);
    }
  };

  // 添加表单提交中状态
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 全局表单合法性
  const isFormValid = useMemo(() => {
    if (!taskName.trim() || !taskDescription.trim() || !dueDate) return false;
    if (includeSubTasks) {
      return subTasks.every(st => st.name && st.assigneeId && (st.hours ?? 0) > 0);
    }
    return true;
  }, [taskName, taskDescription, dueDate, includeSubTasks, subTasks]);

  return {
    // 表单状态
    taskName,
    setTaskName,
    taskDescription,
    setTaskDescription,
    assigneeId,
    setAssigneeId,
    totalHours,
    setTotalHours,
    priorityScore,
    setPriorityScore,
    subTasks,
    setSubTasks,
    includeSubTasks,
    setIncludeSubTasks,
    dueDate,
    setDueDate,

    // 错误状态
    errors,
    setErrors,

    // 表单操作
    isFormValid,
    isSubmitting,  // 新增返回提交中状态
    handleConfirm
  };
};
