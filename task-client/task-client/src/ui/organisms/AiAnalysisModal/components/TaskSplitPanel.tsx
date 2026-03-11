"use client";

import React, {useEffect, useState} from "react";
import {FiArrowRight, FiCheckCircle, FiGitBranch, FiGrid, FiInfo, FiList, FiShare2} from "react-icons/fi";
import {AnimatePresence, motion} from "framer-motion";
import AccordionPanel from "./AccordionPanel";
import {SubTask, TaskSplitData} from "./types";
import {useTheme} from '@/ui/theme/themeContext';

interface TaskSplitPanelProps {
  taskSplitData?: TaskSplitData;
  onOpenDependencyGraph?: (data: TaskSplitData) => void;
  onTaskClick?: (task: SubTask) => void;
  onCreateTask?: () => void; // 创建任务按钮点击回调
  isOpen?: boolean; // 控制面板是否展开
  onToggle?: () => void; // 切换面板展开/折叠状态的回调
}

// 视图模式枚举
type ViewMode = "sequence" | "group";

/**
 * 任务拆分面板组件 - 显示AI分析的任务拆分结果
 */
const TaskSplitPanel: React.FC<TaskSplitPanelProps> = ({ taskSplitData, onOpenDependencyGraph, onTaskClick, onCreateTask, isOpen = false, onToggle }) => {
  const { theme } = useTheme();
  // 视图模式状态
  const [viewMode, setViewMode] = useState<ViewMode>("sequence");
  // 当前选中的任务ID
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  // 当前高亮的依赖任务ID
  const [highlightedDeps, setHighlightedDeps] = useState<string[]>([]);
  // 是否显示依赖关系图
  const [showDependencyGraph, setShowDependencyGraph] = useState<boolean>(true);

  // 打开依赖图弹窗
  const openDependencyGraphModal = () => {
    if (onOpenDependencyGraph && taskSplitData) {
      onOpenDependencyGraph(taskSplitData);
    }
  };

  // 键盘交互处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 空格键切换视图模式
      if (e.key === " " && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setViewMode(prev => prev === "sequence" ? "group" : "sequence");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!taskSplitData) {
    return null;
  }

  // 处理任务点击
  const handleTaskClick = (taskId: string) => {
    // 找到该任务
    const task = taskSplitData.sub_tasks.find(t => t.id === taskId);
    if (!task) return;

    // 选中任务并高亮其依赖任务
    setSelectedTaskId(taskId);
    setHighlightedDeps(task.dependency);

    // 如果有外部点击处理函数，则调用它
    if (onTaskClick) {
      onTaskClick(task);
    }

    // 提供触觉反馈（如果支持）
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(5); // 轻微震动反馈
    }
  };



  // 根据优先级获取样式
  const getPriorityStyle = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "高":
        return {
          color: theme.colors.error[700] || '#DC2626',
          bgColor: `${theme.colors.error[500]}14`, // 8% opacity
          borderColor: `${theme.colors.error[500]}33`, // 20% opacity
          icon: <span style={{ color: theme.colors.error[500] }} className="mr-1">●</span>
        };
      case "中":
        return {
          color: theme.colors.warning[700] || '#D97706',
          bgColor: `${theme.colors.warning[500]}14`, // 8% opacity
          borderColor: `${theme.colors.warning[500]}33`, // 20% opacity
          icon: <span style={{ color: theme.colors.warning[500] }} className="mr-1">●</span>
        };
      case "低":
        return {
          color: theme.colors.primary[700] || theme.colors.primary[500],
          bgColor: `${theme.colors.primary[500]}14`, // 8% opacity
          borderColor: `${theme.colors.primary[500]}33`, // 20% opacity
          icon: <span style={{ color: theme.colors.primary[500] }} className="mr-1">●</span>
        };
      default:
        return {
          color: theme.colors.neutral[700] || theme.colors.neutral[500],
          bgColor: `${theme.colors.neutral[500]}14`, // 8% opacity
          borderColor: `${theme.colors.neutral[500]}33`, // 20% opacity
          icon: <span style={{ color: theme.colors.neutral[500] }} className="mr-1">●</span>
        };
    }
  };

  // 根据并行组获取背景颜色
  const getParallelGroupStyle = (group: string) => {
    const colors = [
      theme.colors.info[500] || theme.colors.primary[500],
      theme.colors.primary[500],
      theme.colors.error[500],
      theme.colors.success[500],
      theme.colors.warning[500],
    ];

    // 根据组名的ASCII码值选择颜色
    const index = group.charCodeAt(0) % colors.length;
    const color = colors[index];
    
    return {
      color: `${color}E6`, // 90% opacity for text
      bgColor: `${color}0D`, // 5% opacity for background
      borderColor: `${color}1A` // 10% opacity for border
    };
  };

  // 按并行组对任务进行分组
  const getTasksByGroup = () => {
    const groupedTasks: Record<string, SubTask[]> = {};

    taskSplitData.sub_tasks.forEach(task => {
      if (!groupedTasks[task.parallel_group]) {
        groupedTasks[task.parallel_group] = [];
      }
      groupedTasks[task.parallel_group].push(task);
    });

    return groupedTasks;
  };

  // 切换视图模式
  const toggleViewMode = () => {
    setViewMode(prev => prev === "sequence" ? "group" : "sequence");
  };

  return (
    <AccordionPanel
      title="任务拆分"
      icon={<FiGitBranch size={14} />}
      initiallyOpen={isOpen}
      animationDelay={0.5}
      onToggle={onToggle}
      iconBgColor={`${theme.colors.primary[500]}1A`} // 10% opacity
      iconColor={theme.colors.primary[500]}
    >
      <div className="space-y-4">
        {/* 视图切换器 - 苹果风格分段控制器 */}
        <div className="flex justify-center mb-4">
          <div 
            className="relative backdrop-blur-xl p-1 rounded-full flex items-center shadow-sm border w-64"
            style={{
              backgroundColor: `${theme.colors.neutral[100]}99`, // 60% opacity
              borderColor: `${theme.colors.card.border}4D` // 30% opacity
            }}
          >
            {/* 滑块背景 - 苹果风格动画滑块 */}
            <div
              className="absolute top-1 bottom-1 rounded-full shadow-sm transition-all duration-300"
              style={{
                backgroundColor: theme.colors.card.background,
                left: viewMode === "sequence" ? "4px" : "50%",
                right: viewMode === "sequence" ? "50%" : "4px",
                transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)"
              }}
            />

            {/* 按序号按钮 */}
            <button
              onClick={() => setViewMode("sequence")}
              className="relative z-10 flex-1 flex justify-center items-center py-1.5 rounded-full text-sm font-medium transition-colors duration-200"
              style={{
                color: viewMode === "sequence" ? theme.colors.primary[600] : theme.colors.neutral[600]
              }}
              aria-pressed={viewMode === "sequence"}
              role="tab"
            >
              <FiList className="mr-1.5" size={14} />
              按序号
            </button>

            {/* 按分组按钮 */}
            <button
              onClick={() => setViewMode("group")}
              className="relative z-10 flex-1 flex justify-center items-center py-1.5 rounded-full text-sm font-medium transition-colors duration-200"
              style={{
                color: viewMode === "group" ? theme.colors.primary[600] : theme.colors.neutral[600]
              }}
              aria-pressed={viewMode === "group"}
              role="tab"
            >
              <FiGrid className="mr-1.5" size={14} />
              按分组
            </button>
          </div>
        </div>
        {/* 主任务 */}
        <div 
          className="p-4 backdrop-blur-2xl rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
          style={{
            backgroundColor: `${theme.colors.card.background}B3`, // 70% opacity
            borderColor: `${theme.colors.card.border}66` // 40% opacity
          }}
        >
          <h3 
            className="text-sm font-medium mb-2 flex items-center"
            style={{ color: theme.colors.foreground }}
          >
            <span 
              className="w-5 h-5 rounded-full flex items-center justify-center mr-2"
              style={{ backgroundColor: `${theme.colors.primary[500]}1A` }} // 10% opacity
            >
              <FiCheckCircle 
                style={{ color: theme.colors.primary[600] }} 
                size={12} 
              />
            </span>
            主任务
          </h3>
          <p 
            className="text-sm pl-7"
            style={{ color: theme.colors.neutral[700] }}
          >
            {taskSplitData.main_task.name}
          </p>
        </div>



        {/* 并行度评分 */}
        <div 
          className="p-4 backdrop-blur-2xl rounded-2xl border shadow-sm"
          style={{
            backgroundColor: `${theme.colors.card.background}B3`, // 70% opacity
            borderColor: `${theme.colors.card.border}66` // 40% opacity
          }}
        >
          <h3 
            className="text-sm font-medium mb-2 flex items-center"
            style={{ color: theme.colors.foreground }}
          >
            <span 
              className="w-5 h-5 rounded-full flex items-center justify-center mr-2"
              style={{ backgroundColor: `${theme.colors.primary[500]}1A` }} // 10% opacity
            >
              <FiGitBranch 
                style={{ color: theme.colors.primary[600] }} 
                size={12} 
              />
            </span>
            并行度评分
          </h3>
          <div className="flex items-center pl-7">
            <div className="flex-1">
              <div 
                className="h-2.5 rounded-full overflow-hidden shadow-inner"
                style={{ backgroundColor: theme.colors.neutral[100] }}
              >
                <motion.div
                  className="h-full"
                  style={{
                    background: `linear-gradient(to right, ${theme.colors.primary[400]}, ${theme.colors.primary[600]})`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${taskSplitData.parallelism_score}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                />
              </div>
            </div>
            <div 
              className="ml-3 text-sm font-medium px-2.5 py-1 rounded-full"
              style={{
                color: theme.colors.primary[600],
                backgroundColor: `${theme.colors.primary[500]}14` // 8% opacity
              }}
            >
              {taskSplitData.parallelism_score}%
            </div>
          </div>
        </div>

        {/* 子任务列表 */}
        <div 
          className="p-4 backdrop-blur-2xl rounded-2xl border shadow-sm"
          style={{
            backgroundColor: `${theme.colors.card.background}B3`, // 70% opacity
            borderColor: `${theme.colors.card.border}66` // 40% opacity
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 
              className="text-sm font-medium flex items-center"
              style={{ color: theme.colors.foreground }}
            >
              <span 
                className="w-5 h-5 rounded-full flex items-center justify-center mr-2"
                style={{ backgroundColor: `${theme.colors.primary[500]}1A` }} // 10% opacity
              >
                <FiArrowRight 
                  style={{ color: theme.colors.primary[600] }} 
                  size={12} 
                />
              </span>
              子任务
            </h3>
            <button
              className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center shadow-sm border transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: `${theme.colors.primary[500]}14`, // 8% opacity
                color: theme.colors.primary[600],
                borderColor: `${theme.colors.primary[500]}33` // 20% opacity
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${theme.colors.primary[500]}1A`; // 10% opacity
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${theme.colors.primary[500]}14`; // 8% opacity
              }}
              onClick={openDependencyGraphModal}
            >
              <FiShare2 className="mr-1" size={12} />
              查看依赖图
            </button>
          </div>

          {/* 按序号视图 */}
          <AnimatePresence mode="wait">
            {viewMode === "sequence" && (
              <motion.div
                key="sequence-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 pl-7"
              >
                {taskSplitData.sub_tasks.map((task, index) => {
                  const priorityStyle = getPriorityStyle(task.priority);
                  const groupStyle = getParallelGroupStyle(task.parallel_group);

                  // 判断是否是选中的任务或高亮的依赖任务
                  const isSelected = selectedTaskId === task.id;
                  const isHighlighted = highlightedDeps.includes(task.id);

                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: isSelected ? 1.005 : 1,
                      }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.02,
                        ease: [0.2, 0.8, 0.2, 1]
                      }}
                      className={`py-2.5 px-4 rounded-xl border ${
                        task.priority === "高" 
                          ? "border-emerald-100/70 bg-emerald-50/70" 
                          : task.priority === "中" 
                            ? "border-blue-100/70 bg-blue-50/70" 
                            : "border-gray-100/60 bg-white/80"
                      } 
                      ${isSelected ? "ring-1 ring-blue-200" : ""} 
                      ${isHighlighted ? "ring-1 ring-green-200" : ""}
                      backdrop-blur-sm transition-all cursor-pointer`}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => handleTaskClick(task.id)}
                      role="button"
                      aria-pressed={isSelected}
                      tabIndex={0}
                    >
                      <div className="flex items-center">
                        {/* 任务ID - 更大更突出 */}
                        <div className="flex-shrink-0 w-6 mr-3 text-center">
                          <span className="text-base text-gray-500 font-normal">
                            {task.id.replace('T', '')}
                          </span>
                        </div>

                        {/* 任务内容主体 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline mb-1">
                            {/* 任务描述 - 占据更多水平空间 */}
                            <div className="text-sm text-gray-800 leading-tight font-normal mr-auto pr-2">
                              {task.description}
                            </div>
                          </div>

                          {/* 标签区 - 更水平的布局 */}
                          <div className="flex items-center gap-x-2.5 text-xs overflow-x-auto pb-0.5">
                            {/* 优先级标签 */}
                            <div className="inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              <span className="text-gray-500">{task.priority}</span>
                            </div>

                            {/* 并行组标签 */}
                            <div className="text-gray-500">
                              组 {task.parallel_group}
                            </div>

                            {/* 依赖任务 */}
                            {task.dependency.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-gray-400">依赖</span>
                                {task.dependency.map((dep, i) => (
                                  <React.Fragment key={dep}>
                                    <span
                                      className="text-gray-500 hover:text-blue-500 transition-colors cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTaskClick(dep);
                                      }}
                                    >
                                      {dep.replace('T', '')}
                                    </span>
                                    {i < task.dependency.length - 1 && <span className="text-gray-400">,</span>}
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* 按分组视图 */}
            {viewMode === "group" && (
              <motion.div
                key="group-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 pl-7"
              >
                {Object.entries(getTasksByGroup()).map(([group, tasks], groupIndex) => {
                  const groupStyle = getParallelGroupStyle(group);

                  return (
                    <div key={group} className="space-y-3">
                      {/* 并行组标题 - 分组标题 */}
                      <div className={`flex items-center justify-between px-3 py-1.5 rounded-xl bg-gray-50/80 text-gray-700 border border-gray-100/50 backdrop-blur-lg`}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-4.5 h-4.5 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100/40">
                            <span className="text-xs font-medium text-gray-600">{group}</span>
                          </div>
                          <span className="text-xs font-medium">并行组</span>
                        </div>
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/80 text-gray-500">
                          {tasks.length}
                        </span>
                      </div>

                      {/* 该组的任务列表 - 苹果卡片流布局 */}
                      <div className="space-y-2.5 ml-3">
                        {tasks.map((task, taskIndex) => {
                          const priorityStyle = getPriorityStyle(task.priority);

                          // 判断是否是选中的任务或高亮的依赖任务
                          const isSelected = selectedTaskId === task.id;
                          const isHighlighted = highlightedDeps.includes(task.id);

                          return (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                scale: isSelected ? 1.005 : 1,
                              }}
                              transition={{
                                duration: 0.2,
                                delay: taskIndex * 0.02,
                                ease: [0.2, 0.8, 0.2, 1]
                              }}
                              className={`py-2.5 px-4 rounded-xl border ${
                                task.priority === "高" 
                                  ? "border-emerald-100/70 bg-emerald-50/70" 
                                  : task.priority === "中" 
                                    ? "border-blue-100/70 bg-blue-50/70" 
                                    : "border-gray-100/60 bg-white/80"
                              } 
                              ${isSelected ? "ring-1 ring-blue-200" : ""} 
                              ${isHighlighted ? "ring-1 ring-green-200" : ""}
                              backdrop-blur-sm transition-all cursor-pointer`}
                              whileHover={{ y: -1 }}
                              whileTap={{ scale: 0.995 }}
                              onClick={() => handleTaskClick(task.id)}
                              role="button"
                              aria-pressed={isSelected}
                              tabIndex={0}
                            >
                              <div className="flex items-center">
                                {/* 任务ID - 更大更突出 */}
                                <div className="flex-shrink-0 w-6 mr-3 text-center">
                                  <span className="text-base text-gray-500 font-normal">
                                    {task.id.replace('T', '')}
                                  </span>
                                </div>

                                {/* 任务内容主体 */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline mb-1">
                                    {/* 任务描述 - 占据更多水平空间 */}
                                    <div className="text-sm text-gray-800 leading-tight font-normal mr-auto pr-2">
                                      {task.description}
                                    </div>
                                  </div>

                                  {/* 标签区 - 更水平的布局 */}
                                  <div className="flex items-center gap-x-2.5 text-xs overflow-x-auto pb-0.5">
                                    {/* 优先级标签 */}
                                    <div className="inline-flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                      <span className="text-gray-500">{task.priority}</span>
                                    </div>

                                    {/* 并行组标签 */}
                                    <div className="text-gray-500">
                                      组 {task.parallel_group}
                                    </div>

                                    {/* 依赖任务 */}
                                    {task.dependency.length > 0 && (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-gray-400">依赖</span>
                                        {task.dependency.map((dep, i) => (
                                          <React.Fragment key={dep}>
                                            <span
                                              className="text-gray-500 hover:text-blue-500 transition-colors cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleTaskClick(dep);
                                              }}
                                            >
                                              {dep.replace('T', '')}
                                            </span>
                                            {i < task.dependency.length - 1 && <span className="text-gray-400">,</span>}
                                          </React.Fragment>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 并行执行提示 */}
        <div 
          className="p-4 backdrop-blur-2xl border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          style={{
            backgroundColor: `${theme.colors.info[500]}14`, // 8% opacity
            borderColor: `${theme.colors.info[500]}33` // 20% opacity
          }}
        >
          <h3 
            className="text-sm font-medium mb-2 flex items-center"
            style={{ color: theme.colors.info[500] || theme.colors.primary[500] }}
          >
            <span 
              className="w-5 h-5 rounded-full flex items-center justify-center mr-2 border"
              style={{
                backgroundColor: `${theme.colors.info[500]}1A`, // 10% opacity
                borderColor: `${theme.colors.info[500]}4D` // 30% opacity
              }}
            >
              <FiInfo 
                style={{ color: theme.colors.info[500] || theme.colors.primary[500] }} 
                size={12} 
              />
            </span>
            并行执行提示
          </h3>
          <p 
            className="text-sm pl-7"
            style={{ color: theme.colors.neutral[700] || theme.colors.neutral[500] }}
          >
            {taskSplitData.parallel_execution_tips}
          </p>
        </div>

        {/* 创建任务按钮 */}
        {onCreateTask && (
          <div className="mt-4">
            <button
              onClick={onCreateTask}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-medium transition-colors shadow-sm"
              style={{
                backgroundColor: theme.colors.primary[600],
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.primary[700] || theme.colors.primary[600];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.primary[600];
              }}
            >
              <FiCheckCircle size={18} />
              创建任务
            </button>
          </div>
        )}
      </div>
    </AccordionPanel>
  );
};

export default TaskSplitPanel;
