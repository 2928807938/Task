'use client';

import React from 'react';

/**
 * 全局样式组件
 *
 * 这个组件提供了全局的苹果设计风格样式，包括：
 * 1. 毛玻璃效果
 * 2. 圆角设计
 * 3. 微妙的阴影效果
 * 4. 平滑过渡动画
 * 5. 自定义滚动条
 * 6. 输入框聚焦效果
 */
const GlobalStyles: React.FC = () => {
  return (
    <style jsx global>{`
      :root {
        --apple-bg-blur: blur(20px);
        --apple-bg-opacity: 0.85;
        --apple-border-radius-sm: 8px;
        --apple-border-radius-md: 12px;
        --apple-border-radius-lg: 16px;
        --apple-border-radius-xl: 20px;
        --apple-shadow-sm: 0 2px 5px rgba(0, 0, 0, 0.05);
        --apple-shadow-md: 0 4px 10px rgba(0, 0, 0, 0.08);
        --apple-shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.12);
        --apple-transition-fast: 0.15s ease;
        --apple-transition-normal: 0.25s ease;
        --apple-transition-slow: 0.4s ease;
        --apple-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }

      body {
        font-family: var(--apple-font-sans);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* 模糊背景 */
      .apple-blur-bg {
        backdrop-filter: var(--apple-bg-blur);
        -webkit-backdrop-filter: var(--apple-bg-blur);
        background-color: rgba(255, 255, 255, var(--apple-bg-opacity));
      }
      
      .apple-blur {
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      /* 卡片 */
      .apple-card {
        border-radius: var(--apple-border-radius-md);
        box-shadow: var(--apple-shadow-md);
        transition: all var(--apple-transition-normal);
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }

      .apple-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--apple-shadow-lg);
      }

      /* 按钮 */
      .apple-button {
        border-radius: 9999px;
        transition: all var(--apple-transition-fast);
        font-weight: 500;
      }

      /* 输入框 */
      .apple-input {
        border-radius: 9999px;
        transition: all var(--apple-transition-fast);
      }
      
      .apple-input:focus {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
      }

      /* 渐变 */
      .apple-gradient-blue {
        background: linear-gradient(to bottom, #3490dc, #2779bd);
      }

      .apple-gradient-gray {
        background: linear-gradient(to bottom, #f7fafc, #e2e8f0);
      }
      
      /* 自定义滚动条 -  */
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 20px;
        border: 2px solid transparent;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(0, 0, 0, 0.3);
      }
      
      /* 暗色模式适配 */
      @media (prefers-color-scheme: dark) {
        .apple-card {
          background: rgba(30, 30, 30, 0.8);
          border-color: rgba(50, 50, 50, 0.3);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
      }
    `}</style>
  );
};

export default GlobalStyles;
