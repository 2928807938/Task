'use client';

import React from 'react';
import {motion} from 'framer-motion';
import {FiChevronLeft, FiChevronRight} from 'react-icons/fi';

interface CalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  monthNames: string[];
  isDragging: boolean;
  dragDistance: number;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonth,
  currentYear,
  monthNames,
  isDragging,
  dragDistance,
  goToPreviousMonth,
  goToNextMonth,
  goToToday
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={goToPreviousMonth}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 active:scale-95 transition-transform"
          aria-label="上个月"
        >
          <FiChevronLeft size={18} />
        </button>
        <motion.h2
          className="text-lg font-medium text-gray-800 dark:text-gray-200"
          animate={{ x: isDragging ? dragDistance * 0.2 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {monthNames[currentMonth]} {currentYear}
        </motion.h2>
        <button
          onClick={goToNextMonth}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 active:scale-95 transition-transform"
          aria-label="下个月"
        >
          <FiChevronRight size={18} />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={goToToday}
          className="text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full active:scale-95 transition-transform shadow-sm"
        >
          今天
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
