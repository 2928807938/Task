import React, {useEffect, useRef, useState} from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  FiChevronRight,
  FiEdit,
  FiGrid,
  FiList,
  FiMail,
  FiMoreHorizontal,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX
} from 'react-icons/fi';
import {Avatar} from '@/ui/atoms/Avatar';
import {useToast} from '@/ui/molecules/Toast';
import useProjectHook from '@/hooks/use-project-hook';
import {useTheme} from '@/ui/theme';

// 定义团队成员接口
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  department?: string;
  joinDate?: string;
  status?: 'active' | 'offline' | 'busy';
}

interface ProjectTeamPanelProps {
  members: TeamMember[];
  onAddMember: () => void;
  onEditMember?: (member: TeamMember) => void;
  onRemoveMember?: (memberId: string) => void;
  onSendEmail?: (member: TeamMember) => void;
  onSendMessage?: (member: TeamMember) => void;
  onSwitchToTeamTab?: () => void;
  projectId: string;
}

const AppleStyleProjectTeamPanel: React.FC<ProjectTeamPanelProps> = ({
  members,
  onAddMember,
  onEditMember,
  onRemoveMember,
  onSendEmail,
  onSendMessage,
  onSwitchToTeamTab,
  projectId
}) => {
  const { isDark } = useTheme();
  const isDarkMode = isDark;
  const { addToast } = useToast();
  const [confirmRemove, setConfirmRemove] = useState<{ memberId: string; memberName: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false); // 添加移除加载状态
  const { useRemoveProjectMember } = useProjectHook();
  const removeMember = useRemoveProjectMember();

  // 处理点击成员卡片
  const handleMemberClick = (member: TeamMember, event: React.MouseEvent) => {
    // 如果点击的是操作按钮或菜单，直接返回
    if ((event.target as HTMLElement).closest('.member-actions')) {
      return;
    }
    // 已移除详情弹窗，点击成员不再有效果
    // 如果后续需要添加相关功能，可以在这里实现
  };
  const [searchText, setSearchText] = useState('');
  const [showActions, setShowActions] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllMembers, setShowAllMembers] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  // 每页显示的成员数量
  const displayLimit = viewMode === 'grid' ? 6 : 8;

  // 点击外部关闭操作菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 过滤成员
  const filteredMembers = searchText.trim()
    ? members.filter(member =>
        member.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (member.role && member.role.toLowerCase().includes(searchText.toLowerCase())) ||
        (member.email && member.email.toLowerCase().includes(searchText.toLowerCase())) ||
        (member.department && member.department.toLowerCase().includes(searchText.toLowerCase()))
      )
    : members;

  // 控制显示成员的数量
  const displayedMembers = searchText || showAllMembers
    ? filteredMembers
    : filteredMembers.slice(0, displayLimit);

  // 是否有更多成员可以显示
  const hasMoreMembers = !searchText && filteredMembers.length > displayLimit && !showAllMembers;

  // 根据状态获取指示器颜色
  const getStatusColor = (status?: 'active' | 'offline' | 'busy') => {
    switch(status) {
      case 'active': return 'bg-green-500';
      case 'busy': return 'bg-amber-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  // 过渡动画
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="mt-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className={`rounded-xl overflow-hidden shadow-sm border ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}
      >
        {/* 搜索和操作区域 */}
        <div className={`px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b apple-blur-bg ${
          isDarkMode ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <div className="flex items-center flex-1 min-w-[280px] max-w-md">
            <div className="relative flex-1">
              <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} size={16} />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索成员..."
                className={`w-full pl-10 pr-4 py-2.5 border rounded-full text-sm focus:outline-none focus:ring-2 transition-all ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400 focus:ring-blue-500/30 focus:border-blue-500' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-blue-100 focus:border-blue-300'
                }`}
              />
              {searchText && (
                <button
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    isDarkMode 
                      ? 'text-gray-500 hover:text-gray-300' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  onClick={() => setSearchText('')}
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`flex p-0.5 rounded-lg ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center ${
                  viewMode === 'grid' 
                    ? isDarkMode 
                      ? 'bg-gray-600 shadow-sm text-gray-100' 
                      : 'bg-white shadow-sm text-gray-800'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiGrid className="mr-1.5" size={14} />
                网格视图
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center ${
                  viewMode === 'list' 
                    ? isDarkMode 
                      ? 'bg-gray-600 shadow-sm text-gray-100' 
                      : 'bg-white shadow-sm text-gray-800'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiList className="mr-1.5" size={14} />
                列表视图
              </button>
            </div>

            <button
              onClick={onAddMember}
              className="apple-button inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
            >
              <FiPlus className="mr-1.5" size={15} />
              添加成员
            </button>
          </div>
        </div>

        {/* 成员列表区域 */}
        <div className="p-5">
          {displayedMembers.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col space-y-3"
              }
            >
              {displayedMembers.map((member) => (
                <motion.div
                  key={member.id}
                  variants={itemVariants}
                  className={`${viewMode === 'grid' 
                    ? isDarkMode
                      ? 'bg-gray-700 rounded-xl p-4 hover:bg-gray-600 transition-all cursor-pointer border border-gray-600 hover:shadow-md'
                      : 'bg-gray-50 rounded-xl p-4 hover:bg-white transition-all cursor-pointer border border-gray-200 hover:shadow-md'
                    : isDarkMode
                      ? 'bg-gray-700 rounded-xl p-3 hover:bg-gray-600 transition-all cursor-pointer border border-gray-600 hover:shadow-md flex items-center'
                      : 'bg-gray-50 rounded-xl p-3 hover:bg-white transition-all cursor-pointer border border-gray-200 hover:shadow-md flex items-center'
                  }`}
                  onClick={(e) => handleMemberClick(member, e)}
                >
                  {viewMode === 'grid' ? (
                    // 网格视图
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="relative">
                            <Avatar
                              src={member.avatar}
                              name={member.name}
                              className="w-12 h-12 rounded-full border border-white shadow-sm"
                            />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                          </div>
                          <div className="flex-1 min-w-0 ml-3">
                            <p className={`font-medium truncate ${
                              isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>{member.name}</p>
                            <p className={`text-sm truncate ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>{member.role}</p>
                            {member.department && (
                              <p className={`text-xs mt-1 truncate ${
                                isDarkMode ? 'text-gray-500' : 'text-gray-400'
                              }`}>{member.department}</p>
                            )}
                          </div>
                        </div>

                        <div className="relative member-actions">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowActions(showActions === member.id ? null : member.id);
                            }}
                            className={`p-1.5 rounded-full transition-colors ${
                              isDarkMode 
                                ? 'text-gray-400 hover:bg-gray-600' 
                                : 'text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            <FiMoreHorizontal size={16} />
                          </button>

                          {showActions === member.id && (
                            <div
                              ref={actionsRef}
                              className={`absolute right-0 top-8 shadow-lg rounded-xl border w-40 py-1 z-10 ${
                                isDarkMode 
                                  ? 'bg-gray-800 border-gray-700' 
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              {onEditMember && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditMember(member);
                                    setShowActions(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                    isDarkMode 
                                      ? 'text-gray-300 hover:bg-gray-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <FiEdit size={14} className="mr-2" />
                                  编辑成员
                                </button>
                              )}

                              {member.email && onSendEmail && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSendEmail(member);
                                    setShowActions(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                    isDarkMode 
                                      ? 'text-gray-300 hover:bg-gray-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <FiMail size={14} className="mr-2" />
                                  发送邮件
                                </button>
                              )}
                              {onRemoveMember && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmRemove({ memberId: member.id, memberName: member.name });
                                    setShowActions(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                    isDarkMode 
                                      ? 'text-red-400 hover:bg-red-900/30' 
                                      : 'text-red-600 hover:bg-red-50'
                                  }`}
                                >
                                  <FiTrash2 size={14} className="mr-2" />
                                  移除成员
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={`mt-4 pt-3 border-t flex justify-between items-center ${
                        isDarkMode ? 'border-gray-600' : 'border-gray-200'
                      }`}>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {member.joinDate && `加入于 ${member.joinDate}`}
                        </div>
                        <div className="flex space-x-1">
                          {/* 移除重复的发送邮件按钮，统一使用更多操作菜单 */}
                        </div>
                      </div>
                    </>
                  ) : (
                    // 列表视图
                    <>
                      <div className="relative mr-3">
                        <Avatar
                          src={member.avatar}
                          name={member.name}
                          className="w-10 h-10 rounded-full border border-white shadow-sm"
                        />
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${getStatusColor(member.status)} rounded-full border-2 border-white`}></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className={`font-medium ${
                              isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>{member.name}</p>
                            <div className={`flex items-center text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              <span className="mr-2">{member.role}</span>
                              {member.department && (
                                <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>· {member.department}</span>
                              )}
                            </div>
                          </div>

                          {member.joinDate && (
                            <div className={`text-xs mr-2 ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              加入于 {member.joinDate}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 member-actions">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowActions(showActions === member.id ? null : member.id);
                            }}
                            className={`p-1.5 rounded-full transition-colors ${
                              isDarkMode 
                                ? 'text-gray-400 hover:bg-gray-600' 
                                : 'text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            <FiMoreHorizontal size={15} />
                          </button>

                          {showActions === member.id && (
                            <div
                              ref={actionsRef}
                              className={`absolute right-0 top-8 shadow-lg rounded-xl border w-40 py-1 z-10 ${
                                isDarkMode 
                                  ? 'bg-gray-800 border-gray-700' 
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              {onEditMember && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditMember(member);
                                    setShowActions(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                    isDarkMode 
                                      ? 'text-gray-300 hover:bg-gray-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <FiEdit size={14} className="mr-2" />
                                  编辑成员
                                </button>
                              )}
                              {member.email && onSendEmail && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSendEmail(member);
                                    setShowActions(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                    isDarkMode 
                                      ? 'text-gray-300 hover:bg-gray-700' 
                                      : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  <FiMail size={14} className="mr-2" />
                                  发送邮件
                                </button>
                              )}
                              {onRemoveMember && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmRemove({ memberId: member.id, memberName: member.name });
                                    setShowActions(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center ${
                                    isDarkMode 
                                      ? 'text-red-400 hover:bg-red-900/30' 
                                      : 'text-red-600 hover:bg-red-50'
                                  }`}
                                >
                                  <FiTrash2 size={14} className="mr-2" />
                                  移除成员
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
               ))}

              {/* 查看全部成员按钮 */}
              {hasMoreMembers && (
                <motion.div
                  variants={itemVariants}
                  className="flex justify-center mt-4 pt-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (onSwitchToTeamTab) {
                        onSwitchToTeamTab();
                      } else {
                        setShowAllMembers(true);
                      }
                    }}
                    className={`inline-flex items-center px-4 py-2.5 text-sm font-medium rounded-full transition-all ${
                      isDarkMode 
                        ? 'text-blue-400 bg-blue-900/30 hover:bg-blue-900/50' 
                        : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <FiUsers className="mr-1.5" size={15} />
                    查看全部成员 ({filteredMembers.length})
                    <FiChevronRight size={14} className="ml-1.5" />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          ) : searchText ? (
            <div className={`text-center py-12 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center mb-6"
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <FiSearch className={`w-8 h-8 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-300'
                  }`} />
                </div>
              </motion.div>
              <p className={`text-lg font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>未找到匹配的成员</p>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>尝试使用其他关键词搜索</p>
            </div>
          ) : (
            <div className={`text-center py-16 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center mb-6"
              >
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                }`}>
                  <svg className={`w-12 h-12 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-300'
                  }`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </motion.div>
              <p className={`text-xl font-medium ${
                isDarkMode ? 'text-gray-200' : 'text-gray-900'
              }`}>暂无团队成员</p>
              <p className={`text-sm mt-2 mb-8 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>点击下方按钮邀请团队成员加入</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAddMember}
                className="px-5 py-2.5 bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600 transition-colors inline-flex items-center"
              >
                <FiPlus className="mr-2" size={16} />
                添加第一个成员
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
      {/* 成员详情弹窗已完全移除 */}

      {/* 设计符合移除成员对话框 */}
      {confirmRemove !== null && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-xl"
          >
            {/* 对话框头部 */}
            <div className="px-6 pt-6 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">移除团队成员</h3>
            </div>

            {/* 信息区域 */}
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mr-4">
                  <FiTrash2 className="text-red-500 dark:text-red-400" size={18} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{confirmRemove.memberName}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">将从当前项目团队中移除</p>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">移除后该成员将无法访问此项目的资源和任务。</p>
              <p className="text-red-500 dark:text-red-400 text-sm font-medium">此操作不可撤销。</p>
            </div>

            {/* 底部按钮区 */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setConfirmRemove(null)}
              >
                取消
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isRemoving}
                className={`px-4 py-2 rounded-full text-sm font-medium text-white ${isRemoving ? 'bg-red-400 dark:bg-red-600/70' : 'bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700'} transition-all duration-200 flex items-center justify-center min-w-[80px]`}
                onClick={() => {
                  if (confirmRemove && onRemoveMember) {
                    setIsRemoving(true);

                    // 模拟触觉反馈
                    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                      window.navigator.vibrate(8);
                    }

                    // 延迟执行以显示加载状态
                    setTimeout(() => {
                      onRemoveMember(confirmRemove.memberId);
                      // 操作完成后关闭对话框
                      setTimeout(() => {
                        setIsRemoving(false);
                        setConfirmRemove(null);
                      }, 300);
                    }, 100);
                  }
                }}
              >
                {isRemoving ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    移除中
                  </>
                ) : '移除'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AppleStyleProjectTeamPanel;
