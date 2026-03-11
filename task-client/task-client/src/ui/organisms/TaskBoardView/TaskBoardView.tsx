'use client';

import React, {useEffect, useState} from 'react';
import {ProjectTask, StatusItem} from '@/types/api-types';
import {AnimatePresence, motion} from 'framer-motion';
import {Avatar} from '@/ui/atoms/Avatar';
import {FiClock, FiLoader} from 'react-icons/fi';
import {getPriorityStyle} from '@/utils/style-utils';
import {taskApi} from '@/adapters/api/task-api';

interface TaskBoardViewProps {
  tasks: ProjectTask[];
  onTaskClick?: (task: ProjectTask) => void;
  onAddTask?: () => void;
  projectId?: string;
  onTaskUpdate?: () => void;
}

// 默认状态列
const DEFAULT_BOARD_COLUMNS: StatusItem[] = [
  { id: 'WAITING', name: '等待处理', color: '#f3f4f6', order: 1 },
  { id: 'IN_PROGRESS', name: '进行中', color: '#dbeafe', order: 2 },
  { id: 'COMPLETED', name: '已完成', color: '#d1fae5', order: 3 },
  { id: 'OVERDUE', name: '已逾期', color: '#fee2e2', order: 4 }
];

export function TaskBoardView({ tasks, onTaskClick, onAddTask, projectId, onTaskUpdate }: TaskBoardViewProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [boardColumns, setBoardColumns] = useState<StatusItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = React.useRef(false);
  
  // 拖拽状态
  const [draggedTask, setDraggedTask] = useState<ProjectTask | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  // 触控板拖拽状态
  const [manualDrag, setManualDrag] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    task: null as ProjectTask | null
  });

  // 获取项目状态列表
  const fetchStatusList = async (id: string) => {
    if (!id || isFetchingRef.current) return;

    try {
      setIsLoading(true);
      isFetchingRef.current = true;
      const response = await taskApi.getProjectStatusList(id);

      if (response.success && response.data) {
        setBoardColumns(response.data);
      } else {
        setBoardColumns(DEFAULT_BOARD_COLUMNS);
        setError(response.message || '获取状态列表失败');
      }
    } catch (err) {
      console.error('获取状态列表出错:', err);
      setBoardColumns(DEFAULT_BOARD_COLUMNS);
      setError(err instanceof Error ? err.message : '获取状态列表失败');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!projectId) {
      setBoardColumns(DEFAULT_BOARD_COLUMNS);
      setIsLoading(false);
      return;
    }
    fetchStatusList(projectId);
  }, [projectId]);

  const taskList = tasks || [];

  // 按任务状态分组
  const getTasksByStatus = (statusId: string) => {
    if (statusId === 'OVERDUE') {
      return taskList.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        return dueDate < today && task.status !== 'COMPLETED';
      });
    }

    if (statusId === 'WAITING') {
      return taskList.filter(task => {
        if (task.statusId) {
          return task.statusId === statusId;
        }
        return !task.status || task.status === 'WAITING';
      });
    }

    const matchedTasks = taskList.filter(task => {
      if (task.statusId) {
        return task.statusId === statusId;
      }
      return task.status === statusId;
    });
    return matchedTasks;
  };

  // 计算任务到期状态
  const getDueStatus = (task: ProjectTask) => {
    if (!task.dueDate) return 'none';

    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 2) return 'soon';
    return 'normal';
  };

  // 拖拽处理函数
  const handleDragStart = (e: React.DragEvent, task: ProjectTask) => {
    console.log('🚀 开始拖拽任务:', task.title);
    setDraggedTask(task);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.setData('application/json', JSON.stringify({
      id: task.id,
      title: task.title,
      status: task.status,
      statusId: task.statusId
    }));
    
    // 创建拖拽图像
    const dragImage = document.createElement('div');
    dragImage.innerHTML = `
      <div style="
        padding: 12px 16px;
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        color: white;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
        box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
        border: 2px solid rgba(255, 255, 255, 0.2);
      ">
        📝 ${task.title}
      </div>
    `;
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.left = '-1000px';
    document.body.appendChild(dragImage);
    
    try {
      e.dataTransfer.setDragImage(dragImage, 125, 25);
    } catch (error) {
      console.log('设置拖拽图像失败:', error);
    }
    
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    }, 100);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumn(null);

    if (!draggedTask || !projectId) {
      return;
    }

    const currentStatusId = draggedTask.statusId || draggedTask.status;
    if (currentStatusId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    if (targetColumnId === 'OVERDUE') {
      setDraggedTask(null);
      return;
    }

    try {
      setIsUpdating(true);
      const result = await taskApi.updateTaskStatus(draggedTask.id, targetColumnId);
      
      if (result.success) {
        console.log('任务状态更新成功');
        if (onTaskUpdate) {
          onTaskUpdate();
        }
      } else {
        console.error('更新任务状态失败:', result.message);
      }
    } catch (error) {
      console.error('更新任务状态出错:', error);
    } finally {
      setIsUpdating(false);
      setDraggedTask(null);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.dataTransfer.dropEffect === 'none') {
      setDraggedTask(null);
      setDragOverColumn(null);
    }
  };

  // 触控板拖拽全局事件监听
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (manualDrag.task && !isUpdating) {
        const deltaX = Math.abs(e.clientX - manualDrag.startX);
        const deltaY = Math.abs(e.clientY - manualDrag.startY);
        
        if (!manualDrag.isDragging && (deltaX > 5 || deltaY > 5)) {
          setManualDrag(prev => ({ ...prev, isDragging: true }));
          setDraggedTask(manualDrag.task);
        }
        
        if (manualDrag.isDragging) {
          setManualDrag(prev => ({
            ...prev,
            currentX: e.clientX,
            currentY: e.clientY
          }));
          
          const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
          const dropTarget = elementUnderMouse?.closest('[data-drop-column]');
          if (dropTarget) {
            const columnId = dropTarget.getAttribute('data-drop-column');
            if (columnId && columnId !== dragOverColumn) {
              setDragOverColumn(columnId);
            }
          } else if (dragOverColumn) {
            setDragOverColumn(null);
          }
        }
      }
    };
    
    const handleGlobalMouseUp = async (e: MouseEvent) => {
      if (manualDrag.isDragging && dragOverColumn && manualDrag.task) {
        const mockEvent = {
          preventDefault: () => {},
          stopPropagation: () => {},
          dataTransfer: {
            getData: () => manualDrag.task?.id || ''
          },
          currentTarget: document.querySelector(`[data-drop-column="${dragOverColumn}"]`)
        } as any;
        
        await handleDrop(mockEvent, dragOverColumn);
      }
      
      setManualDrag({
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        task: null
      });
      setDraggedTask(null);
      setDragOverColumn(null);
    };
    
    if (manualDrag.task) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [manualDrag, dragOverColumn, isUpdating]);

  // 全局拖拽样式
  useEffect(() => {
    if (draggedTask || manualDrag.isDragging) {
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [draggedTask, manualDrag.isDragging]);

  if (isLoading) {
    return (
      <div className="mt-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin mr-2">
            <FiLoader size={24} className="text-blue-500" />
          </div>
          <span className="text-gray-600 dark:text-gray-300">加载状态列表中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4" style={{ userSelect: (draggedTask || manualDrag.isDragging) ? 'none' : 'auto' }}>
      {/* 触控板拖拽浮动预览 */}
      {manualDrag.isDragging && manualDrag.task && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: manualDrag.currentX,
            top: manualDrag.currentY,
            zIndex: 9999
          }}
        >
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg border-2 border-white/20 backdrop-blur-sm max-w-xs">
            <div className="text-sm font-medium truncate">
              📝 {manualDrag.task.title}
            </div>
            <div className="text-xs opacity-80 mt-1">
              拖拽到目标状态列
            </div>
          </div>
        </div>
      )}

      {/* 拖拽提示 */}
      {(draggedTask || manualDrag.isDragging) && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50/95 to-indigo-50/95 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200/40 dark:border-blue-700/40 rounded-2xl text-blue-800 dark:text-blue-200 text-sm flex items-center justify-between backdrop-blur-xl shadow-xl shadow-blue-100/30 dark:shadow-blue-900/10">
          <div className="flex items-center">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-100/80 to-blue-200/60 dark:from-blue-800/60 dark:to-blue-900/40 rounded-2xl flex items-center justify-center mr-3 shadow-sm">
              <span className="text-blue-600 dark:text-blue-400 text-lg">📝</span>
            </div>
            <div>
              <div className="font-semibold text-blue-900 dark:text-blue-100">正在移动任务</div>
              <div className="text-blue-700 dark:text-blue-300 text-xs truncate max-w-xs font-medium">
                {draggedTask?.title || manualDrag.task?.title}
              </div>
            </div>
          </div>
          <div className="text-xs bg-gradient-to-r from-blue-100/90 to-indigo-100/90 dark:from-blue-800/70 dark:to-indigo-800/70 px-4 py-2 rounded-full font-semibold backdrop-blur-sm shadow-sm border border-blue-200/30 dark:border-blue-600/30">
            {manualDrag.isDragging ? '移动到目标列并释放' : '拖放到目标状态列'}
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
          <p>{error}</p>
          <p className="mt-1 text-xs">使用默认状态列表显示任务</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {boardColumns.map(column => (
          <div
            key={column.id}
            className="flex flex-col h-full"
            data-drop-column={column.id}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* 列标题 */}
            <div
              className="px-4 py-3 rounded-t-xl border border-b-0 border-gray-200/80 dark:border-gray-700/80"
              style={{
                backgroundColor: `${column.color}20`,
                borderColor: `${column.color}40`
              }}
              data-drop-column={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    style={{ color: column.color }}>
                  {column.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs py-0.5 px-2 bg-white/60 dark:bg-gray-800/60 rounded-full text-gray-500 dark:text-gray-400 backdrop-blur-sm">
                    {getTasksByStatus(column.id).length}
                  </span>
                </div>
              </div>
            </div>

            {/* 任务列表 */}
            <div 
              className={`flex-1 p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-b-xl border border-t-0 border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-y-auto transition-all duration-500 ease-out ${
                dragOverColumn === column.id ? (
                  column.id === 'OVERDUE' ? 'bg-red-50/95 dark:bg-red-950/30 border-red-300/60 dark:border-red-600/50 shadow-xl shadow-red-200/20 dark:shadow-red-900/10' : 
                  'bg-blue-50/95 dark:bg-blue-950/30 border-blue-300/60 dark:border-blue-600/50 shadow-xl shadow-blue-200/20 dark:shadow-blue-900/10 ring-1 ring-blue-200/40 dark:ring-blue-400/30'
                ) : ''
              } ${
                column.id === 'OVERDUE' && (draggedTask || manualDrag.isDragging) ? 'cursor-not-allowed' : ''
              } ${
                (draggedTask || manualDrag.isDragging) && column.id !== 'OVERDUE' ? 'border-dashed border-[1.5px] border-blue-300/60 dark:border-blue-500/60' : ''
              }`} 
              style={{ 
                minHeight: '420px', 
                maxHeight: 'calc(75vh - 180px)',
                transform: dragOverColumn === column.id ? 'scale(1.008)' : 'scale(1)',
                transformOrigin: 'center',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
              data-drop-column={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <AnimatePresence>
                {getTasksByStatus(column.id).length > 0 ? (
                  getTasksByStatus(column.id).map(task => {
                    const dueStatus = getDueStatus(task);
                    const { textColor, bgColor, borderColor } = getPriorityStyle(task.priority || '');

                    return (
                      <div
                        key={task.id}
                        className={`mb-3 bg-white/95 dark:bg-gray-800/95 rounded-xl border border-gray-200/30 dark:border-gray-700/30 shadow-sm overflow-hidden transition-all duration-300 ease-out ${
                          (draggedTask?.id === task.id || manualDrag.task?.id === task.id) ? 'shadow-xl border-blue-400/60 dark:border-blue-500/60 ring-1 ring-blue-200/40 dark:ring-blue-400/30' : 'hover:shadow-md hover:border-gray-300/50 dark:hover:border-gray-600/50'
                        } ${
                          isUpdating ? 'pointer-events-none opacity-50' : ''
                        }`}
                        style={{
                          transform: (draggedTask?.id === task.id || manualDrag.task?.id === task.id) ? 'rotate(1deg) scale(0.98)' : 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          opacity: (draggedTask?.id === task.id || manualDrag.task?.id === task.id) ? 0.75 : 1,
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)'
                        }}
                      >
                        <div className="flex" style={{ position: 'relative' }}>
                          {/* 拖拽手柄 - Apple 风格设计 */}
                          <div
                            className={`
                              flex-shrink-0 w-12 min-h-[60px] 
                              flex items-center justify-center 
                              border-r border-gray-200/30 dark:border-gray-700/30
                              transition-all duration-300 ease-out select-none
                              ${
                                isUpdating 
                                  ? 'bg-gray-50/80 dark:bg-gray-800/80 cursor-not-allowed' 
                                  : (draggedTask?.id === task.id || manualDrag.task?.id === task.id)
                                    ? 'bg-blue-50/90 dark:bg-blue-950/60 cursor-grabbing shadow-inner' 
                                    : 'bg-gradient-to-b from-gray-50/60 to-gray-100/60 dark:from-gray-800/40 dark:to-gray-900/60 cursor-grab hover:from-gray-100/80 hover:to-gray-200/80 dark:hover:from-gray-700/60 dark:hover:to-gray-800/80 active:from-blue-50/70 active:to-blue-100/70 dark:active:from-blue-950/40 dark:active:to-blue-900/60'
                              }
                            `}
                            style={{
                              backdropFilter: 'blur(10px)',
                              WebkitBackdropFilter: 'blur(10px)'
                            }}
                            draggable={!isUpdating}
                            onDragStart={(e) => {
                              if (!isUpdating) {
                                handleDragStart(e, task);
                              } else {
                                e.preventDefault();
                                return false;
                              }
                            }}
                            onDragEnd={handleDragEnd}
                            onMouseDown={(e) => {
                              if (e.button === 0 && !isUpdating) {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                setManualDrag({
                                  isDragging: false,
                                  startX: e.clientX,
                                  startY: e.clientY,
                                  currentX: e.clientX,
                                  currentY: e.clientY,
                                  task: task
                                });
                              }
                            }}
                            title={isUpdating ? '正在更新任务...' : '拖拽移动任务'}
                          >
                            <div className="pointer-events-none select-none flex items-center justify-center">
                              {/* Apple 风格的拖拽指示器 */}
                              <div className={`
                                w-[18px] h-[18px] rounded-[4px] relative
                                transition-all duration-200 ease-out
                                ${
                                  isUpdating 
                                    ? 'bg-gray-300/60 dark:bg-gray-600/60' 
                                    : (draggedTask?.id === task.id || manualDrag.task?.id === task.id)
                                      ? 'bg-blue-400/80 dark:bg-blue-500/80 scale-110' 
                                      : 'bg-gray-400/50 dark:bg-gray-500/50 hover:bg-gray-500/60 dark:hover:bg-gray-400/60'
                                }
                              `}>
                                {/* 三条横线，模仿 iOS 的拖拽手柄 */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2px]">
                                  <div className={`w-[10px] h-[1.5px] rounded-full transition-all duration-200 ${
                                    isUpdating 
                                      ? 'bg-gray-400/60 dark:bg-gray-500/60' 
                                      : (draggedTask?.id === task.id || manualDrag.task?.id === task.id)
                                        ? 'bg-white/90' 
                                        : 'bg-white/80 dark:bg-gray-300/80'
                                  }`}></div>
                                  <div className={`w-[10px] h-[1.5px] rounded-full transition-all duration-200 ${
                                    isUpdating 
                                      ? 'bg-gray-400/60 dark:bg-gray-500/60' 
                                      : (draggedTask?.id === task.id || manualDrag.task?.id === task.id)
                                        ? 'bg-white/90' 
                                        : 'bg-white/80 dark:bg-gray-300/80'
                                  }`}></div>
                                  <div className={`w-[10px] h-[1.5px] rounded-full transition-all duration-200 ${
                                    isUpdating 
                                      ? 'bg-gray-400/60 dark:bg-gray-500/60' 
                                      : (draggedTask?.id === task.id || manualDrag.task?.id === task.id)
                                        ? 'bg-white/90' 
                                        : 'bg-white/80 dark:bg-gray-300/80'
                                  }`}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* 任务内容 */}
                          <div 
                            className={`flex-1 p-4 ${
                              isUpdating ? 'cursor-not-allowed opacity-60' :
                              'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                            onClick={() => !isUpdating && onTaskClick && onTaskClick(task)}
                          >
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1.5 line-clamp-2">{task.title}</h4>

                            {task.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2.5 line-clamp-2">{task.description}</p>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1.5">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${textColor} ${bgColor} ${borderColor} border backdrop-blur-sm`}>
                                  {task.priority || '无优先级'}
                                </span>

                                {task.dueDate && (
                                  <span className={`flex items-center text-xs ${
                                    dueStatus === 'overdue' ? 'text-red-500' : 
                                    dueStatus === 'soon' ? 'text-amber-500' : 
                                    'text-gray-500 dark:text-gray-400'
                                  }`}>
                                    <FiClock className="mr-0.5" size={10} />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>

                              {task.assignee && (
                                <Avatar name={task.assignee} size="xs" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div 
                    className={`flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500 transition-all duration-300 ease-out ${
                      dragOverColumn === column.id ? (
                        column.id === 'OVERDUE' ? 'text-red-500 dark:text-red-400 scale-102' : 'text-blue-500 dark:text-blue-400 scale-102'
                      ) : ''
                    }`}
                    data-drop-column={column.id}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    {dragOverColumn === column.id ? (
                      column.id === 'OVERDUE' ? (
                        <>
                          <div className="w-16 h-16 border-2 border-dashed border-red-400/60 rounded-3xl mb-4 flex items-center justify-center bg-gradient-to-br from-red-50/80 to-red-100/60 dark:from-red-950/40 dark:to-red-900/30 backdrop-blur-sm shadow-lg shadow-red-200/30 dark:shadow-red-900/20">
                            <span className="text-red-500 text-2xl">⚠️</span>
                          </div>
                          <p className="text-sm font-semibold text-red-600 dark:text-red-400">无法移动到此状态</p>
                          <p className="text-xs opacity-70 mt-1 text-center">逾期状态由系统自动管理</p>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 border-2 border-dashed border-blue-400/60 rounded-3xl mb-4 flex items-center justify-center bg-gradient-to-br from-blue-50/80 to-blue-100/60 dark:from-blue-950/40 dark:to-blue-900/30 backdrop-blur-sm shadow-lg shadow-blue-200/30 dark:shadow-blue-900/20 animate-pulse">
                            <div className="relative">
                              <span className="text-blue-500 text-2xl">⤓</span>
                              <div className="absolute -inset-2 bg-blue-400/20 rounded-full animate-ping"></div>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">在此放置任务</p>
                          <p className="text-xs opacity-70 mt-1 text-center">释放鼠标完成移动</p>
                        </>
                      )
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100/80 to-gray-200/60 dark:from-gray-800/60 dark:to-gray-900/80 flex items-center justify-center mb-3 shadow-sm">
                          <span className="text-gray-400 dark:text-gray-500 text-lg">📋</span>
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">暂无任务</p>
                      </>
                    )}
                  </div>
                )}
              </AnimatePresence>

              {/* 添加任务按钮 */}
              {column.id === 'WAITING' && onAddTask && (
                <button
                  className="w-full mt-3 py-3 flex items-center justify-center text-sm text-blue-600 dark:text-blue-400 font-medium border border-dashed border-blue-300/60 dark:border-blue-600/60 rounded-xl hover:bg-blue-50/60 dark:hover:bg-blue-950/30 active:bg-blue-100/60 dark:active:bg-blue-900/40 transition-all duration-200 ease-out hover:border-blue-400/80 dark:hover:border-blue-500/80 backdrop-blur-sm"
                  onClick={onAddTask}
                >
                  <span className="mr-2 text-blue-500 dark:text-blue-400">+</span>
                  添加新任务
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskBoardView;