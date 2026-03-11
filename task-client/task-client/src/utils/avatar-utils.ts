/**
 * 项目和用户头像相关工具函数
 */

/**
 * 生成用于显示的首字母缩写
 * @param name 名称
 * @returns 首字母缩写（最多2个字符）
 */
export const getInitials = (name: string): string => {
  // 确保name是有效的字符串
  if (!name || typeof name !== 'string') return 'U';
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';
};

/**
 * 根据名称生成一致的背景颜色类名
 * @param name 名称
 * @returns Tailwind 背景色类名
 */
export const getBgColorClass = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  
  // 使用名称的哈希值来确定颜色，确保同一个名字总是得到相同的颜色
  const safeName = name || 'Default';
  const hash = safeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};
