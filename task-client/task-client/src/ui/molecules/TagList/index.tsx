import React from 'react';

interface TagListProps {
  tags: string[];
  colors?: string[];
  className?: string;
}

/**
 * 标签列表组件
 * 根据传入的标签和颜色数组渲染标签
 */
const TagList: React.FC<TagListProps> = ({ tags, colors = [], className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, index) => {
        // 使用对应索引的颜色，如果没有则使用默认颜色
        const color = colors[index] || '#6B7280';
        
        // 根据图片样式，使用较低的透明度
        const rgbaBackground = hexToRgba(color, 0.1); // 非常轻微的背景颜色
        
        // 根据用户要求，使用黑色文字
        const textColor = '#000000';
        
        return (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: rgbaBackground,
              color: textColor,
              border: '1px solid rgba(0, 0, 0, 0.1)', // 添加黑色细边框
            }}
          >
            {/* 标签内容 - 简化设计 */}
            <span className="relative tracking-wide font-medium">{tag}</span>
          </span>
        );
      })}
    </div>
  );
};

/**
 * 将十六进制颜色转换为RGBA格式
 * @param hexColor 十六进制颜色值
 * @param alpha 透明度，0-1之间
 */
function hexToRgba(hexColor: string, alpha: number): string {
  // 移除#前缀
  const hex = hexColor.replace('#', '');
  
  // 将十六进制颜色转换为RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // 返回RGBA格式
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 获取更深的颜色版本
 * @param hexColor 原始颜色
 * @param factor 加深因子，0-1之间，越小越深
 */
function getDarkerColor(hexColor: string, factor: number): string {
  // 移除#前缀
  const hex = hexColor.replace('#', '');
  
  // 将十六进制颜色转换为RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // 加深颜色（将值乘以factor使其变暗）
  r = Math.floor(r * factor);
  g = Math.floor(g * factor);
  b = Math.floor(b * factor);
  
  // 确保值在0-255范围内
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  
  // 转回十六进制
  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
}

/**
 * 判断颜色是否为浅色
 * 如果是浅色，文字使用深色；如果是深色，文字使用浅色
 */
function isLightColor(hexColor: string): boolean {
  // 移除#前缀
  const hex = hexColor.replace('#', '');
  
  // 将十六进制颜色转换为RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // 计算亮度 (基于YIQ公式)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // 亮度大于128被认为是浅色
  return brightness > 128;
}

export default TagList;
