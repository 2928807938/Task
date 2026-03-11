import React, {useRef} from 'react';
import {motion, PanInfo, useAnimation, useMotionValue} from 'framer-motion';
import {FiCheck, FiTrash2} from 'react-icons/fi';

interface SwipeableTaskItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void; // 向左滑动操作（如删除）
  onSwipeRight?: () => void; // 向右滑动操作（如完成）
  leftActionColor?: string;
  rightActionColor?: string;
  leftActionIcon?: React.ReactNode;
  rightActionIcon?: React.ReactNode;
  leftActionText?: string;
  rightActionText?: string;
  swipeThreshold?: number; // 触发动作的滑动阈值
  isCompleted?: boolean; // 任务是否已完成
}

/**
 * 可横向滑动的任务项组件，遵循苹果设计风格
 * 向右滑动触发完成操作，向左滑动触发删除操作
 */
const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftActionColor = '#ef4444', // 红色（删除）
  rightActionColor = '#10b981', // 绿色（完成）
  leftActionIcon = <FiTrash2 size={20} />,
  rightActionIcon = <FiCheck size={20} />,
  leftActionText = '删除',
  rightActionText = '完成',
  swipeThreshold = 80,
  isCompleted = false
}) => {
  // 创建motion值跟踪X轴位置
  const x = useMotionValue(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理拖拽结束
  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // 向左滑动（可能是删除操作）
    if (offset < -swipeThreshold || velocity < -500) {
      if (onSwipeLeft) {
        // 先执行动画
        await controls.start({ x: -200, transition: { type: 'spring', damping: 20 } });
        onSwipeLeft();
      } else {
        controls.start({ x: 0, transition: { type: 'spring', damping: 20 } });
      }
    }
    // 向右滑动（可能是完成操作）
    else if (offset > swipeThreshold || velocity > 500) {
      if (onSwipeRight) {
        // 先执行动画
        await controls.start({ x: 200, transition: { type: 'spring', damping: 20 } });
        onSwipeRight();
      } else {
        controls.start({ x: 0, transition: { type: 'spring', damping: 20 } });
      }
    }
    // 没有达到阈值，恢复原位
    else {
      controls.start({ x: 0, transition: { type: 'spring', damping: 20 } });
    }
  };

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* 背景操作区域 */}
      <div className="absolute inset-0 flex justify-between items-stretch">
        {/* 左侧操作区域（主要是删除） */}
        <div
          className="flex items-center justify-center px-4"
          style={{
            backgroundColor: `${leftActionColor}15`,
            color: leftActionColor,
            width: '30%',
            marginLeft: 'auto'
          }}
        >
          <div className="flex items-center">
            {leftActionIcon}
            <span className="ml-2 font-medium">{leftActionText}</span>
          </div>
        </div>

        {/* 右侧操作区域（主要是完成） */}
        <div
          className="flex items-center justify-center px-4"
          style={{
            backgroundColor: `${rightActionColor}15`,
            color: rightActionColor,
            width: '30%',
            marginRight: 'auto'
          }}
        >
          <div className="flex items-center">
            <span className="mr-2 font-medium">{rightActionText}</span>
            {rightActionIcon}
          </div>
        </div>
      </div>

      {/* 可拖动的任务内容 */}
      <motion.div
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0.1} // 轻微的弹性，符合苹果设计风格
        dragMomentum={false} // 禁用动量，以便更好地控制
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, touchAction: 'pan-y' }} // 允许页面垂直滚动
        className={`relative z-10 bg-white dark:bg-gray-900 transition-colors ${isCompleted ? 'bg-green-50/30 dark:bg-green-900/5' : ''}`}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeableTaskItem;
