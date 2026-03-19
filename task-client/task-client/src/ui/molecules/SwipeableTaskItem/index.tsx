import React, {useRef} from 'react';
import {motion, PanInfo, useAnimation, useMotionValue} from 'framer-motion';
import {FiCheck, FiTrash2} from 'react-icons/fi';

interface SwipeableTaskItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftActionColor?: string;
  rightActionColor?: string;
  leftActionIcon?: React.ReactNode;
  rightActionIcon?: React.ReactNode;
  leftActionText?: string;
  rightActionText?: string;
  swipeThreshold?: number;
  isCompleted?: boolean;
  className?: string;
}

const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftActionColor = '#ef4444',
  rightActionColor = '#10b981',
  leftActionIcon = <FiTrash2 size={20} />,
  rightActionIcon = <FiCheck size={20} />,
  leftActionText = '删除',
  rightActionText = '完成',
  swipeThreshold = 80,
  isCompleted = false,
  className
}) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -swipeThreshold || velocity < -500) {
      if (onSwipeLeft) {
        await controls.start({ x: -200, transition: { type: 'spring', damping: 20 } });
        onSwipeLeft();
      } else {
        controls.start({ x: 0, transition: { type: 'spring', damping: 20 } });
      }
    } else if (offset > swipeThreshold || velocity > 500) {
      if (onSwipeRight) {
        await controls.start({ x: 200, transition: { type: 'spring', damping: 20 } });
        onSwipeRight();
      } else {
        controls.start({ x: 0, transition: { type: 'spring', damping: 20 } });
      }
    } else {
      controls.start({ x: 0, transition: { type: 'spring', damping: 20 } });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[18px]" ref={containerRef}>
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-y-0 right-0 flex w-28 items-center justify-center px-4 text-sm font-medium"
          style={{
            backgroundColor: `${leftActionColor}15`,
            color: leftActionColor
          }}
        >
          <div className="flex items-center">
            {leftActionIcon}
            <span className="ml-2 font-medium">{leftActionText}</span>
          </div>
        </div>

        <div
          className="absolute inset-y-0 left-0 flex w-28 items-center justify-center px-4 text-sm font-medium"
          style={{
            backgroundColor: `${rightActionColor}15`,
            color: rightActionColor
          }}
        >
          <div className="flex items-center">
            <span className="mr-2 font-medium">{rightActionText}</span>
            {rightActionIcon}
          </div>
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, touchAction: 'pan-y' }}
        className={`relative z-10 transition-colors ${className || (isCompleted ? 'bg-green-50/30 dark:bg-green-900/5' : 'bg-white dark:bg-gray-900')}`}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeableTaskItem;
