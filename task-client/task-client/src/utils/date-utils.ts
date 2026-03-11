/**
 * 日期格式化工具函数
 */

/**
 * 格式化日期为本地字符串
 * @param dateString ISO日期字符串或Date对象
 * @returns 格式化后的日期字符串 (YYYY-MM-DD)
 */
export function formatDate(dateString: string | Date): string;

/**
 * 格式化日期为指定格式的字符串
 * @param dateString ISO日期字符串或Date对象
 * @param format 格式字符串，如 'yyyy年MM月dd日'
 * @returns 按指定格式格式化后的日期字符串
 */
export function formatDate(dateString: string | Date, format?: string): string {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '';
  }
  
  // 如果提供了格式字符串，使用自定义格式
  if (format) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    return format
      .replace('yyyy', year.toString())
      .replace('MM', month.toString().padStart(2, '0'))
      .replace('dd', day.toString().padStart(2, '0'))
      .replace('HH', hours.toString().padStart(2, '0'))
      .replace('mm', minutes.toString().padStart(2, '0'))
      .replace('ss', seconds.toString().padStart(2, '0'));
  }
  
  // 默认格式
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
}

/**
 * 格式化日期时间为本地字符串
 * @param dateString ISO日期字符串或Date对象
 * @returns 格式化后的日期时间字符串 (YYYY-MM-DD HH:MM)
 */
export function formatDateTime(dateString: string | Date): string {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const dateStr = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');
  
  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  return `${dateStr} ${timeStr}`;
}

/**
 * 计算相对时间（如：3天前，刚刚等）
 * @param dateString ISO日期字符串或Date对象
 * @returns 相对时间字符串
 */
export function getRelativeTime(dateString: string | Date): string {
  if (!dateString) return '';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return '刚刚';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}天前`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}个月前`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}年前`;
}
