"use client";

import {useCallback, useEffect, useRef, useState} from 'react';
import {
  AnalysisData,
  ChatMessage,
  CompletenessAnalysis,
  ComprehensiveAnalysis,
  Suggestion,
  TaskSplitData
} from '@/ui/organisms/AiAnalysisModal/components/types';
import {WorkloadAnalysisData} from '@/ui/organisms/AiAnalysisModal/components/WorkloadAnalysisPanel';
import {PertWorkloadData} from '@/ui/organisms/AiAnalysisModal/components/PertWorkloadPanel';
import {AnalysisMessage, AnalysisMessageType, AnalysisResult} from './use-task-hook';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type TaskSplitSubTaskInput = Partial<TaskSplitData['sub_tasks'][number]> & Record<string, JsonValue>;
type TaskSplitParsedData = JsonObject & {
  main_task?: string | TaskSplitData['main_task'];
  sub_tasks?: TaskSplitSubTaskInput[];
  parallelism_score?: number;
  parallel_execution_tips?: string;
};

type CompletenessCategory = {
  name?: string;
  category?: string;
  completeness?: string;
  score?: string | number;
  suggestions?: string;
  recommendation?: string;
};

type CompletenessDetailValue = {
  completeness?: string;
  score?: string | number;
  suggestions?: string;
  recommendation?: string;
};

type SuggestionInput = string | {
  icon?: string;
  type?: string;
  title?: string;
  color?: string;
  content?: string;
  text?: string;
  message?: string;
  description?: string;
};

type RecommendationInput = {
  priority?: string;
  content?: string;
  text?: string;
  description?: string;
};

type CompletenessParsedData = JsonObject & {
  overallCompleteness?: string;
  overall?: string | number;
  completeness?: string | number;
  aspects?: CompletenessAnalysis['aspects'];
  categories?: CompletenessCategory[];
  details?: Record<string, string | CompletenessDetailValue>;
  optimizationSuggestions?: CompletenessAnalysis['optimizationSuggestions'];
  suggestions?: SuggestionInput[];
  recommendations?: RecommendationInput[];
};

type PriorityParsedData = JsonObject & {
  priority?: {
    level?: string;
    score?: number;
    analysis?: string;
  };
  scheduling?: JsonValue;
};

const normalizeSuggestions = (value: JsonValue): string[] | Suggestion[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalized = value.reduce<Array<string | Suggestion>>((result, item) => {
    if (typeof item === 'string') {
      result.push(item);
      return result;
    }

    if (!isJsonObject(item)) {
      return result;
    }

    const title = typeof item.title === 'string' ? item.title : '';
    const descriptionCandidate = [item.description, item.content, item.text, item.message]
      .find((entry) => typeof entry === 'string');
    const description = typeof descriptionCandidate === 'string' ? descriptionCandidate : '';

    result.push({
      type: typeof item.type === 'string' ? item.type : 'info',
      title,
      icon: typeof item.icon === 'string' ? item.icon : 'ℹ️',
      color: typeof item.color === 'string' ? item.color : 'blue',
      description
    });

    return result;
  }, []);

  if (normalized.every((item): item is string => typeof item === 'string')) {
    return normalized;
  }

  return normalized.filter((item): item is Suggestion => typeof item !== 'string');
};

const formatCompletenessValue = (value?: string | number): string => {
  if (typeof value === 'number') {
    return `${value}%`;
  }
  return value || '0%';
};

