"use client";

import React, {useRef, useState} from "react";
import {SubTask, TaskSplitData} from './types';
import {useTheme} from '@/ui/theme/themeContext';

interface TaskDependencyGraphProps {
    taskSplitData: TaskSplitData;
    onClose: () => void;
    onViewTaskDetail: (task: SubTask) => void;
}

/**
 * 任务依赖图组件
 *
 * 展示任务依赖关系的可视化图表组件
 */
const TaskDependencyGraph: React.FC<TaskDependencyGraphProps> = ({
    taskSplitData,
    onClose,
    onViewTaskDetail
}) => {
    const { theme } = useTheme();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // 交互状态
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [highlightedDeps, setHighlightedDeps] = useState<string[]>([]);

    // 悬浮提示状态
    const [hoveredTask, setHoveredTask] = useState<SubTask | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // 任务点击处理
    const handleTaskClick = (taskId: string) => {
        // 如果点击的是已选中的任务，则清除选择
        if (selectedTaskId === taskId) {
            setSelectedTaskId(null);
            setHighlightedDeps([]);
        } else {
            // 计算此任务的依赖关系
            const task = taskSplitData.sub_tasks.find(t => t.id === taskId);
            if (task) {
                setSelectedTaskId(taskId);
                setHighlightedDeps(task.dependency);
            } else {
                setSelectedTaskId(null);
                setHighlightedDeps([]);
            }
        }
    };

    // 重置选中状态
    const resetSelection = () => {
        setSelectedTaskId(null);
        setHighlightedDeps([]);
    };

    // 处理鼠标悬停任务节点
    const handleTaskHover = (e: React.MouseEvent, task: SubTask) => {
        setHoveredTask(task);
        setTooltipPosition({ x: e.clientX, y: e.clientY });
    };

    // 鼠标移出节点
    const handleTaskLeave = () => {
        setHoveredTask(null);
    };

    // 根据优先级获取样式
    const getPriorityStyle = (priority: string) => {
        switch (priority.toLowerCase()) {
            case '高':
                return {
                    backgroundColor: `${theme.colors.error[500]}14`, // 8% opacity
                    color: theme.colors.error[700] || theme.colors.error[500],
                    borderColor: `${theme.colors.error[500]}33` // 20% opacity
                };
            case '中':
                return {
                    backgroundColor: `${theme.colors.primary[500]}14`, // 8% opacity
                    color: theme.colors.primary[700] || theme.colors.primary[500],
                    borderColor: `${theme.colors.primary[500]}33` // 20% opacity
                };
            case '低':
                return {
                    backgroundColor: `${theme.colors.success[500]}14`, // 8% opacity
                    color: theme.colors.success[700] || theme.colors.success[500],
                    borderColor: `${theme.colors.success[500]}33` // 20% opacity
                };
            default:
                return {
                    backgroundColor: `${theme.colors.neutral[500]}14`, // 8% opacity
                    color: theme.colors.neutral[700] || theme.colors.neutral[500],
                    borderColor: `${theme.colors.neutral[500]}33` // 20% opacity
                };
        }
    };

    return (
        <div 
            className="rounded-2xl shadow-xl w-[90vw] max-w-5xl h-[80vh] overflow-hidden flex flex-col relative"
            style={{ backgroundColor: theme.colors.card.background }}
        >
            {/* 模态框标题栏 */}
            <div 
                className="p-5 border-b flex flex-col backdrop-blur-md z-10"
                style={{
                    backgroundColor: `${theme.colors.card.background}E6`, // 90% opacity
                    borderBottomColor: theme.colors.card.border
                }}
            >
                <div className="flex justify-between items-center">
                    <h3 
                        className="text-lg font-medium flex items-center"
                        style={{ color: theme.colors.foreground }}
                    >
                        {taskSplitData?.main_task?.name && (
                            <span 
                                className="text-xs font-medium px-2.5 py-1 rounded-md mr-2"
                                style={{
                                    backgroundColor: `${theme.colors.primary[500]}1A`, // 10% opacity
                                    color: theme.colors.primary[700] || theme.colors.primary[500]
                                }}
                            >
                                {taskSplitData.main_task.name}
                            </span>
                        )}
                        任务依赖图
                    </h3>
                    <button
                        className="p-1 rounded-full transition-colors"
                        style={{
                            color: theme.colors.neutral[400]
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = theme.colors.neutral[500];
                            e.currentTarget.style.backgroundColor = theme.colors.neutral[100];
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = theme.colors.neutral[400];
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={onClose}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div 
                    className="text-xs mt-2 p-2 rounded-md flex items-center"
                    style={{
                        color: theme.colors.neutral[500],
                        backgroundColor: theme.colors.neutral[50]
                    }}
                >
                    <svg 
                        className="w-4 h-4 mr-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ color: theme.colors.primary[500] }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>单击高亮依赖，双击查看详情</span>
                </div>
            </div>

            {/* 依赖图内容区域 - 无限画布设计 */}
            <div className="flex-grow overflow-hidden flex items-center justify-center">
                <div
                    ref={wrapperRef}
                    className="relative w-full h-full overflow-hidden flex items-center justify-center"
                    style={{
                        backgroundImage: `radial-gradient(circle, ${theme.colors.neutral[200]} 1px, transparent 1px)`,
                        backgroundSize: `20px 20px`,
                        backgroundPosition: `0px 0px`
                    }}
                >


                    {/* 固定位置的内容容器 */}
                    <div
                        className="flex items-center justify-center w-[90%] h-[90%] max-w-[1000px] max-h-[600px] relative"
                    >
                    {/* 任务依赖关系图 - 无限画布设计 */}
                    <svg
                        width="100%"
                        height="100%"
                        className="absolute top-0 left-0 pointer-events-none"
                        style={{ overflow: 'visible' }}
                    >
                        {/* 绘制依赖关系线 */}
                        {taskSplitData.sub_tasks.map(task => {
                            if (task.dependency.length === 0) return null;

                            return task.dependency.map(depId => {
                                const depTask = taskSplitData.sub_tasks.find(t => t.id === depId);
                                if (!depTask) return null;

                                // 计算节点位置
                                const depIndex = taskSplitData.sub_tasks.findIndex(t => t.id === depId);
                                const taskIndex = taskSplitData.sub_tasks.findIndex(t => t.id === task.id);

                                // 高亮逻辑：
                                // 1. 当前选中的是依赖其他任务的节点，高亮其所有依赖节点的连线
                                // 2. 当前选中的是被其他任务依赖的节点，高亮依赖它的所有连线
                                const isHighlighted =
                                    (selectedTaskId === task.id && highlightedDeps.includes(depId)) ||
                                    (selectedTaskId === depId);

                                // 节点位置计算 - 适配无限画布
                                const xSpacing = 260; // 水平间距
                                const ySpacing = 180; // 垂直间距

                                // 计算中心偏移量 - 调整为画布中心
                                // 根据任务数量计算每行显示的节点数
                                const totalTasks = taskSplitData.sub_tasks.length;
                                const nodesPerRow = totalTasks <= 4 ? 2 : totalTasks <= 9 ? 3 : 4;

                                // 计算所需的行数
                                const rowsNeeded = Math.ceil(totalTasks / nodesPerRow);

                                // 使用容器中心作为整体偏移量，将布局居中
                                const containerWidth = 1000;
                                const containerHeight = 600;
                                const centerOffsetX = (containerWidth - nodesPerRow * xSpacing) / 2;
                                const centerOffsetY = (containerHeight - rowsNeeded * ySpacing) / 2;

                                // 防止超出边界的安全边距
                                const safeMargin = 50;

                                // 计算节点中心坐标，而不是左上角坐标
                                const nodeWidth = 170;
                                const nodeHeight = 65;

                                // 注意！正确的依赖方向应该是从任务指向其依赖
                                // 当前节点task依赖depTask，所以箭头应从当前节点task指向被依赖的depTask

                                // 当前节点(箭头起点)的中心坐标
                                const startX = Math.max(safeMargin, Math.min(containerWidth - safeMargin, centerOffsetX + (taskIndex % nodesPerRow) * xSpacing + nodeWidth/2));
                                const startY = Math.max(safeMargin, Math.min(containerHeight - safeMargin, centerOffsetY + Math.floor(taskIndex / nodesPerRow) * ySpacing + nodeHeight/2));

                                // 被依赖节点(箭头终点)的中心坐标
                                const endX = Math.max(safeMargin, Math.min(containerWidth - safeMargin, centerOffsetX + (depIndex % nodesPerRow) * xSpacing + nodeWidth/2));
                                const endY = Math.max(safeMargin, Math.min(containerHeight - safeMargin, centerOffsetY + Math.floor(depIndex / nodesPerRow) * ySpacing + nodeHeight/2));

                                return (
                                    <g key={`${depId}-${task.id}`}>
                                        <path
                                            d={`M${startX},${startY} C${startX + (endX-startX)*0.4},${startY} ${endX - (endX-startX)*0.4},${endY} ${endX},${endY}`}
                                            fill="none"
                                            stroke={isHighlighted ? theme.colors.primary[500] : theme.colors.neutral[400]}
                                            strokeWidth={isHighlighted ? 2.5 : 1.5}
                                            strokeDasharray={isHighlighted ? "none" : "5,3"}
                                            markerEnd={isHighlighted ? "url(#arrowhead-highlighted)" : "url(#arrowhead)"}
                                        />
                                    </g>
                                );
                            });
                        })}
                        <defs>
                            <marker
                                id="arrowhead"
                                markerWidth="10"
                                markerHeight="7"
                                refX="10"
                                refY="3.5"
                                orient="auto"
                                markerUnits="strokeWidth" // 重要！修改为strokeWidth以响应缩放
                            >
                                <polygon points="0 0, 10 3.5, 0 7" fill={theme.colors.neutral[400]} />
                            </marker>
                            <marker
                                id="arrowhead-highlighted"
                                markerWidth="10"
                                markerHeight="7"
                                refX="10"
                                refY="3.5"
                                orient="auto"
                                markerUnits="strokeWidth" // 重要！修改为strokeWidth以响应缩放
                            >
                                <polygon points="0 0, 10 3.5, 0 7" fill={theme.colors.primary[500]} />
                            </marker>
                        </defs>

                    </svg>

                        {/* 任务节点 */}
                        <div className="pointer-events-auto">
                            {taskSplitData.sub_tasks.map((task, index) => {
                                const isSelected = selectedTaskId === task.id;
                                const isHighlighted = highlightedDeps.includes(task.id);
                                const priorityStyle = getPriorityStyle(task.priority);

                                // 节点位置计算 - 适配无限画布
                                const xSpacing = 260; // 水平间距
                                const ySpacing = 180; // 垂直间距

                                // 计算中心偏移量 - 调整为画布中心
                                // 根据任务数量计算每行显示的节点数
                                const totalTasks = taskSplitData.sub_tasks.length;
                                const nodesPerRow = totalTasks <= 4 ? 2 : totalTasks <= 9 ? 3 : 4;

                                // 计算所需的行数
                                const rowsNeeded = Math.ceil(totalTasks / nodesPerRow);

                                // 使用容器中心作为整体偏移量，将布局居中
                                const containerWidth = 1000;
                                const containerHeight = 600;
                                const centerOffsetX = (containerWidth - nodesPerRow * xSpacing) / 2;
                                const centerOffsetY = (containerHeight - rowsNeeded * ySpacing) / 2;

                                // 防止超出边界的安全边距
                                const safeMargin = 50;

                                // 节点尺寸
                                const nodeWidth = 170;
                                const nodeHeight = 70;

                                const left = Math.max(safeMargin, Math.min(containerWidth - nodeWidth - safeMargin, centerOffsetX + (index % nodesPerRow) * xSpacing));
                                const top = Math.max(safeMargin, Math.min(containerHeight - nodeHeight - safeMargin, centerOffsetY + Math.floor(index / nodesPerRow) * ySpacing));

                                return (
                                    <div
                                        key={task.id}
                                        className={`absolute flex flex-col items-center rounded-xl transition-all duration-200 cursor-pointer
                                            ${isSelected ? "scale-110 z-10" : ""}`}
                                        style={{
                                            left: `${left}px`,
                                            top: `${top}px`
                                        }}
                                    >
                                        <div
                                            className="w-[170px] py-3 px-4 flex flex-col items-center justify-center rounded-xl text-sm border hover:shadow-md transition-all duration-200"
                                            style={{
                                                backgroundColor: isSelected 
                                                    ? `${theme.colors.primary[500]}14` // 8% opacity
                                                    : isHighlighted 
                                                        ? `${theme.colors.success[500]}14` // 8% opacity
                                                        : theme.colors.card.background,
                                                borderColor: isSelected 
                                                    ? `${theme.colors.primary[500]}4D` // 30% opacity
                                                    : isHighlighted 
                                                        ? `${theme.colors.success[500]}4D` // 30% opacity
                                                        : theme.colors.card.border,
                                                boxShadow: isSelected ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 
                                                          isHighlighted ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' :
                                                          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                                            }}
                                            onClick={() => handleTaskClick(task.id)}
                                            onDoubleClick={() => onViewTaskDetail(task)}
                                            onMouseEnter={(e) => handleTaskHover(e, task)}
                                            onMouseLeave={handleTaskLeave}
                                        >
                                            {/* 任务名称显示在主要位置 */}
                                            <div 
                                                className="font-medium text-sm text-center mb-1 w-full truncate" 
                                                title={task.description}
                                                style={{ color: theme.colors.foreground }}
                                            >
                                                {task.description.length > 20 ? task.description.substring(0, 20) + '...' : task.description}
                                            </div>
                                            {/* 任务ID作为次要信息显示 */}
                                            <div 
                                                className="text-xs px-2 py-0.5 rounded-full"
                                                style={{
                                                    color: theme.colors.neutral[500],
                                                    backgroundColor: theme.colors.neutral[100]
                                                }}
                                            >
                                                {task.id}
                                            </div>
                                        </div>
                                        <div
                                            className="mt-2 px-2 py-0.5 rounded-full text-xs border"
                                            style={{
                                                backgroundColor: priorityStyle.backgroundColor,
                                                color: priorityStyle.color,
                                                borderColor: priorityStyle.borderColor
                                            }}
                                        >
                                            {task.priority}优先级
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* 悬浮提示方框 */}
            {hoveredTask && (
                <div
                    className="fixed z-50 backdrop-blur-sm shadow-lg rounded-lg border p-3 max-w-xs"
                    style={{
                        backgroundColor: `${theme.colors.card.background}F2`, // 95% opacity
                        borderColor: theme.colors.card.border,
                        left: tooltipPosition.x + 15,
                        top: tooltipPosition.y - 10,
                        transform: 'translateY(-100%)'
                    }}
                >
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <span 
                                className="text-xs font-medium"
                                style={{ color: theme.colors.neutral[500] }}
                            >
                                {hoveredTask.id}
                            </span>
                            <span 
                                className="text-xs px-1.5 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: getPriorityStyle(hoveredTask.priority).backgroundColor,
                                    color: getPriorityStyle(hoveredTask.priority).color
                                }}
                            >
                                {hoveredTask.priority}优先级
                            </span>
                        </div>
                        <div 
                            className="font-medium text-sm"
                            style={{ color: theme.colors.foreground }}
                        >
                            {hoveredTask.description}
                        </div>
                        {hoveredTask.dependency.length > 0 && (
                            <div className="text-xs mt-2">
                                <span style={{ color: theme.colors.neutral[500] }}>依赖任务：</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {hoveredTask.dependency.map(depId => {
                                        const depTask = taskSplitData.sub_tasks.find(t => t.id === depId);
                                        return depTask ? (
                                            <span 
                                                key={depId} 
                                                className="inline-block px-1.5 py-0.5 rounded-md"
                                                style={{
                                                    backgroundColor: `${theme.colors.primary[500]}14`, // 8% opacity
                                                    color: theme.colors.primary[700] || theme.colors.primary[500]
                                                }}
                                            >
                                                {depTask.description.length > 10 ? depTask.description.substring(0, 10) + '...' : depTask.description}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}


        </div>
    );
};

export default TaskDependencyGraph;
