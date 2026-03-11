"use client";

import React from 'react';
import {FiChevronDown, FiChevronUp, FiClock} from 'react-icons/fi';
import {AnimatePresence, motion} from 'framer-motion';
import {useTheme} from '@/ui/theme/themeContext';

// 定义工作量分析数据类型
export interface WorkloadAnalysisItem {
    taskId: string;
    description: string;
    estimatedHours: number;
    complexity: 'low' | 'medium' | 'high';
    resourceType: string;  // 例如：前端、后端、设计、测试等
}

export interface WorkloadAnalysisData {
    totalEstimatedHours: number;
    breakdown: WorkloadAnalysisItem[];
    summaryByResource?: { [key: string]: number }; // 按资源类型汇总的工时
}

// 工作量分析面板属性
interface WorkloadAnalysisPanelProps {
    workloadData: WorkloadAnalysisData;
    isOpen: boolean;
    onToggle: () => void;
}

// 工作量分析面板组件
const WorkloadAnalysisPanel: React.FC<WorkloadAnalysisPanelProps> = ({ workloadData, isOpen, onToggle }) => {
    const { theme } = useTheme();
    
    // 获取复杂度对应的样式
    const getComplexityStyle = (complexity: string) => {
        switch (complexity) {
            case 'high':
                return {
                    backgroundColor: `${theme.colors.error[500]}14`, // 8% opacity
                    color: theme.colors.error[700],
                    borderColor: `${theme.colors.error[500]}33` // 20% opacity
                };
            case 'medium':
                return {
                    backgroundColor: `${theme.colors.warning[500]}14`, // 8% opacity
                    color: theme.colors.warning[700],
                    borderColor: `${theme.colors.warning[500]}33` // 20% opacity
                };
            case 'low':
                return {
                    backgroundColor: `${theme.colors.success[500]}14`, // 8% opacity
                    color: theme.colors.success[700],
                    borderColor: `${theme.colors.success[500]}33` // 20% opacity
                };
            default:
                return {
                    backgroundColor: `${theme.colors.neutral[500]}14`, // 8% opacity
                    color: theme.colors.neutral[700],
                    borderColor: `${theme.colors.neutral[500]}33` // 20% opacity
                };
        }
    };

    // 计算每个资源类型的总工时占比
    const calculateResourcePercentage = (resourceHours: number) => {
        return Math.round((resourceHours / workloadData.totalEstimatedHours) * 100);
    };

    return (
        <div 
            className="mb-4 rounded-xl border shadow-sm overflow-hidden"
            style={{
                backgroundColor: theme.colors.card.background,
                borderColor: `${theme.colors.card.border}CC` // 80% opacity
            }}
        >
            {/* 面板标题和折叠按钮 */}
            <div
                className="flex justify-between items-center p-4 cursor-pointer transition-colors"
                style={{
                    backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.card.hover;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={onToggle}
            >
                <div className="flex items-center">
                    <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                        style={{
                            backgroundColor: `${theme.colors.info[500]}1A`, // 10% opacity
                            color: theme.colors.info[500]
                        }}
                    >
                        <FiClock className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 
                            className="font-medium"
                            style={{ color: theme.colors.foreground }}
                        >
                            工作量分析
                        </h3>
                        <p 
                            className="text-sm"
                            style={{ color: theme.colors.neutral[500] }}
                        >
                            总计约 {workloadData.totalEstimatedHours} 小时
                        </p>
                    </div>
                </div>
                <div style={{ color: theme.colors.neutral[400] }}>
                    {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                </div>
            </div>

            {/* 折叠内容区域 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-4 pb-4">
                            {/* 资源类型工时占比 */}
                            {workloadData.summaryByResource && (
                                <div className="mb-4">
                                    <h4 
                                        className="text-sm font-medium mb-2"
                                        style={{ color: theme.colors.neutral[700] }}
                                    >
                                        资源分配
                                    </h4>
                                    <div className="space-y-2">
                                        {Object.entries(workloadData.summaryByResource).map(([resource, hours]) => (
                                            <div key={resource} className="w-full">
                                                <div 
                                                    className="flex justify-between text-xs mb-1"
                                                    style={{ color: theme.colors.neutral[600] }}
                                                >
                                                    <span>{resource}</span>
                                                    <span>{hours}小时 ({calculateResourcePercentage(hours)}%)</span>
                                                </div>
                                                <div 
                                                    className="w-full rounded-full h-2.5"
                                                    style={{ backgroundColor: theme.colors.neutral[200] }}
                                                >
                                                    <div
                                                        className="h-2.5 rounded-full"
                                                        style={{ 
                                                            backgroundColor: theme.colors.primary[600],
                                                            width: `${calculateResourcePercentage(hours)}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 工作量明细列表 */}
                            <h4 
                                className="text-sm font-medium mb-2"
                                style={{ color: theme.colors.neutral[700] }}
                            >
                                工作量明细
                            </h4>
                            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                                {workloadData.breakdown.map((item) => (
                                    <div
                                        key={item.taskId}
                                        className="p-3 rounded-lg border"
                                        style={{
                                            backgroundColor: `${theme.colors.neutral[50]}CC`, // 80% opacity
                                            borderColor: `${theme.colors.card.border}CC` // 80% opacity
                                        }}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span 
                                                className="text-sm font-medium"
                                                style={{ color: theme.colors.foreground }}
                                            >
                                                {item.taskId}
                                            </span>
                                            <span 
                                                className="text-sm"
                                                style={{ color: theme.colors.neutral[600] }}
                                            >
                                                {item.estimatedHours} 小时
                                            </span>
                                        </div>
                                        <p 
                                            className="text-sm mb-2"
                                            style={{ color: theme.colors.neutral[600] }}
                                        >
                                            {item.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span
                                                className="text-xs px-2 py-0.5 rounded-full border"
                                                style={getComplexityStyle(item.complexity)}
                                            >
                                                {item.complexity === 'high' ? '高复杂度' :
                                                 item.complexity === 'medium' ? '中复杂度' : '低复杂度'}
                                            </span>
                                            <span 
                                                className="text-xs"
                                                style={{ color: theme.colors.neutral[500] }}
                                            >
                                                {item.resourceType}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkloadAnalysisPanel;
