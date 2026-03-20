"use client";

import React from "react";
import {AnalysisData, ChatMessage, SubTask, Suggestion, TaskSplitData} from './types';
import AnalysisOverviewPanel from './AnalysisOverviewPanel';
import PriorityAnalysisPanel from './PriorityAnalysisPanel';
import CompletenessFoldablePanel from './CompletenessFoldablePanel';
import TaskSplitPanel from './TaskSplitPanel';
import WorkloadAnalysisPanel from './WorkloadAnalysisPanel';
import PertWorkloadPanel from './PertWorkloadPanel';
import SuggestionsPanel from './SuggestionsPanel';
import KeyFindingsPanel from './KeyFindingsPanel';
import EmptyAnalysisState from './EmptyAnalysisState';
import MessageDisplay from './MessageDisplay';
import ChatInputArea from './ChatInputArea';
import {FiMessageSquare, FiRefreshCw} from "react-icons/fi";
import {motion} from 'framer-motion';
import {useTheme} from '@/ui/theme/themeContext';

interface AiAnalysisContentProps {
  // 分析数据
  analysisData: AnalysisData;
  // 消息列表
  messages: ChatMessage[];
  // 控制面板状态
  activePanelId: string | null;
  // 面板切换事件
  handlePanelToggle: (panelId: string) => void;
  // 依赖图相关事件和数据
  openDependencyGraphModal: (taskData: TaskSplitData) => void;
  // 任务详情相关事件和状态设置
  setDetailTask: (task: SubTask) => void;
  setTaskDetailModalOpen: (isOpen: boolean) => void;
  // 创建任务事件
  handleCreateTask: () => void;
  // 聊天相关方法
  handleSendMessage: (content: string) => void;
  // 清空消息
  setIsConfirmDialogOpen: (isOpen: boolean) => void;
}

