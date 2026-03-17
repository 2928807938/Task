'use client';

import React, {useEffect, useRef, useState} from 'react';
import {FiCheck, FiChevronDown} from 'react-icons/fi';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  presetColors = [
    '#FF3B30', // 红色
    '#FF9500', // 橙色
    '#FFCC00', // 黄色
    '#34C759', // 绿色
    '#5AC8FA', // 浅蓝
    '#007AFF', // 蓝色
    '#5856D6', // 紫色
    '#AF52DE', // 粉紫
    '#FF2D55', // 粉红
    '#8E8E93', // 灰色
  ],
  label,
  size = 'md'
}) => {
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [rgbValues, setRgbValues] = useState<{r: number, g: number, b: number}>({
    r: 0, g: 0, b: 0
  });
  const colorPickerRef = useRef<HTMLDivElement>(null);

  // 将十六进制颜色转换为 RGB
  const hexToRgb = (hex: string): {r: number, g: number, b: number} => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // 将 RGB 转换为十六进制颜色
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // RGB 转 HSL
  const rgbToHsl = (r: number, g: number, b: number): {h: number, s: number, l: number} => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // 灰色
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h /= 6;
    }

    return { h, s, l };
  };

  // HSL 转 RGB
  const hslToRgb = (h: number, s: number, l: number): {r: number, g: number, b: number} => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // 灰色
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // 初始化 RGB 值
  useEffect(() => {
    setRgbValues(hexToRgb(value));
  }, [value]);

  // 点击外部关闭颜色选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPalette(false);
      }
    };

    // 处理ESC键关闭面板
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showColorPalette) {
        setShowColorPalette(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showColorPalette]);

  // 处理 RGB 值变化
  const handleRgbChange = (key: 'r' | 'g' | 'b', value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(255, numValue));
    const newRgbValues = { ...rgbValues, [key]: clampedValue };
    setRgbValues(newRgbValues);
    onChange(rgbToHex(newRgbValues.r, newRgbValues.g, newRgbValues.b));
  };

  // 根据尺寸设置不同的样式
  const sizeStyles = {
    sm: {
      button: 'h-8 text-xs',
      colorBox: 'w-6 h-6',
      text: 'text-xs',
      icon: 'w-3 h-3',
      panel: 'w-56'
    },
    md: {
      button: 'h-9 text-sm',
      colorBox: 'w-7 h-7',
      text: 'text-sm',
      icon: 'w-4 h-4',
      panel: 'w-64'
    },
    lg: {
      button: 'h-10 text-base',
      colorBox: 'w-8 h-8',
      text: 'text-base',
      icon: 'w-5 h-5',
      panel: 'w-72'
    },
  }[size];

  return (
    <div className="relative" ref={colorPickerRef}>
      {label && <label className="block text-xs text-gray-700 mb-1.5">{label}</label>}
      <button
        type="button"
        onClick={() => setShowColorPalette(!showColorPalette)}
        className={`flex items-center justify-between w-full ${sizeStyles.button} px-3 rounded-lg bg-white border border-gray-200 ${showColorPalette ? 'border-blue-400 ring-2 ring-blue-100' : 'hover:border-gray-300'} transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-opacity-75 shadow-sm`}
        aria-label="打开颜色选择器"
        aria-expanded={showColorPalette}
        aria-haspopup="dialog"
      >
        <div className="flex items-center space-x-2">
          <div
            className={`${sizeStyles.colorBox} rounded-md relative overflow-hidden shadow-inner`}
            style={{ backgroundColor: value }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)] bg-[length:6px_6px] bg-[position:0_0,3px_3px] opacity-5"></div>
          </div>
          <span className={`${sizeStyles.text} text-gray-700 font-medium`}>{value.toUpperCase()}</span>
        </div>
        <FiChevronDown className={`${sizeStyles.icon} text-gray-400 ${showColorPalette ? 'rotate-180' : ''} transition-transform duration-200`} />
      </button>

      {showColorPalette && (
        <div
          className={`absolute z-10 mt-1 p-4 bg-white rounded-xl border border-gray-200 shadow-xl ${sizeStyles.panel} animate-in fade-in slide-in-from-top-1 duration-150`}
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
          role="dialog"
          aria-label="颜色选择器"
          tabIndex={-1}
        >
          {/* 预设颜色 - 更强调快速选择 */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2.5">
              {presetColors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${size === 'lg' ? 'w-10 h-10' : 'w-9 h-9'} rounded-full border hover:scale-105 active:scale-95 transition-all duration-150 relative ${color === value ? 'ring-2 ring-offset-2 ring-blue-500' : 'hover:shadow-md'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color);
                    setRgbValues(hexToRgb(color));
                  }}
                >
                  {color === value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiCheck className="w-4 h-4 text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 颜色面板 */}
          <div className="space-y-4">
            {/* 颜色渐变 - 的平滑渐变 */}
            <div className="space-y-3">
              <div
                className="w-full h-32 rounded-xl shadow-inner cursor-pointer relative overflow-hidden group"
                style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%), 
                              linear-gradient(to right, rgba(255,255,255,1) 0%, ${rgbToHex(rgbValues.r, rgbValues.g, rgbValues.b)} 100%)`
                }}
                onClick={(e) => {
                  // 基于点击位置计算颜色
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

                  // 将位置转换为颜色值
                  // x轴控制饱和度，y轴控制亮度
                  const h = rgbToHsl(rgbValues.r, rgbValues.g, rgbValues.b).h;
                  const s = x;
                  const l = 1 - y;

                  const rgb = hslToRgb(h, s, l);
                  setRgbValues(rgb);
                  onChange(rgbToHex(rgb.r, rgb.g, rgb.b));
                }}
                role="application"
                aria-label="颜色面板选择器"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc),linear-gradient(45deg,#ccc_25%,transparent_25%,transparent_75%,#ccc_75%,#ccc)] bg-[length:6px_6px] bg-[position:0_0,3px_3px] opacity-5"></div>
              </div>

              {/* 颜色滑块 - 滑块 */}
              <div className="relative w-full h-7">
                <input
                  type="range"
                  min="0"
                  max="360"
                  className="w-full h-7 appearance-none bg-transparent rounded-lg cursor-pointer focus:outline-none"
                  onChange={(e) => {
                    const hue = parseInt(e.target.value);
                    // 简化的 HSL 到 RGB 转换
                    const h = hue / 60;
                    const c = 1;
                    const x = c * (1 - Math.abs(h % 2 - 1));

                    let r = 0, g = 0, b = 0;

                    if (h >= 0 && h < 1) { r = c; g = x; b = 0; }
                    else if (h >= 1 && h < 2) { r = x; g = c; b = 0; }
                    else if (h >= 2 && h < 3) { r = 0; g = c; b = x; }
                    else if (h >= 3 && h < 4) { r = 0; g = x; b = c; }
                    else if (h >= 4 && h < 5) { r = x; g = 0; b = c; }
                    else { r = c; g = 0; b = x; }

                    const newR = Math.round(r * 255);
                    const newG = Math.round(g * 255);
                    const newB = Math.round(b * 255);

                    setRgbValues({ r: newR, g: newG, b: newB });
                    onChange(rgbToHex(newR, newG, newB));
                  }}
                  style={{
                    WebkitAppearance: 'none',
                    appearance: 'none'
                  }}
                  aria-label="调整色调"
                  role="slider"
                  aria-valuemin={0}
                  aria-valuemax={360}
                />
                <div
                  className="absolute top-0 pointer-events-none w-full h-7 rounded-lg shadow-inner overflow-hidden"
                  style={{
                    background: 'linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)'
                  }}
                ></div>
              </div>
            </div>

            {/* 十六进制输入 */}
            <div className="pt-2">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">十六进制代码</label>
              <input
                type="text"
                value={value.toUpperCase()}
                onChange={(e) => {
                  const hexColor = e.target.value;
                  if (/^#?([A-Fa-f0-9]{6})$/.test(hexColor)) {
                    const color = hexColor.startsWith('#') ? hexColor : `#${hexColor}`;
                    onChange(color);
                    setRgbValues(hexToRgb(color));
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-gray-50 shadow-inner"
                placeholder="例如：#007AFF"
              />
            </div>

            {/* RGB 输入 */}
            <div className="pt-1">
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">RGB 值</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.r}
                    onChange={(e) => handleRgbChange('r', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none pl-6 transition-colors bg-gray-50 shadow-inner"
                  />
                  <span className="absolute left-3 top-2 text-gray-400 text-sm font-medium">R</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.g}
                    onChange={(e) => handleRgbChange('g', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none pl-6 transition-colors bg-gray-50 shadow-inner"
                  />
                  <span className="absolute left-3 top-2 text-gray-400 text-sm font-medium">G</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbValues.b}
                    onChange={(e) => handleRgbChange('b', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none pl-6 transition-colors bg-gray-50 shadow-inner"
                  />
                  <span className="absolute left-3 top-2 text-gray-400 text-sm font-medium">B</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
