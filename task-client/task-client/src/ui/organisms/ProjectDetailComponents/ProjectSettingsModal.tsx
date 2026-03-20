'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSettings, FiX, FiInfo, FiUsers, FiTrash2, FiPlus, FiEdit3, FiBell, FiArchive, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { useTheme } from '@/ui/theme';
import { ProjectDetailResponse, ProjectMember } from '@/types/api-types';
import { useProjectHook } from '@/hooks/use-project-hook';
import { useProjectMembers } from '@/hooks/use-project-members-hook';

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

  const handleNotificationValueChange = (
    setting: keyof typeof notificationSettings,
    value: (typeof notificationSettings)[keyof typeof notificationSettings]
  ) => {
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
    { id: 'basic', label: '基本信息', icon: FiInfo, description: '名称、描述与标签' },
    { id: 'members', label: '成员权限', icon: FiUsers, description: '角色与协作权限' },
    { id: 'workflow', label: '任务配置', icon: FiSettings, description: '状态与优先级规则' },
    { id: 'preferences', label: '通知设置', icon: FiBell, description: '提醒渠道与频率' },
    { id: 'danger', label: '危险操作', icon: FiTrash2, description: '归档、转移与删除' }
  ];

  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const memberRoleStats = {
    owner: members.filter((member) => member.role === 'OWNER').length,
    admin: members.filter((member) => member.role === 'ADMIN').length,
    member: members.filter((member) => member.role === 'MEMBER').length
  };

  const shellClass = isDark
    ? 'border-slate-800 bg-slate-950 text-white'
    : 'border-slate-200 bg-slate-50 text-slate-900';
  const sectionCardClass = isDark
    ? 'rounded-[28px] border border-slate-800 bg-slate-900 shadow-[0_20px_60px_rgba(2,8,23,0.35)]'
    : 'rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.08)]';
  const subtleCardClass = isDark
    ? 'rounded-3xl border border-slate-800 bg-slate-950'
    : 'rounded-3xl border border-slate-200 bg-slate-50';
  const inputClass = isDark
    ? 'w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition duration-200 focus:border-blue-400/70 focus:ring-4 focus:ring-blue-500/15'
    : 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-400/70 focus:ring-4 focus:ring-blue-500/10';
  const selectClass = isDark
    ? 'rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition duration-200 focus:border-blue-400/70 focus:ring-4 focus:ring-blue-500/15'
    : 'rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 focus:border-blue-400/70 focus:ring-4 focus:ring-blue-500/10';
  const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(37,99,235,0.34)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0';
  const secondaryButtonClass = isDark
    ? 'inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition duration-200 hover:bg-slate-800 disabled:opacity-50'
    : 'inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-50 disabled:opacity-50';
  const labelClass = isDark ? 'mb-2 block text-sm font-semibold text-slate-200' : 'mb-2 block text-sm font-semibold text-slate-700';
  const helperTextClass = isDark ? 'text-sm text-slate-400' : 'text-sm text-slate-500';
  const titleClass = isDark ? 'text-lg font-semibold text-white' : 'text-lg font-semibold text-slate-900';

  const getToggleTrackClass = (enabled: boolean) => `${
    enabled
      ? 'bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_8px_24px_rgba(59,130,246,0.35)]'
      : isDark
        ? 'bg-white/10'
        : 'bg-slate-200'
  } relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-4 ${
    enabled ? 'focus:ring-blue-500/20' : 'focus:ring-slate-400/20'
  }`;

  // 渲染基本信息设置
  const renderBasicSettings = () => (
    <div className="space-y-5">
      <div className={`${sectionCardClass} relative overflow-hidden p-6 md:p-7`}>
        <div className={`absolute inset-0 ${isDark ? 'bg-[linear-gradient(135deg,#0f172a_0%,#111827_55%,#172554_100%)]' : 'bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_45%,#eef2ff_100%)]'}`} />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-white/10 text-blue-100' : 'bg-white text-blue-700 shadow-sm'}`}>
              项目基础信息
            </div>
            <div>
              <h3 className={`text-[32px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                让项目信息更清晰，协作更顺手
              </h3>
              <p className={`mt-3 max-w-2xl text-sm leading-7 ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
                用更简洁的内容层级展示项目名称、访问范围和标签状态，让团队一眼就能理解这个项目是什么、谁可以看、该如何分类。
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[360px]">
            {[
              { label: '可见范围', value: formData.visibility === 'PUBLIC' ? '公开' : '私有' },
              { label: '项目标签', value: `${formData.tags.length} 个` },
              { label: '描述状态', value: formData.description.trim() ? '已完善' : '待补充' }
            ].map((item) => (
              <div
                key={item.label}
                className={`${isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.06)]'} flex h-28 flex-col justify-between rounded-[24px] border px-4 py-4`}
              >
                <div className={`text-xs font-semibold uppercase tracking-[0.08em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</div>
                <div className="text-2xl font-semibold tracking-tight">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.32fr)_minmax(360px,0.88fr)]">
        <div className={`${sectionCardClass} relative overflow-hidden p-6 md:p-7`}>
          <div className={`absolute inset-x-0 top-0 h-28 ${isDark ? 'bg-gradient-to-r from-blue-950 to-slate-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`} />
          <div className="relative">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-blue-500/15 text-blue-100' : 'bg-blue-50 text-blue-700'}`}>内容编辑</div>
                <h4 className={`mt-4 text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>项目内容</h4>
                <p className={`mt-2 text-sm leading-7 ${helperTextClass}`}>先把项目名字和描述写清楚，成员进入项目时就能立刻理解这个项目的目标、边界和协作方式。</p>
              </div>

              <div className={`rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-slate-700 bg-slate-950 text-slate-300' : 'border-slate-200 bg-white text-slate-600 shadow-sm'}`}>
                已填写 {formData.description.trim() ? '2/2' : '1/2'} 项
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className={`rounded-[24px] border p-5 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>项目名称</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={inputClass}
                      placeholder="请输入项目名称"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>项目描述</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={7}
                      className={`${inputClass} min-h-[220px] resize-none leading-7`}
                      placeholder="补充项目目标、交付范围、协作说明等内容"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 content-start">
                <div className={`rounded-[24px] border p-4 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white shadow-sm'}`}>
                  <div className={`text-xs font-semibold uppercase tracking-[0.08em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>当前名称</div>
                  <div className={`mt-3 text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formData.name || '未命名项目'}</div>
                </div>
                <div className={`rounded-[24px] border p-4 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white shadow-sm'}`}>
                  <div className={`text-xs font-semibold uppercase tracking-[0.08em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>内容建议</div>
                  <div className={`mt-3 text-sm leading-7 ${helperTextClass}`}>建议写清楚业务背景、目标产出、参与角色和时间范围。</div>
                </div>
                <div className={`rounded-[24px] border p-4 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white shadow-sm'}`}>
                  <div className={`text-xs font-semibold uppercase tracking-[0.08em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>描述状态</div>
                  <div className={`mt-3 text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formData.description.trim() ? '已完善' : '待补充'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 content-start">
          <div className={`${sectionCardClass} relative overflow-hidden p-6`}>
            <div className={`absolute inset-x-0 top-0 h-24 ${isDark ? 'bg-gradient-to-r from-emerald-950 to-slate-900' : 'bg-gradient-to-r from-emerald-50 to-cyan-50'}`} />
            <div className="relative">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-emerald-500/15 text-emerald-100' : 'bg-emerald-50 text-emerald-700'}`}>访问控制</div>
                  <h4 className={`mt-4 text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>可见性</h4>
                  <p className={`mt-2 text-sm leading-7 ${helperTextClass}`}>控制项目面向哪些人开放，是否适合跨团队协作。</p>
                </div>
                <button
                  type="button"
                  onClick={handleVisibilityToggle}
                  className={getToggleTrackClass(formData.visibility === 'PUBLIC')}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${
                      formData.visibility === 'PUBLIC' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className={`rounded-[24px] border p-5 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {formData.visibility === 'PUBLIC' ? '公开项目' : '私有项目'}
                    </div>
                    <div className={`mt-2 text-sm leading-7 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {formData.visibility === 'PUBLIC'
                        ? '团队成员默认可见，适合开放协作和共享信息。'
                        : '只有项目成员可见，适合敏感或核心事项。'}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${formData.visibility === 'PUBLIC' ? (isDark ? 'bg-emerald-500/15 text-emerald-200' : 'bg-emerald-50 text-emerald-700') : (isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-700')}`}>
                    {formData.visibility === 'PUBLIC' ? '公开协作' : '私密访问'}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className={`rounded-2xl border p-4 ${formData.visibility === 'PRIVATE' ? (isDark ? 'border-blue-500/30 bg-slate-950 text-white' : 'border-blue-200 bg-blue-50 text-slate-900') : (isDark ? 'border-slate-800 bg-slate-950 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600')}`}>
                  <div className="text-sm font-semibold">私有访问</div>
                  <div className="mt-2 text-xs leading-6 opacity-80">仅项目成员可见</div>
                </div>
                <div className={`rounded-2xl border p-4 ${formData.visibility === 'PUBLIC' ? (isDark ? 'border-emerald-500/30 bg-slate-950 text-white' : 'border-emerald-200 bg-emerald-50 text-slate-900') : (isDark ? 'border-slate-800 bg-slate-950 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600')}`}>
                  <div className="text-sm font-semibold">公开访问</div>
                  <div className="mt-2 text-xs leading-6 opacity-80">团队默认可见</div>
                </div>
              </div>

              <div className={`mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-xs ${isDark ? 'border border-slate-800 bg-slate-950 text-slate-400' : 'border border-slate-200 bg-slate-50 text-slate-500'}`}>
                <FiInfo className="h-3.5 w-3.5 shrink-0" />
                更改可见性后需要保存才能正式生效
              </div>
            </div>
          </div>

          <div className={`${sectionCardClass} relative overflow-hidden p-6`}>
            <div className={`absolute inset-x-0 top-0 h-24 ${isDark ? 'bg-gradient-to-r from-violet-950 to-slate-900' : 'bg-gradient-to-r from-violet-50 to-blue-50'}`} />
            <div className="relative">
              <div className="mb-5">
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-violet-500/15 text-violet-100' : 'bg-violet-50 text-violet-700'}`}>标签系统</div>
                <h4 className={`mt-4 text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>项目标签</h4>
                <p className={`mt-2 text-sm leading-7 ${helperTextClass}`}>通过标签标记业务域、优先级或归属团队，方便后续检索与筛选。</p>
              </div>

              <div className={`mb-4 min-h-[210px] rounded-[24px] border p-4 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                {formData.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isDark ? 'bg-violet-500/15 text-violet-100' : 'bg-violet-50 text-violet-700'}`}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className={`rounded-full transition-colors ${isDark ? 'text-violet-200 hover:text-white' : 'text-violet-500 hover:text-violet-700'}`}
                          aria-label={`删除标签 ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${isDark ? 'bg-violet-500/10 text-violet-200' : 'bg-violet-50 text-violet-600'}`}>#</div>
                    <div className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>还没有项目标签</div>
                    <div className={`mt-2 max-w-[240px] text-sm leading-7 ${helperTextClass}`}>输入标签后回车或点击按钮，即可把项目快速归类。</div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="例如：设计系统、核心项目、市场部"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || formData.tags.includes(tagInput.trim())}
                  className={primaryButtonClass}
                >
                  添加标签
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染成员权限管理
  const renderMembersSettings = () => (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: '项目成员', value: members.length, hint: '当前参与协作的人数' },
          { label: '管理员', value: memberRoleStats.admin, hint: '可以管理设置与成员' },
          { label: '普通成员', value: memberRoleStats.member, hint: '专注任务执行与推进' }
        ].map((item) => (
          <div key={item.label} className={`${sectionCardClass} flex h-[160px] flex-col justify-between p-5`}>
            <div className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</div>
            <div className={`mt-3 text-3xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</div>
            <div className={`mt-2 text-sm ${helperTextClass}`}>{item.hint}</div>
          </div>
        ))}
      </div>

      <div className={`${sectionCardClass} flex h-[360px] flex-col overflow-hidden p-6 md:p-7`}>
        <div className="mb-6 flex shrink-0 flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className={titleClass}>成员与角色</h3>
            <p className={`mt-2 ${helperTextClass}`}>更清晰地查看成员身份、负责任务与权限边界。</p>
          </div>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${isDark ? 'bg-white/[0.05] text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
            所有者 {memberRoleStats.owner} · 管理员 {memberRoleStats.admin}
          </div>
        </div>

        {membersLoading ? (
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {[1, 2, 3].map((item) => (
              <div key={item} className={`${subtleCardClass} min-h-[132px] animate-pulse p-4`}>
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                  <div className="flex-1 space-y-2">
                    <div className={`h-4 w-36 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                    <div className={`h-3 w-28 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                  </div>
                  <div className={`h-10 w-28 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : members.length > 0 ? (
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {members.map((member) => (
              <div key={member.id} className={`${subtleCardClass} min-h-[132px] p-4 transition duration-200 hover:-translate-y-0.5`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-2xl p-[2px] ${isDark ? 'bg-gradient-to-br from-blue-400/60 to-indigo-500/20' : 'bg-gradient-to-br from-blue-200 to-indigo-100'}`}>
                      <img
                        src={member.avatar || '/default-avatar.png'}
                        alt={member.name}
                        className="h-12 w-12 rounded-2xl object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                    </div>

                    <div>
                      <div className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{member.name}</div>
                      <div className={`mt-1 text-sm ${helperTextClass}`}>{member.email}</div>
                      <div className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${isDark ? 'bg-white/[0.06] text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        负责 {member.taskCount} 个任务
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as ProjectMember['role'])}
                      disabled={member.role === 'OWNER' || isLoading}
                      className={`${selectClass} min-w-[148px] ${member.role === 'OWNER' ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <option value="OWNER">{getRoleDisplayName('OWNER')}</option>
                      <option value="ADMIN">{getRoleDisplayName('ADMIN')}</option>
                      <option value="MEMBER">{getRoleDisplayName('MEMBER')}</option>
                    </select>

                    {member.role !== 'OWNER' && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.name)}
                        disabled={isLoading}
                        className={`inline-flex items-center justify-center rounded-2xl border px-3 py-3 transition ${isDark ? 'border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/15' : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'} disabled:opacity-50`}
                        title="移除成员"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className={`mt-4 border-t pt-4 text-sm ${isDark ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                  {getRoleDescription(member.role)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`${subtleCardClass} flex flex-1 items-center justify-center p-10 text-center`}>
            <FiUsers className={`mx-auto mb-4 h-12 w-12 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`text-base font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>暂无项目成员</p>
            <p className={`mt-2 ${helperTextClass}`}>邀请成员后，这里会展示角色信息与协作数据。</p>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { role: '所有者', desc: '拥有项目完全控制权，不可直接修改。', tone: isDark ? 'bg-amber-500/10 text-amber-200 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200' },
          { role: '管理员', desc: '可以管理成员、设置和日常协作规范。', tone: isDark ? 'bg-blue-500/10 text-blue-200 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200' },
          { role: '普通成员', desc: '聚焦任务执行、更新状态与推进交付。', tone: isDark ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200' }
        ].map((item) => (
          <div key={item.role} className={`flex h-[156px] flex-col rounded-3xl border p-5 ${item.tone}`}>
            <div className="text-sm font-semibold">{item.role}</div>
            <p className="mt-2 text-sm leading-6 opacity-90">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // 渲染任务配置页面
  const renderTaskSettings = () => {
    return (
      <div className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.28fr)_minmax(340px,0.82fr)]">
          <div className={`${sectionCardClass} relative overflow-hidden p-6 md:p-7`}>
            <div className={`absolute inset-x-0 top-0 h-28 ${isDark ? 'bg-gradient-to-r from-blue-950 to-slate-900' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`} />
            <div className="relative">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-blue-500/15 text-blue-100' : 'bg-blue-50 text-blue-700'}`}>状态管理</div>
                  <h3 className={`mt-4 text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>任务状态</h3>
                  <p className={`mt-2 text-sm leading-7 ${helperTextClass}`}>定义团队推进任务时的阶段名称，让所有人对流程的理解保持一致。</p>
                </div>

                <button
                  onClick={() => {
                    setNewStatusName('');
                    setNewStatusColor('#3B82F6');
                    setEditingStatusId('new');
                  }}
                  className={primaryButtonClass}
                >
                  <FiPlus className="w-4 h-4" />
                  添加状态
                </button>
              </div>

              <div className={`rounded-[24px] border p-4 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                  {customStatuses.map((status) => (
                    <div key={status.id} className={`${subtleCardClass} min-h-[76px] p-4`}>
                      {editingStatusId === status.id ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            defaultValue={status.color}
                            onChange={(e) => setNewStatusColor(e.target.value)}
                            className="h-8 w-8 cursor-pointer rounded border-0"
                          />
                          <input
                            type="text"
                            defaultValue={status.name}
                            onChange={(e) => setNewStatusName(e.target.value)}
                            className={`${inputClass} flex-1 py-2`}
                            placeholder="状态名称"
                          />
                          <button
                            onClick={() => handleUpdateStatus(status.id, newStatusName || status.name, newStatusColor)}
                            className="rounded-2xl bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => setEditingStatusId(null)}
                            className={secondaryButtonClass}
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: status.color }} />
                            <div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{status.name}</div>
                              <div className={`mt-1 text-xs ${helperTextClass}`}>流程阶段 #{status.order}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingStatusId(status.id);
                                setNewStatusName(status.name);
                                setNewStatusColor(status.color);
                              }}
                              className={`rounded-xl p-2 transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-900 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                            >
                              <FiEdit3 className="h-4 w-4" />
                            </button>
                            {customStatuses.length > 2 && (
                              <button
                                onClick={() => handleDeleteStatus(status.id)}
                                className={`rounded-xl p-2 transition-colors ${isDark ? 'text-red-400 hover:bg-red-950/30 hover:text-red-300' : 'text-red-500 hover:bg-red-50 hover:text-red-600'}`}
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {editingStatusId === 'new' && (
                    <div className={`${subtleCardClass} p-4`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={newStatusColor}
                          onChange={(e) => setNewStatusColor(e.target.value)}
                          className="h-8 w-8 cursor-pointer rounded border-0"
                        />
                        <input
                          type="text"
                          value={newStatusName}
                          onChange={(e) => setNewStatusName(e.target.value)}
                          className={`${inputClass} flex-1 py-2`}
                          placeholder="输入状态名称"
                        />
                        <button
                          onClick={handleAddStatus}
                          disabled={!newStatusName.trim()}
                          className="rounded-2xl bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          添加
                        </button>
                        <button onClick={() => setEditingStatusId(null)} className={secondaryButtonClass}>取消</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 content-start">
            <div className={`${sectionCardClass} relative overflow-hidden p-6`}>
              <div className={`absolute inset-x-0 top-0 h-24 ${isDark ? 'bg-gradient-to-r from-amber-950 to-slate-900' : 'bg-gradient-to-r from-amber-50 to-orange-50'}`} />
              <div className="relative">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-amber-500/15 text-amber-100' : 'bg-amber-50 text-amber-700'}`}>优先级规则</div>
                    <h3 className={`mt-4 text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>优先级设置</h3>
                    <p className={`mt-2 text-sm leading-7 ${helperTextClass}`}>帮助团队快速区分任务紧急程度和处理顺序。</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewPriorityName('');
                      setNewPriorityColor('#F59E0B');
                      setEditingPriorityId('new');
                    }}
                    className={`${primaryButtonClass} shrink-0 self-start whitespace-nowrap px-4`}
                  >
                    <FiPlus className="w-4 h-4" />
                    添加优先级
                  </button>
                </div>

                <div className={`rounded-[24px] border p-4 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="max-h-[280px] space-y-3 overflow-y-auto pr-1">
                    {customPriorities.map((priority) => (
                      <div key={priority.id} className={`${subtleCardClass} min-h-[76px] p-4`}>
                        {editingPriorityId === priority.id ? (
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              defaultValue={priority.color}
                              onChange={(e) => setNewPriorityColor(e.target.value)}
                              className="h-8 w-8 cursor-pointer rounded border-0"
                            />
                            <input
                              type="text"
                              defaultValue={priority.name}
                              onChange={(e) => setNewPriorityName(e.target.value)}
                              className={`${inputClass} flex-1 py-2`}
                              placeholder="优先级名称"
                            />
                            <button
                              onClick={() => handleUpdatePriority(priority.id, newPriorityName || priority.name, newPriorityColor)}
                              className="rounded-2xl bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                            >
                              保存
                            </button>
                            <button onClick={() => setEditingPriorityId(null)} className={secondaryButtonClass}>取消</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: priority.color }} />
                              <div>
                                <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{priority.name}</div>
                                <div className={`mt-1 text-xs ${helperTextClass}`}>优先级 #{priority.order}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingPriorityId(priority.id);
                                  setNewPriorityName(priority.name);
                                  setNewPriorityColor(priority.color);
                                }}
                                className={`rounded-xl p-2 transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-900 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                              >
                                <FiEdit3 className="h-4 w-4" />
                              </button>
                              {customPriorities.length > 2 && (
                                <button
                                  onClick={() => handleDeletePriority(priority.id)}
                                  className={`rounded-xl p-2 transition-colors ${isDark ? 'text-red-400 hover:bg-red-950/30 hover:text-red-300' : 'text-red-500 hover:bg-red-50 hover:text-red-600'}`}
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {editingPriorityId === 'new' && (
                      <div className={`${subtleCardClass} p-4`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={newPriorityColor}
                            onChange={(e) => setNewPriorityColor(e.target.value)}
                            className="h-8 w-8 cursor-pointer rounded border-0"
                          />
                          <input
                            type="text"
                            value={newPriorityName}
                            onChange={(e) => setNewPriorityName(e.target.value)}
                            className={`${inputClass} flex-1 py-2`}
                            placeholder="输入优先级名称"
                          />
                          <button
                            onClick={handleAddPriority}
                            disabled={!newPriorityName.trim()}
                            className="rounded-2xl bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            添加
                          </button>
                          <button onClick={() => setEditingPriorityId(null)} className={secondaryButtonClass}>取消</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${sectionCardClass} p-5`}>
              <h4 className={titleClass}>配置说明</h4>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className={`${subtleCardClass} p-4`}>
                  <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>当前状态数</div>
                  <div className={`mt-2 text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{customStatuses.length}</div>
                </div>
                <div className={`${subtleCardClass} p-4`}>
                  <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>当前优先级数</div>
                  <div className={`mt-2 text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{customPriorities.length}</div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>• 自定义状态和优先级仅适用于当前项目</div>
                <div className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>• 至少需要保留 2 个状态和 2 个优先级</div>
                <div className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>• 删除前请确认没有任务仍在使用该配置</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染通知设置页面
  const renderNotificationSettings = () => {
    const notificationTypeItems = [
      {
        key: 'taskDeadlineReminder' as const,
        title: '任务截止日期提醒',
        description: '在任务即将到期时接收提醒',
        extra: notificationSettings.taskDeadlineReminder ? (
          <div className={`mt-4 border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <label className={labelClass}>提前提醒时间</label>
            <select
              value={notificationSettings.reminderBefore}
              onChange={(e) => handleNotificationValueChange('reminderBefore', Number(e.target.value))}
              className={`w-full ${selectClass}`}
            >
              <option value={1}>1 小时前</option>
              <option value={6}>6 小时前</option>
              <option value={24}>1 天前</option>
              <option value={48}>2 天前</option>
              <option value={168}>1 周前</option>
            </select>
          </div>
        ) : null
      },
      {
        key: 'taskStatusChange' as const,
        title: '任务状态变更',
        description: '当任务状态发生变化时接收通知'
      },
      {
        key: 'taskAssignment' as const,
        title: '任务分配通知',
        description: '当有任务分配给我时接收通知'
      },
      {
        key: 'projectUpdates' as const,
        title: '项目更新通知',
        description: '当项目信息发生变更时接收通知'
      },
      {
        key: 'teamActivity' as const,
        title: '团队活动通知',
        description: '当团队成员有活动时接收通知'
      }
    ];

    return (
      <div className="space-y-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <div className={`${sectionCardClass} relative overflow-hidden p-6 md:p-7`}>
            <div className={`absolute inset-x-0 top-0 h-28 ${isDark ? 'bg-gradient-to-r from-violet-950 to-slate-900' : 'bg-gradient-to-r from-violet-50 to-blue-50'}`} />
            <div className="relative">
              <div className="mb-6 max-w-2xl">
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-violet-500/15 text-violet-100' : 'bg-violet-50 text-violet-700'}`}>通知类型</div>
                <h3 className={`mt-4 text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>通知设置</h3>
                <p className={`mt-2 text-sm leading-7 ${helperTextClass}`}>决定你希望接收哪些消息，避免打扰过多，同时不遗漏关键协作信息。</p>
              </div>

              <div className={`rounded-[24px] border p-4 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {notificationTypeItems.map((item) => (
                    <div key={item.key} className={`${subtleCardClass} p-4`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</div>
                          <div className={`mt-1 text-sm ${helperTextClass}`}>{item.description}</div>
                        </div>
                        <button
                          onClick={() => handleNotificationToggle(item.key)}
                          className={getToggleTrackClass(Boolean(notificationSettings[item.key]))}
                        >
                          <span
                            className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${
                              notificationSettings[item.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      {item.extra}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 content-start">
            <div className={`${sectionCardClass} relative overflow-hidden p-6`}>
              <div className={`absolute inset-x-0 top-0 h-24 ${isDark ? 'bg-gradient-to-r from-sky-950 to-slate-900' : 'bg-gradient-to-r from-sky-50 to-cyan-50'}`} />
              <div className="relative">
                <div className="mb-5">
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-sky-500/15 text-sky-100' : 'bg-sky-50 text-sky-700'}`}>通知渠道</div>
                  <h3 className={`mt-4 text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>通知渠道</h3>
                  <p className={`mt-2 text-sm leading-7 ${helperTextClass}`}>选择你希望通过什么方式接收项目消息。</p>
                </div>

                <div className="space-y-3">
                  <div className={`${subtleCardClass} p-4`}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>邮件通知</div>
                        <div className={`mt-1 text-sm ${helperTextClass}`}>通过邮件接收项目消息</div>
                      </div>
                      <button onClick={() => handleNotificationToggle('emailNotifications')} className={getToggleTrackClass(notificationSettings.emailNotifications)}>
                        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>

                  <div className={`${subtleCardClass} p-4`}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>应用内通知</div>
                        <div className={`mt-1 text-sm ${helperTextClass}`}>在应用内接收实时提醒</div>
                      </div>
                      <button onClick={() => handleNotificationToggle('pushNotifications')} className={getToggleTrackClass(notificationSettings.pushNotifications)}>
                        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${sectionCardClass} p-5`}>
              <h4 className={titleClass}>项目报告</h4>
              <div className={`mt-2 text-sm ${helperTextClass}`}>自动生成并发送项目进度报告</div>
              <select
                value={notificationSettings.reportFrequency}
                onChange={(e) => handleNotificationValueChange('reportFrequency', e.target.value)}
                className={`mt-4 w-full ${selectClass}`}
              >
                <option value="never">从不发送</option>
                <option value="daily">每日发送</option>
                <option value="weekly">每周发送</option>
                <option value="monthly">每月发送</option>
              </select>
            </div>

            <div className={`${sectionCardClass} p-5`}>
              <h4 className={titleClass}>通知说明</h4>
              <div className="mt-4 space-y-2 text-sm">
                <div className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>• 通知设置仅适用于当前项目</div>
                <div className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>• 邮件通知可能有延迟，请及时查看应用内通知</div>
                <div className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>• 关闭通知可能导致错过重要信息</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染高级设置页面
  const renderAdvancedSettings = () => (
    <div className="space-y-5">
      {/* 项目归档 */}
      <div>
        <h3 className={`${titleClass} mb-4`}>
          项目管理
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* 归档项目 */}
          <div className={`${sectionCardClass} flex h-[176px] flex-col justify-between p-5`}>
            <div className="flex items-start justify-between gap-4">
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
                className={`px-4 py-2 text-sm rounded-2xl transition-colors ${
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
          <div className={`${sectionCardClass} flex h-[176px] flex-col justify-between p-5`}>
            <div className="flex items-start justify-between gap-4">
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
                className={`px-4 py-2 text-sm rounded-2xl transition-colors ${
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
        <h3 className={`mb-4 flex items-center text-lg font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          <FiAlertTriangle className="w-5 h-5 mr-2" />
          危险操作
        </h3>
        <div className="grid gap-4">
          {/* 删除项目 */}
          <div className={`flex h-[176px] flex-col justify-between rounded-[28px] border p-5 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start justify-between gap-4">
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
                className={`px-4 py-2 text-sm rounded-2xl transition-colors ${
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
                  归档后项目将被隐藏，但可以随时恢复。确定要归档项目“{project?.name}”吗？
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
                  删除后所有数据将无法恢复。请输入项目名称“{project?.name}”以确认删除。
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
            className="fixed inset-0 bg-[rgba(15,23,42,0.55)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          />

          {/* 弹框内容 */}
          <div className="flex min-h-full items-center justify-center p-4 md:p-6">
            <motion.div
              className={`relative h-[min(860px,92vh)] w-[min(1240px,calc(100vw-32px))] overflow-hidden rounded-[32px] border text-left transition-all md:w-[min(1240px,calc(100vw-48px))] ${shellClass}`}
              style={{
                boxShadow: '0 32px 120px rgba(15, 23, 42, 0.22)'
              }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className={`absolute inset-0 ${isDark ? 'bg-[linear-gradient(180deg,#020617_0%,#0f172a_100%)]' : 'bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]'}`} />

              <div className="relative flex h-full min-h-0 flex-col lg:flex-row">
                <aside className={`w-full shrink-0 border-b p-5 lg:h-full lg:w-[300px] lg:border-b-0 lg:border-r lg:p-6 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
                  <div className="mb-6 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-500 to-indigo-500 text-lg font-semibold text-white shadow-[0_16px_34px_rgba(37,99,235,0.28)]">
                        {project.name?.slice(0, 1).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <div className={`text-xs font-semibold uppercase tracking-[0.2em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          Project Settings
                        </div>
                        <h2 className={`mt-1 text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>项目设置</h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`${secondaryButtonClass} h-10 w-10 rounded-2xl p-0`}
                      onClick={onClose}
                      disabled={isLoading}
                      aria-label="关闭"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>

                  <div className={`${sectionCardClass} mb-5 overflow-hidden p-4`}>
                    <div className="space-y-3">
                      <div>
                        <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formData.name || project.name}</div>
                        <div className={`mt-1 text-sm leading-6 ${helperTextClass}`}>
                          {formData.description?.trim() || project.description?.trim() || '补充项目简介，让团队更容易理解目标与边界。'}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${formData.visibility === 'PUBLIC' ? (isDark ? 'bg-emerald-500/15 text-emerald-200' : 'bg-emerald-50 text-emerald-700') : (isDark ? 'bg-slate-500/15 text-slate-300' : 'bg-slate-100 text-slate-700')}`}>
                          {formData.visibility === 'PUBLIC' ? '公开项目' : '私有项目'}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-white/[0.06] text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          ID · {project.id.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as SettingsTab)}
                          className={`flex h-[84px] w-full items-center rounded-3xl px-4 text-left transition duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 text-white shadow-[0_16px_36px_rgba(37,99,235,0.28)]'
                              : isDark
                                ? 'text-slate-300 hover:bg-slate-900 hover:text-white'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex w-full items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? 'bg-white/15 text-white' : isDark ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-slate-100 text-slate-600'}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold">{tab.label}</div>
                              <div className={`mt-1 line-clamp-2 text-xs leading-5 ${isActive ? 'text-blue-50/90' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {tab.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </aside>

                <div className="flex h-full min-h-0 flex-1 flex-col">
                  <div className={`border-b px-6 py-5 md:px-8 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>当前分组</div>
                        <h3 className={`mt-1 text-2xl font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeTabMeta.label}</h3>
                        <p className={`mt-2 max-w-2xl text-sm leading-6 ${helperTextClass}`}>{activeTabMeta.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${isDark ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-white text-slate-600 shadow-sm border border-slate-200'}`}>
                          共 {tabs.length} 个设置分组
                        </span>
                        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${isDark ? 'bg-blue-500/10 text-blue-200' : 'bg-blue-50 text-blue-700'}`}>
                          已连接当前项目
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-8">
                    {error && (
                      <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-red-500/20 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}>
                        {error}
                      </div>
                    )}
                    {successMessage && (
                      <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                        {successMessage}
                      </div>
                    )}

                    {activeTab === 'basic' && renderBasicSettings()}
                    {activeTab === 'members' && renderMembersSettings()}
                    {activeTab === 'workflow' && renderTaskSettings()}
                    {activeTab === 'preferences' && renderNotificationSettings()}
                    {activeTab === 'danger' && renderAdvancedSettings()}
                  </div>
                  <div className={`flex flex-col gap-3 border-t px-6 py-4 md:flex-row md:items-center md:justify-between md:px-8 ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
                    <div className={`text-sm ${helperTextClass}`}>
                      {activeTab === 'basic' ? '基础信息修改后会同步更新当前项目展示。' : '当前页为配置视图，可继续切换其他分组。'}
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className={secondaryButtonClass}
                      >
                        取消
                      </button>

                      {activeTab === 'basic' && (
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isLoading || !formData.name.trim()}
                          className={primaryButtonClass}
                        >
                          {isLoading && (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          )}
                          保存更改
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectSettingsModal;