const isJsonObject = (value: JsonValue | null): value is JsonObject => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export default function useAiAnalysisDataHook(
  analysisResult: AnalysisResult,
  isStreaming: boolean,
  streamingError: string | null,
  streamingComplete: boolean,
  analysisMessages: AnalysisMessage[],
  messages: ChatMessage[],
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) {
  // 初始化分析数据
  const [analysisData, setAnalysisData] = useState<AnalysisData>({
    overallScore: 0,
    requirementScore: 0,
    riskScore: 0,
    progressScore: 0,
    keyFindings: [],
    risks: [],
    suggestions: [],
    tags: [],
    colors: [],
    isStreaming: false,
    streamingError: null,
    streamingComplete: false,
    priorityLevel: '',
    priorityScore: 0,
    priorityAnalysis: '',
  });

  // 使用useRef跟踪已处理的分析结果，避免重复处理
  const processedPriorityRef = useRef<string>('');
  const processedCompletionRef = useRef<string>('');
  const processedSuggestionsRef = useRef<string>('');
  const processedTaskSplitRef = useRef<string>('');
  const processedWorkloadRef = useRef<string>('');
  const processedComprehensiveRef = useRef<string>('');

  // 监听分析消息和结果的变化
  useEffect(() => {
    if (analysisMessages.length > 0) {
      // 将分析消息转换为聊天消息
      const newMessages: ChatMessage[] = [];
      analysisMessages.forEach(msg => {
        if (msg.type === AnalysisMessageType.START) {
          // 分析开始消息不需要显示
        } else if (msg.type === AnalysisMessageType.COMPLETE) {
          newMessages.push({
            content: "分析已完成，您可以查看左侧的分析结果或继续提问。",
            isAi: true,
            type: msg.type
          });

          // 当分析完成时，更新analysisData中的streamingComplete状态
          setAnalysisData(prevData => ({
            ...prevData,
            streamingComplete: true
          }));
        } else if (msg.type === AnalysisMessageType.ERROR) {
          newMessages.push({
            content: `分析出错：${msg.content}`,
            isAi: true,
            type: msg.type
          });
        } else {
          // 其他类型的消息按需添加
        }
      });

      if (newMessages.length > 0) {
        setMessages(prev => {
          // 过滤掉之前已添加的消息，但保留COMPLETE类型的消息
          const existingTypes = prev.map(m => m.type);
          const uniqueNewMessages = newMessages.filter(m =>
              m.type === AnalysisMessageType.COMPLETE || !existingTypes.includes(m.type));
          return [...prev, ...uniqueNewMessages];
        });
      }
    }
  }, [analysisMessages, setMessages]);

  // 监听流式分析状态变化
  useEffect(() => {
    setAnalysisData(prev => ({
      ...prev,
      isStreaming: isStreaming,
      streamingError: streamingError,
      streamingComplete: streamingComplete
    }));
  }, [isStreaming, streamingError, streamingComplete]);

  // 检查数据是否完整可解析
  const isDataCompleteForParsing = useCallback((content: string): boolean => {
    if (!content || content.trim() === '') {
      return false;
    }

    // 检查是否存在未闭合的Markdown代码块
    const startMarkerCount = (content.match(/```json/g) || []).length;
    const endMarkerCount = (content.match(/```(?!json)/g) || []).length;

    // 如果存在代码块标记但是开始和结束标记数量不匹配，说明数据不完整
    if (startMarkerCount > 0 && startMarkerCount !== endMarkerCount) {
      return false;
    }

    // 简单检查JSON结构是否平衡
    let openBraces = 0, openBrackets = 0;
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '{') openBraces++;
      else if (content[i] === '}') openBraces--;
      else if (content[i] === '[') openBrackets++;
      else if (content[i] === ']') openBrackets--;
    }

    // 如果括号不平衡，说明JSON不完整
    return !(openBraces !== 0 || openBrackets !== 0);
  }, []);

  // 通用的JSON解析方法，用于处理各种类型的JSON数据（包括Markdown格式）
  const parseJsonContent = useCallback((content: string): JsonValue | null => {
    if (!content || content.trim() === '') {
      return null;
    }

    // 首先检查数据是否完整可解析
    if (!isDataCompleteForParsing(content)) {
      return null;
    }

    try {
      // 直接尝试解析JSON
      try {
        return JSON.parse(content.trim());
      } catch {
        // 直接解析失败，继续尝试其他方法
      }

      // 预处理文本
      let cleanedContent = content;

      // 尝试移除Markdown代码块格式
      if (cleanedContent.includes('```')) {
        // 先尝试提取完整的JSON块
        const jsonMatch = cleanedContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            const extractedJson = jsonMatch[1].trim();
            return JSON.parse(extractedJson);
          } catch {
            // 继续使用其他方法尝试
          }
        }

        // 如果提取失败，尝试清理Markdown标记
        cleanedContent = cleanedContent
            .replace(/```json[\r\n\s]*/g, '')
            .replace(/```[\r\n\s]*$/g, '')
            .replace(/```[\r\n\s]*/g, '')
            .trim();
      }

      // 尝试解析清理后的内容
      try {
        return JSON.parse(cleanedContent);
      } catch {
        // 尝试修复JSON
        try {
          // 修复可能的JSON格式问题
          let fixedJson = cleanedContent
              // 修复缺少引号的属性
              .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
              // 修复单引号
              .replace(/:\s*'([^']*)'/g, ': "$1"')
              // 修复未终止的字符串（将所有未闭合的引号闭合）
              .replace(/"([^"]*)(?=[\r\n]|$)/g, '"$1"')
              // 修复缺少逗号的情况
              .replace(/}(\s*){/g, '},\n{')
              // 修复数组元素之间缺少逗号的情况
              .replace(/}(\s*)\[/g, '},\n[')
              .replace(/](\s*){/g, '],\n{')
              // 修复尾随逗号
              .replace(/,(\s*)([\]}])/g, '$1$2');

          try {
            return JSON.parse(fixedJson);
          } catch {
            // 如果还是失败，尝试更激进的修复
            // 移除所有可能导致问题的转义字符
            fixedJson = fixedJson.replace(/\\(?=[^"\\])/g, '');
            // 确保所有属性名都有引号
            fixedJson = fixedJson.replace(/(\w+)\s*:/g, '"$1":');
            try {
              return JSON.parse(fixedJson);
            } catch {
              // 继续尝试下一个方法
            }
          }
        } catch {
          // 继续尝试其他方法
        }

        // 作为最后的尝试，寻找任何看起来像JSON的字符串
        try {
          const jsonPattern = /(\{[\s\S]*?})/g;
          const matches = cleanedContent.match(jsonPattern);

          if (matches && matches.length > 0) {
            // 遍历所有匹配项，尝试找到一个可以解析的JSON
            for (const match of matches) {
              try {
                return JSON.parse(match);
              } catch {
                // 尝试修复这个匹配项
                try {
                  const fixedMatch = match
                      // 修复未终止的字符串
                      .replace(/"([^"]*)(?=[\r\n]|$)/g, '"$1"')
                      // 确保所有属性名都有引号
                      .replace(/(\w+)\s*:/g, '"$1":');
                  return JSON.parse(fixedMatch);
                } catch {
                  // 继续尝试下一个
                }
              }
            }
          }
        } catch {
          // 最后尝试失败
        }

        // 如果所有尝试都失败，返回一个空对象而不是null
        // 这样至少可以避免UI出错
        return {};
      }
    } catch {
      // JSON解析过程中出现意外错误
      return {};
    }
  }, [isDataCompleteForParsing]);

  // 处理建议数据
  const handleSuggestionsData = useCallback((): boolean => {
    try {
      if (!analysisResult || !analysisResult.suggestions) return false;

      // 处理原始数据，仅清理Markdown代码块
      let rawData = analysisResult.suggestions.trim();

      // 只清理Markdown代码块，不做其他处理
      if (rawData.includes('```')) {
        // 先尝试提取完整的JSON块
        const jsonMatch = rawData.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          // 如果成功匹配到完整的JSON块，直接使用它
          rawData = jsonMatch[1].trim();
        } else {
          // 否则使用替换方法清理
          rawData = rawData
              .replace(/```json[\r\n\s]*/g, '')
              .replace(/```[\r\n\s]*$/g, '')
              .replace(/```[\r\n\s]*/g, '')
              .trim();
        }
      }

      // 如果rawData为空或者仅包含空白字符，则跳过解析
      if (!rawData || rawData.trim() === '') {
        return false; // 跳过空数据
      }

      // 尝试解析为JSON对象
      const parsedData = parseJsonContent(rawData);

      // 检查解析后的数据是否符合预期结构
      if (isJsonObject(parsedData) && Array.isArray(parsedData.suggestions)) {
        const normalizedSuggestions = normalizeSuggestions(parsedData.suggestions);

        // 更新分析数据
        setAnalysisData(prev => ({
          ...prev,
          suggestions: normalizedSuggestions
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('处理建议数据出错:', error);
      return false;
    }
  }, [analysisResult, parseJsonContent]);

  // 处理任务拆分数据
  const handleTaskSplitData = useCallback((): boolean => {
    try {
      if (!analysisResult || !analysisResult.taskSplit) {
        return false;
      }

      // 处理原始数据，清理Markdown代码块
      let rawData = analysisResult.taskSplit.trim();

      // 清理Markdown代码块
      if (rawData.includes('```')) {
        // 先尝试提取完整的JSON块
        const jsonMatch = rawData.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          // 如果成功匹配到完整的JSON块，直接使用它
          rawData = jsonMatch[1].trim();
        } else {
          // 否则使用替换方法清理
          rawData = rawData
              .replace(/```json[\r\n\s]*/g, '')
              .replace(/```[\r\n\s]*$/g, '')
              .replace(/```[\r\n\s]*/g, '')
              .trim();
        }
      }

      // 尝试解析为JSON对象
      const parsedData = parseJsonContent(rawData);
      if (!isJsonObject(parsedData)) return false;
      const taskSplitData = parsedData as TaskSplitParsedData;

      // 标准化数据结构
      // 先处理子任务数据，确保字段名称一致性
      const processedSubTasks: TaskSplitData['sub_tasks'] = Array.isArray(taskSplitData.sub_tasks)
        ? taskSplitData.sub_tasks.flatMap((task, index) => {
          if (!task) {
            return [];
          }

          return [{
            ...task,
            id: typeof task.id === 'string' ? task.id : `task-${Date.now()}-${index}`,
            name: typeof task.name === 'string' ? task.name : `子任务 ${index + 1}`,
            description: typeof task.description === 'string' ? task.description : '',
            dependency: Array.isArray(task.dependency)
              ? task.dependency.filter((item): item is string => typeof item === 'string')
              : [],
            priority: typeof task.priority === 'string' ? task.priority : '中',
            parallel_group: typeof task.parallel_group === 'string' ? task.parallel_group : '默认'
          }];
        })
        : [];

      const standardData: TaskSplitData = {
        main_task: typeof taskSplitData.main_task === 'string' ?
            {name: taskSplitData.main_task, description: ''} :
            taskSplitData.main_task || {name: '', description: ''},
        sub_tasks: processedSubTasks,
        parallelism_score: typeof taskSplitData.parallelism_score === 'number' ? taskSplitData.parallelism_score : 0,
        parallel_execution_tips: typeof taskSplitData.parallel_execution_tips === 'string' ? taskSplitData.parallel_execution_tips : ''
      };

      // 更新分析数据
      setAnalysisData(prev => {
        // 只在有数据的情况下才更新
        if (standardData.main_task?.name && standardData.sub_tasks.length > 0) {
          return {
            ...prev,
            taskSplitData: standardData
          };
        }
        return prev;
      });

      return true;

    } catch {
      return false;
    }
  }, [analysisResult, parseJsonContent]);

  // 处理工作量分析数据
  const handleWorkloadAnalysisData = useCallback((): boolean => {
    try {
      // 处理原始数据，清理Markdown代码块
      let rawData = analysisResult?.workload?.trim();

      if (!rawData) {
        return false;
      }

      // 清理Markdown代码块
      if (rawData.includes('```')) {
        // 先尝试提取完整的JSON块
        const jsonMatch = rawData.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          // 如果成功匹配到完整的JSON块，直接使用它
          rawData = jsonMatch[1].trim();
        } else {
          // 否则使用替换方法清理
          rawData = rawData
              .replace(/```json[\r\n\s]*/g, '')
              .replace(/```[\r\n\s]*$/g, '')
              .replace(/```[\r\n\s]*/g, '')
              .trim();
        }
      }

      // 如果rawData为空或者仅包含空白字符，则跳过解析
      if (!rawData || rawData.trim() === '') {
        return false; // 跳过空数据
      }

      // 解析JSON数据
      try {
        // 尝试解析JSON，如果数据不完整，逐步尝试删除可能不完整的部分
        let parsedData: PertWorkloadData | WorkloadAnalysisData;
        try {
          parsedData = JSON.parse(rawData);
        } catch {
          // 如果直接解析失败，尝试修复不完整的JSON
          // 删除最后一个可能不完整的对象或数组
          let fixedData = rawData;

          // 尝试找到最后一个完整的花括号或方括号
          const lastValidBrace = Math.max(
              fixedData.lastIndexOf('}'),
              fixedData.lastIndexOf(']')
          );

          if (lastValidBrace > 0) {
            // 只保留到最后一个有效括号
            fixedData = fixedData.substring(0, lastValidBrace + 1);
            try {
              parsedData = JSON.parse(fixedData);
            } catch {
              // 如果修复失败，则静默返回失败
              return false;
            }
          } else {
            // 如果找不到有效的括号，则静默返回失败
            return false;
          }
        }

        // 检查是否为PERT三点估算格式数据
        if (
            parsedData &&
            'optimistic' in parsedData &&
            'most_likely' in parsedData &&
            'pessimistic' in parsedData
        ) {
          // 这是PERT三点估算数据
          const pertWorkloadData: PertWorkloadData = parsedData;

          // 如果没有expected值，自动计算
          if (!pertWorkloadData.expected) {
            pertWorkloadData.expected = (
                pertWorkloadData.optimistic +
                4 * pertWorkloadData.most_likely +
                pertWorkloadData.pessimistic
            ) / 6;
          }

          // 如果没有standard_deviation值，自动计算
          if (!pertWorkloadData.standard_deviation) {
            pertWorkloadData.standard_deviation = (
                pertWorkloadData.pessimistic - pertWorkloadData.optimistic
            ) / 6;
          }

          // 更新分析数据
          setAnalysisData(prev => ({
            ...prev,
            pertWorkloadData
          }));

          return true;
        }

        // 检查是否为详细工作量数据（带明细的格式）
        if (parsedData.breakdown && Array.isArray(parsedData.breakdown)) {
          const workloadData: WorkloadAnalysisData = parsedData;

          // 如果没有summaryByResource，自动计算各资源类型的总工时
          if (!workloadData.summaryByResource) {
            const summary: { [key: string]: number } = {};
            workloadData.breakdown.forEach(item => {
              if (item.resourceType) {
                summary[item.resourceType] = (summary[item.resourceType] || 0) + item.estimatedHours;
              }
            });
            workloadData.summaryByResource = summary;
          }

          // 如果没有totalEstimatedHours，自动计算总工时
          if (!workloadData.totalEstimatedHours) {
            workloadData.totalEstimatedHours = workloadData.breakdown.reduce(
                (total, item) => total + (item.estimatedHours || 0),
                0
            );
          }

          // 更新分析数据
          setAnalysisData(prev => ({
            ...prev,
            workloadData
          }));

          return true;
        }

        return false;

      } catch {
        // 静默返回失败，不输出日志
        return false;
      }
    } catch {
      return false;
    }
  }, [analysisResult]);

  // 处理完整度分析数据
  const handleCompletenessAnalysisData = useCallback((): boolean => {
    try {
      if (!analysisResult || !analysisResult.completion) {
        return false;
      }

      // 处理原始数据，清理Markdown代码块
      let rawData = analysisResult.completion.trim();

      // 清理Markdown代码块
      if (rawData.includes('```')) {
        // 先尝试提取完整的JSON块
        const jsonMatch = rawData.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          // 如果成功匹配到完整的JSON块，直接使用它
          rawData = jsonMatch[1].trim();
        } else {
          // 否则使用替换方法清理
          rawData = rawData
              .replace(/```json[\r\n\s]*/g, '')
              .replace(/```[\r\n\s]*$/g, '')
              .replace(/```[\r\n\s]*/g, '')
              .trim();
        }
      }

      // 尝试解析为JSON对象
      const parsedData = parseJsonContent(rawData);
      if (!isJsonObject(parsedData)) return false;
      const completenessData = parsedData as CompletenessParsedData;

      // 标准化数据结构
      const standardData: CompletenessAnalysis = {
        overallCompleteness: '0%',
        aspects: [],
        optimizationSuggestions: []
      };

      // 处理总体完整度
      if (completenessData.overallCompleteness) {
        standardData.overallCompleteness = completenessData.overallCompleteness;
      } else if (completenessData.overall) {
        standardData.overallCompleteness = typeof completenessData.overall === 'string'
            ? completenessData.overall
            : `${completenessData.overall}%`;
      } else if (completenessData.completeness) {
        standardData.overallCompleteness = typeof completenessData.completeness === 'string'
            ? completenessData.completeness
            : `${completenessData.completeness}%`;
      }

      // 处理各方面完整度
      if (Array.isArray(completenessData.aspects)) {
        standardData.aspects = completenessData.aspects.map((aspect) => ({
          name: aspect.name,
          completeness: formatCompletenessValue(aspect.completeness),
          suggestions: aspect.suggestions
        }));
      } else if (Array.isArray(completenessData.categories)) {
        standardData.aspects = completenessData.categories.map((cat) => ({
          name: cat.name || cat.category || '',
          completeness: formatCompletenessValue(cat.completeness || cat.score),
          suggestions: cat.suggestions || cat.recommendation || ''
        }));
      } else if (completenessData.details && typeof completenessData.details === 'object') {
        standardData.aspects = Object.entries(completenessData.details).map(([key, value]) => ({
          name: key,
          completeness: typeof value === 'string' ? value : formatCompletenessValue(value.completeness || value.score),
          suggestions: typeof value === 'string' ? '' : value.suggestions || value.recommendation || ''
        }));
      }

      // 处理优化建议
      if (Array.isArray(completenessData.optimizationSuggestions)) {
        standardData.optimizationSuggestions = completenessData.optimizationSuggestions;
      } else if (Array.isArray(completenessData.suggestions)) {
        standardData.optimizationSuggestions = completenessData.suggestions.map((sug) => {
          if (typeof sug === 'string') {
            return {icon: "ℹ️", content: sug};
          } else {
            return {
              icon: sug.icon || (sug.type === 'warning' ? '⚠️' :
                  sug.type === 'error' ? '❌' :
                      sug.type === 'success' ? '✅' : 'ℹ️'),
              content: sug.content || sug.text || sug.message || ''
            };
          }
        });
      } else if (Array.isArray(completenessData.recommendations)) {
        standardData.optimizationSuggestions = completenessData.recommendations.map((rec) => ({
          icon: rec.priority === 'high' ? '❌' :
              rec.priority === 'medium' ? '⚠️' :
                  rec.priority === 'low' ? '✅' : 'ℹ️',
          content: rec.content || rec.text || rec.description || ''
        }));
      }

      // 更新分析数据
      setAnalysisData(prev => {
        // 只在有数据的情况下才更新
        if (standardData.overallCompleteness || standardData.aspects.length > 0 || standardData.optimizationSuggestions.length > 0) {
          return {
            ...prev,
            completenessAnalysis: standardData
          };
        }
        return prev;
      });

      return true;

    } catch {
      return false;
    }
  }, [analysisResult, parseJsonContent]);

  // 处理优先级分析数据
  const handlePriorityAnalysisData = useCallback((): boolean => {
    try {
      if (!analysisResult || !analysisResult.priority) return false;

      // 处理原始数据，仅清理Markdown代码块
      let rawData = analysisResult.priority.trim();

      // 只清理Markdown代码块，不做其他处理
      if (rawData.includes('```')) {
        // 先尝试提取完整的JSON块
        const jsonMatch = rawData.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          // 如果成功匹配到完整的JSON块，直接使用它
          rawData = jsonMatch[1].trim();
        } else {
          // 否则使用替换方法清理
          rawData = rawData
              .replace(/```json[\r\n\s]*/g, '')
              .replace(/```[\r\n\s]*$/g, '')
              .replace(/```[\r\n\s]*/g, '')
              .trim();
        }
      }

      // 如果rawData为空或者仅包含空白字符，则跳过解析
      if (!rawData || rawData.trim() === '') {
        return false; // 跳过空数据
      }

      // 尝试解析为JSON对象
      let parsedData: PriorityParsedData | null = null;

      try {
        // 尝试使用通用JSON解析方法
        const jsonData = parseJsonContent(rawData);
        parsedData = isJsonObject(jsonData) ? (jsonData as PriorityParsedData) : null;

        // 检查解析后的数据是否符合预期结构
        if (isJsonObject(parsedData)) {
          // 更新分析数据
          setAnalysisData(prev => ({
            ...prev,
            priorityLevel: parsedData?.priority?.level || '中优先级',
            priorityScore: parsedData?.priority?.score || 70,
            priorityAnalysis: parsedData?.priority?.analysis || '',
            priorityData: parsedData
          }));
          return true;
        }
      } catch {
        // 流式数据中可能会出现不完整的JSON片段，这是正常情况
        if (process.env.NODE_ENV === 'development') {
          console.debug('优先级数据解析跳过:', rawData.substring(0, 50) + '...');
        }
      }
      return false;
    } catch (error) {
      console.error('处理优先级数据出错:', error);
      return false;
    }
  }, [analysisResult, parseJsonContent]);

  // 处理综合分析数据
  const handleComprehensiveAnalysisData = useCallback((): boolean => {
    if (!analysisResult || !analysisResult.comprehensive) {
      return false;
    }

    try {
      // 清理数据，提取JSON
      let dataContent = analysisResult.comprehensive.trim();
      let parsedData: ComprehensiveAnalysis | null = null;

      // 检查是否是Markdown代码块格式
      if (dataContent.includes('```json')) {

        // 检查代码块是否完整（有开始和结束标记）
        if (dataContent.includes('```json') && dataContent.includes('```', dataContent.indexOf('```json') + 6)) {
          // 使用更可靠的方法提取JSON
          const jsonStartIndex = dataContent.indexOf('```json') + 7;
          const jsonEndIndex = dataContent.indexOf('```', jsonStartIndex);

          if (jsonEndIndex > jsonStartIndex) {
            // 手动提取代码块内容
            dataContent = dataContent.substring(jsonStartIndex, jsonEndIndex).trim();
          }
        } else {
          return false;
        }
      }

      try {
        // 尝试解析JSON
        const jsonData = parseJsonContent(dataContent);
        if (isJsonObject(jsonData)) {
          const summary = isJsonObject(jsonData.summary) ? jsonData.summary : undefined;
          const taskArrangement = isJsonObject(jsonData.taskArrangement) ? jsonData.taskArrangement : undefined;

          parsedData = {
            content: typeof jsonData.content === 'string' ? jsonData.content : JSON.stringify(jsonData),
            summary: summary as unknown as ComprehensiveAnalysis['summary'],
            taskArrangement: taskArrangement as unknown as ComprehensiveAnalysis['taskArrangement'],
            recommendations: Array.isArray(jsonData.recommendations)
              ? jsonData.recommendations.filter((item): item is string => typeof item === 'string')
              : undefined
          };
        }

        // 检查是否有必要的字段
        if (!parsedData || !parsedData.summary) {
          return false; // 数据不完整，等待更多数据
        }

        // 使用解析后的数据创建消息
        const comprehensiveMessage: ChatMessage = {
          content: JSON.stringify(parsedData, null, 2),  // 格式化的JSON数据
          isAi: true,
          type: 8, // 综合分析类型
          isComprehensiveAnalysis: true,
          structuredData: parsedData // 保存解析后的结构化数据
        };

        // 过滤掉之前可能存在的失败解析消息
        setMessages(prevMessages => [
          ...prevMessages.filter(m => !(m.type === 8 && m.structuredData?.summary?.overview === '无法解析数据结构。请查看左侧面板了解完整分析。')),  // 移除之前的错误消息
          comprehensiveMessage
        ]);

        // 更新全局分析数据
        setAnalysisData(prev => ({
          ...prev,
          comprehensiveAnalysis: parsedData || undefined
        }));

        return true;
      } catch {
        // 当解析失败时，什么也不做，待数据完整后再尝试
        return false;
      }
    } catch {
      return false;
    }
  }, [analysisResult, parseJsonContent, setMessages]);

  // 监听分析结果的变化
  useEffect(() => {
    if (!analysisResult) return;

    // 尝试自动处理完整度分析数据
    if (analysisResult.completion && analysisResult.completion !== processedCompletionRef.current) {
      // 只有在数据流结束或数据完整时才处理
      if (streamingComplete || isDataCompleteForParsing(analysisResult.completion)) {
        // 更新已处理的完整度数据引用
        processedCompletionRef.current = analysisResult.completion;
        handleCompletenessAnalysisData();
      }
    }

    // 尝试自动处理建议数据
    if (analysisResult.suggestions && analysisResult.suggestions !== processedSuggestionsRef.current) {
      // 只有在数据流结束或数据完整时才处理
      if (streamingComplete || isDataCompleteForParsing(analysisResult.suggestions)) {
        // 更新已处理的建议数据引用
        processedSuggestionsRef.current = analysisResult.suggestions;
        handleSuggestionsData();
      }
    }

    // 尝试自动处理任务拆分数据
    if (analysisResult.taskSplit && analysisResult.taskSplit !== processedTaskSplitRef.current) {
      // 只有在数据流结束或数据完整时才处理
      if (streamingComplete || isDataCompleteForParsing(analysisResult.taskSplit)) {
        // 更新已处理的任务拆分数据引用
        processedTaskSplitRef.current = analysisResult.taskSplit;
        handleTaskSplitData();
      }
    }

    // 尝试自动处理工作量分析数据
    if (analysisResult.workload && analysisResult.workload !== processedWorkloadRef.current) {
      // 只有在数据流结束或数据完整时才处理
      if (streamingComplete || isDataCompleteForParsing(analysisResult.workload)) {
        // 更新已处理的工作量分析数据引用
        processedWorkloadRef.current = analysisResult.workload;
        handleWorkloadAnalysisData();
      }
    }

    // 尝试自动处理优先级分析数据
    if (analysisResult.priority && analysisResult.priority !== processedPriorityRef.current) {
      // 更新已处理的优先级数据引用
      processedPriorityRef.current = analysisResult.priority;
      handlePriorityAnalysisData();
    }

    // 尝试自动处理综合分析数据
    if (analysisResult.comprehensive && analysisResult.comprehensive !== processedComprehensiveRef.current) {
      // 只有在数据流结束或数据完整时才处理
      if (streamingComplete || isDataCompleteForParsing(analysisResult.comprehensive)) {
        // 更新已处理的综合分析数据引用
        processedComprehensiveRef.current = analysisResult.comprehensive;
        handleComprehensiveAnalysisData();
      }
    }
  }, [analysisResult, streamingComplete, handleCompletenessAnalysisData, handleComprehensiveAnalysisData, handlePriorityAnalysisData, handleSuggestionsData, handleTaskSplitData, handleWorkloadAnalysisData, isDataCompleteForParsing]);

  // 返回需要的状态和函数
  return {
    analysisData,
    setAnalysisData,
    handleSuggestionsData,
    handleTaskSplitData,
    handleWorkloadAnalysisData,
    handleCompletenessAnalysisData,
    handlePriorityAnalysisData,
    handleComprehensiveAnalysisData,
    parseJsonContent
  };
}
