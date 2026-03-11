"use client";

import React from 'react';
import {FiClock} from 'react-icons/fi';
import AccordionPanel from "./AccordionPanel";

// 定义PERT工作量分析数据类型
export interface PertWorkloadData {
    optimistic: number;
    most_likely: number;
    pessimistic: number;
    expected: number;
    standard_deviation: number;
}

// PERT工作量分析面板属性
interface PertWorkloadPanelProps {
    workloadData: PertWorkloadData;
    isOpen?: boolean;
    onToggle?: () => void;
    animationDelay?: number;
}

/**
 * PERT工作量分析面板组件
 */
const PertWorkloadPanel: React.FC<PertWorkloadPanelProps> = ({ workloadData, isOpen = false, onToggle, animationDelay = 0 }) => {
    if (!workloadData) {
        return null;
    }

    // 预期工时字符串
    const expectedWorkload = `${workloadData.expected.toFixed(2)} ± ${workloadData.standard_deviation.toFixed(2)}`;

    return (
        <AccordionPanel
            title="工作量分析"
            icon={<FiClock size={14} />}
            initiallyOpen={isOpen}
            animationDelay={animationDelay}
            onToggle={onToggle}
            iconBgColor="rgba(59, 130, 246, 0.1)"
            iconColor="#3b82f6"
        >
            {/* 线性图表部分 */}
            <div className="py-3 px-2">
                <div className="relative h-20 max-w-[400px] mx-auto">
                    {/* 基线 */}
                    <div className="absolute left-0 right-0 top-10 h-[1px] bg-slate-200"></div>

                    {/* 曲线 - 轻微的贝塞尔曲线 */}
                    <svg className="absolute left-0 top-0 w-full h-20" preserveAspectRatio="none" viewBox="0 0 100 50">
                        <path
                            d="M0,30 C15,20 30,10 50,30 C70,50 85,40 100,30"
                            fill="none"
                            stroke="#e0e7ff"
                            strokeWidth="1.5"
                        />
                    </svg>

                    {/* 三个估计点的标记 - 使用相对位置计算 */}
                    {/* 乐观估计 */}
                    <div className="absolute" style={{ left: '10%', top: '10px' }}>
                        <div className="h-12 flex flex-col items-center">
                            <div className="h-5 w-5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            </div>
                            <div className="h-7 w-[1px] bg-green-500/40"></div>
                            <div className="text-green-600 font-medium text-sm mt-1 whitespace-nowrap">
                                {workloadData.optimistic} 工时
                            </div>
                        </div>
                    </div>

                    {/* 最可能估计 */}
                    <div className="absolute" style={{ left: '45%', top: '10px' }}>
                        <div className="h-12 flex flex-col items-center">
                            <div className="h-5 w-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            </div>
                            <div className="h-7 w-[1px] bg-blue-500/40"></div>
                            <div className="text-blue-600 font-medium text-sm mt-1 whitespace-nowrap">
                                {workloadData.most_likely} 工时
                            </div>
                        </div>
                    </div>

                    {/* 悲观估计 */}
                    <div className="absolute" style={{ left: '75%', top: '10px' }}>
                        <div className="h-12 flex flex-col items-center">
                            <div className="h-5 w-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            </div>
                            <div className="h-7 w-[1px] bg-red-500/40"></div>
                            <div className="text-red-600 font-medium text-sm mt-1 whitespace-nowrap">
                                {workloadData.pessimistic} 工时
                            </div>
                        </div>
                    </div>

                    {/* 预期值标记 - 采用突出的标记风格 */}
                    <div className="absolute" style={{ left: '50%', top: '-5px' }}>
                        <div className="h-12 flex flex-col items-center">
                            <div className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium shadow-sm">
                                {workloadData.expected.toFixed(2)}
                            </div>
                            <div className="h-8 w-[2px] bg-indigo-500 mt-1"></div>
                            <div className="w-5 h-5 rounded-full bg-indigo-500 border-2 border-white shadow-sm flex items-center justify-center -mt-1">
                                <FiClock className="text-white" size={10} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 数据卡片部分 */}
            <div className="px-4 py-2">
                <div className="bg-blue-50/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-gray-600 text-xs font-medium">乐观估计</span>
                        </div>
                        <span className="text-gray-800 text-xs font-semibold">{workloadData.optimistic} 工时</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-gray-600 text-xs font-medium">最可能估计</span>
                        </div>
                        <span className="text-gray-800 text-xs font-semibold">{workloadData.most_likely} 工时</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-gray-600 text-xs font-medium">悲观估计</span>
                        </div>
                        <span className="text-gray-800 text-xs font-semibold">{workloadData.pessimistic} 工时</span>
                    </div>

                    {/* 分隔线 */}
                    <div className="h-[1px] bg-blue-200/50 my-3"></div>

                    {/* 预期工时信息 */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2">
                                <FiClock size={10} />
                            </div>
                            <span className="text-indigo-700 text-xs font-medium">预期工时</span>
                        </div>
                        <div className="text-indigo-800 font-medium">
                            <span className="text-sm">{workloadData.expected.toFixed(2)}</span>
                            <span className="text-xs ml-1 text-indigo-500">± {workloadData.standard_deviation.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="ml-6 mt-1 text-[10px] text-indigo-500">
                        基于PERT三点估算法
                    </div>
                </div>
            </div>
        </AccordionPanel>
    );
};

export default PertWorkloadPanel;
