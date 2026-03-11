/**
 * 格式化工具函数
 * 提供日期、文件大小等格式化功能
 */

/**
 * 格式化日期
 * @param dateString 日期字符串
 * @param options 格式化选项
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  dateString: string,
  options: {
    showTime?: boolean;
    showYear?: boolean;
    showWeekday?: boolean;
    format?: 'short' | 'medium' | 'long';
  } = {}
): string {
  if (!dateString) return '无日期';

  try {
    const date = new Date(dateString);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '无效日期';
    }

    const {
      showTime = false,
      showYear = true,
      showWeekday = false,
      format = 'medium'
    } = options;

    // 日期格式化选项
    const dateFormatOptions: Intl.DateTimeFormatOptions = {
      year: showYear ? 'numeric' : undefined,
      month: format === 'short' ? '2-digit' : format === 'medium' ? 'short' : 'long',
      day: '2-digit',
      weekday: showWeekday ? (format === 'short' ? 'short' : 'long') : undefined,
      hour: showTime ? '2-digit' : undefined,
      minute: showTime ? '2-digit' : undefined,
      hour12: false
    };

    // 使用Intl.DateTimeFormat进行本地化格式化
    return new Intl.DateTimeFormat('zh-CN', dateFormatOptions).format(date);
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '格式化错误';
  }
}

/**
 * 格式化文件大小
 * @param bytes 文件大小（字节）
 * @param decimals 小数位数
 * @returns 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 字节';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['字节', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 格式化持续时间（毫秒转为可读时间）
 * @param milliseconds 持续时间（毫秒）
 * @returns 格式化后的持续时间字符串
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 0) return '无效时间';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天${hours % 24}小时`;
  } else if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`;
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`;
  } else {
    return `${seconds}秒`;
  }
}

/**
 * 格式化数字（添加千位分隔符）
 * @param num 数字
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('zh-CN').format(num);
}

/**
 * 格式化百分比
 * @param value 百分比值（0-1）
 * @param decimals 小数位数
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(value: number, decimals: number = 0): string {
  if (isNaN(value)) return '0%';
  
  const percentage = value * 100;
  return `${percentage.toFixed(decimals)}%`;
}
