import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiCheck, FiChevronDown, FiInfo, FiMail, FiPlus, FiSearch, FiUsers, FiX} from 'react-icons/fi';
import {Avatar} from '@/ui/atoms/Avatar';
import useProjectHook from '@/hooks/use-project-hook';
import {useFindUsers} from '@/hooks/use-user-hook';
import {useToast} from '@/ui/molecules/Toast';
import {UserSearchItem} from '@/types/api-types';
import {ProjectRoleItem} from '@/core/interfaces/repositories/project-repository';
import {useTheme} from '@/ui/theme';

// 添加成员弹框属性
interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onMemberAdded: () => void;
}

/**
 * 添加成员弹框组件
 * 采用
 */
const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onMemberAdded
}) => {
  const { isDark } = useTheme();
  const isDarkMode = isDark;
  
  const [searchText, setSearchText] = useState('');
  const [users, setUsers] = useState<UserSearchItem[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchItem[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'invite'>('search');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  // 创建角色相关状态
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [showCreateRoleForm, setShowCreateRoleForm] = useState(false);

  const { addToast } = useToast();

  const {
    useAddProjectMember,
    useGetProjectRoles,
    useCreateProjectRole
  } = useProjectHook();

  // 获取项目角色列表
  const { data: roles = [], isLoading: isLoadingRoles, refetch: refetchRoles } = useGetProjectRoles(projectId);
  const [_, setRoles] = useState<ProjectRoleItem[]>([]); // 保持向后兼容

  // 使用 addMember mutation
  const addMemberMutation = useAddProjectMember();

  // 使用 createProjectRole mutation
  const createRoleMutation = useCreateProjectRole();

  // 使用用户搜索钩子
  const { data: searchResults, isLoading, isError, searchUsers } = useFindUsers('', projectId);
  const { mutate: addMember } = addMemberMutation;
  // 使用正确的字段名访问加载状态
  const isAdding = addMemberMutation.isPending;

  // 在获取到角色列表后设置默认角色
  useEffect(() => {
    if (roles && roles.length > 0) {
      // 默认选中成员角色，如果不存在则选择第一个角色
      const memberRole = roles.find(role => role.name.includes('成员'));
      setSelectedRole(memberRole ? memberRole.id : roles[0].id);
    }
  }, [roles]);

  // 执行搜索的函数
  const handleSearch = () => {
    if (!searchText.trim() || searchText.length < 2) {
      addToast('请输入至少2个字符进行搜索', 'warning');
      setUsers([]);
      return;
    }

    // 调用搜索用户 API
    searchUsers(searchText, projectId);
  };

  // 处理回车键搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 当搜索结果发生变化时更新用户列表
  useEffect(() => {
    if (searchResults) {
      setUsers([...searchResults]);
    }
  }, [searchResults]);

  // 弹框打开时自动聚焦搜索框
  useEffect(() => {
    if (isOpen && activeTab === 'search') {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, activeTab]);
  
  // 弹框关闭时重置状态
  useEffect(() => {
    if (!isOpen) {
      // 重置所有状态
      setSearchText('');
      setUsers([]);
      setSelectedUsers([]);
      setInviteEmail('');
      setActiveTab('search');
      setIsRoleDropdownOpen(false);
      setShowCreateRoleForm(false);
      setNewRoleName('');
      setNewRoleDescription('');
    }
  }, [isOpen]);



  // 选择/取消选择用户
  const toggleUser = (user: UserSearchItem) => {
    // 如果用户已在项目中，不允许选择
    if (user.isInProject) {
      return;
    }

    const isSelected = selectedUsers.some(u => u.id === user.id);

    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // 验证邮箱格式
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 获取选中角色的名称
  const getSelectedRoleName = () => {
    if (!roles || roles.length === 0) return '加载中...';
    const role = roles.find(r => r.id === selectedRole);
    return role ? role.name : '选择角色';
  };

  // 创建新角色
  const handleCreateRole = async () => {
    const trimmedName = newRoleName.trim();

    if (!trimmedName) {
      addToast('请输入角色名称', 'warning');
      return;
    }

    if (trimmedName.length > 20) {
      addToast('角色名称不能超过20个字符', 'warning');
      return;
    }

    try {
      setIsCreatingRole(true);
      const result = await createRoleMutation.mutateAsync({
        projectId,
        name: trimmedName,
        description: newRoleDescription.trim()
      });

      // 重置表单
      setNewRoleName('');
      setNewRoleDescription('');
      setShowCreateRoleForm(false);

      // 刷新角色列表
      const updatedRoles = await refetchRoles();

      // 自动选择新创建的角色
      if (updatedRoles.data && result) {
        setSelectedRole(result.id);
      }

      addToast('角色创建成功', 'success');

    } catch (error) {
      // 错误处理已经在 useCreateProjectRole 中处理
      console.error('创建角色失败:', error);
    } finally {
      setIsCreatingRole(false);
    }
  };

  // 提交添加成员
  const handleSubmit = () => {
    if (activeTab === 'search' && selectedUsers.length === 0) {
      addToast('请选择要添加的成员', 'warning');
      return;
    }

    if (activeTab === 'invite' && !isValidEmail(inviteEmail)) {
      addToast('请输入有效的邮箱地址', 'warning');
      return;
    }

    if (!selectedRole) {
      addToast('请选择角色', 'warning');
      return;
    }

    if (activeTab === 'search') {
      // 批量添加已选择的用户
      let successCount = 0;
      let errorCount = 0;
      const totalCount = selectedUsers.length;
      
      const handleBatchComplete = () => {
        if (successCount + errorCount === totalCount) {
          // 所有操作完成后的处理
          if (successCount > 0) {
            if (successCount === totalCount) {
              addToast(`成功添加 ${successCount} 位成员`, 'success');
            } else {
              addToast(`成功添加 ${successCount} 位成员，${errorCount} 位失败`, 'warning');
            }
            // 重置选择状态
            setSelectedUsers([]);
            setUsers([]);
            setSearchText('');
            // 通知父组件刷新成员列表
            onMemberAdded();
            // 关闭弹框
            onClose();
          } else {
            // 全部失败，不关闭弹框
            addToast('所有成员添加失败，请检查后重试', 'error');
          }
        }
      };
      
      selectedUsers.forEach(user => {
        addMember(
          {
            projectId,
            userId: user.id,
            role: selectedRole
          },
          {
            onSuccess: () => {
              successCount++;
              handleBatchComplete();
            },
            onError: (err) => {
              errorCount++;
              console.error(`添加成员 ${user.name || user.email} 失败:`, err.message);
              handleBatchComplete();
            }
          }
        );
      });
    } else {
      // 邀请新用户
      addMember(
        {
          projectId,
          email: inviteEmail,
          role: selectedRole
        },
        {
          onSuccess: () => {
            addToast(`邀请已发送至 ${inviteEmail}`, 'success');
            // 重置表单
            setInviteEmail('');
            onMemberAdded();
            onClose();
          },
          onError: (err) => {
            addToast(`邀请失败: ${err.message}`, 'error');
          }
        }
      );
    }
  };

  // 弹框动画效果
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 500
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm ${
            isDarkMode ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-20'
          }`}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`w-full max-w-lg rounded-xl overflow-hidden shadow-xl ${
              isDarkMode 
                ? 'bg-gray-800 shadow-black/30' 
                : 'bg-white shadow-black/10'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* 头部标题栏 */}
            <div className={`px-6 py-4 border-b flex justify-between items-center ${
              isDarkMode 
                ? 'border-gray-700 bg-gray-800' 
                : 'border-gray-100 bg-white'
            }`}>
              <h2 className={`text-lg font-semibold ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>添加项目成员</h2>
              <button
                onClick={() => {
                  onClose();
                }}
                className={`ml-auto p-1 rounded-full transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="关闭"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* 标签切换栏*/}
            <div className={`px-6 pt-4 flex space-x-2 ${
              isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              <button
                className={`flex-1 py-2 px-4 rounded-t-md font-medium text-sm ${
                  activeTab === 'search' 
                    ? isDarkMode
                      ? 'bg-gray-800 text-gray-100 shadow-sm border-t border-x border-gray-700'
                      : 'bg-white text-gray-900 shadow-sm border-t border-x border-gray-200'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setActiveTab('search')}
              >
                搜索用户
              </button>
              <div className="relative flex-1">
                <button
                  className={`w-full py-2 px-4 rounded-t-md font-medium text-sm cursor-not-allowed opacity-80 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}
                  title="邀请新用户功能，敬请期待"
                >
                  邀请新用户
                  <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full align-text-top ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-400' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    敬请期待
                  </span>
                </button>
                {/* 右上角的颜色标记，添加闪烁效果 */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 animate-pulse ${
                  isDarkMode ? 'border-gray-800' : 'border-white'
                }`}>
                  <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" style={{ animationDuration: '2s' }}></span>
                </div>
              </div>
            </div>

            {activeTab === 'search' ? (
              <>
                {/* 搜索区域 */}
                <div className={`p-6 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className={`flex border rounded-lg overflow-hidden mb-4 ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div className={`pl-3 flex items-center ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      <FiSearch size={18} />
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="搜索用户名或邮箱..."
                      className={`flex-1 py-2 px-3 outline-none bg-transparent ${
                        isDarkMode 
                          ? 'text-gray-200 placeholder-gray-500' 
                          : 'text-gray-700 placeholder-gray-400'
                      }`}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <button
                      onClick={handleSearch}
                      className="px-4 bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors flex items-center"
                    >
                      {isLoading ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <>
                          <FiSearch size={16} className="mr-1" /> 搜索
                        </>
                      )}
                    </button>
                  </div>

                  {/* 已选用户区域 */}
                  {selectedUsers.length > 0 && (
                    <div className="mb-4">
                      <div className={`text-xs font-medium mb-2 flex items-center ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <span>已选择 {selectedUsers.length} 位成员</span>
                        <button
                          className="ml-auto text-xs text-blue-500 hover:text-blue-600"
                          onClick={() => setSelectedUsers([])}
                        >
                          清除所有
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map(user => (
                          <div
                            key={user.id}
                            className={`flex items-center rounded-full py-1 pl-1 pr-2 text-sm border ${
                              isDarkMode 
                                ? 'bg-blue-900/30 border-blue-800' 
                                : 'bg-blue-50 border-blue-100'
                            }`}
                          >
                            <Avatar
                              size="xs"
                              src={user.avatar}
                              name={user.name || user.email}
                            />
                            <span className={`mx-1 ${
                              isDarkMode ? 'text-blue-300' : 'text-blue-800'
                            }`}>{user.name || user.email}</span>
                            <button
                              className="text-blue-400 hover:text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleUser(user);
                              }}
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 角色选择区域*/}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <label className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          角色
                        </label>
                      </div>
                      <button
                        onClick={() => setShowCreateRoleForm(true)}
                        className="flex items-center text-sm text-blue-500 hover:text-blue-600"
                      >
                        <FiPlus className="mr-1" size={14} />
                        创建新角色
                      </button>
                    </div>

                    {/* 创建新角色表单 */}
                    {showCreateRoleForm && (
                      <div className={`p-4 rounded-xl border mb-4 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="space-y-4">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              角色名称
                            </label>
                            <input
                              type="text"
                              value={newRoleName}
                              onChange={(e) => setNewRoleName(e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                isDarkMode 
                                  ? 'border-gray-600 bg-gray-800 text-gray-200' 
                                  : 'border-gray-300 bg-white text-gray-900'
                              }`}
                              placeholder="输入角色名称（最多20个字符）"
                              maxLength={20}
                              disabled={isCreatingRole}
                            />
                            <div className={`text-xs mt-1 text-right ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {newRoleName.length}/20
                            </div>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              角色描述（可选）
                            </label>
                            <textarea
                              value={newRoleDescription}
                              onChange={(e) => setNewRoleDescription(e.target.value)}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                isDarkMode 
                                  ? 'border-gray-600 bg-gray-800 text-gray-200' 
                                  : 'border-gray-300 bg-white text-gray-900'
                              }`}
                              rows={2}
                              placeholder="输入角色描述"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setShowCreateRoleForm(false)}
                              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                isDarkMode 
                                  ? 'text-gray-300 hover:bg-gray-600' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              disabled={isCreatingRole}
                            >
                              取消
                            </button>
                            <button
                              type="button"
                              onClick={handleCreateRole}
                              className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center"
                              disabled={isCreatingRole}
                            >
                              {isCreatingRole ? (
                                <>
                                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                  创建中...
                                </>
                              ) : '创建角色'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 角色下拉框 */}
                    <div className="relative">
                      {/* 下拉框按钮 */}
                      <button
                        onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                        className={`w-full px-4 py-3 border rounded-lg flex items-center justify-between text-left transition-colors ${
                          isDarkMode 
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${selectedRole ? 'border-blue-500 bg-blue-500' : isDarkMode ? 'border-gray-500' : 'border-gray-300'}`}>
                            {selectedRole && (
                              <FiCheck className="text-white" size={12} />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{getSelectedRoleName()}</div>
                          </div>
                        </div>
                        <FiChevronDown className={`transition-transform ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* 下拉列表 */}
                      {isRoleDropdownOpen && (
                        <div className={`absolute z-10 w-full mt-1 rounded-lg shadow-md max-h-60 overflow-auto border ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-white border-gray-200'
                        }`}>
                          {isLoadingRoles ? (
                            <div className="py-4 text-center">
                              <div className="animate-spin w-4 h-4 border-2 border-[#007AFF] border-t-transparent rounded-full mx-auto mb-2"></div>
                              <span className="text-sm text-gray-500">加载角色中...</span>
                            </div>
                          ) : (
                            <div>
                              {/* 系统角色说明 */}
                              <div className={`px-4 py-2 text-sm border-b ${
                                isDarkMode 
                                  ? 'text-gray-400 bg-gray-900 border-gray-700' 
                                  : 'text-gray-500 bg-gray-50 border-gray-200'
                              }`}>
                                <span className={`text-xs ${
                                  isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                }`}>提示：</span>
                                系统预设的管理员角色，不可被修改或删除
                              </div>

                              {/* 系统角色 */}
                              {roles.some((r: any) => r.system) && (
                                <div
                                  className={`px-4 py-3 w-full text-left flex items-center border-b cursor-not-allowed ${
                                    isDarkMode 
                                      ? 'bg-gray-900 border-gray-700' 
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                  title="系统预设角色，不可选择"
                                >
                                  <div className="flex-1">
                                    <div className={`font-medium ${
                                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>{(roles as any[]).find(r => r.system)?.name || '管理员'}</div>
                                    <div className={`text-xs mt-0.5 ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>{(roles as any[]).find(r => r.system)?.description || '系统预设角色'}</div>
                                  </div>
                                </div>
                              )}

                              {/* 普通角色列表 */}
                              <div className="space-y-1">
                                {roles
                                  .filter(role => !role.system)
                                  .map((role) => (
                                    <button
                                      key={role.id}
                                      onClick={() => {
                                        setSelectedRole(role.id);
                                        setIsRoleDropdownOpen(false);
                                      }}
                                      className={`px-4 py-3 w-full text-left flex items-center transition-colors ${
                                        selectedRole === role.id 
                                          ? isDarkMode
                                            ? 'bg-blue-900/30 text-blue-400'
                                            : 'bg-blue-50 text-blue-600'
                                          : isDarkMode
                                            ? 'hover:bg-gray-700 text-gray-300'
                                            : 'hover:bg-gray-50 text-gray-700'
                                      }`}
                                    >
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                                        selectedRole === role.id ? 'border-blue-500 bg-blue-500' : isDarkMode ? 'border-gray-500' : 'border-gray-300'
                                      }`}>
                                        {selectedRole === role.id && (
                                          <FiCheck className="text-white" size={12} />
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-medium">{role.name}</div>
                                        {role.description && (
                                          <div className={`text-xs mt-0.5 ${
                                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                          }`}>{role.description}</div>
                                        )}
                                      </div>
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* 用户搜索结果列表 */}
                <div className={`px-6 pb-6 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  {isError && (
                    <div className={`p-4 mb-4 text-center rounded-lg border ${
                      isDarkMode 
                        ? 'bg-red-900/30 border-red-800 text-red-400' 
                        : 'bg-red-50 border-red-100 text-red-600'
                    }`}>
                      <div className="flex items-center justify-center">
                        <FiInfo className="mr-2" />
                        搜索出错，请重试
                      </div>
                    </div>
                  )}

                  {/* 搜索结果标题 */}
                  <div className="mb-2 flex items-center justify-between">
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>搜索结果</div>
                    {users.length > 0 && !isLoading && (
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>找到 {users.length} 位用户</div>
                    )}
                  </div>

                  {/* 搜索结果列表 */}
                  <div className={`rounded-lg border overflow-hidden ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-700' 
                      : 'border-gray-100 bg-gray-50'
                  }`}>
                    {isLoading ? (
                      <div className="py-8 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className={`${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>正在搜索用户...</p>
                      </div>
                    ) : users.length === 0 && !isError ? (
                      <div className={`py-8 text-center flex flex-col items-center ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <FiUsers className={`mb-2 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} size={32} />
                        <p>尚未找到匹配的用户</p>
                        <p className={`text-sm mt-1 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}>请尝试其他搜索词或邀请新用户</p>
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto">
                        <ul className={`divide-y ${
                          isDarkMode ? 'divide-gray-600' : 'divide-gray-100'
                        }`}>
                          {users.map(user => (
                            <li
                              key={user.id}
                              className={`
                                flex items-center p-3 transition-colors
                                ${user.isInProject 
                                  ? isDarkMode
                                    ? 'bg-gray-600 cursor-not-allowed' 
                                    : 'bg-gray-100 cursor-not-allowed'
                                  : selectedUsers.some(u => u.id === user.id)
                                    ? isDarkMode
                                      ? 'bg-blue-900/30 hover:bg-blue-900/50 cursor-pointer'
                                      : 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
                                    : isDarkMode
                                      ? 'bg-gray-800 hover:bg-gray-700 cursor-pointer'
                                      : 'bg-white hover:bg-gray-50 cursor-pointer'
                                }
                              `}
                              onClick={() => toggleUser(user)}
                            >
                              <Avatar
                                size="sm"
                                src={user.avatar}
                                name={user.name || user.email}
                              />
                              <div className="ml-3 flex-1">
                                <div className={`font-medium ${
                                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                                }`}>
                                  {user.name || '未设置用户名'}
                                </div>
                                <div className={`text-sm ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>{user.email}</div>
                              </div>

                              {user.isInProject ? (
                                <span className={`px-2.5 py-1 text-xs rounded-full border ${
                                  isDarkMode 
                                    ? 'bg-gray-600 text-gray-300 border-gray-500' 
                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>
                                  已在项目中
                                </span>
                              ) : selectedUsers.some(u => u.id === user.id) ? (
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                  <FiCheck size={14} />
                                </div>
                              ) : (
                                <div className={`w-6 h-6 rounded-full border-2 ${
                                  isDarkMode ? 'border-gray-500' : 'border-gray-200'
                                }`}></div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* 已选成员数量提示 */}
                  {selectedUsers.length > 0 && (
                    <div className={`mt-4 p-2 rounded-lg border text-sm flex items-center justify-between ${
                      isDarkMode 
                        ? 'bg-blue-900/30 border-blue-800 text-blue-300' 
                        : 'bg-blue-50 border-blue-100 text-blue-800'
                    }`}>
                      <span>已选择 {selectedUsers.length} 位成员将被添加到项目</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={`p-6 space-y-4 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    邮箱地址
                  </label>
                  <div className={`flex border rounded-lg overflow-hidden ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                  }`}>
                    <div className={`pl-3 flex items-center ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      <FiMail size={18} />
                    </div>
                    <input
                      type="email"
                      placeholder="输入邮箱地址..."
                      className={`flex-1 py-2 px-3 outline-none bg-transparent ${
                        isDarkMode 
                          ? 'text-gray-200 placeholder-gray-500' 
                          : 'text-gray-700 placeholder-gray-400'
                      }`}
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* 角色选择 - 苹果风格下拉菜单 */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    角色
                  </label>
                  <div className="relative" ref={roleDropdownRef}>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl text-left text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 focus:border-blue-300 dark:focus:border-blue-600 transition-all shadow-sm hover:shadow-md"
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        fontSize: '14px',
                      }}
                    >
                      <div className="flex items-center">
                        {isLoadingRoles ? (
                          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                        )}
                        <span>{getSelectedRoleName()}</span>
                      </div>
                      <FiChevronDown className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ease-in-out ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isRoleDropdownOpen && (
                      <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
                           style={{
                             boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
                             backdropFilter: 'blur(8px)',
                             animation: 'fadeIn 0.2s ease-out',
                           }}
                      >
                        <div className="max-h-60 overflow-y-auto py-1">
                          {isLoadingRoles ? (
                            <div className="px-4 py-3.5 text-center text-gray-500 dark:text-gray-400 flex items-center justify-center">
                              <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full mr-2"></div>
                              <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                                加载中...
                              </span>
                            </div>
                          ) : (
                            <>
                              {/* 创建角色选项 */}
                              <button
                                type="button"
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center text-[#007AFF] border-b border-gray-100 dark:border-gray-700 transition-colors duration-150 ease-in-out"
                                onClick={() => {
                                  setShowCreateRoleForm(true);
                                  setIsRoleDropdownOpen(false);
                                }}
                                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                              >
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#007AFF] bg-opacity-10 mr-2.5">
                                  <FiPlus className="text-[#007AFF]" size={12} />
                                </span>
                                <div className="font-medium">创建新角色</div>
                              </button>

                              {/* 角色列表 */}
                              {roles && roles.length > 0 ? (
                                roles.map((role) => (
                                  <button
                                    key={role.id}
                                    className={`w-full px-4 py-3 text-left transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center ${selectedRole === role.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                                    onClick={() => {
                                      setSelectedRole(role.id);
                                      setIsRoleDropdownOpen(false);
                                    }}
                                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                                  >
                                    <div className="flex items-center flex-1">
                                      <div className={`w-3 h-3 rounded-full mr-2.5 ${selectedRole === role.id ? 'bg-blue-500' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
                                      <div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200">{role.name}</div>
                                        {role.description && (
                                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{role.description}</div>
                                        )}
                                      </div>
                                    </div>
                                    {selectedRole === role.id &&
                                      <span className="ml-auto inline-flex items-center justify-center">
                                        <FiCheck className="text-blue-500" size={16} />
                                      </span>
                                    }
                                  </button>
                                ))
                              ) : (
                                <div className={`px-4 py-3.5 text-center ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}>
                                  没有可用的角色
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-1 flex items-start">
                    <FiInfo className={`mr-1 mt-0.5 flex-shrink-0 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} size={14} />
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      选择适当的角色以分配给新成员，每个角色具有不同的权限级别
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <div className={`p-3 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-blue-900/30 border-blue-800' 
                      : 'bg-blue-50 border-blue-100'
                  }`}>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-800'
                    }`}>
                      将向指定邮箱发送邀请链接，对方接受邀请后即可加入项目。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 底部按钮区域 */}
            <div className={`px-6 py-4 border-t flex justify-end space-x-2 ${
              isDarkMode 
                ? 'border-gray-700 bg-gray-900' 
                : 'border-gray-100 bg-gray-50'
            }`}>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={onClose}
              >
                取消
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium flex items-center"
                onClick={handleSubmit}
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-1"></div>
                    处理中...
                  </>
                ) : (
                  <>
                    <FiPlus size={16} className="mr-1" />
                    {activeTab === 'search' ? (
                      selectedUsers.length > 0 ? `添加 ${selectedUsers.length} 位成员` : '添加成员'
                    ) : '发送邀请'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};

export default AddMemberModal;
