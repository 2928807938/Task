"use client";

import React from 'react';
import type {Components} from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// 创建标题ID的辅助函数
const createHeadingId = (text: string): string => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // 创建组件映射
  const components: Components = {
    h1: ({ node, children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = createHeadingId(text);
      return <h1 id={id} className="text-2xl font-bold my-4" {...props}>{children}</h1>;
    },
    h2: ({ node, children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = createHeadingId(text);
      return <h2 id={id} className="text-xl font-bold my-3 flex items-center" {...props}>{children}</h2>;
    },
    h3: ({ node, children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = createHeadingId(text);
      return <h3 id={id} className="text-lg font-bold my-2" {...props}>{children}</h3>;
    },
    h4: ({ node, children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = createHeadingId(text);
      return <h4 id={id} className="text-base font-bold my-2" {...props}>{children}</h4>;
    },
    h5: ({ node, children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = createHeadingId(text);
      return <h5 id={id} className="text-sm font-bold my-2" {...props}>{children}</h5>;
    },
    h6: ({ node, children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = createHeadingId(text);
      return <h6 id={id} className="text-xs font-bold my-2" {...props}>{children}</h6>;
    },
    p: ({ node, ...props }: any) => <p className="my-2" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc pl-6 my-2" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal pl-6 my-2" {...props} />,
    li: ({ node, ...props }: any) => <li className="my-1" {...props} />,
    a: ({ node, ...props }: any) => <a className="text-blue-600 hover:underline" {...props} />,
    blockquote: ({ node, ...props }: any) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />,
    code: ({ node, ...props }: any) => {
      const isInline = props.inline;
      return isInline
        ? <code className="bg-gray-100 px-1 rounded text-sm" {...props} />
        : <pre className="bg-gray-100 p-4 rounded overflow-x-auto my-2"><code className="text-sm" {...props} /></pre>;
    },
    hr: ({ node, ...props }: any) => <hr className="my-4 border-t border-gray-300" {...props} />,
    table: ({ node, ...props }: any) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-gray-300" {...props} /></div>,
    thead: ({ node, ...props }: any) => <thead className="bg-gray-50" {...props} />,
    tbody: ({ node, ...props }: any) => <tbody className="divide-y divide-gray-200" {...props} />,
    tr: ({ node, ...props }: any) => <tr className="hover:bg-gray-50" {...props} />,
    th: ({ node, ...props }: any) => <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />,
    td: ({ node, ...props }: any) => <td className="px-3 py-2 whitespace-nowrap text-sm" {...props} />,
  };

  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
