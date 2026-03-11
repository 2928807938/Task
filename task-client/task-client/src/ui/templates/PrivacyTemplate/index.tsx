"use client";

import React, {useEffect, useRef, useState} from 'react';
import MarkdownRenderer from '@/ui/molecules/MarkdownRenderer';
import {usePrivacyHook} from '@/hooks/use-privacy-hook';
import Link from 'next/link';
import GlobalStyles from '@/ui/atoms/GlobalStyles';
import {useTheme} from 'next-themes';

interface TableOfContentsItem {
  id: string;
  text: string;
  level: number;
}

const PrivacyTemplate: React.FC = () => {
  const { privacy, isLoading, error } = usePrivacyHook();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContent, setFilteredContent] = useState('');
  const [tableOfContents, setTableOfContents] = useState<TableOfContentsItem[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const contentRef = useRef<HTMLDivElement>(null);

  // 提取目录的函数
  const extractTableOfContents = (content: string) => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const toc: TableOfContentsItem[] = [];
    let match;
    let index = 0;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      let id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      // 确保id不为空且唯一，如果为空或重复则添加索引
      if (!id) id = `heading-${index}`;

      // 检查是否已存在相同id
      const existingIdCount = toc.filter(item => item.id === id || item.id.startsWith(`${id}-`)).length;
      if (existingIdCount > 0) {
        id = `${id}-${existingIdCount}`;
      }

      toc.push({
        id,
        text,
        level
      });

      index++;
    }

    return toc;
  };

  // 监听滚动位置，高亮当前可见的标题并更新阅读进度
  useEffect(() => {
    const handleScroll = () => {
      if (tableOfContents.length === 0) return;

      const headingElements = tableOfContents.map(item =>
        document.getElementById(item.id)
      ).filter(Boolean);

      // 找到当前可见的标题
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        if (rect.top <= 100) { // 标题在视口顶部附近或以上
          setActiveHeading(tableOfContents[i].id);
          break;
        }
      }

      // 计算阅读进度
      if (contentRef.current) {
        const windowHeight = window.innerHeight;
        const documentHeight = contentRef.current.scrollHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrolled = (scrollTop / (documentHeight - windowHeight)) * 100;
        setReadingProgress(Math.min(scrolled, 100));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tableOfContents]);

  useEffect(() => {
    if (privacy?.content) {
      // 提取目录
      const toc = extractTableOfContents(privacy.content);
      setTableOfContents(toc);

      // 直接使用原始内容，不添加HTML标签，而是依靠Markdown渲染器的特性
      if (searchQuery.trim() === '') {
        setFilteredContent(privacy.content);
      } else {
        // 搜索实现，高亮匹配的内容
        const regex = new RegExp(`(${searchQuery})`, 'gi');
        const highlighted = privacy.content.replace(regex, '**$1**');
        setFilteredContent(highlighted);
      }
    }
  }, [privacy, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] dark:bg-[#1c1c1e]">
        <GlobalStyles />
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 dark:border-gray-700 rounded-full opacity-30"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7] dark:bg-[#1c1c1e]">
        <GlobalStyles />
        <div className="apple-card bg-white dark:bg-[#2c2c2e] p-8 max-w-md text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 dark:text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-gray-800 dark:text-gray-200 mb-4 font-medium">加载隐私政策时出错</p>
          <Link href="/login" className="apple-button inline-flex items-center px-6 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-all duration-200">
            返回登录页面
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#1c1c1e]">
      <GlobalStyles />

      {/* 进度条 */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        <div
          className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300 ease-out"
          style={{ width: `${readingProgress}%` }}
        ></div>
      </div>

      <div className="container mx-auto py-16 px-6 sm:px-8 lg:px-12 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 左侧目录 */}
          <div className="w-full md:w-1/4 lg:w-1/5">
            <div className="apple-card sticky top-8 bg-white/90 dark:bg-[#2c2c2e]/90 apple-blur-bg p-6 rounded-2xl">
              <h2 className="text-xl font-medium mb-6 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3">目录</h2>

              <nav className="space-y-1.5 max-h-[calc(100vh-240px)] overflow-y-auto pr-2 custom-scrollbar">
                {tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
                    className={`block py-2 rounded-xl px-3 text-base transition-all duration-200 ${activeHeading === item.id ? 
                      'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium' : 
                      'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/30'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(item.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        setActiveHeading(item.id);
                      }
                    }}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="w-full md:w-3/4 lg:w-4/5" ref={contentRef}>
            <div className="apple-card bg-white/95 dark:bg-[#2c2c2e]/95 apple-blur-bg rounded-2xl overflow-hidden">
              <div className="p-8 md:p-10 lg:p-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                  <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">隐私政策</h1>

                  <div className="relative w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="搜索隐私政策内容..."
                      className="apple-input w-full sm:w-64 pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800/50 border-0 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none lg:max-w-4xl mx-auto">
                  {filteredContent ? (
                    <MarkdownRenderer content={filteredContent} />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-12">没有隐私政策内容可显示</p>
                  )}
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 justify-between border-t border-gray-200 dark:border-gray-700 pt-8">
                  <Link href="/login" className="apple-button w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200">
                    返回登录
                  </Link>
                  <Link href="/terms" className="apple-button w-full sm:w-auto inline-flex justify-center items-center px-8 py-3 text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200">
                    查看服务条款
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 添加自定义样式
const styles = `
  /* 自定义滚动条 */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }
  
  .dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  /* Markdown内容样式增强 */
  .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
    scroll-margin-top: 80px;
    font-weight: 600;
  }
  
  .prose h1 {
    font-size: 2rem;
    margin-top: 3rem;
    margin-bottom: 1.5rem;
  }
  
  .prose h2 {
    font-size: 1.75rem;
    margin-top: 2.5rem;
    margin-bottom: 1.25rem;
  }
  
  .prose h3 {
    font-size: 1.5rem;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
  
  .prose p {
    line-height: 1.8;
    margin-bottom: 1.25em;
  }
  
  .prose ul, .prose ol {
    margin-top: 1.25em;
    margin-bottom: 1.25em;
  }
  
  .prose li {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
`;

export default function PrivacyPage() {
  return (
    <>
      <style jsx global>{styles}</style>
      <PrivacyTemplate />
    </>
  );
}
