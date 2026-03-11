import {useCallback, useEffect, useRef, useState} from 'react';
import {taskApi} from '@/adapters/api/task-api';
import {ANALYSIS_COMPLETE_EVENT, analysisEventEmitter} from '../utils/analysisEventEmitter';
import {extractTaskData} from '../utils/taskDataUtils';

// 从统一类型定义文件导入
import {TaskSplitData} from '../types/types';

// 定义useTaskAnalysis的属性类型
interface UseTaskAnalysisProps {
  isOpen: boolean;
  projectId?: string;
  initialData?: TaskSplitData;
  onAnalysisComplete?: (data: any) => void;
}

export const useTaskAnalysis = ({
  isOpen,
  projectId,
  initialData = {},
  onAnalysisComplete
}: UseTaskAnalysisProps) => {
  // 状态管理
  const [streamingData, setStreamingData] = useState<TaskSplitData | null>(null);
  const [streamingComplete, setStreamingComplete] = useState(false);
  const [streamingError, setStreamingError] = useState<string | null>(null);

  // 引用管理
  const eventSourceRef = useRef<EventSource | null>(null);
  const hasConnectedRef = useRef(false);
  const dataProcessedRef = useRef(false);

  // 增加加载中状态 - 默认为false，确保按钮可点击
  const [isLoading, setIsLoading] = useState(false);

  // 并行执行提示 - 从流数据中提取
  const parallelismScore = streamingData?.parallelism_score ?? null;
  const parallelTips = streamingData?.parallel_execution_tips ?? '';

  /**
   * 初始化表单数据
   */
  const initializeFormWithData = useCallback((apiData: any) => {
    // 健壮性校验：如果数据无效，返回
    if (!apiData || (typeof apiData === 'object' && Object.keys(apiData).length === 0)) {
      return false;
    }

    try {
      // 提取和标准化数据
      const { mainTask, subTasksList } = extractTaskData(apiData);

      // 组合成TaskSplitData格式
      const formattedData: TaskSplitData = {
        mainTask: mainTask,
        subTasks: Array.isArray(subTasksList) ? subTasksList : []
      };

      // 更新流数据
      setStreamingData(formattedData);
      setStreamingComplete(true);

      return true;
    } catch (error) {
      console.error('初始化表单数据失败:', error);
      return false;
    }
  }, []);

  /**
   * 关闭SSE连接并重置状态
   */
  const closeEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  /**
   * 连接到任务分配流
   * @param taskDescription 任务描述，如果提供则使用这个描述进行分析
   */
  const connectToTaskAssignStream = useCallback((taskDescription?: string) => {
    // 如果没有项目ID，不应该发起连接
    if (!projectId) return;

    // 如果已经有有效的初始数据，不需要重新连接
    const hasValidInitialData = initialData && (
      (initialData.mainTask && initialData.mainTask.name) || 
      (initialData.main_task && initialData.main_task.name) || 
      (initialData.subTasks && initialData.subTasks.length > 0) ||
      (initialData.sub_tasks && initialData.sub_tasks.length > 0)
    );

    if (hasValidInitialData) {
      console.log('已有有效初始数据，跳过API调用', initialData);
      setIsLoading(false);
      return;
    }

    // 获取描述：优先使用传入的参数，然后是初始数据中的描述
    const description = taskDescription || 
                       initialData?.mainTask?.description || 
                       initialData?.main_task?.description;
    
    if (!description) {
      console.log('没有任务描述，无法进行分析');
      setIsLoading(false);
      return;
    }

    try {
      // 清理现有连接
      closeEventSource();

      // 重置状态
      setStreamingError(null);
      setStreamingComplete(false);
      setStreamingData(null);

      // 设置加载状态
      setIsLoading(true);

      console.log('开始任务分配流分析，描述:', description);
      // 创建新连接
      const es = taskApi.streamAssignTaskWithMainTaskDescription(projectId, description);
      eventSourceRef.current = es;

      // 处理消息事件
      es.onmessage = (evt: MessageEvent) => {
        try {
          const json = JSON.parse(evt.data);

          // 检查分析完成状态 (type: -2)
          if (Number(json.type) === -2) {
            handleAnalysisComplete(json, es);
            return;
          }

          // 常规完成标记
          if (json.status === 'COMPLETE' || json.complete === true) {
            // 设置最终数据并标记完成
            setStreamingData(json);
            setStreamingComplete(true);
            es.close();
            return;
          }

          // 只有当数据发生变化时才更新
          // 如果是不包含子任务或主任务的空消息，则跳过
          if (json.mainTask || json.main_task ||
              (json.subTasks && json.subTasks.length > 0) ||
              (json.sub_tasks && json.sub_tasks.length > 0)) {
            setStreamingData(json);
          }
        } catch (_) {
          // 可能是分片字符串，忽略
        }
      };

      // 处理错误
      es.onerror = () => {
        setStreamingError('SSE 连接错误');
        setIsLoading(false);
        es.close();
      };
    } catch (err) {
      console.error(err);
      setStreamingError('无法建立 SSE 连接');
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, initialData, closeEventSource]);

  /**
   * 重新启动分析过程 - 可以被外部调用
   * @param taskDescription 任务描述
   */
  const restartAnalysis = useCallback((taskDescription?: string) => {
    // 关闭现有连接
    closeEventSource();

    // 重置所有状态标记
    hasConnectedRef.current = false;
    dataProcessedRef.current = false;

    // 重置数据状态
    setStreamingData(null);
    setStreamingComplete(false);
    setStreamingError(null);

    // 重新连接 - 传递任务描述
    if (projectId) {
      connectToTaskAssignStream(taskDescription);
    }
  }, [projectId, connectToTaskAssignStream, closeEventSource]);

  /**
   * 处理分析完成事件 (状态码 -2)
   */
  const handleAnalysisComplete = (json: any, es: EventSource) => {
    // 防止重复处理
    if (dataProcessedRef.current) {
      es.close();
      return;
    }

    // 标记处理完成并关闭连接
    dataProcessedRef.current = true;
    setStreamingComplete(true);
    setIsLoading(false);
    es.close();

    // 创建分析数据对象
    const analysisData = {
      projectId,
      content: json.content,
      type: json.type
    };

    // 直接调用回调函数，减少事件传递延迟
    if (onAnalysisComplete) {
      // 通知父组件关闭弹框
      onAnalysisComplete({
        projectId,
        content: json.content,
        type: json.type,
        closeModal: true // 添加关闭弹框的标识
      });
    }

    // 同时触发自定义事件，作为备用机制
    try {
      // 创建并触发自定义事件
      window.dispatchEvent(new CustomEvent('forceCloseAnalysisLoading', {
        detail: { message: '任务分析完成', immediate: true }
      }));
      window.dispatchEvent(new CustomEvent('forceCloseModal'));
    } catch (e) {
      console.error('触发关闭事件失败:', e);
    }

    // 然后处理数据
    try {
      // 解析内容
      const parsedContent = JSON.parse(json.content || '{}');

      // 确保有效的数据对象
      if (parsedContent && typeof parsedContent === 'object') {
        // 仅调用一次初始化函数
        initializeFormWithData(parsedContent);

        // 仅当实际有数据处理时才发射事件
        analysisEventEmitter.emit(ANALYSIS_COMPLETE_EVENT, {
          ...analysisData,
          closeModal: true // 添加关闭弹框的标识
        });
      } else {
        console.error('未收到有效的分析数据');
      }

      if (onAnalysisComplete) {
        // 通知父组件关闭弹框
        onAnalysisComplete({
          ...analysisData,
          closeModal: true // 添加关闭弹框的标识
        });
      }

      // 延迟一下再次触发关闭事件，确保关闭
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('forceCloseAnalysisLoading'));
        window.dispatchEvent(new CustomEvent('forceCloseModal'));
      }, 500);
    } catch (e) {
      console.error('解析任务数据失败:', e);
      // 即使解析失败也关闭弹框
      if (onAnalysisComplete) {
        onAnalysisComplete({
          ...analysisData,
          closeModal: true
        });
      }
    }
  };

  // 生命周期管理：SSE 连接和事件监听
  useEffect(() => {
    // 首次打开弹窗时检查是否需要分析
    if (isOpen && projectId && !hasConnectedRef.current) {
      // 重置状态标记
      dataProcessedRef.current = false;
      hasConnectedRef.current = true;

      // 确保初始状态下按钮是启用的
      setIsLoading(false);

      // 检查是否已经有有效的初始数据
      const hasValidInitialData = initialData && (
        (initialData.mainTask && initialData.mainTask.name) || 
        (initialData.main_task && initialData.main_task.name) || 
        (initialData.subTasks && initialData.subTasks.length > 0) ||
        (initialData.sub_tasks && initialData.sub_tasks.length > 0)
      );
      
      console.log('检查有效初始数据:', { initialData, hasValidInitialData });

      if (hasValidInitialData) {
        // 如果有有效的初始数据，直接初始化表单，不需要重新分析
        console.log('使用已有的分析数据，跳过重新分析', initialData);
        
        // 直接初始化表单数据
        const success = initializeFormWithData(initialData);
        if (success) {
          // 标记数据处理完成
          dataProcessedRef.current = true;
        }
      } else {
        // 只有在没有有效初始数据时才进行分析
        console.log('没有初始数据，开始分析流程');
        connectToTaskAssignStream();
      }
    }

    // 添加分析完成事件监听器
    const handleExternalAnalysisComplete = (data: any) => {
      // 防止重复处理
      if (dataProcessedRef.current) {
        return;
      }

      // 提取数据内容
      let contentData = data.content || data.structuredTaskData;

      // 健壮性检查
      if (!data || !contentData) {
        console.error('分析完成事件数据不完整');
        return;
      }

      // 标记已经处理数据
      dataProcessedRef.current = true;

      // 初始化表单数据
      initializeFormWithData(contentData);
    };

    // 注册事件监听
    const unsubscribe = analysisEventEmitter.on(ANALYSIS_COMPLETE_EVENT, handleExternalAnalysisComplete);

    // 清理函数
    return () => {
      closeEventSource();
      unsubscribe();
      hasConnectedRef.current = false;
      dataProcessedRef.current = false;
    };
  }, [isOpen, projectId, connectToTaskAssignStream, initializeFormWithData, closeEventSource, initialData]);

  return {
    streamingData,
    streamingComplete,
    streamingError,
    isLoading,
    parallelismScore,
    parallelTips,
    initializeFormWithData,
    closeEventSource,
    restartAnalysis
  };
};
