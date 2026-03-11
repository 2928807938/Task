'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSettings, FiX, FiInfo, FiUsers, FiToggleLeft, FiToggleRight, FiTrash2, FiPlus, FiEdit3, FiBell, FiArchive, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { useTheme } from '@/ui/theme';
import { ProjectDetailResponse, ProjectMember } from '@/types/api-types';
import { useProjectHook } from '@/hooks/use-project-hook';
import { useProjectMembers } from '@/hooks/use-project-members-hook';

// 苹果风格颜色常量
const APPLE_COLORS = {
  blue: {
    default: '#007AFF',
    hover: '#0056CC',
    active: '#004499'
  },
  red: {
    default: '#FF3B30',
    hover: '#FF453A',
    active: '#D70015'
  },
  gray: {
    50: '#F9F9F9',
    100: '#F2F2F7',
    200: '#E5E5EA',
    300: '#D1D1D6',
    400: '#C7C7CC',
    500: '#AEAEB2',
    600: '#8E8E93'
  },
  text: {
    primary: '#000000',
    secondary: '#3A3A3C',
    tertiary: '#8E8E93'
  }
};

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    description?: string;
    visibility?: 'PUBLIC' | 'PRIVATE';
  } | null;
  onProjectUpdate?: (updatedProject: Partial<ProjectDetailResponse>) => void;
}

