import { useState, useEffect } from 'react';

/**
 * 防抖钩子
 *
 * 用于延迟处理频繁变化的值，如搜索输入框的值
 *
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 */
export function useDebounceHook<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 设置延迟器
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 在下一次 effect 运行前清除延迟器
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
