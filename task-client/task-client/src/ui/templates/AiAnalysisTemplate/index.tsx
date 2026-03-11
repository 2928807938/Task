"use client";

import React, {useEffect, useRef, useState} from "react";
import {
    FiAlertCircle,
    FiCheckCircle,
    FiChevronDown,
    FiChevronUp,
    FiDownload,
    FiHelpCircle,
    FiInfo,
    FiMessageSquare,
    FiPlus,
    FiSend,
    FiSettings,
    FiShare2,
    FiStar
} from "react-icons/fi";
import {HiChartBar} from "react-icons/hi";
import {useRouter} from 'next/navigation';
import {AnimatePresence, motion} from 'framer-motion';
import useTaskHook from '@/hooks/use-task-hook';
import TagList from '@/ui/molecules/TagList';

// 聊天气泡组件 - 与Projects页面风格一致
const ChatBubble: React.FC<{
    isAi: boolean;
    children: React.ReactNode;
}> = ({ isAi, children }) => {
    return (
        <div className={`flex ${isAi ? "justify-start" : "justify-end"} mb-2`}>
            <div
                className={`flex max-w-[85%] ${
                    isAi
                        ? "bg-white border border-gray-200 shadow-sm rounded-lg"
                        : "bg-blue-50 border border-blue-100 rounded-lg shadow-sm"
                } px-3 py-2.5 transition-all`}
            >
                {isAi && (
                    <div className="flex-shrink-0 mr-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-sm">
                            <FiMessageSquare className="w-3.5 h-3.5" />
                        </div>
                    </div>
                )}
                <div>{children}</div>
            </div>
        </div>
    );
};

// 聊天消息组件 - 改进样式
const ChatMessage: React.FC<{
    message: { content: string; isAi: boolean };
}> = ({ message }) => {
    return (
        <ChatBubble isAi={message.isAi}>
            <p className="text-sm leading-relaxed">{message.content}</p>
        </ChatBubble>
    );
};

