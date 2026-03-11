"use client";

import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiCheck, FiSearch, FiUser} from 'react-icons/fi';
import {Avatar} from '@/ui/atoms/Avatar';

// 定义一个最小成员接口，只包含必要的属性
interface MinimumMemberData {
  id: string;
  name: string;
  avatar?: string;
}

interface MemberPickerProps {
  selectedMember: MinimumMemberData | null;
  members: MinimumMemberData[];
  onChange: (memberId: string) => void;
  className?: string;
  disabled?: boolean;
  position?: 'top' | 'bottom';
}

/**
 * 成员选择器组件
 */
const MemberPicker: React.FC<MemberPickerProps> = ({
  selectedMember,
  members,
  onChange,
  className = '',
  disabled = false,
  position = 'bottom'
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);


  // 搜索筛选成员 - 不直接使用props作为初始状态
  const [filteredMembers, setFilteredMembers] = useState<MinimumMemberData[]>([]);

  // 当搜索条件或成员列表变化时更新筛选结果
  useEffect(() => {
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  // 选择成员
  const handleSelectMember = (memberId: string) => {
    onChange(memberId);
    setIsOpen(false);
    setSearchTerm('');
  };

  // 清除选择
  const clearSelection = () => {
    onChange('');
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <div
        ref={inputRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          flex items-center w-full px-4 py-3 rounded-xl border transition-all duration-200
          ${disabled ? 
            'bg-gray-50 cursor-not-allowed border-gray-200 dark:bg-gray-800/50 dark:border-gray-700' : 
            'bg-white cursor-pointer hover:border-blue-400 border-gray-200 dark:bg-gray-800/80 dark:border-gray-700 hover:shadow-sm'
          }
          ${isOpen ? 'ring-2 ring-blue-300/60 border-blue-500 dark:ring-blue-500/30 dark:border-blue-500 shadow-sm' : ''}
        `}
      >
        <FiUser className="text-indigo-500 mr-2.5" size={17} />

        <div className={`flex-grow ${selectedMember ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'} font-medium`}>
          {selectedMember ? selectedMember.name : '选择负责人'}
        </div>

        {selectedMember && (
          <Avatar
            name={selectedMember.name}
            src={selectedMember.avatar}
            size="xs"
          />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            className="absolute z-[100] w-full bg-white dark:bg-gray-800/95 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/80 apple-blur"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, type: 'spring', stiffness: 400, damping: 28 }}
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              ...(position === 'top'
                ? { bottom: 'calc(100% + 8px)', top: 'auto' }
                : { top: 'calc(100% + 8px)', bottom: 'auto' })
            }}
          >
            {/* 搜索框 */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-700/60">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索成员..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    // 只阻止回车键提交表单，不自动选择成员
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  className="w-full py-2 pl-9 pr-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600/50 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 dark:focus:ring-blue-500/30 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              </div>
            </div>

            {/* 成员列表 */}
            <div className="max-h-60 overflow-y-auto">
              {filteredMembers.length > 0 ? (
                filteredMembers.map(member => (
                  <div
                    key={member.id}
                    className={`
                      px-4 py-2.5 flex items-center justify-between cursor-pointer
                      ${selectedMember?.id === member.id ? 
                        'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 
                        'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                      }
                      transition-colors duration-150
                    `}
                    onClick={() => handleSelectMember(member.id)}
                  >
                    <div className="flex items-center">
                      <Avatar
                        name={member.name}
                        src={member.avatar}
                        size="sm"
                        className="mr-3"
                      />
                      <span className="font-medium">{member.name}</span>
                    </div>

                    {selectedMember?.id === member.id && (
                      <FiCheck className="text-blue-500" size={18} />
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                  没有找到匹配的成员
                </div>
              )}
            </div>

            {/* 底部操作栏 */}
            <div className="border-t border-gray-100 dark:border-gray-700/60 px-4 py-3 flex justify-between items-center bg-gray-50/80 dark:bg-gray-800/80">
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors duration-150 focus:outline-none"
                onClick={clearSelection}
              >
                清除
              </button>

              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-150 focus:outline-none shadow-sm hover:shadow"
                onClick={() => setIsOpen(false)}
              >
                确定
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemberPicker;