const AiAnalysisContent: React.FC<AiAnalysisContentProps> = ({
  analysisData,
  messages,
  activePanelId,
  handlePanelToggle,
  openDependencyGraphModal,
  setDetailTask,
  setTaskDetailModalOpen,
  handleCreateTask,
  handleSendMessage,
  setIsConfirmDialogOpen
}) => {
  const { theme } = useTheme();
  // 优先级等级对应的颜色
  const priorityLevelColors: Record<string, string> = {
    "高优先级": "bg-red-500",
    "中优先级": "bg-orange-500",
    "低优先级": "bg-blue-500"
  };

  // 判断是否有任何分析数据
  const hasAnalysisData = (
    (analysisData.completenessAnalysis && (
      analysisData.completenessAnalysis.overallCompleteness ||
      (analysisData.completenessAnalysis.aspects && analysisData.completenessAnalysis.aspects.length > 0) ||
      (analysisData.completenessAnalysis.optimizationSuggestions && analysisData.completenessAnalysis.optimizationSuggestions.length > 0)
    )) ||
    (analysisData.tags && analysisData.tags.length > 0) ||
    (analysisData.priorityLevel || analysisData.priorityScore || analysisData.priorityAnalysis) ||
    (analysisData.priorityData) ||
    (analysisData.taskSplitData && analysisData.taskSplitData.sub_tasks && analysisData.taskSplitData.sub_tasks.length > 0) ||
    (analysisData.keyFindings && analysisData.keyFindings.length > 0) ||
    (analysisData.risks && analysisData.risks.length > 0) ||
    (analysisData.suggestions && analysisData.suggestions.length > 0) ||
    (analysisData.workloadData) ||
    (analysisData.pertWorkloadData)
  );

  return (
    <div 
      className="flex flex-1 overflow-hidden"
      style={{ backgroundColor: theme.colors.card.background }}
    >
      {/* 分析结果左侧区域 -  */}
      <div 
        className="w-5/12 overflow-y-auto border-r"
        style={{
          backgroundColor: theme.colors.neutral[50],
          borderRightColor: theme.colors.card.border,
          backdropFilter: 'blur(20px)',
          boxShadow: 'inset -1px 0 0 rgba(0, 0, 0, 0.03)'
        }}
      >
        <div 
          className="py-[21px] px-5 sticky top-0 z-10 backdrop-blur-md border-b flex items-center"
          style={{
            backgroundColor: `${theme.colors.card.background}CC`, // 80% opacity
            borderBottomColor: theme.colors.card.border,
            boxShadow: '0 4px 15px -8px rgba(0, 0, 0, 0.05)',
          }}
        >
          <h2 
            className="text-base font-medium"
            style={{ color: theme.colors.foreground }}
          >
            分析概览
          </h2>
        </div>
        <div className="space-y-7 p-8 pt-6">
        {/* 状态指示器已移至标题栏 */}

        {hasAnalysisData ? (
          <div className="space-y-3">
            {/* 使用分析概览面板组件 */}
            <AnalysisOverviewPanel analysisData={analysisData} />

            {/* 使用优先级分析面板组件 */}
            {analysisData.priorityData && typeof analysisData.priorityData === 'object' && (
              <PriorityAnalysisPanel
                priorityData={analysisData.priorityData}
                priorityLevel={analysisData.priorityLevel}
                priorityScore={analysisData.priorityScore}
                priorityLevelColors={priorityLevelColors}
                isOpen={activePanelId === 'priority'}
                onToggle={() => handlePanelToggle('priority')}
              />
            )}

            {/* 使用完整度分析折叠面板组件 */}
            {analysisData.completenessAnalysis && (
              <CompletenessFoldablePanel
                completenessData={analysisData.completenessAnalysis}
                animationDelay={0.2}
                isOpen={activePanelId === 'completeness'}
                onToggle={() => handlePanelToggle('completeness')}
              />
            )}

            {/* 使用任务拆分面板组件 */}
            {analysisData.taskSplitData && (
              <TaskSplitPanel
                taskSplitData={analysisData.taskSplitData}
                onOpenDependencyGraph={openDependencyGraphModal}
                onTaskClick={(task) => {
                  setDetailTask(task);
                  setTaskDetailModalOpen(true);
                }}
                onCreateTask={handleCreateTask}
                isOpen={activePanelId === 'taskSplit'}
                onToggle={() => handlePanelToggle('taskSplit')}
              />
             )}

             {/* 使用工作量分析面板组件 */}
             {analysisData.workloadData && (
              <WorkloadAnalysisPanel
                workloadData={analysisData.workloadData}
                isOpen={activePanelId === 'workload'}
                onToggle={() => handlePanelToggle('workload')}
              />
             )}

             {/* 使用PERT工作量分析面板组件 */}
             {analysisData.pertWorkloadData && (
              <PertWorkloadPanel
                workloadData={analysisData.pertWorkloadData}
                isOpen={activePanelId === 'pert-workload'}
                onToggle={() => handlePanelToggle('pert-workload')}
              />
             )}

            {/* 使用建议面板组件 */}
            {analysisData.suggestions && analysisData.suggestions.length > 0 && (
              <SuggestionsPanel
                suggestions={Array.isArray(analysisData.suggestions) && typeof analysisData.suggestions[0] === 'object'
                  ? (analysisData.suggestions as Suggestion[])
                  : undefined}
                isOpen={activePanelId === 'suggestions'}
                onToggle={() => handlePanelToggle('suggestions')}
              />
            )}

            {/* 使用关键发现面板组件 */}
            {analysisData.keyFindings && analysisData.keyFindings.length > 0 && (
              <KeyFindingsPanel
                keyFindings={analysisData.keyFindings}
                isOpen={activePanelId === 'keyFindings'}
                onToggle={() => handlePanelToggle('keyFindings')}
              />
            )}
          </div>
        ) : (
          /* 使用空分析状态组件 */
          <EmptyAnalysisState />
        )}
        </div>
      </div>

      {/* 右侧聊天区域 -  */}
      <div 
        className="flex-1 flex flex-col"
        style={{ backgroundColor: theme.colors.card.background }}
      >
        {/* 聊天标题栏 -  */}
        <div 
          className="border-b px-8 py-4 flex justify-between items-center"
          style={{ borderBottomColor: theme.colors.card.border }}
        >
          <h3 
            className="font-medium flex items-center"
            style={{ color: theme.colors.foreground }}
          >
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center mr-2 border"
              style={{ 
                backgroundColor: `${theme.colors.primary[500]}14`, // 8% opacity
                borderColor: `${theme.colors.primary[500]}32` // 20% opacity
              }}
            >
              <FiMessageSquare 
                className="text-blue-600" 
                size={16} 
                style={{ color: theme.colors.primary[600] }}
              />
            </div>
            <span>与AI助手对话</span>
          </h3>

          <div className="flex gap-2">
            <motion.button
              className="p-2 rounded-full transition-all"
              style={{
                backgroundColor: theme.colors.neutral[100],
                color: theme.colors.neutral[600]
              }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: theme.colors.neutral[200]
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsConfirmDialogOpen(true)}
              disabled={analysisData.isStreaming}
            >
              <FiRefreshCw 
                className={analysisData.isStreaming ? 'animate-spin' : ''} 
                size={18} 
                style={{
                  color: analysisData.isStreaming ? theme.colors.primary[500] : theme.colors.neutral[600]
                }}
              />
            </motion.button>
          </div>
        </div>

        {/* 消息显示区域 */}
        <MessageDisplay
          messages={messages}
          onCreateTask={handleCreateTask}
          hasTaskSplitData={!!analysisData.taskSplitData}
          streamingComplete={analysisData.streamingComplete}
        />

        {/* 聊天输入区域 */}
        <ChatInputArea
          onSendMessage={handleSendMessage}
          disabled={!!analysisData.isStreaming}
        />
      </div>
    </div>
  );
};

export default AiAnalysisContent;
