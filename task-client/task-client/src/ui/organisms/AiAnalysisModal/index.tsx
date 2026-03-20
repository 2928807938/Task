"use client";

import React, {useEffect, useRef, useState} from "react";
import {AnimatePresence, motion} from 'framer-motion';
import SimpleLoadingView from '../CreateTaskConfirmModal/components/SimpleLoadingView';
import useTaskHook from '@/hooks/use-task-hook';
import {useRouter} from 'next/navigation';
import {useQueryClient} from '@tanstack/react-query';
import {useToast} from '@/ui/molecules/Toast';
import {useTheme} from '@/ui/theme/themeContext';
import {useAnalysisPanelsHook} from '@/hooks/use-analysis-panels-hook';
import useAiAnalysisDataHook from '@/hooks/use-ai-analysis-data-hook';

// 导入历史记录相关组件和工具
// 历史记录相关导入已移除
// 导入组件
import AiAnalysisHeader from './components/AiAnalysisHeader';
import AiAnalysisContent from './components/AiAnalysisContent';
import ConfirmDialog from './components/ConfirmDialog';
import ConversationHistoryDrawer from './components/ConversationHistoryDrawer';
import CreateTaskConfirmModal from '../CreateTaskConfirmModal';
import TaskDetailModal from './components/TaskDetailModal';
import {
    ANALYSIS_COMPLETE_EVENT,
    analysisEventEmitter,
    RESET_ANALYSIS_DATA_EVENT
} from '../CreateTaskConfirmModal/utils/analysisEventEmitter';
import {CLOSE_AI_ANALYSIS_MODAL_EVENT} from '../CreateTaskConfirmModal/utils/closeModalEvent';
import TaskDependencyGraph from './components/TaskDependencyGraph';
import {ChatMessage, ComprehensiveAnalysis, SubTask, Suggestion, TaskSplitData} from './components/types';
import requirementConversationApi, {
    CreateRequirementConversationRequest,
    RequirementConversationHistorySummary
} from '@/adapters/api/requirement-conversation-api';
import {
    createInitialAnalysisData,
    createInitialMessages,
    restoreConversationFromHistoryDetail
} from './components/history-utils';

// 类型转换函数：将内部TaskSplitData转换为CreateTaskConfirmModal需要的格式
type TaskArrangementData = NonNullable<ComprehensiveAnalysis['taskArrangement']>;
type TaskArrangementPhase = TaskArrangementData['phases'][number];
type TaskArrangementTask = TaskArrangementPhase['tasks'][number];
type TaskArrangementRisk = TaskArrangementData['riskManagement'][number];

const normalizeHistorySummaries = (data: unknown): RequirementConversationHistorySummary[] => {
    if (Array.isArray(data)) {
        return data as RequirementConversationHistorySummary[];
    }

    if (data && typeof data === 'object' && 'conversationListId' in data) {
        return [data as RequirementConversationHistorySummary];
    }

    return [];
};

const convertTaskSplitData = (data: TaskSplitData | undefined): Record<string, unknown> => {
    if (!data) return {};

    // 转换子任务数据结构
    const convertedSubTasks = data.sub_tasks?.map(subTask => ({
        id: subTask.id,
        name: subTask.name || '',  // 确保name字段有值
        description: subTask.description,
        assigneeId: '0',           // 默认分配给ID为'0'的用户
        hours: 4,                  // 默认工时
        priorityScore: 50,         // 默认优先级
        dependencies: subTask.dependency || []
    })) || [];

    return {
        mainTask: {
            name: data.main_task?.name || '',
            description: data.main_task?.description || '',
            assigneeId: '0',       // 默认分配给ID为'0'的用户
            totalHours: 0,         // 默认总工时
            priorityScore: 50      // 默认优先级
        },
        subTasks: convertedSubTasks,
        parallelism_score: data.parallelism_score,
        parallel_execution_tips: data.parallel_execution_tips
    };
};

// 弹窗组件属性
interface AiAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
    conversationListId?: string | null;
}

// AI分析弹窗主组件


