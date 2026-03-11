"use client";

import React, {useEffect, useState} from 'react';
import {FiAlertCircle, FiCalendar, FiClock, FiFlag, FiInfo} from 'react-icons/fi';
import DatePicker from '../../../../molecules/DatePicker';

interface TimeAndPriorityStepProps {
  totalHours: number;
  setTotalHours: (value: number) => void;
  priorityScore: number;
  setPriorityScore: (value: number) => void;
  dueDate?: string;
  setDueDate?: (value: string) => void;
  errors?: {
    dueDate?: string;
  };
}

const TimeAndPriorityStep: React.FC<TimeAndPriorityStepProps> = ({
  totalHours,
  setTotalHours,
  priorityScore,
  setPriorityScore,
  dueDate,
  setDueDate,
  errors
}) => {
  // 计算推荐截止日期
  const [recommendedDueDate, setRecommendedDueDate] = useState<Date | null>(null);
  const [dateWarning, setDateWarning] = useState<string>('');

  // 中国法定节假日数据（每年需要更新）
  // 按实际情况可以从API获取或在项目中维护
  const HOLIDAYS_2025 = [
    // 元旦
    '2025-01-01',
    // 春节
    '2025-02-08', '2025-02-09', '2025-02-10', '2025-02-11', '2025-02-12', '2025-02-13', '2025-02-14',
    // 清明节
    '2025-04-04', '2025-04-05', '2025-04-06',
    // 劳动节
    '2025-05-01', '2025-05-02', '2025-05-03', '2025-05-04', '2025-05-05',
    // 端午节
    '2025-06-01', '2025-06-02', '2025-06-03',
    // 中秋节
    '2025-09-28', '2025-09-29', '2025-09-30',
    // 国庆节
    '2025-10-01', '2025-10-02', '2025-10-03', '2025-10-04', '2025-10-05', '2025-10-06', '2025-10-07',
  ];

  // 计算工作日期天数
  const calculateWorkingDays = (startDate: Date, daysNeeded: number): Date => {
    let workingDays = 0;
    let currentDate = new Date(startDate);
    let totalDays = 0;

    // 格式化日期为YYYY-MM-DD格式，用于检查是否是假期
    const formatDate = (date: Date): string => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    // 检查是否是周末
    const isWeekend = (date: Date): boolean => {
      const day = date.getDay();
      return day === 0 || day === 6; // 0是周日，6是周六
    };

    // 检查是否是法定假日
    const isHoliday = (date: Date): boolean => {
      return HOLIDAYS_2025.includes(formatDate(date));
    };

    // 添加天数直到达到所需的工作日数量
    while (workingDays < daysNeeded) {
      currentDate.setDate(currentDate.getDate() + 1);
      totalDays++;

      // 如果不是周末也不是假期，则计为一个工作日
      if (!isWeekend(currentDate) && !isHoliday(currentDate)) {
        workingDays++;
      }

      // 安全检查，防止无限循环
      if (totalDays > 365) {
        break;
      }
    }

    return currentDate;
  };

  // 根据工时计算合理的截止日期
  useEffect(() => {
    if (totalHours > 0) {
      // 每天工作8小时
      const today = new Date();
      const workDays = Math.ceil(totalHours / 8); // 计算工作天数

      // 加上一些缓冲时间（工作天数的20%，最少1天）
      const bufferDays = Math.max(1, Math.ceil(workDays * 0.2));
      const totalWorkDays = workDays + bufferDays;

      // 计算考虑周末和假期的推荐日期
      const recommendedDate = calculateWorkingDays(today, totalWorkDays);
      // 设置建议时间为下午6点（工作日结束时间）
      recommendedDate.setHours(18, 0, 0, 0);

      setRecommendedDueDate(recommendedDate);

      // 如果已有截止日期，检查是否合理（这里主要是为了兼容性，因为我们现在不允许选择小于建议日期的日期）
      if (dueDate) {
        const selectedDate = new Date(dueDate);

        // 如果已经有建议日期，并且当前选择的日期小于建议日期，则自动将选择更新为建议日期
        if (recommendedDate && selectedDate < recommendedDate && setDueDate) {
          // 保留完整的日期时间信息，不仅仅是日期
          const year = recommendedDate.getFullYear();
          const month = String(recommendedDate.getMonth() + 1).padStart(2, '0');
          const day = String(recommendedDate.getDate()).padStart(2, '0');
          const hours = String(recommendedDate.getHours()).padStart(2, '0');
          const minutes = String(recommendedDate.getMinutes()).padStart(2, '0');
          const seconds = String(recommendedDate.getSeconds()).padStart(2, '0');
          setDueDate(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
        }

        setDateWarning('');
      }
    } else {
      setRecommendedDueDate(null);
      setDateWarning('');
    }
  }, [totalHours, dueDate]);
  return (
    <div className="space-y-7">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 tracking-wide">时间与优先级</h3>

      {/* 预计工时 */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
          <FiClock className="mr-1.5 text-blue-500" size={15} />
          预计工时
        </label>
        <div className="relative">
          <div className="flex items-center w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 shadow-sm">
            <span className="font-medium text-base">{totalHours || 0}</span>
            <span className="ml-1 text-gray-500 dark:text-gray-400">小时</span>
          </div>
        </div>
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 ml-1">
          预计完成此任务所需的工作时间（不可修改）
        </p>
      </div>

      {/* 截止日期 -  */}
      {setDueDate && (
        <div className="mt-1">
          <div className="flex justify-between items-center mb-2.5">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <FiCalendar className="mr-1.5 text-green-500" size={15} />
              截止时间
              <span className="text-red-500 ml-1">*</span>
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              选择任务的完成截止时间
            </span>
          </div>
          <div className="relative shadow-sm hover:shadow transition-shadow duration-200">
            <DatePicker
              selectedDate={dueDate ? new Date(dueDate) : null}
              position="top"
              showTimePicker={true} // 启用时间选择功能
              is24Hour={true} // 使用24小时制
              onChange={(date) => {
                if (date) {
                  // 保存完整的日期时间，包含时间部分
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const hours = String(date.getHours()).padStart(2, '0');
                  const minutes = String(date.getMinutes()).padStart(2, '0');
                  const seconds = String(date.getSeconds()).padStart(2, '0');

                  // 使用ISO格式保存日期时间，但不包含时区信息
                  // 时区信息将在formatDateWithOffset函数中添加
                  setDueDate(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
                } else {
                  setDueDate('');
                }
              }}
              minDate={recommendedDueDate || new Date()}
              suggestedDate={recommendedDueDate}
              disableSuggestedDateWarning={true}
            />
          </div>

          {recommendedDueDate && (
            <div className="mt-2 flex items-start px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <div className="flex-shrink-0 text-blue-500 mr-2 mt-0.5">
                <FiInfo size={14} />
              </div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  建议完成日期: {recommendedDueDate.toLocaleDateString('zh-CN', {year: 'numeric', month: 'long', day: 'numeric'})}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  （已考虑每天8小时工作制、周末和法定假期）
                </p>
              </div>
            </div>
          )}

          {recommendedDueDate && (
            <div className="mt-2 flex items-start">
              <FiAlertCircle className="flex-shrink-0 text-green-500 mr-1.5 mt-0.5" size={14} />
              <p className="text-xs text-green-600 dark:text-green-400">
                已设置开始日期为建议日期，早于此日期的日期将不可选择
              </p>
            </div>
          )}

          {errors?.dueDate && (
            <div className="mt-2 flex items-center px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/30">
              <FiAlertCircle className="flex-shrink-0 text-red-500 mr-2" size={14} />
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {errors.dueDate}
              </p>
            </div>
          )}
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 ml-1">
            任务必须完成的最后期限，支持选择具体的日期和时间
          </p>
        </div>
      )}

      {/* 优先级分数 */}
      <div className="mt-1">
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2.5">
          <FiFlag className="mr-1.5 text-orange-500" size={15} />
          优先级
        </label>
        <div className="mt-2 mb-5 px-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 shadow-sm">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2 px-3 font-medium">
            <span>低优先级</span>
            <span>中优先级</span>
            <span>高优先级</span>
          </div>
          <div className="flex items-center space-x-3 px-3">
            <input
              type="range"
              min="0"
              max="100"
              value={priorityScore}
              onChange={(e) => setPriorityScore(parseInt(e.target.value, 10))}
              className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all duration-150"
              style={{
                backgroundImage: `linear-gradient(to right, 
                  #22c55e 0%, 
                  #22c55e ${priorityScore < 33 ? priorityScore : 33}%, 
                  #f59e0b ${priorityScore < 33 ? 33 : priorityScore < 66 ? priorityScore : 66}%, 
                  #ef4444 ${priorityScore < 66 ? 66 : priorityScore}%, 
                  #ef4444 100%)`,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            />
            <span className="w-10 text-center font-medium text-sm bg-gray-100 dark:bg-gray-700 rounded-md py-1 text-gray-700 dark:text-gray-300">
              {priorityScore}
            </span>
          </div>
        </div>
        <div className="flex items-center p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-4 h-4 rounded-full mr-3" style={{
            backgroundColor: priorityScore >= 70 ? '#ef4444' : priorityScore >= 40 ? '#f59e0b' : '#22c55e'
          }}></div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {priorityScore >= 70 ? '高优先级' : priorityScore >= 40 ? '中优先级' : '低优先级'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {priorityScore >= 70
                ? '需要立即解决的重要任务'
                : priorityScore >= 40
                  ? '正常优先级的标准任务'
                  : '可以稍后处理的低紧急度任务'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeAndPriorityStep;
