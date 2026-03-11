'use client';

import React, {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [delayHandler, setDelayHandler] = useState<NodeJS.Timeout | null>(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 mb-1',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-1 mt-1',
    left: 'right-full top-1/2 transform -translate-x-1 -translate-y-1/2 mr-1',
    right: 'left-full top-1/2 transform translate-x-1 -translate-y-1/2 ml-1',
  };

  const handleMouseEnter = () => {
    const handler = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setDelayHandler(handler);
  };

  const handleMouseLeave = () => {
    if (delayHandler) {
      clearTimeout(delayHandler);
      setDelayHandler(null);
    }
    setIsVisible(false);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionClasses[position]}`}
          >
            <div className="bg-gray-800 text-white text-xs whitespace-nowrap rounded px-2 py-1 shadow-lg">
              {content}
              <div
                className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 ${
                  position === 'top' ? 'top-full -translate-y-1/2 left-1/2 -translate-x-1/2' :
                  position === 'bottom' ? 'bottom-full translate-y-1/2 left-1/2 -translate-x-1/2' :
                  position === 'left' ? 'left-full -translate-x-1/2 top-1/2 -translate-y-1/2' :
                  'right-full translate-x-1/2 top-1/2 -translate-y-1/2'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
