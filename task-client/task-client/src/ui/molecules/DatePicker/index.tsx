"use client";

import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiCalendar, FiChevronLeft, FiChevronRight, FiX} from 'react-icons/fi';

interface DatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  disabled?: boolean;
  suggestedDate?: Date | null; // 添加建议日期属性
  disableSuggestedDateWarning?: boolean; // 是否禁用建议日期的警告
  position?: 'top' | 'bottom'; // 弹出位置：上方或下方
  showTimePicker?: boolean; // 是否显示时间选择器
  is24Hour?: boolean; // 是否使用24小时制
}

// 一周的日期
const DAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

/**
 * 日期选择器组件
 */
const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onChange,
  minDate,
  maxDate,
  className = '',
  disabled = false,
  suggestedDate = null,
  disableSuggestedDateWarning = false,
  position = 'bottom', // 默认弹出位置在下方
  showTimePicker = true, // 默认显示时间选择器
  is24Hour = false // 默认使用12小时制
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [displayDate, setDisplayDate] = useState<Date>(selectedDate || new Date());
  // 获取默认小时，不限制工作时间
  const getDefaultHour = () => {
    return selectedDate ? selectedDate.getHours() : new Date().getHours();
  };
  const [selectedHour, setSelectedHour] = useState<number>(getDefaultHour());
  const [selectedMinute, setSelectedMinute] = useState<number>(selectedDate ? selectedDate.getMinutes() : 0);
  
  // 当suggestedDate改变时，更新默认时间
  useEffect(() => {
    if (suggestedDate && !selectedDate) {
      setSelectedHour(suggestedDate.getHours());
      setSelectedMinute(suggestedDate.getMinutes());
    }
  }, [suggestedDate, selectedDate]);
  const [isAM, setIsAM] = useState<boolean>(selectedDate ? selectedDate.getHours() < 12 : true);
  const [activeTab, setActiveTab] = useState<'date' | 'time'>('date');
  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭日历
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 获取当前月份的日期
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // 获取当前月份的第一天是星期几
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // 生成日历网格
  const generateCalendarDays = () => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    // 上个月的最后几天
    const daysInPrevMonth = month === 0
      ? getDaysInMonth(year - 1, 11)
      : getDaysInMonth(year, month - 1);

    const days = [];

    // 填充上个月的日期
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevMonthDay = daysInPrevMonth - i;
      const date = new Date(
        month === 0 ? year - 1 : year,
        month === 0 ? 11 : month - 1,
        prevMonthDay
      );
      days.push({
        date,
        day: prevMonthDay,
        isCurrentMonth: false,
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0)),
        isDisabled: isDateDisabled(date)
      });
    }

    // 当前月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        day: i,
        isCurrentMonth: true,
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0)),
        isDisabled: isDateDisabled(date)
      });
    }

    // 填充下个月的日期
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    const nextMonthDays = totalCells - days.length;

    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(
        month === 11 ? year + 1 : year,
        month === 11 ? 0 : month + 1,
        i
      );
      days.push({
        date,
        day: i,
        isCurrentMonth: false,
        isPast: date < new Date(new Date().setHours(0, 0, 0, 0)),
        isDisabled: isDateDisabled(date)
      });
    }

    return days;
  };

  // 检查日期是否被禁用
  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) {
      return true;
    }
    if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999))) {
      return true;
    }
    return false;
  };

  // 格式化日期显示
  const formatDate = (date: Date | null): string => {
    if (!date) return '年/月/日';

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (!showTimePicker) {
      return `${year}年${month}月${day}日`;
    }

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    if (is24Hour) {
      const formattedHours = hours < 10 ? `0${hours}` : hours;
      return `${year}年${month}月${day}日 ${formattedHours}:${formattedMinutes}`;
    } else {
      const hour12 = hours % 12 === 0 ? 12 : hours % 12;
      const formattedHour = hour12 < 10 ? `0${hour12}` : hour12;
      return `${year}年${month}月${day}日 ${formattedHour}:${formattedMinutes}`;
    }
  };

  // 前一个月
  const prevMonth = () => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  // 后一个月
  const nextMonth = () => {
    setDisplayDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // 选择日期
  const handleSelectDate = (date: Date, isDisabled: boolean) => {
    if (isDisabled) return;

    // 如枟启用了时间选择器，选择日期后直接切换到时间选择页面
    if (showTimePicker) {
      const newDate = new Date(date);
      
      // 检查是否是建议日期
      const isClickingSuggestedDate = isSuggested(date);
      
      if (isClickingSuggestedDate && suggestedDate) {
        // 如果点击的是建议日期，使用建议日期的时间
        newDate.setHours(suggestedDate.getHours());
        newDate.setMinutes(suggestedDate.getMinutes());
        newDate.setSeconds(suggestedDate.getSeconds());
        // 更新时间选择器的状态
        setSelectedHour(suggestedDate.getHours());
        setSelectedMinute(suggestedDate.getMinutes());
      } else if (selectedDate) {
        // 如果不是建议日期，保留原有的时间部分
        newDate.setHours(selectedHour);
        newDate.setMinutes(selectedMinute);
      } else {
        // 如果没有选中的日期，使用当前时间选择器的值
        newDate.setHours(selectedHour);
        newDate.setMinutes(selectedMinute);
      }
      
      setDisplayDate(newDate);

      // 选择日期后直接切换到时间页面
      setActiveTab('time');
    } else {
      // 如果没有启用时间选择器，直接选择日期并关闭
      onChange(date);
      setIsOpen(false);
    }
  };

  // 清除日期
  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    // 重置时间选择
    setSelectedHour(new Date().getHours());
    setSelectedMinute(0);
    setIsAM(new Date().getHours() < 12);
  };

  // 检查是否是今天
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 检查是否是选中的日期
  const isSelected = (date: Date): boolean => {
    return selectedDate !== null &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear();
  };

  // 检查是否是建议的日期
  const isSuggested = (date: Date): boolean => {
    return suggestedDate !== null &&
      date.getDate() === suggestedDate.getDate() &&
      date.getMonth() === suggestedDate.getMonth() &&
      date.getFullYear() === suggestedDate.getFullYear();
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={inputRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center w-full px-4 py-3 h-[50px] rounded-xl border transition-all duration-200
          ${disabled ? 
            'bg-gray-50 cursor-not-allowed border-gray-200 dark:bg-gray-800/50 dark:border-gray-700' : 
            'bg-white cursor-pointer hover:border-blue-400 border-gray-200 dark:bg-gray-800/80 dark:border-gray-700 hover:shadow-sm'
          }
          ${isOpen ? 'ring-2 ring-blue-300/60 border-blue-500 dark:ring-blue-500/30 dark:border-blue-500 shadow-sm' : ''}
        `}
      >
        <div className="text-green-500 mr-2.5">
          {/* 使用单一图标替代两个图标 */}
          <FiCalendar size={16} />
        </div>

        <div className={`flex-grow ${selectedDate ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'} font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis`}>
          {selectedDate ? formatDate(selectedDate) : '选择截止时间'}
        </div>

        {selectedDate && !disabled && (
          <button
            type="button"
            onClick={clearDate}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 -mr-1"
            aria-label="清除日期"
          >
            <FiX className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" size={15} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={calendarRef}
            className="absolute z-[100] w-full bg-white dark:bg-gray-800/95 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/80 apple-blur"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              ...(position === 'top'
                ? { bottom: 'calc(100% + 8px)', top: 'auto' }
                : { top: 'calc(100% + 8px)', bottom: 'auto' })
            }}
          >
            {/* 标签页切换 */}
            {showTimePicker && (
              <div className="flex border-b border-gray-100 dark:border-gray-700/60">
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'date' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                  onClick={() => setActiveTab('date')}
                >
                  日期
                </button>
                <button
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'time' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
                  onClick={() => setActiveTab('time')}
                >
                  时间
                </button>
              </div>
            )}

            {/* 日历视图 */}
            {(!showTimePicker || activeTab === 'date') && (
            <div>
              {/* 日历头部 */}
              <div className="px-4 py-3.5 flex justify-between items-center border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/80 dark:bg-gray-800/80">
              <div className="flex items-center">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 tracking-wide">
                  {displayDate.getFullYear()}年{MONTHS[displayDate.getMonth()]}
                </h3>
                <div className="flex ml-4">
                  <button
                    type="button"
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none"
                    onClick={prevMonth}
                  >
                    <FiChevronLeft className="text-gray-500 dark:text-gray-400" size={18} />
                  </button>
                  <button
                    type="button"
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none ml-1"
                    onClick={nextMonth}
                  >
                    <FiChevronRight className="text-gray-500 dark:text-gray-400" size={18} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-150 focus:outline-none font-medium"
                onClick={() => {
                  const today = new Date();
                  setDisplayDate(today);
                  if (!isDateDisabled(today)) {
                    onChange(today);
                    setIsOpen(false);
                  }
                }}
              >
                今天
              </button>
            </div>

            {/* 星期标题行 */}
            <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
              {DAYS.map((day, index) => (
                <div
                  key={index}
                  className={`text-center py-2 text-xs font-medium ${
                    index === 0 || index === 6 ? 'text-red-400' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 日历天数 */}
            <div className="grid grid-cols-7 p-2 gap-0.5">
              {generateCalendarDays().map(({ date, day, isCurrentMonth, isDisabled }, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={isDisabled}
                  className={`
                    relative h-9 w-9 flex items-center justify-center text-sm rounded-full mx-auto
                    transition-all duration-200 focus:outline-none
                    ${isCurrentMonth ? 'font-normal' : 'text-gray-400 dark:text-gray-600 font-light'}
                    ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700/80 hover:scale-105'}
                    ${isSelected(date) ? 'bg-blue-500 text-white hover:bg-blue-600 dark:hover:bg-blue-600 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30' : ''}
                    ${!isSelected(date) && isSuggested(date) ? 'border border-blue-400 dark:border-blue-500/80 bg-blue-50 dark:bg-blue-900/20' : ''}
                    ${!isSelected(date) && isToday(date) ? 'text-blue-500 font-medium' : ''}
                  `}
                  onClick={() => handleSelectDate(date, isDisabled)}
                >
                  {day}

                  {/* 今天的指示器 */}
                  {!isSelected(date) && isToday(date) && (
                    <div className="absolute bottom-1.5 w-1 h-1 bg-blue-500 rounded-full"></div>
                  )}

                  {/* 建议日期的指示器 */}
                  {!isSelected(date) && isSuggested(date) && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-400 dark:bg-blue-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* 删除日期选择器中的确定按钮，选择日期后直接进入时间选择 */}
          </div>
          )}

            {/* 时间选择器视图 */}
            {showTimePicker && activeTab === 'time' && (
              <div className="p-4">
                <div className="mb-4 text-center font-medium text-sm text-gray-700 dark:text-gray-300">
                  选择时间
                </div>

                <div className="flex justify-center items-center space-x-2">
                  {/* 小时选择器 */}
                  <div className="relative w-20">
                    <select
                      value={is24Hour ? selectedHour : selectedHour % 12 === 0 ? 12 : selectedHour % 12}
                      onChange={(e) => {
                        let hour = parseInt(e.target.value);
                        if (!is24Hour) {
                          // 转换为24小时制
                          if (isAM) {
                            hour = hour === 12 ? 0 : hour; // 上午1点到11点不变，12点变成0点
                          } else {
                            hour = hour === 12 ? 12 : hour + 12; // 下午1点到11点加12，12点不变
                          }
                        }
                        setSelectedHour(hour);
                      }}
                      className="w-full py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none"
                    >
                      {is24Hour ? (
                        // 24小时制选项，0-23小时全天可选
                        Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i < 10 ? `0${i}` : i}
                          </option>
                        ))
                      ) : (
                        // 12小时制选项，1-12小时可选
                        Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <FiChevronDown className="text-gray-400" size={16} />
                    </div>
                  </div>

                  <span className="text-lg font-medium text-gray-500 dark:text-gray-400">:</span>

                  {/* 分钟选择器 */}
                  <div className="relative w-20">
                    <select
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(parseInt(e.target.value))}
                      className="w-full py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none"
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i}>
                          {i < 10 ? `0${i}` : i}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <FiChevronDown className="text-gray-400" size={16} />
                    </div>
                  </div>

                  {/* 上午/下午选择 (仅12小时制) */}
                  {!is24Hour && (
                    <div className="relative w-20">
                      <select
                        value={isAM ? 'AM' : 'PM'}
                        onChange={(e) => setIsAM(e.target.value === 'AM')}
                        className="w-full py-2 px-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none"
                      >
                        <option value="AM">上午</option>
                        <option value="PM">下午</option>
                      </select>
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <FiChevronDown className="text-gray-400" size={16} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 底部操作栏 */}
            <div className="border-t border-gray-100 dark:border-gray-700/60 px-4 py-3 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80">
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors duration-150 focus:outline-none"
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
              >
                清除
              </button>

              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-150 focus:outline-none shadow-sm hover:shadow"
                onClick={() => {
                  if (showTimePicker) {
                    // 创建最终的日期时间
                    const finalDate = new Date(displayDate);
                    let hour = selectedHour;

                    // 处理12小时制转换
                    if (!is24Hour) {
                      // 使用已经转换过的selectedHour，不需要再次转换
                      hour = selectedHour;
                    }

                    finalDate.setHours(hour);
                    finalDate.setMinutes(selectedMinute);
                    finalDate.setSeconds(0);
                    finalDate.setMilliseconds(0);

                    onChange(finalDate);
                  }
                  setIsOpen(false);
                }}
              >
                确定
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 添加丢失的FiChevronDown组件
const FiChevronDown = ({ className, size }: { className?: string, size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default DatePicker;
