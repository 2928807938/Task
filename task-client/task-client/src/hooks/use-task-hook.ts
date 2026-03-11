import {useCallback, useEffect, useRef, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {taskApi} from '@/adapters/api/task-api';
import {CreateTaskRequest, EditTaskRequest, ProjectTask, TaskWithSubtasks} from '@/types/api-types';

/**
 * 消息类型枚举
 */
export enum AnalysisMessageType {
  START = -1,       // 分析开始
  COMPLETE = -2,    // 分析完成
  ERROR = -3,       // 分析错误
  TYPE = 2,         // 类型分析
  PRIORITY = 3,     // 优先级分析
  COMPLETION = 4,   // 完整度分析
  SUGGESTION = 5,   // 建议分析
  TASK_SPLIT = 6,   // 任务拆分分析
  WORKLOAD = 7,     // 工作量分析
  COMPREHENSIVE = 8 // 综合分析
}

/**
 * 分析消息接口
 */
export interface AnalysisMessage {
  type: AnalysisMessageType;
  content: string;
}

/**
 * 分析结果接口
 */
export interface AnalysisResult {
  type: string;        // 需求类型，可能包含JSON数据
  typeTags?: string[]; // 已解析的类型标签
  typeColors?: string[]; // 已解析的标签颜色
  priority: string;
  completion: string;
  suggestions: string;
  taskSplit: string;
  workload: string;
  comprehensive: string;
}

// 子任务结构
export type SubTask = {
  id: string;
  name: string;
  description: string;
  assigneeId: string; // 仅使用string类型，确保与SubTaskItem兼容
  hours: number;
  priorityScore: number;
  dependencies?: string[]; // 添加可选的dependencies字段，与SubTaskItem保持一致
};

// 主任务结构
export type MainTask = {
  name: string;
  description: string;
  assigneeId: string; // 仅使用string类型，确保与API类型兼容
  totalHours: number;
  priorityScore: number;
};

// 结构化的任务数据
export type StructuredTaskData = {
  mainTask: MainTask;
  subTasks: SubTask[];
};

export type AssignResultType = {
  type: string;
  priority: string;
  workload: string;
  comprehensive: string;
  taskSplit: string;
  completion: string;
  suggestions: string;
  structuredTaskData: StructuredTaskData;
};

/**
 * 任务API Hook
 */
export default function useTaskHook() {
  // 用于存储和取消EventSource实例 - 分析任务
  const analyzeEventSourceRef = useRef<EventSource | null>(null);
  // 流式处理的状态 - 分析任务
  const [isAnalyzeStreaming, setIsAnalyzeStreaming] = useState(false);
  const [analyzeStreamingError, setAnalyzeStreamingError] = useState<string | null>(null);
  const [analyzeStreamingComplete, setAnalyzeStreamingComplete] = useState(false);

  // 分析消息列表 - 分析任务
  const [analysisMessages, setAnalysisMessages] = useState<AnalysisMessage[]>([]);
  // 分析结果 - 分析任务
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({
    type: '',
    priority: '',
    completion: '',
    suggestions: '',
    taskSplit: '',
    workload: '',
    comprehensive: ''
  });

  // 用于存储和取消EventSource实例 - 任务分配
  const assignEventSourceRef = useRef<EventSource | null>(null);
  // 流式处理的状态 - 任务分配
  const [isAssignStreaming, setIsAssignStreaming] = useState(false);
  const [assignStreamingError, setAssignStreamingError] = useState<string | null>(null);
  const [assignStreamingComplete, setAssignStreamingComplete] = useState(false);

  // 分配任务消息列表
  const [assignMessages, setAssignMessages] = useState<AnalysisMessage[]>([]);
  // 分配任务结果
  const [assignResult, setAssignResult] = useState<AssignResultType>({
    type: '',
    priority: '',
    workload: '',
    comprehensive: '',
    taskSplit: '',
    completion: '',
    suggestions: '',
    structuredTaskData: {
      mainTask: {
        name: '',
        description: '',
        assigneeId: '',
        totalHours: 0,
        priorityScore: 0
      },
      subTasks: []
    }
  });

  /**
   * 重置分析状态
   */
  const resetAnalysis = useCallback(() => {
    setAnalysisMessages([]);
    setAnalysisResult({
      type: '',
      priority: '',
      completion: '',
      suggestions: '',
      taskSplit: '',
      workload: '',
      comprehensive: ''
    });
    setIsAnalyzeStreaming(false);
    setAnalyzeStreamingError(null);
    setAnalyzeStreamingComplete(false);

    // 关闭之前的连接
    if (analyzeEventSourceRef.current) {
      analyzeEventSourceRef.current.close();
      analyzeEventSourceRef.current = null;
    }
  }, []);

  /**
   * 重置任务分配状态
   */
  const resetAssign = useCallback(() => {
    setIsAssignStreaming(false);
    setAssignStreamingError(null);
    setAssignStreamingComplete(false);
    setAssignMessages([]);
    setAssignResult({
      type: '',
      priority: '',
      workload: '',
      comprehensive: '',
      taskSplit: '',
      completion: '',
      suggestions: '',
      structuredTaskData: {
        mainTask: {
          name: '',
          description: '',
          assigneeId: '',
          totalHours: 0,
          priorityScore: 0
        },
        subTasks: []
      }
    });
  }, []);

  /**
   * 处理消息
   */
  const handleAnalysisMessage = useCallback((message: AnalysisMessage) => {
    setAnalysisMessages(prev => [...prev, message]);

    // 根据消息类型更新结果
    switch (message.type) {
      case AnalysisMessageType.TYPE:
        setAnalysisResult(prev => ({ ...prev, type: prev.type + message.content }));
        break;
      case AnalysisMessageType.PRIORITY:
        // 尝试检查是否是有效的JSON
        const isPriorityValidJson = message.content.trim().startsWith('{') && message.content.trim().endsWith('}');
        if (isPriorityValidJson) {
          // 如果是完整JSON，直接设置
          setAnalysisResult(prev => ({ ...prev, priority: message.content }));
        } else {
          // 否则累加内容
          setAnalysisResult(prev => {
            const newPriority = prev.priority + message.content;
            return { ...prev, priority: newPriority };
          });
        }
        break;
      case AnalysisMessageType.COMPLETION:
        // 尝试检查是否是有效的JSON
        const isValidJson = message.content.trim().startsWith('{') && message.content.trim().endsWith('}');
        if (isValidJson) {
          // 如果是完整JSON，直接设置
          setAnalysisResult(prev => ({ ...prev, completion: message.content }));
        } else {
          // 否则累加内容
          setAnalysisResult(prev => {
            const newCompletion = prev.completion + message.content;
            return { ...prev, completion: newCompletion };
          });
        }
        break;
      case AnalysisMessageType.SUGGESTION:
        setAnalysisResult(prev => ({ ...prev, suggestions: prev.suggestions + message.content }));
        break;
      case AnalysisMessageType.TASK_SPLIT:
        setAnalysisResult(prev => ({ ...prev, taskSplit: prev.taskSplit + message.content }));
        break;
      case AnalysisMessageType.WORKLOAD:
        setAnalysisResult(prev => ({ ...prev, workload: prev.workload + message.content }));
        break;
      case AnalysisMessageType.COMPREHENSIVE:
        setAnalysisResult(prev => ({ ...prev, comprehensive: prev.comprehensive + message.content }));
        break;
      case AnalysisMessageType.COMPLETE:
        setAnalyzeStreamingComplete(true);
        setIsAnalyzeStreaming(false);

        // 分析完成时，显式关闭 EventSource 连接
        if (analyzeEventSourceRef.current) {
          analyzeEventSourceRef.current.close();
          analyzeEventSourceRef.current = null;
        }
        break;
      case AnalysisMessageType.ERROR:
        setAnalyzeStreamingError(message.content);
        setIsAnalyzeStreaming(false);
        break;
    }
  }, []);

  /**
   * 流式分析任务需求
   */
  const streamAnalyzeTask = useCallback((projectId: string, content: string, conversationListId?: string | null) => {
    // 重置分析状态
    resetAnalysis();

    try {
      setIsAnalyzeStreaming(true);

      // 创建EventSource实例
      const eventSource = taskApi.streamAnalyzeTask(projectId, content, conversationListId);
      analyzeEventSourceRef.current = eventSource;

      // 监听消息
      eventSource.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          handleAnalysisMessage(data);
        } catch (error) {
          // 流式数据中可能会出现不完整的JSON片段，这是正常情况
          // 只在调试模式下输出日志，不影响用户体验
          if (process.env.NODE_ENV === 'development') {
            console.debug('流式数据片段解析跳过:', event.data);
          }
          // 不设置错误状态，继续等待下一个消息
        }
      };

      // 监听错误
      eventSource.onerror = (error: Event) => {
        console.error('SSE连接错误:', error);
        setAnalyzeStreamingError('连接错误');
        setIsAnalyzeStreaming(false);

        // 关闭连接
        if (analyzeEventSourceRef.current) {
          analyzeEventSourceRef.current.close();
          analyzeEventSourceRef.current = null;
        }
      };

      return () => {
        // 清理EventSource
        if (analyzeEventSourceRef.current) {
          analyzeEventSourceRef.current.close();
          analyzeEventSourceRef.current = null;
        }
      };
    } catch (error) {
      console.error('创建SSE连接失败:', error);
      setAnalyzeStreamingError('创建连接失败');
      setIsAnalyzeStreaming(false);
      return () => {};
    }
  }, [resetAnalysis, handleAnalysisMessage]);

  /**
   * 处理任务分配消息
   */
  const handleAssignMessage = useCallback((message: AnalysisMessage) => {

    // 将消息添加到消息列表
    setAssignMessages(prev => [...prev, message]);

    // -------- 通用解析：尝试从任何消息中提取结构化任务数据 --------
    try {
      const tryParsed = JSON.parse(message.content);
      let extracted: StructuredTaskData | null = null;
      if (tryParsed && typeof tryParsed === 'object') {
        if (tryParsed.mainTask && Array.isArray(tryParsed.subTasks)) {
          extracted = tryParsed as StructuredTaskData;
        } else if (tryParsed.main_task && Array.isArray(tryParsed.sub_tasks)) {
          extracted = { mainTask: tryParsed.main_task, subTasks: tryParsed.sub_tasks } as StructuredTaskData;
        } else if (tryParsed.data && tryParsed.data.mainTask && Array.isArray(tryParsed.data.subTasks)) {
          extracted = tryParsed.data as StructuredTaskData;
        }
      }

      if (extracted) {
        setAssignResult(prev => {
          // 如果之前已经存在有效数据，则保持原有数据，但若现有数据是默认占位则允许覆盖
          const hasExisting = prev.structuredTaskData && prev.structuredTaskData.mainTask?.name;
          const isDefaultExisting = hasExisting && prev.structuredTaskData!.mainTask.name === '新任务';
          if (hasExisting && !isDefaultExisting) {
            return prev;
          }
          return {
            ...prev,
            structuredTaskData: extracted,
            // 同步 taskSplit 字段，方便后续调试
            taskSplit: JSON.stringify(extracted)
          };
        });
      }
    } catch (_) {
      // 非 JSON 或解析失败忽略
    }

    // 根据消息类型处理
    switch (message.type) {
      case AnalysisMessageType.TYPE:
        setAssignResult(prev => ({ ...prev, type: prev.type + message.content }));
        break;
      case AnalysisMessageType.PRIORITY:
        // 尝试检查是否是有效的JSON
        const isPriorityValidJson = message.content.trim().startsWith('{') && message.content.trim().endsWith('}');
        if (isPriorityValidJson) {
          // 如果是完整JSON，直接设置
          setAssignResult(prev => ({ ...prev, priority: message.content }));
        } else {
          // 否则累加内容
          setAssignResult(prev => {
            const newPriority = prev.priority + message.content;
            return { ...prev, priority: newPriority };
          });
        }
        break;
      case AnalysisMessageType.COMPLETION:
        // 尝试检查是否是有效的JSON
        const isValidJson = message.content.trim().startsWith('{') && message.content.trim().endsWith('}');
        if (isValidJson) {
          // 如果是完整JSON，直接设置
          setAssignResult(prev => ({ ...prev, completion: message.content }));
        } else {
          // 否则累加内容
          setAssignResult(prev => {
            const newCompletion = prev.completion + message.content;
            return { ...prev, completion: newCompletion };
          });
        }
        break;
      case AnalysisMessageType.SUGGESTION:
        setAssignResult(prev => ({ ...prev, suggestions: prev.suggestions + message.content }));
        break;
      case AnalysisMessageType.TASK_SPLIT:
        // 如果在通用解析阶段已经提取到了结构化数据，并且该数据不是默认占位，则直接返回，避免重复累加
        const existingData = assignResult.structuredTaskData;
        const isDefaultExistingData = existingData && existingData.mainTask?.name === '新任务';
        if (existingData && existingData.mainTask?.name && !isDefaultExistingData) {
          return;
        }

        // 存储原始数据并尝试解析
        setAssignResult(prev => {
          // 1. 首先保存原始数据（累加方式）
          const updatedTaskSplit = prev.taskSplit + message.content;

          // 2. 尝试解析单条消息（如果是完整JSON）
          const isSingleMessageJson = message.content.trim().startsWith('{') && message.content.trim().endsWith('}');
          if (isSingleMessageJson) {
            try {
              const parsedMessage = JSON.parse(message.content);

              // 检查是否符合标准格式
              if (parsedMessage.mainTask && Array.isArray(parsedMessage.subTasks)) {
                return {
                  ...prev,
                  taskSplit: message.content, // 使用单条消息作为完整数据
                  structuredTaskData: parsedMessage
                };
              }

              // 检查是否有嵌套格式
              if (parsedMessage.data && parsedMessage.data.mainTask && Array.isArray(parsedMessage.data.subTasks)) {
                return {
                  ...prev,
                  taskSplit: JSON.stringify(parsedMessage.data), // 转换为标准格式
                  structuredTaskData: parsedMessage.data
                };
              }
            } catch (e) {
              console.error('单条消息解析失败:', e);
            }
          }

          // 3. 尝试解析累加后的完整数据
          const isAccumulatedJson = updatedTaskSplit.trim().startsWith('{') && updatedTaskSplit.trim().endsWith('}');
          if (isAccumulatedJson) {
            try {
              const parsedData = JSON.parse(updatedTaskSplit);

              // 检查是否符合标准格式
              if (parsedData.mainTask && Array.isArray(parsedData.subTasks)) {
                return {
                  ...prev,
                  taskSplit: updatedTaskSplit,
                  structuredTaskData: parsedData
                };
              }

              // 检查是否有嵌套格式
              if (parsedData.data && parsedData.data.mainTask && Array.isArray(parsedData.data.subTasks)) {
                return {
                  ...prev,
                  taskSplit: JSON.stringify(parsedData.data),
                  structuredTaskData: parsedData.data
                };
              }

              // 尝试从其他字段构建标准格式
              // 构建主任务
              const mainTask: MainTask = {
                name: parsedData.name || parsedData.title || parsedData.taskName || '新任务',
                description: parsedData.description || parsedData.content || '',
                assigneeId: '',
                totalHours: 0,
                priorityScore: 50
              };

              // 尝试从各种可能的字段提取子任务
              let subTasks: SubTask[] = [];
              const possibleSubTasksFields = ['subTasks', 'subtasks', 'tasks', 'children', 'items'];

              for (const field of possibleSubTasksFields) {
                if (Array.isArray(parsedData[field])) {
                  subTasks = parsedData[field].map((task: any, index: number) => ({
                    id: task.id || `subtask-${index}`,
                    name: task.name || task.title || `子任务 ${index + 1}`,
                    description: task.description || task.content || '',
                    assigneeId: '',
                    hours: 0,
                    priorityScore: 50,
                    dependencies: []
                  }));
                  break;
                }
              }

              // 构建结构化数据
              const constructedData: StructuredTaskData = {
                mainTask,
                subTasks
              };

              return {
                ...prev,
                taskSplit: JSON.stringify(constructedData),
                structuredTaskData: constructedData
              };
            } catch (e) {
              console.error('累加数据解析失败:', e);
            }
          }

          // 4. 如果所有解析尝试都失败，只累加数据
          return {
            ...prev,
            taskSplit: updatedTaskSplit
          };
        });
        break;
      case AnalysisMessageType.WORKLOAD:
        setAssignResult(prev => ({ ...prev, workload: prev.workload + message.content }));
        break;
      case AnalysisMessageType.COMPREHENSIVE:
        setAssignResult(prev => ({ ...prev, comprehensive: prev.comprehensive + message.content }));
        break;
      case AnalysisMessageType.COMPLETE: {
        // 先尝试解析COMPLETE消息内容，提取最终结果
        let finalParsed: StructuredTaskData | null = null;
        try {
          const parsed = JSON.parse(message.content || '{}');
          if (parsed.mainTask && Array.isArray(parsed.subTasks)) {
            finalParsed = parsed;
          } else if (parsed.main_task && Array.isArray(parsed.sub_tasks)) {
            finalParsed = { mainTask: parsed.main_task, subTasks: parsed.sub_tasks } as StructuredTaskData;
          } else if (parsed.data && parsed.data.mainTask && Array.isArray(parsed.data.subTasks)) {
            finalParsed = parsed.data as StructuredTaskData;
          }
        } catch (_) {}

        if (finalParsed && finalParsed.mainTask.name !== '新任务') {
          setAssignResult(prev => ({
            ...prev,
            structuredTaskData: finalParsed,
            taskSplit: JSON.stringify(finalParsed)
          }));
        } else if (!finalParsed && assignResult.structuredTaskData) {
          setAssignResult(prev => ({ ...prev }));
        }
        // 使用微任务确保 assignResult 已更新
        Promise.resolve().then(() => {
          setAssignStreamingComplete(true);
        });
        setIsAssignStreaming(false);

        // 强制关闭弹框 - 触发全局事件
        try {
          // 创建并触发自定义事件
          const closeEvent = new CustomEvent('forceCloseAnalysisLoading', {
            detail: { message: '任务分配完成' }
          });
          window.dispatchEvent(closeEvent);

          // 作为备用方案，也触发现有的关闭事件
          window.dispatchEvent(new CustomEvent('forceCloseModal'));
        } catch (e) {
          console.error('触发关闭事件失败:', e);
        }

        break;
      }
      case AnalysisMessageType.ERROR:
        setAssignStreamingError(message.content);
        setIsAssignStreaming(false);
        break;
    }
  }, [assignResult.structuredTaskData]);

  /**
   * 流式分配任务
   */
  const streamAssignTask = useCallback((projectId: string, description: string) => {
    // 重置分配状态
    resetAssign();

    try {
      setIsAssignStreaming(true);

      // 创建 EventSource 实例
      const eventSource = taskApi.streamAssignTask(projectId, description);
      assignEventSourceRef.current = eventSource;

      // 用于累积消息片段
      let messageBuffer = '';
      // 用于累积所有type为9的数据的content
      let type9ContentBuffer = '';
      // 标记数据是否已经被处理，避免重复处理
      let dataProcessed = false;

      // 监听消息
      // 设置消息处理函数
      eventSource.onmessage = (event: MessageEvent) => {
        try {
          // 获取消息数据
          const data = event.data;

          // 如果没有数据，跳过
          if (!data) return;

          // 处理结束状态
          if (data.includes('[DONE]')) {
            // 如果有累积的 type 9 数据且数据未被处理，则处理它
            if (type9ContentBuffer && !dataProcessed) {
              // 标记数据已经被处理
              dataProcessed = true;

              // 先处理可能存在的Markdown格式符号
              let cleanedContent = type9ContentBuffer;

              // 去除开头的 ```json 或 ``` 格式
              cleanedContent = cleanedContent.replace(/^\s*```(?:json)?\s*/i, '');

              // 去除结尾的 ``` 格式
              cleanedContent = cleanedContent.replace(/\s*```\s*$/i, '');

              try {
                // 创建AnalysisMessage并处理
                const message: AnalysisMessage = {
                  type: AnalysisMessageType.TASK_SPLIT,
                  content: cleanedContent
                };

                handleAssignMessage(message);
              } catch (jsonError) {
                console.error('解析累积的JSON失败:', jsonError);
                // 如果解析失败，仍然尝试处理原始数据
                const message: AnalysisMessage = {
                  type: AnalysisMessageType.TASK_SPLIT,
                  content: type9ContentBuffer
                };

                handleAssignMessage(message);
              }
            } else if (dataProcessed) {
              console.log('收到[DONE]，但数据已经被处理，跳过');
            }

            setAssignStreamingComplete(true);
            setIsAssignStreaming(false);

            // 清空缓冲区并关闭连接
            messageBuffer = '';
            type9ContentBuffer = '';
            if (assignEventSourceRef.current) {
              assignEventSourceRef.current.close();
              assignEventSourceRef.current = null;
            }
            return;
          }

          // 处理JSON格式数据
          try {
            const jsonData = JSON.parse(data);

            // 处理错误消息 - 检查是否为错误类型 (type: -1)
            if (jsonData.type === -1) {
              setAssignStreamingError(jsonData.content || data);
              setIsAssignStreaming(false);
              return;
            }

            // 处理正常数据 - type为9
            if (jsonData.type === 9) {
              // 累积 type 9 的数据的 content
              type9ContentBuffer += jsonData.content;
              return;
            }

            // 处理完成消息 - type为-2
            if (jsonData.type === -2) {
              // 如果有累积的 type 9 数据且数据未被处理，则处理它
              if (type9ContentBuffer && !dataProcessed) {
                // 标记数据已经被处理
                dataProcessed = true;

                // 先处理可能存在的Markdown格式符号
                let cleanedContent = type9ContentBuffer;

                // 去除开头的 ```json 或 ``` 格式
                cleanedContent = cleanedContent.replace(/^\s*```(?:json)?\s*/i, '');

                // 去除结尾的 ``` 格式
                cleanedContent = cleanedContent.replace(/\s*```\s*$/i, '');

                try {
                  // 创建AnalysisMessage并处理
                  const message: AnalysisMessage = {
                    type: AnalysisMessageType.TASK_SPLIT,
                    content: cleanedContent
                  };

                  handleAssignMessage(message);
                } catch (jsonError) {
                  console.error('解析累积的JSON失败:', jsonError);
                  // 如果解析失败，仍然尝试处理原始数据
                  const message: AnalysisMessage = {
                    type: AnalysisMessageType.TASK_SPLIT,
                    content: type9ContentBuffer
                  };

                  handleAssignMessage(message);
                }
              } else if (dataProcessed) {
                console.log('收到type为-2的消息，但数据已经被处理，跳过');
              }

              setAssignStreamingComplete(true);
              setIsAssignStreaming(false);

              // 清空缓冲区并关闭连接
              messageBuffer = '';
              type9ContentBuffer = '';
              if (assignEventSourceRef.current) {
                assignEventSourceRef.current.close();
                assignEventSourceRef.current = null;
              }
              return;
            }
          } catch (e) {
            // 如果不是JSON格式，继续处理
          }

          // 累积接收到的数据
          messageBuffer += data;

          // 专门处理分行格式数据 (用于捕捉如 "assigneeId":"700727881978276319" 这样的分行数据)
          if (messageBuffer.includes('assigneeId') && !messageBuffer.includes('{"mainTask"')) {

            // 提取assigneeId的值 - 这是要解决的主要问题
            const assigneeIdMatch = messageBuffer.match(/assigneeId[^0-9]*([0-9]+)/);
            const assigneeId = assigneeIdMatch ? assigneeIdMatch[1] : '';

            // 提取hours字段
            const hoursMatch = messageBuffer.match(/hours[^0-9]*([0-9]+)/);
            const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;

            // 提取priorityScore字段
            const priorityMatch = messageBuffer.match(/priorityScore[^0-9]*([0-9]+)/);
            const priority = priorityMatch ? parseInt(priorityMatch[1]) : 50;

            // 提取name和description
            const nameMatch = messageBuffer.match(/name[^\n]*"([^"]+)"/);
            const name = nameMatch ? nameMatch[1] : '新任务';

            const descMatch = messageBuffer.match(/description[^\n]*"([^"]+)"/);
            const description = descMatch ? descMatch[1] : '';

            // 如果成功提取到assigneeId，创建任务对象
            if (assigneeId) {
              console.log('流式数据处理 - 提取到assigneeId:', {
                assigneeId,
                assigneeIdType: typeof assigneeId,
                name,
                description,
                hours,
                priority
              });
              
              const taskData: StructuredTaskData = {
                mainTask: {
                  name,
                  description,
                  assigneeId,
                  totalHours: hours,
                  priorityScore: priority
                },
                subTasks: []
              };

              // 创建AnalysisMessage并处理
              const message: AnalysisMessage = {
                type: AnalysisMessageType.TASK_SPLIT,
                content: JSON.stringify(taskData)
              };

              handleAssignMessage(message);
              messageBuffer = '';
              return;
            }
          }

          // 如果不是分行格式，尝试解析JSON格式
          if (messageBuffer.includes('{') && messageBuffer.includes('}')) {
            try {
              // 尝试提取完整JSON
              const startIndex = messageBuffer.indexOf('{');
              const endIndex = messageBuffer.lastIndexOf('}');

              if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
                const jsonString = messageBuffer.substring(startIndex, endIndex + 1);

                try {
                  // 解析JSON
                  const parsedData = JSON.parse(jsonString);

                  // 检查是否有mainTask结构
                  if (parsedData.mainTask) {
                    const message: AnalysisMessage = {
                      type: AnalysisMessageType.TASK_SPLIT,
                      content: jsonString
                    };
                    handleAssignMessage(message);
                    messageBuffer = '';
                    return;
                  }

                  // 检查是否是AnalysisMessage格式
                  if (parsedData.type !== undefined && parsedData.content) {
                    handleAssignMessage(parsedData);
                    messageBuffer = '';
                    return;
                  }
                } catch (jsonError) {
                  console.error('解析JSON失败:', jsonError);
                }
              }
            } catch (error) {
              console.error('处理JSON格式数据失败:', error);
            }
          }
        } catch (error) {
          console.error('处理SSE消息时发生错误:', error);
        }
      };

      // 监听错误
      eventSource.onerror = (error: Event) => {
        console.error('流式分配任务SSE连接错误:', error);
        setAssignStreamingError('连接错误');
        setIsAssignStreaming(false);

        // 关闭连接
        if (assignEventSourceRef.current) {
          assignEventSourceRef.current.close();
          assignEventSourceRef.current = null;
        }
      };

      return () => {
        // 清理EventSource
        if (assignEventSourceRef.current) {
          assignEventSourceRef.current.close();
          assignEventSourceRef.current = null;
        }
      };
    } catch (error) {
      console.error('创建流式分配任务SSE连接失败:', error);
      setAssignStreamingError('创建连接失败');
      setIsAssignStreaming(false);
      return () => {};
    }
  }, [resetAssign, handleAssignMessage]);

  // 组件卸载时清理EventSource
  useEffect(() => {
    return () => {
      // 清理分析任务的EventSource
      if (analyzeEventSourceRef.current) {
        analyzeEventSourceRef.current.close();
        analyzeEventSourceRef.current = null;
      }

      // 清理任务分配的EventSource
      if (assignEventSourceRef.current) {
        assignEventSourceRef.current.close();
        assignEventSourceRef.current = null;
      }
    };
  }, []);

  /**
   * 获取项目任务列表的React Query Hook
   * @param projectId 项目ID
   * @param priority 优先级筛选条件（可选）
   * @param pageNumber 页码，从1开始（可选）
   * @param pageSize 每页记录数（可选）
   * @param taskType 任务类型，main: 只查询主任务，sub: 只查询子任务，all: 查询所有任务（可选）
   * @param options React Query选项（可选）
   */
  const useGetProjectTasks = (
    projectId: string,
    priority?: string,
    pageNumber?: number,
    pageSize?: number,
    taskType?: 'main' | 'sub' | 'all',
    options?: { enabled?: boolean; staleTime?: number; refetchOnWindowFocus?: boolean; cacheTime?: number }
  ) => {
    return useQuery({
      queryKey: ['projectTasks', projectId, priority, pageNumber, pageSize, taskType],
      queryFn: async () => {
        const response = await taskApi.getProjectTasks(projectId, priority, pageNumber, pageSize, taskType);
        if (!response.success) {
          throw new Error(response.message || '获取项目任务列表失败');
        }
        return response.data;
      },
      // 合并默认选项和用户传入的选项
      enabled: options?.enabled !== undefined ? options.enabled : !!projectId, // 默认只有当projectId存在时才执行查询
      staleTime: options?.staleTime !== undefined ? options.staleTime : 30000, // 默认缓存30秒，减少重复请求
      gcTime: options?.cacheTime !== undefined ? options.cacheTime : 5 * 60 * 1000, // 默认缓存5分钟
      refetchOnWindowFocus: options?.refetchOnWindowFocus !== undefined ? options.refetchOnWindowFocus : false, // 默认不在窗口聚焦时重新获取
    });
  };

  /**
   * 创建任务的useMutation Hook
   * @returns React Query 创建任务useMutation
   */
  const useCreateTask = () => {
    return useMutation({
      mutationFn: async (taskData: CreateTaskRequest) => {
        const response = await taskApi.createTask(taskData);
        if (!response.success) {
          throw new Error(response.message || '创建任务失败');
        }
        return response.data;
      },
    });
  };

  /**
   * 获取任务及其子任务的React Query Hook
   * @param taskId 任务ID
   * @param options React Query选项（可选）
   */
  const useGetTaskWithSubtasks = (
    taskId: string,
    options?: { enabled?: boolean; staleTime?: number; refetchOnWindowFocus?: boolean; gcTime?: number }
  ) => {
    // 简化日志，仅记录关键日志点
    return useQuery<TaskWithSubtasks | null, Error, TaskWithSubtasks | null>({
      queryKey: ['taskWithSubtasks', taskId],
      queryFn: async () => {
        try {
          const response = await taskApi.getTaskWithSubtasks(taskId);

          if (!response.success) {
            console.error(`[API] 获取任务详情失败: ${response.message}`);
            throw new Error(response.message || '获取任务详情失败');
          }

          return response.data; // 可能为null
        } catch (error) {
          console.error(`[API] 获取任务详情异常:`, error);
          throw error;
        }
      },
      // 合并默认选项和用户传入的选项
      enabled: options?.enabled !== undefined ? options.enabled : !!taskId, // 默认只有当taskId存在时才执行查询
      staleTime: options?.staleTime !== undefined ? options.staleTime : 30000, // 默认缓存30秒，减少重复请求
      gcTime: options?.gcTime !== undefined ? options.gcTime : 5 * 60 * 1000, // 默认缓存5分钟
      refetchOnWindowFocus: options?.refetchOnWindowFocus !== undefined ? options.refetchOnWindowFocus : false // 默认不在窗口聚焦时重新获取


    });
  };

  /**
   * 更新任务的useMutation Hook
   * @returns React Query 更新任务useMutation
   */
  const useUpdateTask = () => {
    return useMutation({
      mutationFn: async ({ taskId, taskData }: { taskId: string; taskData: Partial<ProjectTask> }) => {
        const response = await taskApi.updateTask(taskId, taskData);
        if (!response.success) {
          throw new Error(response.message || '更新任务失败');
        }
        return response.data;
      },
    });
  };

  /**
   * 编辑任务的useMutation Hook
   * @returns React Query 编辑任务useMutation
   */
  const useEditTask = () => {
    return useMutation({
      mutationFn: async (taskData: EditTaskRequest) => {
        const response = await taskApi.editTask(taskData);
        // 根据状态码判断请求是否成功，2xx系列状态码表示成功
        if (response.code.startsWith('2') || response.code === '200') {
          return response.data;
        } else {
          throw new Error(response.message || '编辑任务失败');
        }
      },
    });
  };

  /**
   * 更新任务状态的useMutation Hook
   * @returns React Query 更新任务状态useMutation
   */
  const useUpdateTaskStatus = () => {
    // 获取queryClient实例用于乐观更新
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ taskId, statusId }: { taskId: string; statusId: string }) => {
        const response = await taskApi.updateTaskStatus(taskId, statusId);

        // 根据状态码判断请求是否成功，2xx系列状态码表示成功
        if (response.code.startsWith('2') || response.code === '200') {
          return response.data;
        } else {
          throw new Error(response.message || '更新任务状态失败');
        }
      },
      // 使用乐观更新直接修改前端状态，而不刷新整个列表
      onMutate: async ({ taskId, statusId }) => {
        // 取消可能正在进行的查询，避免竞争条件
        await queryClient.cancelQueries({ queryKey: ['dashboardTasks'] });
        await queryClient.cancelQueries({ queryKey: ['tasks'] });
        await queryClient.cancelQueries({ queryKey: ['myTasks'] });
        await queryClient.cancelQueries({ queryKey: ['upcomingTasks'] });

        // 保存前一个状态，以便需要时回滚
        const previousData = queryClient.getQueryData(['dashboardTasks']);

        // 获取当前状态状态名和颜色
        const { statusName, statusColor } = await getStatusInfo(statusId);

        // 更新任务状态的通用处理函数
        const updateTasksInData = (oldData: any) => {
          if (!oldData || !oldData.data) return oldData;

          // 处理直接作为tasks数组的情况
          if (Array.isArray(oldData)) {
            return oldData.map((task: any) => {
              if (task.id === taskId) {
                return {
                  ...task,
                  statusId,
                  statusName: statusName || task.statusName,
                  statusColor: statusColor || task.statusColor,
                  status: statusId, // 兼容可能使用status字段的情况
                };
              }
              return task;
            });
          }

          // 没有tasks字段的情况，可能是直接返回了任务数组
          if (!oldData.data.tasks && Array.isArray(oldData.data)) {
            return {
              ...oldData,
              data: oldData.data.map((task: any) => {
                if (task.id === taskId) {
                  return {
                    ...task,
                    statusId,
                    statusName: statusName || task.statusName,
                    statusColor: statusColor || task.statusColor,
                    status: statusId,
                  };
                }
                return task;
              })
            };
          }

          // 如果有tasks字段
          if (oldData.data.tasks) {
            // 如果数据是数组形式
            let tasksData = oldData.data.tasks;
            // 如果是对象形式且有items字段
            if (!Array.isArray(tasksData) && tasksData.items) {
              tasksData = tasksData.items;
            }

            if (!Array.isArray(tasksData)) return oldData;

            // 更新列表中的对应任务
            const updatedTasks = tasksData.map((task: any) => {
              if (task.id === taskId) {
                return {
                  ...task,
                  statusId,
                  statusName: statusName || task.statusName,
                  statusColor: statusColor || task.statusColor,
                  status: statusId, // 兼容可能使用status字段的情况
                };
              }
              return task;
            });

            // 构造新的数据对象，保持原有结构
            if (Array.isArray(oldData.data.tasks)) {
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  tasks: updatedTasks,
                }
              };
            } else if (oldData.data.tasks.items) {
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  tasks: {
                    ...oldData.data.tasks,
                    items: updatedTasks,
                  }
                }
              };
            }
          }

          return oldData;
        };

        // 乐观更新所有任务相关的查询结果
        queryClient.setQueriesData({ queryKey: ['dashboardTasks'] }, updateTasksInData);

        // 同时更新“我的任务”列表
        queryClient.setQueriesData({ queryKey: ['myTasks'] }, updateTasksInData);

        // 同时更新“临期任务”列表
        queryClient.setQueriesData({ queryKey: ['upcomingTasks'] }, updateTasksInData);

        // 更新任务详情中的状态
        queryClient.setQueriesData({ queryKey: ['taskDetail', taskId] }, (oldData: any) => {
          if (!oldData || !oldData.data) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              statusId,
              statusName: statusName || oldData.data.statusName,
              statusColor: statusColor || oldData.data.statusColor,
              status: statusId,
            }
          };
        });

        return { previousData };
      },
      onError: (error, variables, context) => {
        console.error('状态更新错误，回滚操作:', error);
        // 如果出错，回滚到之前的状态
        if (context?.previousData) {
          queryClient.setQueryData(['dashboardTasks'], context.previousData);
        }
      },
      onSuccess: (data, variables) => {
        const { taskId } = variables;

        // 使状态相关缓存失效，确保下次打开列表可以获取最新状态
        queryClient.invalidateQueries({ queryKey: ['taskStatuses', taskId] });
      }
    });
  };

  // 帮助函数：根据状态ID获取状态信息
  const getStatusInfo = async (statusId: string) => {
    try {
      // 这里可以根据状态组件中的状态列表获取，或者使用一个固定的映射
      // 如果有状态缓存或事先知道的状态列表，可以使用那个
      const statusMap: Record<string, {name: string, color: string}> = {
        'pending': { name: '待处理', color: '#8E8E93' },
        'in_progress': { name: '进行中', color: '#007AFF' },
        'completed': { name: '已完成', color: '#34C759' },
        'canceled': { name: '已取消', color: '#FF3B30' }
      };

      return {
        statusName: statusMap[statusId]?.name || statusId,
        statusColor: statusMap[statusId]?.color || '#8E8E93'
      };
    } catch (error) {
      console.error('获取状态信息错误:', error);
      return { statusName: statusId, statusColor: '#8E8E93' };
    }
  };

  /**
   * 获取项目状态列表的React Query Hook
   * @param projectId 项目ID
   * @param options React Query选项（可选）
   */
  const useGetProjectStatusList = (
    projectId: string,
    options?: { enabled?: boolean; staleTime?: number; refetchOnWindowFocus?: boolean }
  ) => {
    return useQuery({
      queryKey: ['projectStatusList', projectId],
      queryFn: async () => {
        const response = await taskApi.getProjectStatusList(projectId);
        // 根据状态码判断请求是否成功，2xx系列状态码表示成功
        if (response.code.startsWith('2') || response.code === '200') {
          return response.data;
        } else {
          throw new Error(response.message || '获取项目状态列表失败');
        }
      },
      // 合并默认选项和用户传入的选项
      enabled: options?.enabled !== undefined ? options.enabled : !!projectId, // 默认只有当projectId存在时才执行查询
      staleTime: options?.staleTime !== undefined ? options.staleTime : 60000, // 默认缓存1分钟
      refetchOnWindowFocus: options?.refetchOnWindowFocus !== undefined ? options.refetchOnWindowFocus : false,
    });
  };

  /**
   * 获取项目优先级列表的React Query Hook
   * @param projectId 项目ID
   * @param options React Query选项（可选）
   */
  const useGetProjectPriorityList = (
    projectId: string,
    options?: { enabled?: boolean; staleTime?: number; refetchOnWindowFocus?: boolean }
  ) => {
    return useQuery({
      queryKey: ['projectPriorityList', projectId],
      queryFn: async () => {
        const response = await taskApi.getProjectPriorityList(projectId);
        // 根据状态码判断请求是否成功，2xx系列状态码表示成功
        if (response.code.startsWith('2') || response.code === '200') {
          return response.data;
        } else {
          throw new Error(response.message || '获取项目优先级列表失败');
        }
      },
      // 合并默认选项和用户传入的选项
      enabled: options?.enabled !== undefined ? options.enabled : !!projectId, // 默认只有当projectId存在时才执行查询
      staleTime: options?.staleTime !== undefined ? options.staleTime : 60000, // 默认缓存1分钟
      refetchOnWindowFocus: options?.refetchOnWindowFocus !== undefined ? options.refetchOnWindowFocus : false,
    });
  };

  /**
   * 获取任务可用状态列表的React Query Hook
   * @param taskId 任务ID
   * @param options React Query选项（可选）
   */
  const useGetTaskStatuses = (
    taskId: string,
    options?: { enabled?: boolean; staleTime?: number; refetchOnWindowFocus?: boolean; gcTime?: number }
  ) => {
    return useQuery({
      // 使用taskId作为缓存key
      queryKey: ['taskStatuses', taskId],
      queryFn: async () => {
        const response = await taskApi.getTaskStatuses(taskId);
        // 根据状态码判断请求是否成功，2xx系列状态码表示成功
        if (response.code.startsWith('2') || response.code === '200') {
          return response.data;
        } else {
          throw new Error(response.message || '获取任务状态列表失败');
        }
      },
      // 合并默认选项和用户传入的选项
      enabled: options?.enabled !== undefined ? options.enabled : !!taskId, // 默认只有当taskId存在时才执行查询

      // 增强缓存配置 - 长时间缓存任务状态列表
      staleTime: options?.staleTime !== undefined ? options.staleTime : 24 * 60 * 60 * 1000, // 默认缓存24小时，因为状态列表很少变化
      gcTime: options?.gcTime !== undefined ? options.gcTime : 30 * 24 * 60 * 60 * 1000, // 默认缓存30天，防止频繁请求
      refetchOnWindowFocus: options?.refetchOnWindowFocus !== undefined ? options.refetchOnWindowFocus : false, // 默认禁用窗口聚焦时重新获取
      refetchOnMount: false, // 禁止组件挂载时重新获取
      refetchOnReconnect: false, // 禁止网络重连时重新获取
    });
  };


  return {
    // 分析任务状态
    isStreaming: isAnalyzeStreaming,
    streamingError: analyzeStreamingError,
    streamingComplete: analyzeStreamingComplete,
    analysisMessages,
    analysisResult,
    // 任务分配状态
    isAssignStreaming,
    assignStreamingError,
    assignStreamingComplete,
    assignMessages,
    assignResult,
    // 方法
    resetAnalysis,
    resetAssign,
    streamAnalyzeTask,
    streamAssignTask,
    // React Query Hooks
    useGetProjectTasks,
    useCreateTask,
    useGetTaskWithSubtasks,
    useUpdateTask,
    useEditTask,
    useGetProjectStatusList,
    useGetProjectPriorityList,
    useGetTaskStatuses,
    useUpdateTaskStatus // 任务状态更新Hook
  };
}