// 进度条组件 - 使用蓝色系并添加动画效果
const ProgressBar: React.FC<{ percentage: number; color?: string }> = ({
                                                                           percentage,
                                                                           color = "bg-blue-500"
                                                                       }) => {
    return (
        <div className="w-full bg-gray-100 rounded-full h-2">
            <div
                className={`${color} h-2 rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

// 分析卡片组件 - 与Projects页面风格一致
const AnalysisCard: React.FC<{
    title: string;
    children: React.ReactNode;
    variant?: "default" | "suggestion" | "warning" | "success";
    icon?: React.ReactNode;
    expandable?: boolean;
}> = ({ title, children, variant = "default", icon, expandable = false }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const bgColorMap = {
        default: "bg-white",
        suggestion: "bg-blue-50",
        warning: "bg-yellow-50",
        success: "bg-green-50"
    };

    const borderColorMap = {
        default: "border-gray-200",
        suggestion: "border-blue-200",
        warning: "border-yellow-200",
        success: "border-green-200"
    };

    return (
        <div className={`rounded-lg ${bgColorMap[variant]} border ${borderColorMap[variant]} mb-3 shadow-sm hover:shadow transition-shadow duration-300 overflow-hidden`}>
            <div className="flex justify-between items-center p-3 border-b border-gray-100">
                <div className="flex items-center">
                    {icon && <span className="mr-2">{icon}</span>}
                    <h3 className="font-semibold text-gray-800">{title}</h3>
                </div>
                {expandable && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                    </button>
                )}
            </div>
            {(!expandable || isExpanded) && (
                <div className="p-3">
                    {children}
                </div>
            )}
        </div>
    );
};

// 建议项组件 - 与Projects页面风格一致
const SuggestionItem: React.FC<{
    children: React.ReactNode;
    icon: "check" | "warning" | "info";
    onClick?: () => void;
}> = ({ children, icon, onClick }) => {
    const iconMap = {
        check: <FiCheckCircle className="text-green-500 flex-shrink-0" size={16} />,
        warning: <FiAlertCircle className="text-yellow-500 flex-shrink-0" size={16} />,
        info: <FiInfo className="text-blue-500 flex-shrink-0" size={16} />
    };

    return (
        <div
            className={`flex items-start p-2 rounded-md border border-gray-100 mb-2 hover:bg-gray-50 transition-colors duration-200 ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <div className="mr-2.5 mt-0.5">
                {iconMap[icon]}
            </div>
            <div className="text-sm leading-relaxed flex-grow">{children}</div>
        </div>
    );
};

// 聊天界面组件 - 改进交互体验并统一风格
const ChatInterface: React.FC<{
    messages: Array<{ content: string; isAi: boolean }>;
    onSendMessage: (message: string) => void;
}> = ({ messages, onSendMessage }) => {
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const suggestedQueries = [
        "帮我设计一个电商网站",
        "需要一个CRM系统",
        "我想开发一款移动应用"
    ];

    // 自动滚动到最新消息
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isSending) {
            setIsSending(true);
            onSendMessage(inputValue.trim());
            setInputValue("");

            // 模拟发送延迟
            setTimeout(() => {
                setIsSending(false);
            }, 500);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* 聊天头部 */}
            <div className="border-b border-gray-200 p-3 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <FiMessageSquare className="text-blue-600" size={14} />
                    </div>
                    <h2 className="font-semibold text-gray-800">需求对话</h2>
                    <div className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">在线</div>
                </div>
                <div className="flex space-x-2">
                    <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500">
                        <FiSettings size={16} />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500">
                        <FiHelpCircle size={16} />
                    </button>
                </div>
            </div>

            {/* 聊天内容区域 */}
            <div className="flex-grow overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <FiMessageSquare className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">开始您的需求对话</h3>
                        <p className="text-gray-500 mb-6 max-w-sm">描述您的产品需求，AI将帮助分析并提供建议。</p>
                        <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                            {suggestedQueries.map((query, index) => (
                                <button
                                    key={index}
                                    className="text-left px-4 py-2 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors flex items-center"
                                    onClick={() => onSendMessage(query)}
                                >
                                    <FiMessageSquare className="mr-2 text-blue-500" size={14} />
                                    {query}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChatMessage message={msg} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 聊天输入区域 */}
            <div className="border-t border-gray-200 p-3 bg-white sticky bottom-0">
                <form onSubmit={handleSubmit} className="flex">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="描述您的需求或问题..."
                        className="flex-grow border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-300 shadow-sm"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        className={`ml-2 px-3 py-2 rounded-lg ${isSending ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors shadow-sm flex items-center`}
                        disabled={isSending}
                    >
                        <FiSend size={16} />
                        <span className="ml-1 font-medium">发送</span>
                    </button>
                </form>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>自动保存中...</span>
                    <span>字数限制: 0/1000</span>
                </div>
            </div>
        </div>
    );
};

// 分析面板组件 - 改进信息展示层次
const AnalysisPanel: React.FC<{
    analysisData: {
        requirementType: string;
        requirementTypeTags: string[];
        requirementTypeColors: string[];
        completionScore: number;
        functionalityScore: number;
        userExperienceScore: number;
        technicalFeasibilityScore: number;
        suggestions: Array<{
            type: "improvement" | "warning" | "info";
            content: string;
        }>;
    } | null;
}> = ({ analysisData }) => {
    if (!analysisData) {
        return (
            <div className="p-4 flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">AI正在分析您的需求...</p>
                <p className="text-gray-500 text-sm mt-2">这通常需要几秒钟时间</p>
            </div>
        );
    }

    // 计算总体评分
    const overallScore = Math.round(
        (analysisData.completionScore +
            analysisData.functionalityScore +
            analysisData.userExperienceScore +
            analysisData.technicalFeasibilityScore) / 4
    );

    // 得分级别评语
    const getScoreComment = (score: number) => {
        if (score >= 90) return "非常好";
        if (score >= 80) return "良好";
        if (score >= 70) return "一般";
        if (score >= 60) return "需要改进";
        return "存在问题";
    };

    // 评分颜色
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 70) return "text-blue-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="p-3 h-full overflow-y-auto">
            {/* 需求概要 */}
            <AnalysisCard
                title="需求概要"
                variant="default"
                icon={<FiStar className="text-blue-500" size={18} />}
            >
                <div className="border-b border-gray-100 pb-4 mb-4">
                    <div className="mb-2">
                        <div className="flex items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">需求类型：</span>
                        </div>
                        {analysisData.requirementTypeTags && analysisData.requirementTypeTags.length > 0 ? (
                            <TagList
                                tags={analysisData.requirementTypeTags}
                                colors={analysisData.requirementTypeColors}
                                className="mt-1"
                            />
                        ) : (
                            <span className="text-gray-500 text-sm italic">正在分析...</span>
                        )}
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex items-center">
                            <span className="text-sm text-gray-600 mr-2">总体评分：</span>
                            <span className={`text-xl font-bold ${getScoreColor(overallScore)}`}>
                                {overallScore}
                            </span>
                        </div>
                        <span className="text-xs text-gray-500">{getScoreComment(overallScore)}</span>
                    </div>
                </div>
            </AnalysisCard>

            {/* 详细评分 */}
            <AnalysisCard
                title="详细评分"
                expandable={true}
                icon={<FiCheckCircle className="text-blue-500" size={18} />}
            >
                <div className="space-y-4">
                    {/* 完整性评分 */}
                    <div>
                        <div className="flex justify-between mb-1.5">
                            <span className="font-medium text-gray-700">完整性</span>
                            <div className="flex items-center">
                                <span className="font-semibold mr-1.5 text-blue-600">{analysisData.completionScore}%</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                    {getScoreComment(analysisData.completionScore)}
                                </span>
                            </div>
                        </div>
                        <ProgressBar percentage={analysisData.completionScore} />
                    </div>

                    {/* 功能性评分 */}
                    <div>
                        <div className="flex justify-between mb-1.5">
                            <span className="font-medium text-gray-700">功能性</span>
                            <div className="flex items-center">
                                <span className="font-semibold mr-1.5 text-blue-600">{analysisData.functionalityScore}%</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  {getScoreComment(analysisData.functionalityScore)}
                </span>
                            </div>
                        </div>
                        <ProgressBar percentage={analysisData.functionalityScore} />
                    </div>

                    {/* 用户体验评分 */}
                    <div>
                        <div className="flex justify-between mb-1.5">
                            <span className="font-medium text-gray-700">用户体验</span>
                            <div className="flex items-center">
                                <span className="font-semibold mr-1.5 text-blue-600">{analysisData.userExperienceScore}%</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  {getScoreComment(analysisData.userExperienceScore)}
                </span>
                            </div>
                        </div>
                        <ProgressBar percentage={analysisData.userExperienceScore} />
                    </div>

                    {/* 技术可行性评分 */}
                    <div>
                        <div className="flex justify-between mb-1.5">
                            <span className="font-medium text-gray-700">技术可行性</span>
                            <div className="flex items-center">
                                <span className="font-semibold mr-1.5 text-blue-600">{analysisData.technicalFeasibilityScore}%</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  {getScoreComment(analysisData.technicalFeasibilityScore)}
                </span>
                            </div>
                        </div>
                        <ProgressBar percentage={analysisData.technicalFeasibilityScore} />
                    </div>
                </div>
            </AnalysisCard>

            {/* 改进建议 */}
            <AnalysisCard
                title="改进建议"
                expandable={true}
                icon={<FiInfo className="text-blue-500" size={18} />}
            >
                <div className="space-y-1">
                    {analysisData.suggestions.map((suggestion, index) => {
                        const iconType = suggestion.type === "improvement" ? "check" :
                            suggestion.type === "warning" ? "warning" : "info";
                        return (
                            <SuggestionItem key={index} icon={iconType as "check" | "warning" | "info"}>
                                {suggestion.content}
                            </SuggestionItem>
                        );
                    })}
                </div>
            </AnalysisCard>
        </div>
    );
};

