"use client";

import React from "react";
import {AnalysisData, SubTask, TaskSplitData} from './types';
import AnalysisOverviewPanel from './AnalysisOverviewPanel';
import PriorityAnalysisPanel from './PriorityAnalysisPanel';
import CompletenessFoldablePanel from './CompletenessFoldablePanel';
import TaskSplitPanel from './TaskSplitPanel';
import WorkloadAnalysisPanel from './WorkloadAnalysisPanel';
import PertWorkloadPanel from './PertWorkloadPanel';
import SuggestionsPanel from './SuggestionsPanel';
import KeyFindingsPanel from './KeyFindingsPanel';
import EmptyAnalysisState from './EmptyAnalysisState';

interface AnalysisResultsPanelProps {
  analysisData: AnalysisData;
  activePanelId: string | null;
  handlePanelToggle: (panelId: string) => void;
  openDependencyGraphModal: (taskData: TaskSplitData) => void;
  onTaskClick: (task: SubTask) => void;
  handleCreateTask: () => void;
  hasAnalysisData: boolean;
}

const AnalysisResultsPanel: React.FC<AnalysisResultsPanelProps> = ({
  analysisData,
  activePanelId,
  handlePanelToggle,
  openDependencyGraphModal,
  onTaskClick,
  handleCreateTask,
  hasAnalysisData
}) => {
  // 优先级等级对应的颜色
  const priorityLevelColors: Record<string, string> = {
    "高优先级": "bg-red-500",
    "中优先级": "bg-orange-500",
    "低优先级": "bg-blue-500"
  };

  return (
    <div className="w-1/3 overflow-y-auto p-6 border-r border-gray-100/80 bg-gray-50">
      {hasAnalysisData ? (
        <div className="space-y-2">
          {/* 分析概览面板组件 */}
          <AnalysisOverviewPanel analysisData={analysisData} />

          {/* 优先级分析面板组件 */}
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

          {/* 完整度分析折叠面板组件 */}
          {analysisData.completenessAnalysis && (
            <CompletenessFoldablePanel
              completenessData={analysisData.completenessAnalysis}
              animationDelay={0.2}
              isOpen={activePanelId === 'completeness'}
              onToggle={() => handlePanelToggle('completeness')}
            />
          )}

          {/* 任务拆分面板组件 */}
          {analysisData.taskSplitData && (
            <TaskSplitPanel
              taskSplitData={analysisData.taskSplitData}
              onOpenDependencyGraph={openDependencyGraphModal}
              onTaskClick={onTaskClick}
              onCreateTask={handleCreateTask}
              isOpen={activePanelId === 'taskSplit'}
              onToggle={() => handlePanelToggle('taskSplit')}
            />
          )}

          {/* 工作量分析面板组件 */}
          {analysisData.workloadData && (
            <WorkloadAnalysisPanel
              workloadData={analysisData.workloadData}
              isOpen={activePanelId === 'workload'}
              onToggle={() => handlePanelToggle('workload')}
            />
          )}

          {/* PERT工作量分析面板组件 */}
          {analysisData.pertWorkloadData && (
            <PertWorkloadPanel
              workloadData={analysisData.pertWorkloadData}
              isOpen={activePanelId === 'pert-workload'}
              onToggle={() => handlePanelToggle('pert-workload')}
            />
          )}

          {/* 建议面板组件 */}
          {analysisData.suggestions && analysisData.suggestions.length > 0 && (
            <SuggestionsPanel
              suggestions={Array.isArray(analysisData.suggestions) && typeof analysisData.suggestions[0] === 'object'
                ? (analysisData.suggestions as any)
                : undefined}
              isOpen={activePanelId === 'suggestions'}
              onToggle={() => handlePanelToggle('suggestions')}
            />
          )}

          {/* 关键发现面板组件 */}
          {analysisData.keyFindings && analysisData.keyFindings.length > 0 && (
            <KeyFindingsPanel
              keyFindings={analysisData.keyFindings}
              isOpen={activePanelId === 'keyFindings'}
              onToggle={() => handlePanelToggle('keyFindings')}
            />
          )}
        </div>
      ) : (
        /* 空分析状态组件 */
        <EmptyAnalysisState />
      )}
    </div>
  );
};

export default AnalysisResultsPanel;