const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({ isOpen, onClose, projectId, conversationListId }) => {
    const router = useRouter();
    const queryClient = useQueryClient(); // 将useQueryClient移到组件顶层
    const { theme } = useTheme(); // 获取主题

    // 在组件顶层获取创建任务的mutation
    // 获取Toast组件
    const { addToast } = useToast();
    const [isCreatingRequirementConversation, setIsCreatingRequirementConversation] = useState(false);

    const [messages, setMessages] = useState<ChatMessage[]>(createInitialMessages());
    const [activeConversationListId, setActiveConversationListId] = useState<string | null>(conversationListId || null);
    const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
    const [historySummaries, setHistorySummaries] = useState<RequirementConversationHistorySummary[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [loadingHistoryConversationListId, setLoadingHistoryConversationListId] = useState<string | null>(null);

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

    // 使用封装后的面板控制Hook
    const { activePanelId, handlePanelToggle } = useAnalysisPanelsHook();

    // 依赖图弹窗状态
    const [dependencyGraphModalOpen, setDependencyGraphModalOpen] = useState<boolean>(false);
    const [taskSplitDataForGraph, setTaskSplitDataForGraph] = useState<TaskSplitData | null>(null);
    const [detailTask, setDetailTask] = useState<SubTask | null>(null);
    const [taskDetailModalOpen, setTaskDetailModalOpen] = useState<boolean>(false);

    // 注意：不再使用自定义的isAssigning状态，直接使用API提供的isAssignStreaming状态

    // 监听关闭AI分析模态框事件
    useEffect(() => {
        const handleCloseAiAnalysisModal = () => {
            onClose();
        };

        window.addEventListener(CLOSE_AI_ANALYSIS_MODAL_EVENT, handleCloseAiAnalysisModal);

        return () => {
            window.removeEventListener(CLOSE_AI_ANALYSIS_MODAL_EVENT, handleCloseAiAnalysisModal);
        };
    }, [onClose]);

    // 打开依赖图弹窗
    const openDependencyGraphModal = (taskData: TaskSplitData) => {
        setTaskSplitDataForGraph(taskData);
        setDependencyGraphModalOpen(true);
    };

    // 处理任务点击
    const handleTaskClick = (taskId: string) => {
        if (!taskSplitDataForGraph) return;

        // 找到被点击的任务
        const task = taskSplitDataForGraph.sub_tasks.find(t => t.id === taskId);
        if (!task) return;

        // 设置详情任务并打开详情模态框
        setDetailTask(task);
        setTaskDetailModalOpen(true);
    };

    // 使用任务API hook
    const taskApiHook = useTaskHook();
    const {
        streamAnalyzeTask,
        streamAssignTask,
        resetAnalysis,
        resetAssign,
        analysisMessages,
        analysisResult,
        isStreaming,
        streamingError,
        streamingComplete,
        // 分配任务相关状态
        isAssignStreaming,
        assignStreamingComplete,
        assignResult
    } = taskApiHook;

    // 使用自定义hook处理分析数据
    const {
        analysisData,
        setAnalysisData
    } = useAiAnalysisDataHook(
        analysisResult,
        isStreaming,
        streamingError,
        streamingComplete,
        analysisMessages,
        messages,
        setMessages
    );

    const resetConversationViewRef = useRef<() => void>(() => undefined);

    resetConversationViewRef.current = () => {
        resetAnalysis();
        resetAssign();
        setMessages(createInitialMessages());
        setAnalysisData(createInitialAnalysisData());

        if (activePanelId) {
            handlePanelToggle(activePanelId);
        }

        setIsConfirmDialogOpen(false);
        setIsCreateTaskModalOpen(false);
    };

    const fetchHistorySummaries = async () => {
        if (!projectId) {
            setHistoryError('缺少项目ID，无法查询历史对话');
            setHistorySummaries([]);
            return;
        }

        setIsHistoryLoading(true);
        setHistoryError(null);

        try {
            const response = await requirementConversationApi.getProjectRequirementConversationHistories(projectId);
            const normalizedSummaries = normalizeHistorySummaries(response.data);

            if (response.success && (response.data === null || response.data === undefined)) {
                setHistorySummaries([]);
                setHistoryError(null);
                return;
            }

            if (!response.success) {
                setHistorySummaries([]);
                setHistoryError(response.message || '历史对话加载失败');
                return;
            }

            setHistorySummaries(normalizedSummaries.map((item) => ({
                ...item,
                conversationListId: String(item.conversationListId),
                projectId: String(item.projectId),
                conversationId: String(item.conversationId),
            })));
        } catch (error) {
            console.error('加载历史对话失败:', error);
            setHistorySummaries([]);
            setHistoryError('历史对话加载失败，请稍后重试');
        } finally {
            setIsHistoryLoading(false);
        }
    };

    const handleOpenHistory = async () => {
        setIsHistoryDrawerOpen(true);
        await fetchHistorySummaries();
    };

    const handleSelectHistory = async (history: RequirementConversationHistorySummary) => {
        const historyConversationListId = String(history.conversationListId);
        setLoadingHistoryConversationListId(historyConversationListId);

        try {
            const response = await requirementConversationApi.getRequirementConversationHistoryDetail(historyConversationListId);

            if (!response.success || !response.data) {
                addToast(response.message || '历史对话详情加载失败', 'error');
                return;
            }

            const restoredConversation = restoreConversationFromHistoryDetail({
                ...response.data,
                conversationListId: String(response.data.conversationListId),
                projectId: String(response.data.projectId),
                conversation: {
                    ...response.data.conversation,
                    id: String(response.data.conversation.id),
                    conversationListId: String(response.data.conversation.conversationListId),
                },
                turns: Array.isArray(response.data.turns)
                    ? response.data.turns.map((turn) => ({
                        ...turn,
                        id: String(turn.id),
                        conversationListId: String(turn.conversationListId),
                    }))
                    : [],
            });

            resetAnalysis();
            resetAssign();
            setMessages(restoredConversation.messages);
            setAnalysisData(restoredConversation.analysisData);
            setActiveConversationListId(historyConversationListId);
            setIsHistoryDrawerOpen(false);
            addToast(`已恢复历史会话：${restoredConversation.title}`, 'success');
        } catch (error) {
            console.error('恢复历史对话失败:', error);
            addToast('恢复历史对话失败，请稍后重试', 'error');
        } finally {
            setLoadingHistoryConversationListId(null);
        }
    };

    const handleCreateNewConversation = async () => {
        if (!projectId) {
            addToast('缺少项目信息，无法创建新对话', 'error');
            return;
        }

        try {
            const response = await requirementConversationApi.createRequirementConversationList({ projectId });

            if (!response.success || response.data === null || response.data === undefined) {
                addToast(response.message || '新建对话失败，请稍后重试', 'error');
                return;
            }

            setActiveConversationListId(String(response.data));
            resetConversationViewRef.current();
            setIsHistoryDrawerOpen(false);
            await fetchHistorySummaries();
        } catch (error) {
            console.error('新建对话失败:', error);
            addToast('新建对话失败，请稍后重试', 'error');
        }
    };

    // 清空对话消息和分析数据
    const handleClearMessages = () => {
        resetConversationViewRef.current();
    };

    // 创建新对话
    const handleNewConversation = async () => {
        await handleCreateNewConversation();
    };

    // 通过useAiAnalysisData自定义hook已经处理了所有的分析数据适配和状态更新

    // 监听分析结果的变化
    useEffect(() => {
        if (!analysisResult) return;

        // 当分析完成时，更新历史记录
        if (streamingComplete) {
            // 等待一下，确保分析数据和消息都已更新
            setTimeout(() => {
            }, 500);
        }
    }, [analysisResult, streamingComplete]);

    // 监听重置数据事件
    useEffect(() => {
        // 重置数据的处理函数
        const handleResetData = () => {
            resetConversationViewRef.current();
        };

        // 注册重置事件监听器
        analysisEventEmitter.on(RESET_ANALYSIS_DATA_EVENT, handleResetData);

        return () => {
            // 清理监听器
            analysisEventEmitter.off(RESET_ANALYSIS_DATA_EVENT, handleResetData);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setActiveConversationListId(conversationListId ? String(conversationListId) : null);
    }, [conversationListId, isOpen]);

    // 监听模态框打开状态，首次打开时清理数据
    useEffect(() => {
        if (!isOpen) return;
        resetConversationViewRef.current();
        setIsHistoryDrawerOpen(false);
        setHistoryError(null);
        setLoadingHistoryConversationListId(null);

        // 项目信息已在其他地方加载
    }, [isOpen]);

    // 监听任务分配结果的变化
    useEffect(() => {
        // 当任务分配完成时，自动打开创建任务确认模态框并更新数据
        if (assignStreamingComplete && assignResult) {
            // 先打开创建任务确认模态框
            setIsCreateTaskModalOpen(true);

            // 注意：不再手动控制关闭弹框，现在由API自动控制

            try {

                // 解析任务拆分数据
                let taskSplitData = null;
                let hasValidData = false;

                // 首先尝试使用结构化数据
                if (assignResult.structuredTaskData &&
                    assignResult.structuredTaskData.mainTask &&
                    assignResult.structuredTaskData.mainTask.name &&
                    Array.isArray(assignResult.structuredTaskData.subTasks)) {
                    taskSplitData = assignResult.structuredTaskData;
                    hasValidData = true;
                }
                // 然后尝试解析taskSplit数据
                else if (assignResult.taskSplit && assignResult.taskSplit.trim() !== '') {
                    try {
                        taskSplitData = JSON.parse(assignResult.taskSplit);
                        hasValidData = true;
                    } catch (e) {
                        console.error('解析taskSplit数据失败:', e);
                    }
                } else {
                    console.log('structuredTaskData和taskSplit数据都为空，检查其他字段');
                }

                // 如果上述数据解析失败，尝试使用type字段
                if (!hasValidData && assignResult.type && assignResult.type.trim() !== '') {
                    try {
                        const typeData = JSON.parse(assignResult.type);
                        taskSplitData = {
                            mainTask: {
                                name: typeData?.title || '新任务',
                                description: typeData?.description || ''
                            },
                            subTasks: []
                        };
                        hasValidData = true;
                    } catch (e) {
                        console.error('解析type字段失败:', e);
                    }
                }

                // 如果没有有效数据，构造一个默认的任务对象
                if (!hasValidData) {
                    console.warn('所有字段都为空，没有生成有效任务数据');
                    taskSplitData = null;
                }

                // 不再强制补充默认子任务，如果没有子任务则保持为空，由后续UI兜底提示


                // 等待一下确保UI更新
                setTimeout(() => {
                    // 发送任务分配完成事件
                    const analysisData = {
                        projectId: projectId || '',
                        content: JSON.stringify(taskSplitData),
                        type: -2
                    };

                    // 使用CreateTaskConfirmModal中导入的事件发射器
                    analysisEventEmitter.emit(ANALYSIS_COMPLETE_EVENT, analysisData);

                    // 只重置任务分配状态，不关闭创建任务模态框
                    resetAssign();

                    // 打开创建任务模态框
                    setIsCreateTaskModalOpen(true);

                    // 不再自动关闭AI分析界面，让用户手动关闭
                }, 300);
            } catch (error) {
                console.error('处理任务分配数据失败:', error);
                addToast('处理任务数据失败，请重试', 'error');

                // 不关闭创建任务模态框，只重置分配状态
                resetAssign();

                // 显示错误提示，但不关闭AI分析界面
            }
        }
    }, [assignStreamingComplete, assignResult, projectId, resetAssign, addToast]);

    const handleSendMessage = (content: string) => {
        if (!content.trim()) return;

        // 不完全重置分析数据，只更新流式状态
        setAnalysisData(prev => ({
            ...prev,  // 保留现有的分析数据
            isStreaming: true,   // 将流式状态设置为正在进行
            streamingError: null, // 清除可能的错误
            streamingComplete: false, // 重置流式完成状态
        }));

        // 添加用户新消息到现有消息列表，保留历史记录
        setMessages(prev => [
            ...prev,
            {
                content,
                isAi: false
            }
        ]);

        // 添加AI思考中的消息
        setTimeout(() => {
            const thinkingMessage: ChatMessage = {
                content: "正在思考...",
                isAi: true
            };
            setMessages(prev => [...prev, thinkingMessage]);

            // 重设分析状态，然后调用API
            resetAnalysis();
            // 调用API进行分析
            streamAnalyzeTask(projectId || '', content, activeConversationListId);

        }, 100); // 小延时确保状态设置正确

        // 更新最后一条消息为正在分析
        setTimeout(() => {
            setMessages(prev => {
                const newMessages = [...prev];
                // 找到最后一条AI消息
                const lastAiMessageIndex = newMessages.findIndex(
                    m => m.isAi && m.content === "正在思考..."
                );
                if (lastAiMessageIndex !== -1) {
                    newMessages[lastAiMessageIndex] = {
                        ...newMessages[lastAiMessageIndex],
                        content: "正在分析您的需求，请稍候..."
                    };
                }
                return newMessages;
            });
        }, 1000);
        return;
    }

    const buildRequirementConversationPayload = (currentConversationListId: string): CreateRequirementConversationRequest => {
        const toStringArray = (value: unknown, fallback: string[] = []): string[] => {
            if (Array.isArray(value)) {
                return value.filter(item => item !== null && item !== undefined && String(item).trim() !== '').map(item => String(item));
            }
            if (typeof value === 'string' && value.trim()) {
                return [value.trim()];
            }
            return fallback;
        };

        const toDisplayWorkload = (value: unknown): string => {
            if (value === null || value === undefined || value === '') return '0人天';
            if (typeof value === 'number') return `${value}人天`;
            const normalized = String(value).trim();
            if (!normalized) return '0人天';
            if (normalized.includes('人天') || normalized.includes('工时')) {
                return normalized;
            }
            return `${normalized}人天`;
        };

        const userMessages = messages
            .filter(message => !message.isAi)
            .map(message => message.content.trim())
            .filter(Boolean);

        const taskSplitData = analysisData.taskSplitData;
        const summaryData = analysisData.comprehensiveAnalysis?.summary;
        const arrangementData = analysisData.comprehensiveAnalysis?.taskArrangement;
        const priorityData = analysisData.priorityData || {};
        const completenessData = analysisData.completenessAnalysis;
        const pertWorkloadData = analysisData.pertWorkloadData || {};

        const title =
            summaryData?.title ||
            taskSplitData?.main_task?.name ||
            (userMessages[0] ? userMessages[0].slice(0, 30) : '需求分析');

        const subTasks = (taskSplitData?.sub_tasks || []).map((task, index) => ({
            id: task.id || `T${index + 1}`,
            description: task.description || task.name || `子任务${index + 1}`,
            dependency: Array.isArray(task.dependency) ? task.dependency : [],
            priority: task.priority || '中',
            parallel_group: task.parallel_group || 'G1'
        }));

        const suggestionList = Array.isArray(analysisData.suggestions)
            ? analysisData.suggestions.map((item: string | Suggestion) => {
                if (typeof item === 'string') {
                    return {
                        type: 'info',
                        title: '优化建议',
                        icon: '💡',
                        color: '#4CAF50',
                        description: item
                    };
                }

                return {
                    type: item.type || 'info',
                    title: item.title || '优化建议',
                    icon: item.icon || '💡',
                    color: item.color || '#4CAF50',
                    description: item.description || ''
                };
            })
            : [];

        const phases = Array.isArray(arrangementData?.phases)
            ? arrangementData.phases.map((phase: TaskArrangementPhase, phaseIndex: number) => ({
                name: phase.name || `阶段${phaseIndex + 1}`,
                description: phase.description || '',
                estimatedWorkload: phase.estimatedWorkload || '0人天',
                suggestedTimeframe: phase.suggestedTimeframe || '',
                tasks: Array.isArray(phase.tasks)
                    ? phase.tasks.map((task: TaskArrangementTask, taskIndex: number) => ({
                        name: task.name || `任务${taskIndex + 1}`,
                        priority: task.priority || '中',
                        estimatedWorkload: task.estimatedWorkload || '0人天',
                        dependencies: toStringArray(task.dependencies),
                        assignmentSuggestion: task.assignmentSuggestion || ''
                    }))
                    : []
            }))
            : [];

        const fallbackPhase = {
            name: '任务拆分',
            description: '基于AI分析生成的任务拆分',
            estimatedWorkload: toDisplayWorkload(pertWorkloadData.expected || 0),
            suggestedTimeframe: '待排期',
            tasks: subTasks.map((task) => ({
                name: task.description,
                priority: task.priority,
                estimatedWorkload: '待评估',
                dependencies: task.dependency,
                assignmentSuggestion: ''
            }))
        };

        const resourceRecommendations = (arrangementData?.resourceRecommendations ?? {}) as {
            personnel?: unknown;
            skills?: unknown;
            tools?: unknown;
        };
        const personnelRaw = resourceRecommendations?.personnel;

        return {
            conversationListId: currentConversationListId,
            title,
            requirementCategory: {
                tags: toStringArray(analysisData.tags, ['需求分析']),
                colors: toStringArray(analysisData.colors, ['#0A84FF'])
            },
            priorityAnalysis: {
                priority: {
                    level: priorityData?.priority?.level || analysisData.priorityLevel || 'MEDIUM',
                    score: Number(priorityData?.priority?.score || analysisData.priorityScore || 70),
                    analysis: priorityData?.priority?.analysis || analysisData.priorityAnalysis || '基于AI分析结果自动生成'
                },
                scheduling: {
                    recommendation: priorityData?.scheduling?.recommendation || 'CURRENT_ITERATION',
                    factors: {
                        difficulty: priorityData?.scheduling?.factors?.difficulty || '中等',
                        resourceMatch: priorityData?.scheduling?.factors?.resourceMatch || '待评估',
                        dependencies: priorityData?.scheduling?.factors?.dependencies || '待评估'
                    },
                    justification: priorityData?.scheduling?.justification || '基于AI分析结果自动生成'
                }
            },
            workloadEstimation: {
                optimistic: toDisplayWorkload(pertWorkloadData.optimistic ?? 0),
                most_likely: toDisplayWorkload(pertWorkloadData.most_likely ?? 0),
                pessimistic: toDisplayWorkload(pertWorkloadData.pessimistic ?? 0),
                expected: toDisplayWorkload(pertWorkloadData.expected ?? 0),
                standard_deviation: toDisplayWorkload(pertWorkloadData.standard_deviation ?? 0)
            },
            taskBreakdown: {
                main_task: taskSplitData?.main_task?.name || title,
                sub_tasks: subTasks,
                parallelism_score: taskSplitData?.parallelism_score || 0,
                parallel_execution_tips: taskSplitData?.parallel_execution_tips || ''
            },
            requirementCompleteness: {
                overallCompleteness: completenessData?.overallCompleteness || '0%',
                aspects: Array.isArray(completenessData?.aspects) ? completenessData!.aspects.map(aspect => ({
                    name: aspect.name || '未命名方面',
                    completeness: aspect.completeness || '0%'
                })) : [],
                optimizationSuggestions: Array.isArray(completenessData?.optimizationSuggestions)
                    ? completenessData!.optimizationSuggestions.map(suggestion => ({
                        icon: suggestion.icon || '',
                        content: suggestion.content || ''
                    }))
                    : []
            },
            requirementSuggestions: {
                suggestions: suggestionList
            },
            requirementAnalysisSummary: {
                summary: {
                    title,
                    overview: summaryData?.overview || userMessages[0] || '基于AI分析结果自动生成',
                    keyPoints: toStringArray(summaryData?.keyPoints, taskSplitData?.sub_tasks?.map(task => task.description).filter(Boolean).slice(0, 3) || ['待补充关键点']),
                    challenges: toStringArray(summaryData?.challenges, ['待补充挑战项']),
                    opportunities: toStringArray(summaryData?.opportunities, ['待补充机会点'])
                },
                taskArrangement: {
                    phases: phases.length > 0 ? phases : [fallbackPhase],
                    resourceRecommendations: {
                        personnel: Array.isArray(personnelRaw)
                            ? personnelRaw.filter((item: unknown) => item !== null && item !== undefined && String(item).trim() !== '').map((item: unknown) => String(item))
                            : (personnelRaw ? [String(personnelRaw)] : []),
                        skills: toStringArray(resourceRecommendations?.skills),
                        tools: toStringArray(resourceRecommendations?.tools)
                    },
                    riskManagement: Array.isArray(arrangementData?.riskManagement)
                        ? arrangementData.riskManagement.map((risk: TaskArrangementRisk) => ({
                            risk: risk.risk || '',
                            impact: risk.impact || '',
                            mitigation: risk.mitigation || ''
                        }))
                        : []
                }
            }
        };
    };

    const handleCreateTask = async () => {
        // 检查项目ID
        if (!projectId) {
            addToast('缺少项目信息', 'error');
            return;
        }

        if (!activeConversationListId) {
            addToast('会话初始化失败，请重新点击创建任务', 'error');
            return;
        }

        if (isCreatingRequirementConversation) {
            return;
        }

        // 如果没有任务拆分数据，提示用户将进行自动分析
        if (!analysisData.taskSplitData) {
            setMessages(prev => [
                ...prev,
                {
                    content: "将为您自动进行任务分析...",
                    isAi: true
                }
            ]);
        }

        try {
            const requirementPayload = buildRequirementConversationPayload(activeConversationListId);
            console.info('[RequirementConversation] 准备创建需求对话列表', {
                endpoint: '/api/client/requirement-conversation/create',
                projectId,
                conversationListId: activeConversationListId,
                title: requirementPayload.title
            });

            setIsCreatingRequirementConversation(true);
            try {
                const requirementResponse = await requirementConversationApi.createRequirementConversation(requirementPayload);
                if (!requirementResponse.success) {
                    console.error('创建需求对话列表失败:', requirementResponse.message || requirementResponse.code);
                    addToast(`需求对话创建失败: ${requirementResponse.message || requirementResponse.code}`, 'error');
                } else {
                    console.info('[RequirementConversation] 创建成功', {
                        requirementConversationId: requirementResponse.data
                    });
                    addToast('需求对话创建成功', 'success');
                }
            } catch (requirementError) {
                console.error('调用创建需求对话列表接口异常:', requirementError);
                addToast('调用需求对话创建接口异常', 'error');
            } finally {
                setIsCreatingRequirementConversation(false);
            }

            // 强制多次调用resetAssign确保状态完全重置
            // 这是最关键的一步使用hook中的重置函数来重置状态
            resetAssign();
            // 再次调用以确保完全重置
            resetAssign();
            // 如果可能，直接从任务API hook中再次调用
            taskApiHook.resetAssign();

            // 强制清除所有缓存
            queryClient.removeQueries({ queryKey: ['taskAssignStream'] });
            queryClient.removeQueries({ queryKey: ['assignTask'] });
            queryClient.removeQueries({ queryKey: ['assignMessages'] });
            queryClient.removeQueries({ queryKey: ['assignResult'] });
            queryClient.removeQueries({ queryKey: ['taskAssign', projectId] });

            // 构造要提交的数据
            let assignTaskData;
            
            if (analysisData.taskSplitData) {
                // 如果有任务拆分数据，使用现有数据
                const mainTask = analysisData.taskSplitData.main_task;
                const subTasks = analysisData.taskSplitData.sub_tasks || [];

                const formattedSubTasks = subTasks.map((task, index) => ({
                    id: task.id || `T${index + 1}`,
                    name: task.name || `子任务${index + 1}`,
                    description: task.description || '',
                    assigneeId: '',  // 默认空
                    hours: 0,      // 默认为0
                    priorityScore: task.priority ? parseInt(task.priority) || 50 : 50,
                    dependencies: task.dependency || []
                }));

                assignTaskData = {
                    mainTask: {
                        name: mainTask?.name || '新任务',
                        description: mainTask?.description || '',
                        assigneeId: '',  // 默认空
                        totalHours: 0,   // 默认为0
                        priorityScore: 50, // 默认为50
                        endTime: mainTask?.endTime || undefined // 添加截止时间字段
                    },
                    subTasks: formattedSubTasks
                };
            } else {
                // 如果没有任务拆分数据，创建基础任务描述供分析
                const lastUserMessage = messages.filter(msg => !msg.isAi).pop();
                const taskDescription = lastUserMessage?.content || '根据项目需求创建一个基本任务';
                
                assignTaskData = {
                    description: taskDescription,
                    needsAnalysis: true // 标记需要分析
                };
                
                console.log('没有taskSplitData，使用描述进行分析:', taskDescription);
            }
            const dataString = JSON.stringify(assignTaskData);

            // 关键改动！先强制多次重置任务分配状态
            resetAssign();
            taskApiHook.resetAssign();

            // 确保关闭创建任务确认模态框
            setIsCreateTaskModalOpen(false);

            // 使用替代方案引起界面更新，跳过直接访问内部状态
            // 直接将消息添加到当前对话中
            setMessages(prev => [
                ...prev,
                {
                    content: '正在准备分配任务...',
                    isAi: true
                }
            ]);

            // 注意：不再手动设置isAssignStreaming，这在streamAssignTask函数内部自动设置

            // 等待大约一帧的时间，确保UI先刷新
            setTimeout(() => {
                // 启动流式分配任务调用
                console.log('开始调用任务分配流接口');
                streamAssignTask(projectId, dataString);

                // 注意：不再在这里移除task-assigning类
                // 而是在CreateTaskConfirmModal显示后再移除
            }, 50);

            // 注意：创建任务确认模态框将在useEffect中监测到assignStreamingComplete时打开
        } catch (error) {
            console.error('调用流式分配任务接口失败:', error);
            addToast('调用任务分配接口失败，请重试', 'error');
            resetAssign();
        }
    };

    // 如果弹窗未打开，不渲染任何内容
    if (!isOpen) return null;

    return (
        <>
            {/* 任务分配中的弹框，使用AnalysisLoadingView组件 */}
            <AnimatePresence>
                {isAssignStreaming && (
                    <SimpleLoadingView />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="modal-backdrop"
                        className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center backdrop-blur-sm ai-analysis-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col w-full max-w-7xl h-[85vh] overflow-hidden"
                            style={{
                                backgroundColor: `${theme.colors.card.background}E6`, // 90% opacity
                                boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.12), 0 12px 20px -10px rgba(0, 0, 0, 0.08)',
                                borderColor: theme.colors.card.border
                            }}
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* 使用封装的AiAnalysisHeader组件 */}
                            <AiAnalysisHeader
                                isStreaming={analysisData.isStreaming}
                                streamingError={analysisData.streamingError}
                                streamingComplete={analysisData.streamingComplete}
                                hasTaskSplitData={!!analysisData.taskSplitData}
                                onClose={onClose}
                                onNewConversation={handleNewConversation}
                                onOpenHistory={handleOpenHistory}
                                onCreateTask={handleCreateTask}
                                disableHistoryActions={!!analysisData.isStreaming || !!isAssignStreaming || isCreatingRequirementConversation}
                            />

                            {/* 使用封装的内容组件 */}
                            <AiAnalysisContent
                                analysisData={analysisData}
                                messages={messages}
                                activePanelId={activePanelId}
                                handlePanelToggle={handlePanelToggle}
                                openDependencyGraphModal={openDependencyGraphModal}
                                setDetailTask={setDetailTask}
                                setTaskDetailModalOpen={setTaskDetailModalOpen}
                                handleCreateTask={handleCreateTask}
                                handleSendMessage={handleSendMessage}
                                setIsConfirmDialogOpen={setIsConfirmDialogOpen}
                            />

                            <ConversationHistoryDrawer
                                isOpen={isHistoryDrawerOpen}
                                histories={historySummaries}
                                activeConversationListId={activeConversationListId}
                                loading={isHistoryLoading}
                                loadingConversationListId={loadingHistoryConversationListId}
                                error={historyError}
                                onClose={() => setIsHistoryDrawerOpen(false)}
                                onRefresh={fetchHistorySummaries}
                                onCreateNew={handleNewConversation}
                                onSelect={handleSelectHistory}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 任务依赖图弹窗 - 全局层级 */}
            <AnimatePresence>
                {dependencyGraphModalOpen && taskSplitDataForGraph && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="rounded-2xl shadow-xl w-[90vw] max-w-5xl h-[80vh] overflow-hidden"
                            style={{
                                backgroundColor: theme.colors.card.background,
                                borderColor: theme.colors.card.border
                            }}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <TaskDependencyGraph
                                taskSplitData={taskSplitDataForGraph}
                                onClose={() => setDependencyGraphModalOpen(false)}
                                onViewTaskDetail={(task) => {
                                    setDetailTask(task);
                                    setTaskDetailModalOpen(true);
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 任务详情模态框 - 使用封装的组件 */}
            <TaskDetailModal
                isOpen={taskDetailModalOpen}
                onClose={() => setTaskDetailModalOpen(false)}
                task={detailTask}
                allTasks={taskSplitDataForGraph?.sub_tasks || []}
                onViewDependencyTask={handleTaskClick}
            />

            {/* 确认弹窗 - 苹果风格改进 */}
            <ConfirmDialog
                key="confirm-dialog"
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={handleClearMessages}
                title="确认清空对话"
                message="是否确认清空所有对话记录？此操作不可恢复。"
            />

            {/* 创建任务确认弹窗 */}
            <CreateTaskConfirmModal
                isOpen={isCreateTaskModalOpen}
                onClose={() => setIsCreateTaskModalOpen(false)}
                onConfirm={() => {
                    try {
                        // 显示成功提示
                        addToast('任务创建成功!', 'success');

                        // 关闭弹窗
                        setIsCreateTaskModalOpen(false);

                        // 关闭AI分析弹窗
                        setTimeout(() => {
                            onClose();
                        }, 500);

                        // 跳转到项目详情页
                        // 注意：这里我们无法知道创建的任务ID，因此只能跳转到项目页面
                        if (projectId) {
                            setTimeout(() => {
                                router.push(`/projects/${projectId}`);
                            }, 800);
                        }
                    } catch (error) {
                        console.error('❌ 处理任务创建结果时出错:', error);
                        // 处理错误，显示错误提示
                        let errorMessage = '处理任务创建结果失败';
                        if (error instanceof Error) {
                            errorMessage = `${errorMessage}: ${error.message}`;
                        }
                        addToast(errorMessage, 'error');
                    }
                }}
                initialData={(() => {
                    // 日志开关 - 只在开发环境且需要详细日志时打开
                    // 转换数据结构
                    const convertedData = convertTaskSplitData(analysisData.taskSplitData);
                    return convertedData;
                })()}
                projectId={projectId}
            />
        </>
    );
};

// 仅使用命名导出，解决多个默认导出的问题
export { AiAnalysisModal };