// 主组件
interface AiAnalysisTemplateProps {
    projectId?: string;
}

const AiAnalysisTemplate: React.FC<AiAnalysisTemplateProps> = ({ projectId }) => {
    // 使用任务API Hook
    const {
        streamAnalyzeTask,
        resetAnalysis,
        analysisMessages,
        analysisResult,
        isStreaming,
        streamingError,
        streamingComplete
    } = useTaskHook();

    // 初始化聊天消息状态 - 只保留欢迎消息
    const [messages, setMessages] = useState<Array<{ content: string; isAi: boolean }>>([
        {
            content: "您好！我是您的 AI 助手，请描述您的需求，我会进行智能分析。",
            isAi: true,
        }
    ]);

    // 更新分析数据状态并将流式结果转换为显示格式
    useEffect(() => {
        if (analysisResult) {
            // 计算各项评分 - 这是示例逻辑，可以根据实际情况调整
            const functionalityScore = analysisResult.type ? 70 + Math.random() * 30 : 0;
            const completionScore = analysisResult.completion ? 60 + Math.random() * 40 : 0;
            const userExperienceScore = analysisResult.workload ? 50 + Math.random() * 50 : 0;
            const technicalFeasibilityScore = analysisResult.comprehensive ? 65 + Math.random() * 35 : 0;

            // 处理建议转换成格式化的内容
            const suggestionsArr = analysisResult.suggestions
                .split('\n')
                .filter(item => item.trim().length > 0)
                .map(item => ({
                    type: Math.random() > 0.3 ? "improvement" : (Math.random() > 0.5 ? "warning" : "info") as "improvement" | "warning" | "info",
                    content: item.trim()
                }));

            // 解析类型字段的JSON数据（如果存在）
            let typeData = {
                tags: [],
                colors: []
            };
            let requirementTypeForDisplay = "";

            try {
                if (analysisResult.type && analysisResult.type.trim()) {
                    // 查找JSON字符串，通常被```json和```包围
                    const jsonMatch = analysisResult.type.match(/```json\s*([\s\S]*?)\s*```/);
                    if (jsonMatch && jsonMatch[1]) {
                        // 解析JSON字符串
                        const parsedData = JSON.parse(jsonMatch[1]);
                        if (parsedData.tags && Array.isArray(parsedData.tags)) {
                            typeData.tags = parsedData.tags;
                        }
                        if (parsedData.colors && Array.isArray(parsedData.colors)) {
                            typeData.colors = parsedData.colors;
                        }
                        // 不使用原始JSON显示
                        requirementTypeForDisplay = "";
                    } else {
                        // 尝试直接解析整个字符串
                        try {
                            const parsedData = JSON.parse(analysisResult.type);
                            if (parsedData.tags && Array.isArray(parsedData.tags)) {
                                typeData.tags = parsedData.tags;
                            }
                            if (parsedData.colors && Array.isArray(parsedData.colors)) {
                                typeData.colors = parsedData.colors;
                            }
                            // 不使用原始JSON显示
                            requirementTypeForDisplay = "";
                        } catch {
                            // 如果不是JSON，则保留原始文本
                            requirementTypeForDisplay = analysisResult.type;
                        }
                    }
                }
            } catch (error) {
                console.error('解析需求类型JSON数据失败:', error);
            }

            // 更新分析数据
            setAnalysisData({
                requirementType: requirementTypeForDisplay,
                requirementTypeTags: typeData.tags,
                requirementTypeColors: typeData.colors,
                completionScore: completionScore,
                functionalityScore: functionalityScore,
                userExperienceScore: userExperienceScore,
                technicalFeasibilityScore: technicalFeasibilityScore,
                suggestions: suggestionsArr.length > 0 ? suggestionsArr : []
            });
        }
    }, [analysisResult]);

    // 初始化分析数据状态 - 初始为空
    const [analysisData, setAnalysisData] = useState<{
        requirementType: string;
        requirementTypeTags: string[];
        requirementTypeColors: string[];
        completionScore: number;
        functionalityScore: number;
        userExperienceScore: number;
        technicalFeasibilityScore: number;
        suggestions: Array<{
            type: "improvement" | "warning" | "info";
            content: string;
        }>;
    } | null>(null);

    // 发送消息处理函数
    const handleSendMessage = (message: string) => {
        if (!message.trim() || isStreaming) return;

        // 添加用户消息
        setMessages(prev => [
            ...prev,
            {
                content: message,
                isAi: false,
            },
        ]);

        // 添加AI正在处理的消息
        setMessages(prev => [
            ...prev,
            {
                content: "我已收到您的需求，正在进行分析...",
                isAi: true,
            },
        ]);

        // 重置分析结果
        resetAnalysis();

        // 调用流式分析接口
        if (projectId) {
            // 启动流式分析
            streamAnalyzeTask(projectId, message);
        } else {
            // 无项目ID时的错误处理
            setMessages(prev => [
                ...prev,
                {
                    content: "抱歉，无法获取项目信息，请返回项目详情页重试。",
                    isAi: true,
                },
            ]);
        }
    };

    // 创建需求处理函数
    const router = useRouter();
    const handleCreateRequirement = () => {
        if (!analysisData) return;

        // 整理分析数据，准备传递给任务创建页面
        const requirementSummary = {
            title: "基于AI分析的需求",
            type: analysisData?.requirementType || "功能优化",
            priority: analysisData && analysisData.completionScore > 80 ? "high" : "medium",
            description: messages.filter(m => !m.isAi).map(m => m.content).join("\n"),
            projectId: projectId
        };

        // 将数据编码为URL参数
        const params = new URLSearchParams();
        params.append('data', JSON.stringify(requirementSummary));

        // 导航到任务创建页面
        router.push(`/tasks/create?${params.toString()}`);
    };

    // 监听流式分析完成事件
    useEffect(() => {
        if (streamingComplete) {
            // 流式分析完成后，添加总结消息
            setMessages(prev => [
                ...prev,
                {
                    content: "分析已完成，请查看右侧的详细分析结果。您可以基于这些结果创建具体的任务需求。",
                    isAi: true,
                },
            ]);
        }
    }, [streamingComplete]);

    // 监听流式分析错误事件
    useEffect(() => {
        if (streamingError) {
            // 出现错误时，显示错误消息
            setMessages(prev => [
                ...prev,
                {
                    content: `分析过程中出现错误: ${streamingError}，请稍后重试。`,
                    isAi: true,
                },
            ]);
        }
    }, [streamingError]);

    return (
        <div className="h-full w-full">
            {/* 主体内容 - 占据全屏 */}
            <div className="h-full w-full px-3 py-2">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full">
                    {/* 左侧聊天区域 */}
                    <div className="md:col-span-6 h-full">
                        <div className="bg-white h-full rounded-lg shadow-sm flex flex-col overflow-hidden">
                            <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
                        </div>
                    </div>

                    {/* 右侧分析结果区域 */}
                    <div className="md:col-span-6 h-full">
                        <div className="bg-white h-full rounded-lg shadow-sm flex flex-col overflow-hidden">
                            <div className="border-b border-gray-200 p-3 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                        <HiChartBar className="text-blue-600" size={14} />
                                    </div>
                                    <h2 className="font-semibold text-gray-800">分析结果</h2>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500">
                                        <FiDownload size={16} />
                                    </button>
                                    <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500">
                                        <FiShare2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                <AnalysisPanel analysisData={analysisData} />
                            </div>

                            {/* 创建需求按钮 */}
                            <div className="p-3 border-t border-gray-200 bg-white sticky bottom-0">
                                <button
                                    className="flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-3 py-2 rounded-lg transition-all duration-200 text-sm shadow-sm hover:shadow"
                                    onClick={handleCreateRequirement}
                                >
                                    <FiPlus className="mr-2" size={16} />
                                    <span className="font-medium">根据分析创建需求</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiAnalysisTemplate;
