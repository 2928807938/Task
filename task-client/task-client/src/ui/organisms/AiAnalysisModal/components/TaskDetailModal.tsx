"use client";

import React from "react";
import {AnimatePresence, motion} from 'framer-motion';
import {getParallelGroupStyle, getPriorityStyle} from "@/utils/style-utils";
import {SubTask} from './types';
import {useTheme} from '@/ui/theme/themeContext';

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: SubTask | null;
    allTasks?: SubTask[]; // 用于查找依赖任务信息
    onViewDependencyTask?: (taskId: string) => void; // 查看依赖任务的回调
}

/**
 * 任务详情模态框组件
 * 展示任务的详细信息，包括描述、优先级、并行组和依赖任务
 */
const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
    isOpen,
    onClose,
    task,
    allTasks = [],
    onViewDependencyTask
}) => {
    const { theme } = useTheme();
    if (!isOpen || !task) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/20 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => {
                    e.stopPropagation(); // 阻止事件继续传播
                    onClose();
                }}
            >
                <motion.div
                    className="rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden"
                    style={{ backgroundColor: theme.colors.card.background }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", damping: 25 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div 
                        className="p-5 border-b"
                        style={{ borderBottomColor: theme.colors.card.border }}
                    >
                        <div className="flex justify-between items-center">
                            <h3 
                                className="text-lg font-medium flex items-center"
                                style={{ color: theme.colors.foreground }}
                            >
                                <span 
                                    className="text-xs font-medium px-2.5 py-1 rounded-md mr-2"
                                    style={{
                                        backgroundColor: `${theme.colors.primary[500]}1A`, // 10% opacity
                                        color: theme.colors.primary[700]
                                    }}
                                >
                                    {task.id}
                                </span>
                                任务详情
                            </h3>
                            <button
                                className="p-1 rounded-full transition-colors"
                                style={{ color: theme.colors.neutral[400] }}
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
                    </div>

                    <div className="p-5">
                        <div className="mb-4">
                            <h4 
                                className="text-sm font-medium mb-1"
                                style={{ color: theme.colors.neutral[500] }}
                            >
                                任务描述
                            </h4>
                            <p style={{ color: theme.colors.foreground }}>{task.description}</p>
                        </div>

                        <div className="mb-4">
                            <h4 
                                className="text-sm font-medium mb-1"
                                style={{ color: theme.colors.neutral[500] }}
                            >
                                优先级
                            </h4>
                            <div className="flex items-center">
                                {getPriorityStyle(task.priority).icon}
                                <span className={`${getPriorityStyle(task.priority).textColor} font-medium`}>
                                    {task.priority}优先级
                                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 
                                className="text-sm font-medium mb-1"
                                style={{ color: theme.colors.neutral[500] }}
                            >
                                并行组
                            </h4>
                            <div className={`inline-flex items-center text-sm ${getParallelGroupStyle(task.parallel_group).textColor} px-2.5 py-1 rounded-lg ${getParallelGroupStyle(task.parallel_group).bgColor}`}>
                                组 {task.parallel_group}
                            </div>
                        </div>

                        {task.dependency.length > 0 && (
                            <div>
                                <h4 
                                    className="text-sm font-medium mb-1"
                                    style={{ color: theme.colors.neutral[500] }}
                                >
                                    依赖任务
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {task.dependency.map((depId: string) => {
                                        const depTask = allTasks.find(t => t.id === depId);
                                        return (
                                            <div
                                                key={depId}
                                                className="flex items-center bg-gray-100 px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onViewDependencyTask) {
                                                        onClose();
                                                        // 使用setTimeout确保当前模态框先关闭
                                                        setTimeout(() => onViewDependencyTask(depId), 300);
                                                    }
                                                }}
                                            >
                                                <span className="font-medium mr-2">{depId}</span>
                                                {depTask && <span className="text-gray-600 text-xs truncate max-w-[150px]">{depTask.description}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            onClick={onClose}
                        >
                            关闭
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TaskDetailModal;
