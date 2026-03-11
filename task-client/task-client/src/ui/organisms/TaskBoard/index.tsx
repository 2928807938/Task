'use client';

import React from 'react';
import {Task, TaskPriority, TaskStatus} from '@/core/domain/entities/task';
import {FiCalendar, FiClock, FiFlag} from 'react-icons/fi';
import {DragDropContext, Draggable, Droppable, DropResult} from 'react-beautiful-dnd';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  onAddTask?: () => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  onStatusChange,
}) => {
  // 移除了筛选相关的状态，因为这些功能已经在TaskToolbar中实现

  // 获取优先级标签样式
  const getPriorityBadge = (priority: TaskPriority) => {
    const classes = {
      [TaskPriority.HIGH]: 'bg-red-50 text-red-700 border-red-200',
      [TaskPriority.MEDIUM]: 'bg-amber-50 text-amber-700 border-amber-200',
      [TaskPriority.LOW]: 'bg-green-50 text-green-700 border-green-200',
      [TaskPriority.CUSTOM]: 'bg-purple-50 text-purple-700 border-purple-200',
    };

    const labels = {
      [TaskPriority.HIGH]: '高',
      [TaskPriority.MEDIUM]: '中',
      [TaskPriority.LOW]: '低',
      [TaskPriority.CUSTOM]: '自定义',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center ${classes[priority]}`}>
        <FiFlag className="w-3 h-3 mr-1" />
        {labels[priority]}
      </span>
    );
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 获取看板列的标题和样式
  const getColumnConfig = (status: TaskStatus) => {
    const config = {
      [TaskStatus.WAITING]: {
        title: '待处理',
        icon: <FiClock className="mr-2" />,
        headerClass: 'bg-amber-50 border-amber-200',
        iconClass: 'text-amber-500',
      },
      [TaskStatus.IN_PROGRESS]: {
        title: '进行中',
        icon: <FiClock className="mr-2" />,
        headerClass: 'bg-blue-50 border-blue-200',
        iconClass: 'text-blue-500',
      },
      [TaskStatus.COMPLETED]: {
        title: '已完成',
        icon: <FiClock className="mr-2" />,
        headerClass: 'bg-green-50 border-green-200',
        iconClass: 'text-green-500',
      },
      [TaskStatus.OVERDUE]: {
        title: '已逾期',
        icon: <FiClock className="mr-2" />,
        headerClass: 'bg-red-50 border-red-200',
        iconClass: 'text-red-500',
      },
    };

    return config[status];
  };

  // 任务已经在TaskManagementTemplate中进行了筛选
  const filteredTasks = tasks;

  // 按状态分组任务
  const groupedTasks = {
    [TaskStatus.WAITING]: filteredTasks.filter(task => task.status === TaskStatus.WAITING),
    [TaskStatus.IN_PROGRESS]: filteredTasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
    [TaskStatus.COMPLETED]: filteredTasks.filter(task => task.status === TaskStatus.COMPLETED),
    [TaskStatus.OVERDUE]: filteredTasks.filter(task => task.status === TaskStatus.OVERDUE),
  };

  // 处理拖拽结束事件
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // 如果没有目标位置或者拖拽到相同位置，不做任何处理
    if (!destination ||
        (destination.droppableId === source.droppableId &&
         destination.index === source.index)) {
      return;
    }

    // 获取任务ID和新状态
    // 不用parseInt转换为数字，直接使用字符串ID
    const taskId = draggableId.split('-')[1];
    const newStatus = destination.droppableId as TaskStatus;

    // 调用状态变更回调
    if (onStatusChange) {
      onStatusChange(taskId, newStatus);
    }
  };

  // 渲染任务卡片
  const renderTaskCard = (task: Task, index: number) => {
    // 获取卡片颜色（根据任务类型）
    const getCardColor = () => {
      const colors = [
        'from-blue-500 to-blue-400',
        'from-pink-500 to-pink-400',
        'from-amber-500 to-amber-400',
        'from-emerald-500 to-emerald-400',
        'from-purple-500 to-purple-400',
        'from-indigo-500 to-indigo-400'
      ];
      // 使用字符串ID的哈希值来确定颜色，确保同一ID总是获得相同颜色
      const colorIndex = task.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
      return colors[colorIndex];
    };

    return (
      <Draggable
        draggableId={`task-${task.id}`}
        index={index}
        key={task.id}
      >
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="bg-white rounded-lg shadow-sm mb-3 overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => onTaskClick && onTaskClick(task.id)}
          >
            {/* 卡片顶部颜色条 */}
            <div className={`h-1 bg-gradient-to-r ${getCardColor()}`}></div>

            <div className="p-3">
              {/* 任务标题 */}
              <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">{task.title}</h3>

              {/* 任务描述 */}
              {task.description && (
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">{task.description}</p>
              )}

              {/* 任务元数据 */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  {getPriorityBadge(task.priority)}
                </div>

                {/* 截止日期 */}
                {task.dueDate && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <FiCalendar className="w-3 h-3 mr-1" />
                    {formatDate(task.dueDate)}
                  </div>
                )}
              </div>

              {/* 负责人 */}
              {task.assignee && (
                <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
                  {task.assignee.avatar ? (
                    <img
                      className="h-5 w-5 rounded-full mr-1.5 border border-white shadow-sm"
                      src={task.assignee.avatar}
                      alt={task.assignee.name}
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-1.5 text-white shadow-sm">
                      <span className="text-xs font-medium">
                        {task.assignee.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-gray-600">{task.assignee.name}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      {/* 删除了重复的工具栏和筛选面板，因为这些功能已经在TaskToolbar中实现 */}

      {/* 看板内容 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 min-h-[500px]">
          {/* 待处理列 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
            <div className={`p-3 ${getColumnConfig(TaskStatus.WAITING).headerClass} border-b flex items-center justify-between`}>
              <div className="flex items-center">
                <span className={`${getColumnConfig(TaskStatus.WAITING).iconClass}`}>
                  {getColumnConfig(TaskStatus.WAITING).icon}
                </span>
                <h3 className="font-medium text-gray-700">
                  {getColumnConfig(TaskStatus.WAITING).title}
                </h3>
              </div>
              <span className="bg-white text-xs font-medium px-2 py-1 rounded-full">
                {groupedTasks[TaskStatus.WAITING].length}
              </span>
            </div>

            <Droppable droppableId={TaskStatus.WAITING}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="p-3 flex-grow overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 300px)' }}
                >
                  {groupedTasks[TaskStatus.WAITING].map((task, index) =>
                    renderTaskCard(task, index)
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* 进行中列 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
            <div className={`p-3 ${getColumnConfig(TaskStatus.IN_PROGRESS).headerClass} border-b flex items-center justify-between`}>
              <div className="flex items-center">
                <span className={`${getColumnConfig(TaskStatus.IN_PROGRESS).iconClass}`}>
                  {getColumnConfig(TaskStatus.IN_PROGRESS).icon}
                </span>
                <h3 className="font-medium text-gray-700">
                  {getColumnConfig(TaskStatus.IN_PROGRESS).title}
                </h3>
              </div>
              <span className="bg-white text-xs font-medium px-2 py-1 rounded-full">
                {groupedTasks[TaskStatus.IN_PROGRESS].length}
              </span>
            </div>

            <Droppable droppableId={TaskStatus.IN_PROGRESS}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="p-3 flex-grow overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 300px)' }}
                >
                  {groupedTasks[TaskStatus.IN_PROGRESS].map((task, index) =>
                    renderTaskCard(task, index)
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* 已完成列 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
            <div className={`p-3 ${getColumnConfig(TaskStatus.COMPLETED).headerClass} border-b flex items-center justify-between`}>
              <div className="flex items-center">
                <span className={`${getColumnConfig(TaskStatus.COMPLETED).iconClass}`}>
                  {getColumnConfig(TaskStatus.COMPLETED).icon}
                </span>
                <h3 className="font-medium text-gray-700">
                  {getColumnConfig(TaskStatus.COMPLETED).title}
                </h3>
              </div>
              <span className="bg-white text-xs font-medium px-2 py-1 rounded-full">
                {groupedTasks[TaskStatus.COMPLETED].length}
              </span>
            </div>

            <Droppable droppableId={TaskStatus.COMPLETED}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="p-3 flex-grow overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 300px)' }}
                >
                  {groupedTasks[TaskStatus.COMPLETED].map((task, index) =>
                    renderTaskCard(task, index)
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* 已逾期列 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-full">
            <div className={`p-3 ${getColumnConfig(TaskStatus.OVERDUE).headerClass} border-b flex items-center justify-between`}>
              <div className="flex items-center">
                <span className={`${getColumnConfig(TaskStatus.OVERDUE).iconClass}`}>
                  {getColumnConfig(TaskStatus.OVERDUE).icon}
                </span>
                <h3 className="font-medium text-gray-700">
                  {getColumnConfig(TaskStatus.OVERDUE).title}
                </h3>
              </div>
              <span className="bg-white text-xs font-medium px-2 py-1 rounded-full">
                {groupedTasks[TaskStatus.OVERDUE].length}
              </span>
            </div>

            <Droppable droppableId={TaskStatus.OVERDUE}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="p-3 flex-grow overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 300px)' }}
                >
                  {groupedTasks[TaskStatus.OVERDUE].map((task, index) =>
                    renderTaskCard(task, index)
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>

      {/* 底部信息 */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
        <div>显示 {filteredTasks.length} 个任务（共 {tasks.length} 个）</div>
        <div className="text-xs text-gray-400">提示：拖拽任务卡片可以更改任务状态</div>
      </div>
    </div>
  );
};

export default TaskBoard;
