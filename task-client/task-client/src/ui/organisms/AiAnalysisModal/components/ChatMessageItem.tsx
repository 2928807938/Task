"use client";

import React, {useEffect} from "react";
import ChatBubble from "./ChatBubble";
import {ChatMessage, PhaseItem, RiskItem, TaskItem} from "./types";
import {motion} from "framer-motion";
import {FiArrowRight, FiCheckCircle} from 'react-icons/fi';
import {useTheme} from '@/ui/theme/themeContext';

interface ChatMessageItemProps {
  message: ChatMessage;
  isComprehensiveAnalysis?: boolean;
  onCreateTask?: () => void; // 创建任务回调
  hasTaskSplitData?: boolean; // 是否有任务拆分数据
  streamingComplete?: boolean; // 分析是否完成
  isLastMessage?: boolean; // 是否是最后一条消息
}

/**
 * 聊天消息组件 -
 */
const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isComprehensiveAnalysis,
  onCreateTask,
  hasTaskSplitData,
  streamingComplete,
  isLastMessage
}) => {
  const { theme } = useTheme();
  // 使用消息自身的属性或外部传入的属性
  const isComprehensiveMsg = message.isComprehensiveAnalysis || isComprehensiveAnalysis;

  // 添加 useEffect 钩子，只在消息变化时执行日志打印
  useEffect(() => {
    if (isComprehensiveMsg || message.type === 8) {
      // 这里可以添加需要的逻辑
    }
  }, [message, isComprehensiveMsg]);

  // 特殊处理思考中状态
  if (message.isThinking) {
    return (
      <ChatBubble isAi={message.isAi}>
        <div className="flex items-center space-x-2">
          <span className="text-sm tracking-wide">思考中</span>
          <div className="flex space-x-1">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.colors.primary[500] }}
              animate={{ y: ["-25%", "0%", "-25%"] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.colors.primary[500] }}
              animate={{ y: ["-25%", "0%", "-25%"] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.colors.primary[500] }}
              animate={{ y: ["-25%", "0%", "-25%"] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            />
          </div>
        </div>
      </ChatBubble>
    );
  }

  // 错误消息显示
  if (message.isError) {
    return (
      <ChatBubble isAi={message.isAi}>
        <div 
          className="p-2 border rounded-lg"
          style={{
            backgroundColor: `${theme.colors.error[500]}0D`, // 5% opacity
            borderColor: `${theme.colors.error[500]}33` // 20% opacity
          }}
        >
          <p 
            className="text-sm leading-relaxed whitespace-pre-wrap tracking-wide"
            style={{ color: theme.colors.error[500] }}
          >
            {message.content}
          </p>
        </div>
      </ChatBubble>
    );
  }

  // 综合分析消息 - 友好展示结构化数据 (苹果风格优化)
  if (isComprehensiveMsg || message.type === 8) {
    // 移除此处的日志，放到 useEffect 中

    // 使用消息中的结构化数据或尝试解析内容
    let data: any = message.structuredData;

    // 如果没有结构化数据，尝试从内容中提取和解析JSON
    if (!data && message.content) {
      try {
        // 检查是否是Markdown代码块格式
        if (message.content.includes('```json')) {
          // 从代码块中提取JSON
          const jsonMatch = message.content.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            // 解析提取出的JSON
            data = JSON.parse(jsonMatch[1].trim());
          }
        } else {
          // 如果不是代码块格式，直接尝试解析
          data = JSON.parse(message.content);
        }
      } catch (e) {
        console.error('无法解析综合分析数据:', e);
        console.log('原始消息内容:', message.content);
      }
    }

    // 如果是流式数据但还未完成，显示加载中提示
    const isStreamingIncomplete = message.content &&
                                (!data &&
                                 (message.content.includes('```json') && !message.content.includes('```\n')));


    return (
      <ChatBubble isAi={message.isAi}>
        <div className="space-y-4 w-full">
          {/* 标题区*/}
          {data?.summary?.title ? (
            <h3 className="font-semibold text-gray-800 text-base flex items-center bg-gradient-to-r from-blue-50 to-blue-100/50 px-3 py-2 rounded-lg border border-blue-100/50 shadow-sm">
              <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2 shadow-sm">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {data.summary.title}
            </h3>
          ) : (
            <h3 className="font-semibold text-gray-800 text-base flex items-center bg-gradient-to-r from-blue-50 to-blue-100/50 px-3 py-2 rounded-lg border border-blue-100/50 shadow-sm">
              <span className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-2 shadow-sm">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              需求综合分析
            </h3>
          )}

          {/* 概述区*/}
          {data?.summary?.overview && (
            <div className="px-4 py-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100/70 shadow-sm">
              <p className="text-gray-700 text-sm leading-relaxed">
                {data.summary.overview}
              </p>
            </div>
          )}

          {/* 要点卡片组*/}
          {data && data.summary && (
            <div className="grid grid-cols-1 gap-3">
              {/* 关键指标 */}
              {data.summary.keyPoints && data.summary.keyPoints.length > 0 && (
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-blue-50/70 p-3.5 border border-blue-100/70 shadow-sm backdrop-blur-sm">
                  <p className="font-medium text-sm text-blue-800 mb-2 flex items-center">
                    <span className="w-5 h-5 mr-1.5 rounded-full bg-blue-100 flex items-center justify-center shadow-inner">
                      <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    关键指标
                  </p>
                  <ul className="space-y-2 pl-2">
                    {data.summary.keyPoints.map((point: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mt-0.5 mr-2 text-xs">●</span>
                        <span className="text-sm text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 潜在挑战 */}
              {data.summary.challenges && data.summary.challenges.length > 0 && (
                <div className="rounded-xl bg-gradient-to-r from-amber-50 to-amber-50/70 p-3.5 border border-amber-100/70 shadow-sm backdrop-blur-sm">
                  <p className="font-medium text-sm text-amber-800 mb-2 flex items-center">
                    <span className="w-5 h-5 mr-1.5 rounded-full bg-amber-100 flex items-center justify-center shadow-inner">
                      <svg className="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </span>
                    潜在挑战
                  </p>
                  <ul className="space-y-2 pl-2">
                    {data.summary.challenges.map((challenge: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-amber-500 mt-0.5 mr-2 text-xs">●</span>
                        <span className="text-sm text-gray-700">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 价值机会 */}
              {data.summary.opportunities && data.summary.opportunities.length > 0 && (
                <div className="rounded-xl bg-gradient-to-r from-green-50 to-green-50/70 p-3.5 border border-green-100/70 shadow-sm backdrop-blur-sm">
                  <p className="font-medium text-sm text-green-800 mb-2 flex items-center">
                    <span className="w-5 h-5 mr-1.5 rounded-full bg-green-100 flex items-center justify-center shadow-inner">
                      <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    价值机会
                  </p>
                  <ul className="space-y-2 pl-2">
                    {data.summary.opportunities.map((opportunity: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mt-0.5 mr-2 text-xs">●</span>
                        <span className="text-sm text-gray-700">{opportunity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 任务安排部分 - 苹果风格完全展开 */}
          {data?.taskArrangement?.phases && data.taskArrangement.phases.length > 0 && (
            <div className="mt-4 pt-2">
              <div className="flex items-center bg-gradient-to-r from-indigo-50 to-indigo-100/50 px-3 py-2 rounded-lg border border-indigo-100/50 shadow-sm mb-3">
                <span className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center mr-2 shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </span>
                <h3 className="font-semibold text-gray-800 text-base">任务安排计划</h3>
              </div>

              {/* 阶段卡片*/}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100/80 shadow-sm overflow-hidden">
                {/* 概要统计 */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 bg-gray-50/70">
                  <div className="py-3 px-4 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">总阶段</p>
                    <p className="text-lg font-medium text-gray-800">{data.taskArrangement.phases.length}</p>
                  </div>
                  <div className="py-3 px-4 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">总任务数</p>
                    <p className="text-lg font-medium text-gray-800">{data.taskArrangement.phases.reduce((acc: number, phase: PhaseItem) => acc + phase.tasks.length, 0)}</p>
                  </div>
                  <div className="py-3 px-4 text-center">
                    <p className="text-xs text-gray-500 mb-0.5">预计工时</p>
                    <p className="text-lg font-medium text-gray-800">{data.taskArrangement?.estimatedDuration || '-'}</p>
                  </div>
                </div>

                {/* 全部阶段 */}
                <div className="p-4 space-y-4">
                  {data.taskArrangement.phases.map((phase: PhaseItem, phaseIndex: number) => (
                    <div key={phaseIndex} className="">
                      <div className="font-medium text-sm mb-2 flex items-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs mr-2 shadow-inner">
                          {phaseIndex + 1}
                        </span>
                        <span className="text-gray-800 font-medium">{phase.name}</span>
                        <span className="ml-2 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100/50">
                          {phase.suggestedTimeframe}
                        </span>
                      </div>

                      {/* 显示所有任务 */}
                      <div className="pl-5 border-l-2 border-indigo-100 ml-3 space-y-2.5">
                        {phase.tasks.map((task: TaskItem, taskIndex: number) => (
                          <div key={taskIndex} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <p className="font-medium text-gray-800 text-sm">{task.name}</p>
                            <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{task.assignmentSuggestion}</p>

                            {task.dependencies && task.dependencies.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {task.dependencies.map((dep: string, depIndex: number) => (
                                  <span key={depIndex} className="inline-block bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs border border-indigo-100/50">
                                    依赖: {dep}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 资源建议 */}
                {data.taskArrangement.resourceRecommendations && (
                  <div className="bg-gray-50/70 px-4 py-3 border-t border-gray-100/80">
                    <p className="font-medium text-sm text-gray-700 mb-1.5">资源建议</p>
                    <div className="bg-white/80 rounded-lg p-3 border border-gray-100/50 shadow-sm">
                      <p className="text-sm text-gray-700 mb-1.5">
                        <span className="font-medium">人员配置: </span>
                        {data.taskArrangement.resourceRecommendations.personnel}
                      </p>
                      {data.taskArrangement.resourceRecommendations.skills && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">所需技能:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {data.taskArrangement.resourceRecommendations.skills.map((skill: string, index: number) => (
                              <span key={index} className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs border border-blue-100/50">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 风险管理*/}
          {data?.taskArrangement?.riskManagement && data.taskArrangement.riskManagement.length > 0 && (
            <div className="mt-4 pt-2">
              <div className="flex items-center bg-gradient-to-r from-red-50 to-red-100/50 px-3 py-2 rounded-lg border border-red-100/50 shadow-sm mb-3">
                <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-2 shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <h3 className="font-semibold text-gray-800 text-base">风险管理</h3>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100/80 shadow-sm overflow-hidden">
                <div className="p-4 space-y-3">
                  {data.taskArrangement.riskManagement.map((risk: RiskItem, riskIndex: number) => (
                    <div key={riskIndex} className="bg-gradient-to-r from-red-50 to-red-50/70 rounded-lg p-3 border border-red-100/60 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm text-gray-800 flex items-center">
                          <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mr-1.5 text-red-500 shadow-inner">
                            {riskIndex + 1}
                          </span>
                          {risk.risk}
                        </span>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200/50">
                          {risk.impact}
                        </span>
                      </div>
                      <div className="bg-white/90 rounded-md p-2.5 border border-red-50">
                        <p className="text-xs text-gray-700 leading-relaxed">
                          <span className="font-medium">缓解措施: </span>
                          {risk.mitigation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 如果是流式数据未完成，显示加载状态 */}
          {isStreamingIncomplete ? (
            <div className="py-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                <span className="text-sm text-gray-500 ml-2">分析数据生成中...</span>
              </div>
            </div>
          ) : !data && (
            <p className="text-sm text-gray-600 italic">
              暂无结构化分析数据可显示。
            </p>
          )}

          {/* 底部提示 */}
          <div className="text-xs text-gray-400 flex justify-between items-center mt-2 pt-1 border-t border-gray-100 dark:border-gray-700">
            <span>分析时间: {new Date().toLocaleDateString()}</span>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <svg 
                className="w-3 h-3 mr-1 opacity-60" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span className="opacity-75">左侧面板显示详细分析</span>
            </div>
          </div>
        </div>
      </ChatBubble>
    );
  }

  // 默认消息显示
  return (
    <ChatBubble isAi={message.isAi}>
      <div className="space-y-3">
        <p className="leading-relaxed whitespace-pre-wrap text-sm tracking-wide">
          {message.content}
        </p>

        {/* 在分析完成的最后一条AI消息中显示创建任务按钮 */}
        {message.isAi && isLastMessage && streamingComplete && hasTaskSplitData && onCreateTask &&
         (message.content?.includes('分析已完成') || message.content?.includes('查看左侧的分析结果')) && (
          <motion.div
            className="mt-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <button
              onClick={onCreateTask}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md text-xs font-medium transition-all border border-gray-100"
            >
              <FiCheckCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>点击创建任务</span>
              <FiArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </motion.div>
        )}
      </div>
    </ChatBubble>
  );
};

export default ChatMessageItem;
