"use client";

import React, {useState} from "react";
import {AnimatePresence, motion} from 'framer-motion';
import {FiChevronRight, FiLink, FiTrash2} from "react-icons/fi";
import UserDisplay from "@/ui/molecules/UserDisplay";
import { useTheme } from "@/ui/theme";

export interface SubTask {
  id?: string; // 子任务ID，用于内部关联和依赖关系
  name: string;
  description: string;
  assigneeId?: string;
  hours?: number;
  priorityScore?: number;
  dependencies?: string[];
  extraInfo?: string; // 添加可选的extraInfo属性，用于存储额外信息
}

interface SubTaskItemProps {
  subTask: SubTask;
  index: number;
  updateSubTask: (index: number, subTask: SubTask) => void;
  removeSubTask: (index: number) => void;
  projectId?: string; // 项目ID，用于获取项目成员
  isMobile?: boolean; // 是否为移动端视图
  // 含有所有子任务的数组，用于根据ID查找任务名称
  allSubTasks?: SubTask[];
}

/**
 * 子任务项组件 -
 *
 * 遵循苹果设计规范的子任务项组件
 */
const SubTaskItem: React.FC<SubTaskItemProps> = ({
  subTask,
  index: subTaskIndex,
  updateSubTask,
  removeSubTask,
  projectId,
  isMobile = false,
  allSubTasks = []
}) => {
  // 使用主题系统
  const { theme, isDark } = useTheme();
  
  // 展开/折叠状态
  const [expanded, setExpanded] = useState<boolean>(false);
  
  const getPriorityLabel = (score?: number) => {
    if (!score) return '中';
    if (score >= 70) return '高';
    if (score >= 40) return '中';
    return '低';
  };

  const getPriorityColor = (score?: number) => {
    if (!score) {
      return isDark ? 'bg-blue-900/60 text-blue-300' : 'bg-blue-100 text-blue-800';
    }
    if (score >= 70) {
      return isDark ? 'bg-red-900/60 text-red-300' : 'bg-red-100 text-red-800';
    }
    if (score >= 40) {
      return isDark ? 'bg-blue-900/60 text-blue-300' : 'bg-blue-100 text-blue-800';
    }
    return isDark ? 'bg-green-900/60 text-green-300' : 'bg-green-100 text-green-800';
  };

  return (
    <motion.div
      className={`overflow-hidden ${isMobile ? 'p-3' : 'p-4'} border rounded-xl hover:shadow-lg transition-all`}
      style={{
        borderColor: theme.colors.card.border,
        backgroundColor: theme.colors.card.background,
        backdropFilter: 'blur(8px)'
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      layout
    >
      {/* 标题栏 - 更符合macOS的标题栏设计 */}
      <div className="flex items-center justify-between mb-3 group">
        <div
          className="flex-1 flex items-center space-x-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            style={{ color: theme.colors.primary[500] }}
          >
            <FiChevronRight size={16} />
          </motion.div>
          <input
            type="text"
            value={subTask.name}
            onChange={(e) => {
              updateSubTask(subTaskIndex, { ...subTask, name: e.target.value });
            }}
            onClick={(e) => e.stopPropagation()}
            className={`flex-1 font-medium bg-transparent border-b border-transparent focus:outline-none transition-colors ${isMobile ? 'text-sm' : ''}`}
            style={{
              color: theme.colors.foreground,
              borderColor: 'transparent'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.colors.primary[500];
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'transparent';
            }}
            placeholder="子任务名称"
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(subTask.priorityScore)}`}>
            {getPriorityLabel(subTask.priorityScore)}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="opacity-0 group-hover:opacity-100 transition-all p-1 rounded-full"
            style={{
              color: theme.colors.neutral[600]
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.error[500];
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(254, 226, 226, 1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.neutral[600];
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={() => removeSubTask(subTaskIndex)}
          >
            <FiTrash2 size={14} />
          </motion.button>
        </div>
      </div>

      {/* 详细内容区域 - 可展开/折叠 */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={{
              expanded: { opacity: 1, height: "auto", marginBottom: "12px" },
              collapsed: { opacity: 0, height: 0, marginBottom: 0 }
            }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="mb-3">
              <textarea
                value={subTask.description}
                onChange={(e) => {
                  updateSubTask(subTaskIndex, { ...subTask, description: e.target.value });
                }}
                className={`w-full ${isMobile ? 'text-xs' : 'text-sm'} bg-transparent border hover:border-opacity-100 border-opacity-50 focus:outline-none rounded-lg p-2 transition-colors`}
                style={{
                  color: theme.colors.neutral[600],
                  borderColor: theme.colors.card.border,
                  backgroundColor: 'transparent'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.colors.primary[500];
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.colors.card.border;
                }}
                placeholder="子任务描述"
                rows={isMobile ? 2 : 3}
              />
            </div>

            <div className={`grid grid-cols-${isMobile ? '1' : '2'} gap-3 mb-4`}>
              {/* 责任人（只读显示） */}
              <div>
                <label className={`block text-xs font-medium mb-1`} style={{ color: theme.colors.foreground }}>
                  责任人
                </label>
                <UserDisplay
                  userId={subTask.assigneeId}
                  projectId={projectId}
                  className="w-full"
                />
              </div>

              {/* 工时 */}
              <div className={isMobile ? 'mt-3' : ''}>
                <label className={`block text-xs font-medium mb-1`} style={{ color: theme.colors.foreground }}>
                  工时（小时）
                </label>
                <div 
                  className={`flex items-center w-full px-3 py-1.5 ${isMobile ? 'text-xs' : 'text-sm'} rounded-lg border`}
                  style={{
                    borderColor: theme.colors.card.border,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.foreground
                  }}
                >
                  <span className="font-medium">{subTask.hours || 0}</span>
                </div>
              </div>
            </div>

            {/* 优先级滑块 - macOS风格滑块 */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <label className={`block text-xs font-medium`} style={{ color: theme.colors.foreground }}>
                  优先级
                </label>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(subTask.priorityScore)}`}>
                    {getPriorityLabel(subTask.priorityScore)}
                  </span>
                  <span className={`text-xs font-medium w-8 text-center`} style={{ color: theme.colors.foreground }}>
                    {subTask.priorityScore || 50}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={subTask.priorityScore || 50}
                  onChange={(e) => {
                    updateSubTask(subTaskIndex, {
                      ...subTask,
                      priorityScore: parseInt(e.target.value)
                    });
                  }}
                  className={`flex-grow h-2 appearance-none rounded-full focus:outline-none cursor-pointer`}
                  style={{
                    background: subTask.priorityScore
                      ? `linear-gradient(to right, ${theme.colors.primary[500]} 0%, ${theme.colors.primary[500]} ${subTask.priorityScore}%, ${theme.colors.card.border} ${subTask.priorityScore}%, ${theme.colors.card.border} 100%)`
                      : theme.colors.card.border
                  }}
                />
              </div>
            </div>

            {/* 依赖任务显示 */}
            <div className="mt-4">
              <div className="mb-1">
                <label className={`block text-xs font-medium`} style={{ color: theme.colors.foreground }}>
                  依赖任务
                </label>
              </div>

              {/* 已选依赖列表 */}
              {Array.isArray(subTask.dependencies) && subTask.dependencies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {subTask.dependencies.map((depId, depIndex) => {
                    // 尝试根据ID查找依赖的子任务
                    const depTask = allSubTasks.find(t => t.id === depId);

                    // 根据任务ID格式处理显示文本
                    let displayText = depId;
                    if (depTask) {
                      // 如果在子任务列表中找到了对应的任务
                      displayText = depTask.name;
                    } else if (typeof depId === 'string' && depId.startsWith('T')) {
                      // 如果是"T"开头的ID格式，如T3
                      displayText = `任务 ${depId}`;
                    }

                    // 显示依赖任务标签
                    return (
                      <div
                        key={depIndex}
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${isDark ? 'bg-blue-600/20 text-blue-300 border border-blue-700/30' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
                        title={`依赖任务: ${depId}`}
                      >
                        <FiLink size={10} className="mr-1 opacity-70" />
                        <span className="truncate max-w-[8rem]">{displayText}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-gray-500 italic">无依赖任务</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SubTaskItem;
