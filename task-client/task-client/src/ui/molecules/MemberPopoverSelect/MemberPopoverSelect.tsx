'use client';

import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiCheck, FiSearch, FiUser, FiX} from 'react-icons/fi';
import {Avatar} from '@/ui/atoms/Avatar';

export interface MemberOption {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface MemberPopoverSelectProps {
  options: MemberOption[];
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MemberPopoverSelect: React.FC<MemberPopoverSelectProps> = ({
  options,
  value,
  onChange,
  isLoading = false,
  placeholder = '选择负责人',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedMember = options.find(option => option.id === value);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 过滤后的选项
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 当弹窗打开时，聚焦搜索框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // 打开弹窗时重置搜索词
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  // 高亮显示匹配文本
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <span key={i} className="bg-blue-100 text-blue-800 font-medium">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        className={`flex items-center w-full px-4 py-3 rounded-lg border border-gray-300 bg-white bg-opacity-90 backdrop-blur-sm text-left ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'hover:border-gray-400 cursor-pointer'
        }`}
      >
        {selectedMember ? (
          <div className="flex items-center flex-1 overflow-hidden">
            {selectedMember.avatarUrl ? (
              <Avatar
                src={selectedMember.avatarUrl}
                size="sm"
                name={selectedMember.name || '用户'}
                className="flex-shrink-0 mr-2"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0 mr-2">
                <FiUser size={14} />
              </div>
            )}
            <div className="overflow-hidden overflow-ellipsis whitespace-nowrap max-w-full">
              <span className="text-gray-800">{selectedMember.name}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center flex-1 overflow-hidden">
            <FiUser className="flex-shrink-0 mr-2" size={16} />
            <div className="overflow-hidden overflow-ellipsis whitespace-nowrap max-w-full">
              <span className="text-gray-500">{placeholder}</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <svg className="ml-auto h-4 w-4 text-gray-400 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg
            className="ml-auto h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {/* 弹出选择器 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩层 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-[1000]"
              onClick={() => setIsOpen(false)}
            />

            {/* 弹出面板 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="fixed left-0 right-0 bottom-0 z-[1001] bg-white/95 backdrop-blur-md rounded-t-2xl shadow-xl max-h-[70vh] overflow-hidden"
            >
              {/* 拖动条 */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>

              {/* 头部 */}
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">选择负责人</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* 搜索区 */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索成员..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all bg-white/70"
                  />
                </div>
              </div>

              {/* 列表区域 */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(70vh - 150px)' }}>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500">加载中...</p>
                  </div>
                ) : filteredOptions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                      <FiUser size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500">没有找到匹配的成员</p>
                  </div>
                ) : (
                  <ul>
                    {filteredOptions.map(option => (
                      <li key={option.id} className="border-b border-gray-100 last:border-b-0">
                        <button
                          type="button"
                          onClick={() => handleSelect(option.id)}
                          className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          {/* 头像 */}
                          <div className="flex-shrink-0 mr-3">
                            {option.avatarUrl ? (
                              <Avatar
                                src={option.avatarUrl}
                                size="sm"
                                name={option.name}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <FiUser size={14} />
                              </div>
                            )}
                          </div>

                          {/* 名称 */}
                          <div className="flex-1 text-left text-gray-800">
                            {searchTerm ? highlightMatch(option.name, searchTerm) : option.name}
                          </div>

                          {/* 选中标记 */}
                          {value === option.id && (
                            <div className="flex-shrink-0 ml-2 text-blue-500">
                              <FiCheck size={18} />
                            </div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 底部按钮区 */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                >
                  完成
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemberPopoverSelect;