// 设置选项卡类型
type SettingsTab = 'basic' | 'members' | 'workflow' | 'preferences' | 'danger';

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  project,
  onProjectUpdate
}) => {
  const { isDark } = useTheme();
  const { useUpdateProject } = useProjectHook();
  const updateProjectMutation = useUpdateProject();
  
  // 获取项目成员数据
  const { members, isLoading: membersLoading } = useProjectMembers(project?.id);
  
  // 当前选中的标签页
  const [activeTab, setActiveTab] = useState<SettingsTab>('basic');
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'PRIVATE' as 'PUBLIC' | 'PRIVATE',
    tags: [] as string[]
  });
  
  // 标签输入状态
  const [tagInput, setTagInput] = useState('');
  
  // 成员角色编辑状态
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [pendingRoleChange, setPendingRoleChange] = useState<{memberId: string, newRole: ProjectMember['role']} | null>(null);
  
  // 任务配置状态
  const [customStatuses, setCustomStatuses] = useState([
    { id: '1', name: '待处理', color: '#9CA3AF', order: 1 },
    { id: '2', name: '进行中', color: '#3B82F6', order: 2 },
    { id: '3', name: '已完成', color: '#10B981', order: 3 },
    { id: '4', name: '已取消', color: '#EF4444', order: 4 }
  ]);
  
  const [customPriorities, setCustomPriorities] = useState([
    { id: '1', name: '低', color: '#9CA3AF', order: 1 },
    { id: '2', name: '中', color: '#F59E0B', order: 2 },
    { id: '3', name: '高', color: '#EF4444', order: 3 }
  ]);
  
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null);
  const [newStatusName, setNewStatusName] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#3B82F6');
  const [newPriorityName, setNewPriorityName] = useState('');
  const [newPriorityColor, setNewPriorityColor] = useState('#F59E0B');
  
  // 通知设置状态
  const [notificationSettings, setNotificationSettings] = useState({
    taskDeadlineReminder: true,
    taskStatusChange: true,
    taskAssignment: true,
    projectUpdates: false,
    teamActivity: false,
    emailNotifications: true,
    pushNotifications: false,
    reminderBefore: 24, // 截止日期前多少小时提醒
    reportFrequency: 'weekly' // daily, weekly, monthly, never
  });
  
  // 高级设置状态
  const [confirmingAction, setConfirmingAction] = useState<'archive' | 'transfer' | 'delete' | null>(null);
  const [transferTargetEmail, setTransferTargetEmail] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // 加载和错误状态
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 初始化表单数据
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        visibility: project.visibility || 'PRIVATE',
        tags: [] // TODO: 从API获取项目标签
      });
    }
  }, [project]);

  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccessMessage(null);
  };

  // 处理可见性切换
  const handleVisibilityToggle = () => {
    const newVisibility = formData.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
    handleInputChange('visibility', newVisibility);
  };

  // 处理标签添加
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  };

  // 处理标签删除
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 处理标签输入键盘事件
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 处理成员角色变更
  const handleRoleChange = async (memberId: string, newRole: ProjectMember['role']) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: 实现API调用更新成员角色
      console.log('更新成员角色:', { memberId, newRole });
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage(`成员角色已更新为 ${getRoleDisplayName(newRole)}`);
      setEditingMemberId(null);
      setPendingRoleChange(null);
      
      // 2秒后清除消息
      setTimeout(() => setSuccessMessage(null), 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '角色更新失败，请重试';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理移除成员
  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`确定要将 ${memberName} 从项目中移除吗？`)) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: 实现API调用移除成员
      console.log('移除成员:', { memberId, memberName });
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage(`已将 ${memberName} 从项目中移除`);
      
      // 2秒后清除消息
      setTimeout(() => setSuccessMessage(null), 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '移除成员失败，请重试';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取角色显示名称
  const getRoleDisplayName = (role: ProjectMember['role']) => {
    switch (role) {
      case 'OWNER': return '所有者';
      case 'ADMIN': return '管理员';
      case 'MEMBER': return '普通成员';
      default: return role;
    }
  };

  // 获取角色描述
  const getRoleDescription = (role: ProjectMember['role']) => {
    switch (role) {
      case 'OWNER': return '拥有项目的完全控制权';
      case 'ADMIN': return '可以管理项目设置和成员';
      case 'MEMBER': return '可以查看和编辑任务';
      default: return '';
    }
  };

  // 任务状态管理函数
  const handleAddStatus = () => {
    if (!newStatusName.trim()) return;
    
    const newStatus = {
      id: Date.now().toString(),
      name: newStatusName.trim(),
      color: newStatusColor,
      order: customStatuses.length + 1
    };
    
    setCustomStatuses([...customStatuses, newStatus]);
    setNewStatusName('');
    setNewStatusColor('#3B82F6');
  };

  const handleUpdateStatus = (id: string, name: string, color: string) => {
    setCustomStatuses(statuses => 
      statuses.map(status => 
        status.id === id ? { ...status, name, color } : status
      )
    );
    setEditingStatusId(null);
  };

  const handleDeleteStatus = (id: string) => {
    if (customStatuses.length <= 2) {
      setError('至少需要保留2个状态');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setCustomStatuses(statuses => statuses.filter(status => status.id !== id));
  };

  // 优先级管理函数
  const handleAddPriority = () => {
    if (!newPriorityName.trim()) return;
    
    const newPriority = {
      id: Date.now().toString(),
      name: newPriorityName.trim(),
      color: newPriorityColor,
      order: customPriorities.length + 1
    };
    
    setCustomPriorities([...customPriorities, newPriority]);
    setNewPriorityName('');
    setNewPriorityColor('#F59E0B');
  };

  const handleUpdatePriority = (id: string, name: string, color: string) => {
    setCustomPriorities(priorities => 
      priorities.map(priority => 
        priority.id === id ? { ...priority, name, color } : priority
      )
    );
    setEditingPriorityId(null);
  };

  const handleDeletePriority = (id: string) => {
    if (customPriorities.length <= 2) {
      setError('至少需要保留2个优先级');
      setTimeout(() => setError(null), 3000);
      return;
    }
    setCustomPriorities(priorities => priorities.filter(priority => priority.id !== id));
  };

  // 通知设置处理函数
  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleNotificationValueChange = (setting: keyof typeof notificationSettings, value: any) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // 高级设置处理函数
  const handleArchiveProject = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: 实现API调用归档项目
      console.log('归档项目:', project?.id);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('项目已成功归档');
      setConfirmingAction(null);
      
      // 2秒后关闭弹窗
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '归档失败，请重试';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferProject = async () => {
    if (!transferTargetEmail.trim()) {
      setError('请输入接收者邮箱');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: 实现API调用转移项目
      console.log('转移项目:', { projectId: project?.id, targetEmail: transferTargetEmail });
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage(`项目已转移至 ${transferTargetEmail}`);
      setConfirmingAction(null);
      setTransferTargetEmail('');
      
      // 2秒后关闭弹窗
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '转移失败，请重试';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (deleteConfirmText !== project?.name) {
      setError('项目名称不匹配');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: 实现API调用删除项目
      console.log('删除项目:', project?.id);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('项目已永久删除');
      setConfirmingAction(null);
      setDeleteConfirmText('');
      
      // 2秒后关闭弹窗并导航到项目列表
      setTimeout(() => {
        onClose();
        // TODO: 导航到项目列表页面
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除失败，请重试';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理表单提交
  const handleSave = async () => {
    if (!project || !formData.name.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 使用实际的API调用更新项目
      await updateProjectMutation.mutateAsync({
        id: project.id,
        name: formData.name.trim(),
        description: formData.description.trim()
        // TODO: 添加可见性字段到API调用
        // visibility: formData.visibility
      });
      
      // 调用回调函数更新项目（如果提供）
      if (onProjectUpdate) {
        onProjectUpdate({
          name: formData.name,
          description: formData.description,
          visibility: formData.visibility
        });
      }
      
      setSuccessMessage('设置已保存');
      
      // 2秒后自动关闭弹窗
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存失败，请重试';
      setError(errorMessage);
      console.error('保存项目设置失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 点击背景关闭弹框
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // 标签页配置
  const tabs = [
    { id: 'basic', label: '基本信息', icon: FiInfo },
    { id: 'members', label: '成员权限', icon: FiUsers },
    { id: 'workflow', label: '任务配置', icon: FiSettings },
    { id: 'preferences', label: '通知设置', icon: FiBell },
    { id: 'danger', label: '危险操作', icon: FiTrash2 }
  ];

  // 渲染基本信息设置
  const renderBasicSettings = () => (
    <div className="space-y-6">
      {/* 项目名称 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          项目名称
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`w-full px-4 py-3 rounded-xl border transition-all ${
            isDark 
              ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500' 
              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          }`}
          placeholder="请输入项目名称"
        />
      </div>

      {/* 项目描述 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          项目描述
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 rounded-xl border transition-all resize-none ${
            isDark 
              ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500' 
              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
          }`}
          placeholder="请输入项目描述"
        />
      </div>

      {/* 项目可见性 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          项目可见性
        </label>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formData.visibility === 'PUBLIC' ? '公开项目' : '私有项目'}
              </div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {formData.visibility === 'PUBLIC' 
                  ? '团队所有成员都可以查看此项目' 
                  : '只有项目成员可以查看此项目'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleVisibilityToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                formData.visibility === 'PUBLIC' ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.visibility === 'PUBLIC' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} flex items-center`}>
            <FiInfo className="w-3 h-3 mr-1" />
            更改可见性后需要保存才能生效
          </div>
        </div>
      </div>

      {/* 项目标签 */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          项目标签
        </label>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.length > 0 ? (
              formData.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {tag}
                  <button 
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`删除标签 ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                暂无标签，输入标签名称后按回车添加
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="输入标签后按回车添加"
              className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!tagInput.trim() || formData.tags.includes(tagInput.trim())}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                !tagInput.trim() || formData.tags.includes(tagInput.trim())
                  ? isDark 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染成员权限管理
  const renderMembersSettings = () => (
    <div className="space-y-6">
      {/* 成员列表 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            项目成员 ({members.length})
          </h3>
        </div>
        
        {membersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'} animate-pulse`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  <div className="flex-1">
                    <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-32 mb-2`}></div>
                    <div className={`h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-24`}></div>
                  </div>
                  <div className={`h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-20`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className={`p-4 rounded-xl border transition-colors ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={member.avatar || '/default-avatar.png'}
                      alt={member.name}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                      }}
                    />
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {member.name}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {member.email}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        负责 {member.taskCount} 个任务
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* 角色选择器 */}
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as ProjectMember['role'])}
                      disabled={member.role === 'OWNER' || isLoading}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        member.role === 'OWNER'
                          ? isDark 
                            ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          : isDark
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="OWNER">{getRoleDisplayName('OWNER')}</option>
                      <option value="ADMIN">{getRoleDisplayName('ADMIN')}</option>
                      <option value="MEMBER">{getRoleDisplayName('MEMBER')}</option>
                    </select>
                    
                    {/* 移除成员按钮 */}
                    {member.role !== 'OWNER' && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        disabled={isLoading}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark
                            ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                            : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                        } disabled:opacity-50`}
                        title="移除成员"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* 角色描述 */}
                <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {getRoleDescription(member.role)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-8 text-center rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <FiUsers className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              暂无项目成员
            </p>
          </div>
        )}
      </div>
      
      {/* 权限说明 */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
        <h4 className={`font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          角色权限说明
        </h4>
        <div className="space-y-2 text-sm">
          <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <span>所有者:</span>
            <span>完全控制权，不可修改</span>
          </div>
          <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <span>管理员:</span>
            <span>管理项目设置和成员</span>
          </div>
          <div className={`flex justify-between ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            <span>普通成员:</span>
            <span>查看和编辑任务</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染任务配置页面
  const renderTaskSettings = () => (
    <div className="space-y-8">
      {/* 任务状态配置 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            任务状态
          </h3>
          <button
            onClick={() => {
              setNewStatusName('');
              setNewStatusColor('#3B82F6');
              setEditingStatusId('new');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isDark
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <FiPlus className="w-4 h-4" />
            添加状态
          </button>
        </div>
        
        <div className="space-y-3">
          {customStatuses.map((status) => (
            <div key={status.id} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
              {editingStatusId === status.id ? (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    defaultValue={status.color}
                    onChange={(e) => setNewStatusColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue={status.name}
                    onChange={(e) => setNewStatusName(e.target.value)}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="状态名称"
                  />
                  <button
                    onClick={() => handleUpdateStatus(status.id, newStatusName || status.name, newStatusColor)}
                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingStatusId(null)}
                    className={`px-3 py-2 text-sm rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {status.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingStatusId(status.id);
                        setNewStatusName(status.name);
                        setNewStatusColor(status.color);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark
                          ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                    {customStatuses.length > 2 && (
                      <button
                        onClick={() => handleDeleteStatus(status.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark
                            ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                            : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* 添加新状态表单 */}
          {editingStatusId === 'new' && (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newStatusColor}
                  onChange={(e) => setNewStatusColor(e.target.value)}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="输入状态名称"
                />
                <button
                  onClick={handleAddStatus}
                  disabled={!newStatusName.trim()}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  添加
                </button>
                <button
                  onClick={() => setEditingStatusId(null)}
                  className={`px-3 py-2 text-sm rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 优先级配置 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            优先级设置
          </h3>
          <button
            onClick={() => {
              setNewPriorityName('');
              setNewPriorityColor('#F59E0B');
              setEditingPriorityId('new');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
              isDark
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <FiPlus className="w-4 h-4" />
            添加优先级
          </button>
        </div>
        
        <div className="space-y-3">
          {customPriorities.map((priority) => (
            <div key={priority.id} className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
              {editingPriorityId === priority.id ? (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    defaultValue={priority.color}
                    onChange={(e) => setNewPriorityColor(e.target.value)}
                    className="w-8 h-8 rounded border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue={priority.name}
                    onChange={(e) => setNewPriorityName(e.target.value)}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="优先级名称"
                  />
                  <button
                    onClick={() => handleUpdatePriority(priority.id, newPriorityName || priority.name, newPriorityColor)}
                    className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingPriorityId(null)}
                    className={`px-3 py-2 text-sm rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: priority.color }}
                    ></div>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {priority.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPriorityId(priority.id);
                        setNewPriorityName(priority.name);
                        setNewPriorityColor(priority.color);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark
                          ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                    {customPriorities.length > 2 && (
                      <button
                        onClick={() => handleDeletePriority(priority.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark
                            ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                            : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* 添加新优先级表单 */}
          {editingPriorityId === 'new' && (
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newPriorityColor}
                  onChange={(e) => setNewPriorityColor(e.target.value)}
                  className="w-8 h-8 rounded border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={newPriorityName}
                  onChange={(e) => setNewPriorityName(e.target.value)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="输入优先级名称"
                />
                <button
                  onClick={handleAddPriority}
                  disabled={!newPriorityName.trim()}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  添加
                </button>
                <button
                  onClick={() => setEditingPriorityId(null)}
                  className={`px-3 py-2 text-sm rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 配置说明 */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
        <h4 className={`font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          配置说明
        </h4>
        <div className="space-y-2 text-sm">
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            • 自定义的状态和优先级仅适用于当前项目
          </div>
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            • 至少需要保留2个状态和2个优先级
          </div>
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            • 删除状态或优先级前，请确保没有任务正在使用
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染通知设置页面
  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {/* 通知类型设置 */}
      <div>
        <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          通知类型
        </h3>
        <div className="space-y-4">
          {/* 任务截止日期提醒 */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  任务截止日期提醒
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  在任务即将到期时接收提醒
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('taskDeadlineReminder')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.taskDeadlineReminder ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.taskDeadlineReminder ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {notificationSettings.taskDeadlineReminder && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  提前提醒时间
                </label>
                <select
                  value={notificationSettings.reminderBefore}
                  onChange={(e) => handleNotificationValueChange('reminderBefore', Number(e.target.value))}
                  className={`px-3 py-2 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value={1}>1小时前</option>
                  <option value={6}>6小时前</option>
                  <option value={24}>1天前</option>
                  <option value={48}>2天前</option>
                  <option value={168}>1周前</option>
                </select>
              </div>
            )}
          </div>

          {/* 任务状态变更 */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  任务状态变更
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  当任务状态发生变化时接收通知
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('taskStatusChange')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.taskStatusChange ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.taskStatusChange ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 任务分配 */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  任务分配通知
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  当有任务分配给我时接收通知
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('taskAssignment')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.taskAssignment ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.taskAssignment ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 项目更新 */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  项目更新通知
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  当项目信息发生变更时接收通知
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('projectUpdates')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.projectUpdates ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.projectUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 团队活动 */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  团队活动通知
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  当团队成员有活动时接收通知
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('teamActivity')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.teamActivity ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.teamActivity ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 通知渠道设置 */}
      <div>
        <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          通知渠道
        </h3>
        <div className="space-y-4">
          {/* 邮件通知 */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  邮件通知
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  通过邮件接收通知
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('emailNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.emailNotifications ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 应用内通知 */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  应用内通知
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  在应用内接收推送通知
                </div>
              </div>
              <button
                onClick={() => handleNotificationToggle('pushNotifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationSettings.pushNotifications ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 报告频率设置 */}
      <div>
        <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          项目报告
        </h3>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
          <div className="mb-3">
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              报告发送频率
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              自动生成并发送项目进度报告
            </div>
          </div>
          <select
            value={notificationSettings.reportFrequency}
            onChange={(e) => handleNotificationValueChange('reportFrequency', e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="never">从不发送</option>
            <option value="daily">每日发送</option>
            <option value="weekly">每周发送</option>
            <option value="monthly">每月发送</option>
          </select>
        </div>
      </div>

      {/* 设置说明 */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
        <h4 className={`font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          通知说明
        </h4>
        <div className="space-y-2 text-sm">
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            • 通知设置仅适用于当前项目
          </div>
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            • 邮件通知可能有延迟，请及时查看应用内通知
          </div>
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            • 关闭通知可能导致错过重要信息
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染高级设置页面
  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      {/* 项目归档 */}
      <div>
        <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          项目管理
        </h3>
        <div className="space-y-4">
          {/* 归档项目 */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <FiArchive className={`w-5 h-5 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    归档项目
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    归档项目不会删除数据，但会隐藏项目。可以随时恢复。
                  </div>
                </div>
              </div>
              <button
                onClick={() => setConfirmingAction('archive')}
                disabled={isLoading}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                } disabled:opacity-50`}
              >
                归档
              </button>
            </div>
          </div>

          {/* 转移项目 */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <FiRefreshCw className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    转移项目所有权
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    将项目所有权转移给其他用户。您将失去项目的完全控制权。
                  </div>
                </div>
              </div>
              <button
                onClick={() => setConfirmingAction('transfer')}
                disabled={isLoading}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                } disabled:opacity-50`}
              >
                转移
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 危险操作 */}
      <div>
        <h3 className={`text-lg font-medium mb-4 ${isDark ? 'text-red-400' : 'text-red-600'} flex items-center`}>
          <FiAlertTriangle className="w-5 h-5 mr-2" />
          危险操作
        </h3>
        <div className="space-y-4">
          {/* 删除项目 */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <FiTrash2 className={`w-5 h-5 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                <div>
                  <div className={`font-medium ${isDark ? 'text-red-400' : 'text-red-900'}`}>
                    永久删除项目
                  </div>
                  <div className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'} mt-1`}>
                    一旦删除，项目的所有数据将无法恢复。请谨慎操作。
                  </div>
                </div>
              </div>
              <button
                onClick={() => setConfirmingAction('delete')}
                disabled={isLoading}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  isDark
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                } disabled:opacity-50`}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 确认对话框 */}
      {confirmingAction && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50`}>
          <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full`}>
            {confirmingAction === 'archive' && (
              <>
                <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  确认归档项目
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  归档后项目将被隐藏，但可以随时恢复。确定要归档项目"{project?.name}"吗？
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleArchiveProject}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {isLoading ? '归档中...' : '确认归档'}
                  </button>
                  <button
                    onClick={() => setConfirmingAction(null)}
                    disabled={isLoading}
                    className={`flex-1 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    取消
                  </button>
                </div>
              </>
            )}

            {confirmingAction === 'transfer' && (
              <>
                <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  转移项目所有权
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  请输入接收者的邮箱地址。转移后您将失去项目的完全控制权。
                </p>
                <input
                  type="email"
                  value={transferTargetEmail}
                  onChange={(e) => setTransferTargetEmail(e.target.value)}
                  placeholder="接收者邮箱"
                  className={`w-full px-3 py-2 mb-4 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleTransferProject}
                    disabled={isLoading || !transferTargetEmail.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? '转移中...' : '确认转移'}
                  </button>
                  <button
                    onClick={() => {
                      setConfirmingAction(null);
                      setTransferTargetEmail('');
                    }}
                    disabled={isLoading}
                    className={`flex-1 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    取消
                  </button>
                </div>
              </>
            )}

            {confirmingAction === 'delete' && (
              <>
                <h3 className={`text-lg font-medium mb-3 ${isDark ? 'text-red-400' : 'text-red-900'}`}>
                  永久删除项目
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  删除后所有数据将无法恢复。请输入项目名称"{project?.name}"以确认删除。
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={`请输入：${project?.name}`}
                  className={`w-full px-3 py-2 mb-4 text-sm rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteProject}
                    disabled={isLoading || deleteConfirmText !== project?.name}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isLoading ? '删除中...' : '永久删除'}
                  </button>
                  <button
                    onClick={() => {
                      setConfirmingAction(null);
                      setDeleteConfirmText('');
                    }}
                    disabled={isLoading}
                    className={`flex-1 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                  >
                    取消
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // 渲染开发中的标签页
  const renderComingSoon = (tabName: string) => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`text-6xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
        🚧
      </div>
      <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
        {tabName}功能开发中
      </h3>
      <p className={`text-sm text-center max-w-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        此功能正在开发中，敬请期待。我们会尽快为您带来更多强大的项目管理功能。
      </p>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && project && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          />

          {/* 弹框内容 */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className={`relative transform overflow-hidden rounded-2xl ${
                isDark ? 'bg-gray-900' : 'bg-white'
              } text-left shadow-xl transition-all w-full max-w-4xl max-h-[90vh]`}
              style={{
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1), 0 1px 6px rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* 弹框头部 */}
              <div className={`flex justify-between items-center px-6 pt-5 pb-4 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <h2 className={`text-lg font-semibold flex items-center gap-2.5 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  <FiSettings className="h-5 w-5 text-blue-500" />
                  项目设置
                </h2>
                <button
                  type="button"
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                    isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                  onClick={onClose}
                  disabled={isLoading}
                  aria-label="关闭"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="flex">
                {/* 左侧标签栏 */}
                <div className={`w-48 flex-shrink-0 border-r ${
                  isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
                }`}>
                  <nav className="p-4 space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as SettingsTab)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                            isActive
                              ? isDark
                                ? 'bg-blue-600 text-white'
                                : 'bg-blue-50 text-blue-700'
                              : isDark
                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* 右侧内容区域 */}
                <div className="flex-1 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="p-6">
                    {/* 状态消息 */}
                    {error && (
                      <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                      </div>
                    )}
                    {successMessage && (
                      <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                        {successMessage}
                      </div>
                    )}

                    {/* 根据当前标签页渲染内容 */}
                    {activeTab === 'basic' && renderBasicSettings()}
                    {activeTab === 'members' && renderMembersSettings()}
                    {activeTab === 'workflow' && renderTaskSettings()}
                    {activeTab === 'preferences' && renderNotificationSettings()}
                    {activeTab === 'danger' && renderAdvancedSettings()}
                  </div>
                </div>
              </div>

              {/* 底部操作栏 */}
              <div className={`flex justify-end items-center gap-3 px-6 py-4 border-t ${
                isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
              }`}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                  }`}
                >
                  取消
                </button>
                
                {activeTab === 'basic' && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading || !formData.name.trim()}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    保存更改
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectSettingsModal;