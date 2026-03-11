"use client";

import React, {useState} from 'react';
import {SubmitHandler, useForm} from 'react-hook-form';
import {AnimatePresence, motion} from 'framer-motion';
import {
    FaArrowLeft,
    FaArrowRight,
    FaCalendarAlt,
    FaCheck,
    FaChevronDown,
    FaClipboard,
    FaEnvelope,
    FaEye,
    FaInfoCircle,
    FaLink,
    FaPhone,
    FaRedo,
    FaShieldAlt,
    FaUser
} from 'react-icons/fa';
import {HiOutlineOfficeBuilding} from 'react-icons/hi';
import {MdPeopleAlt} from 'react-icons/md';
import {BsPersonVcard} from 'react-icons/bs';

// 定义表单数据类型
interface InviteMemberFormData {
  email: string;
  name: string;
  phone: string;
}

interface SystemRole {
  systemName: string;
  role: string;
  icon?: React.ReactNode;
}

interface PermissionFormData {
  selectedSystems: string[];
  systemRoles: SystemRole[];
}

interface SystemInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  roles: string[];
  defaultRole: string;
}

interface LinkSettings {
  validDays: string;
  usageLimit: string;
}

export function InviteMemberTemplate() {
  const { register, handleSubmit, formState: { errors } } = useForm<InviteMemberFormData>();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [basicInfo, setBasicInfo] = useState<InviteMemberFormData | null>(null);
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [systemRoles, setSystemRoles] = useState<SystemRole[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [linkSettings, setLinkSettings] = useState<LinkSettings>({
    validDays: '7 天',
    usageLimit: '单次'
  });

  // 系统数据
  const systems: SystemInfo[] = [
    {
      id: 'finance',
      name: '企业财务管理系统',
      icon: <HiOutlineOfficeBuilding className="text-info-600 dark:text-info-500" />,
      roles: ['系统管理员', '财务经理', '财务专员', '只读用户'],
      defaultRole: '系统管理员'
    },
    {
      id: 'hr',
      name: '人力资源平台',
      icon: <MdPeopleAlt className="text-success-600 dark:text-success-500" />,
      roles: ['人事经理', '招聘专员', '培训专员', '只读用户'],
      defaultRole: '人事经理'
    },
    {
      id: 'crm',
      name: '客户关系管理系统',
      icon: <BsPersonVcard className="text-primary-600 dark:text-primary-500" />,
      roles: ['销售经理', '客户经理', '市场专员', '只读用户'],
      defaultRole: '销售经理'
    }
  ];

  const onSubmit: SubmitHandler<InviteMemberFormData> = (data) => {
    // 保存基本信息并进入下一步
    setBasicInfo(data);
    setCurrentStep(2);
  };

  const handleSystemSelect = (systemName: string) => {
    const system = systems.find(s => s.name === systemName);

    if (!system) return;

    if (selectedSystems.includes(systemName)) {
      setSelectedSystems(selectedSystems.filter(name => name !== systemName));
      setSystemRoles(systemRoles.filter(role => role.systemName !== systemName));
    } else {
      setSelectedSystems([...selectedSystems, systemName]);
      setSystemRoles([...systemRoles, {
        systemName,
        role: system.defaultRole,
        icon: system.icon
      }]);
    }
  };

  const handleRoleChange = (systemName: string, role: string) => {
    const updatedRoles = systemRoles.map(item =>
      item.systemName === systemName ? { ...item, role } : item
    );
    setSystemRoles(updatedRoles);
  };

  const handleSendInvitation = () => {
    setIsSubmitting(true);

    // 模拟API调用
    const invitationData = {
      ...basicInfo,
      permissions: {
        selectedSystems,
        systemRoles
      }
    };

    // 模拟网络请求
    setTimeout(() => {
      setIsSubmitting(false);
      // 进入第三步
      setCurrentStep(3);
      // 生成随机邀请链接
      setGeneratedLink(`https://team.com/join/${Math.random().toString(36).substring(2, 8)}`);
    }, 1500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink)
      .then(() => {
        alert('链接已复制到剪贴板');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  const handleShareByEmail = () => {
    // 模拟邮件分享功能
    alert(`邀请链接已通过邮件发送至 ${basicInfo?.email}`);
  };

  const handleClose = () => {
    // 重置表单并返回第一步
    setCurrentStep(1);
    setSelectedSystems([]);
    setSystemRoles([]);
    setGeneratedLink('');
    setShowSuccess(true);

    // 3秒后关闭成功提示
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleLinkSettingChange = (setting: 'validDays' | 'usageLimit', value: string) => {
    setLinkSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-indigo-50 to-blue-50 p-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-card-bg rounded-2xl shadow-xl overflow-hidden border border-card-border dark:border-neutral-700">

        {/* 移除了卡片顶部装饰 */}
        <div className="p-4">
          <h2 className="text-lg font-bold text-center text-neutral-800 dark:text-neutral-100 mb-1">邀请新成员</h2>
          <p className="text-center text-neutral-500 dark:text-neutral-400 text-xs mb-3">添加团队成员，提升协作效率</p>

          {/* 步骤指示器 */}
          <div className="flex items-center justify-center mb-4 relative">
            {/* 连接线 */}
            <div className="absolute top-1/2 left-1/4 right-1/4 h-1 bg-neutral-200 dark:bg-neutral-700 -translate-y-1/2 z-0"></div>

            {/* 步骤1 */}
            <div className="flex flex-col items-center z-10 w-1/3">
              <motion.div
                initial={false}
                animate={{
                  scale: currentStep === 1 ? 1.1 : 1,
                  backgroundColor: currentStep === 1 ? '#4F46E5' : currentStep > 1 ? '#10B981' : '#E5E7EB'
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 shadow-md`}
              >
                {currentStep > 1 ? (
                  <FaCheck className="text-white" />
                ) : (
                  <span className="text-white font-medium">1</span>
                )}
              </motion.div>
              <span className={`text-xs font-medium ${currentStep === 1 ? 'text-primary-600 dark:text-primary-400' : currentStep > 1 ? 'text-success-600 dark:text-success-400' : 'text-neutral-500 dark:text-neutral-400'}`}>基本信息</span>
            </div>

            {/* 步骤2 */}
            <div className="flex flex-col items-center z-10 w-1/3">
              <motion.div
                initial={false}
                animate={{
                  scale: currentStep === 2 ? 1.1 : 1,
                  backgroundColor: currentStep === 2 ? '#4F46E5' : currentStep > 2 ? '#10B981' : '#E5E7EB'
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 shadow-md`}
              >
                {currentStep > 2 ? (
                  <FaCheck className="text-white" />
                ) : (
                  <span className={`${currentStep >= 2 ? 'text-white' : 'text-gray-500'} font-medium`}>2</span>
                )}
              </motion.div>
              <span className={`text-xs font-medium ${currentStep === 2 ? 'text-primary-600 dark:text-primary-400' : currentStep > 2 ? 'text-success-600 dark:text-success-400' : 'text-neutral-500 dark:text-neutral-400'}`}>分配权限</span>
            </div>

            {/* 步骤3 */}
            <div className="flex flex-col items-center z-10 w-1/3">
              <motion.div
                initial={false}
                animate={{
                  scale: currentStep === 3 ? 1.1 : 1,
                  backgroundColor: currentStep === 3 ? '#4F46E5' : currentStep > 3 ? '#10B981' : '#E5E7EB'
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all duration-300 shadow-md`}
              >
                <span className={`${currentStep >= 3 ? 'text-white' : 'text-gray-500'} font-medium`}>3</span>
              </motion.div>
              <span className={`text-xs font-medium ${currentStep === 3 ? 'text-primary-600 dark:text-primary-400' : currentStep > 3 ? 'text-success-600 dark:text-success-400' : 'text-neutral-500 dark:text-neutral-400'}`}>生成链接</span>
            </div>
          </div>

        {currentStep === 1 && (
          <AnimatePresence mode="wait">
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit(onSubmit)}
              className="px-8 pb-10 space-y-8"
            >
              {/* 邮箱输入框 */}
              <div className="relative">
                <label htmlFor="email" className="flex items-center text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-0.5">
                  <FaEnvelope className="mr-2 text-indigo-500" />
                  邮箱
                </label>
                <div className="relative group">
                  <input
                    id="email"
                    {...register('email', {
                      required: '邮箱不能为空',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: '请输入有效的邮箱地址'
                      }
                    })}
                    type="email"
                    className="w-full py-2 px-3 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-200 bg-neutral-50 dark:bg-neutral-800 group-hover:bg-white dark:group-hover:bg-neutral-700 text-sm"
                    placeholder="请输入人员邮箱地址"
                  />
                </div>
                <div className="mt-1 text-xs text-red-500 h-6 flex items-center">
                  {errors.email && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center"
                    >
                      <FaInfoCircle className="mr-1" /> {errors.email.message}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* 姓名输入框 */}
              <div className="relative">
                <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="mr-2 text-indigo-500" />
                  姓名
                </label>
                <div className="relative group">
                  <input
                    id="name"
                    {...register('name', { required: '姓名不能为空' })}
                    type="text"
                    className="w-full py-2 px-3 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-200 bg-neutral-50 dark:bg-neutral-800 group-hover:bg-white dark:group-hover:bg-neutral-700 text-sm"
                    placeholder="请输入人员姓名"
                  />
                </div>
                <div className="mt-1 text-xs text-red-500 h-6 flex items-center">
                  {errors.name && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center"
                    >
                      <FaInfoCircle className="mr-1" /> {errors.name.message}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* 手机输入框 */}
              <div className="relative">
                <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <FaPhone className="mr-2 text-indigo-500" />
                  手机
                </label>
                <div className="relative group">
                  <input
                    id="phone"
                    {...register('phone', {
                      required: '手机号不能为空',
                      pattern: {
                        value: /^1[3-9]\d{9}$/,
                        message: '请输入有效的手机号码'
                      }
                    })}
                    type="tel"
                    className="w-full py-2 px-3 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent transition-all duration-200 bg-neutral-50 dark:bg-neutral-800 group-hover:bg-white dark:group-hover:bg-neutral-700 text-sm"
                    placeholder="请输入手机号码"
                  />
                </div>
                <div className="mt-1 text-xs text-red-500 h-6 flex items-center">
                  {errors.phone && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center"
                    >
                      <FaInfoCircle className="mr-1" /> {errors.phone.message}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* 提示信息 */}
              <div className="flex items-center p-4 bg-info-50 dark:bg-info-900/20 border border-info-100 dark:border-info-800 rounded-lg mt-4">
                <FaInfoCircle className="text-info-500 dark:text-info-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-info-800 dark:text-info-300">邀请信息将发送至该邮箱，请确保邮箱地址正确</p>
                </div>
              </div>

              {/* 下一步按钮 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium rounded-lg transition duration-200 mt-6 flex items-center justify-center shadow-md"
              >
                下一步
                <FaArrowRight className="ml-2" />
              </motion.button>
            </motion.form>
          </AnimatePresence>
        )}

        {currentStep === 2 && (
          <AnimatePresence mode="wait">
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="px-8 pb-10 space-y-8"
            >
              {/* 选择项目 */}
              <div>
                <h3 className="flex items-center text-base font-medium text-gray-800 mb-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                    <FaShieldAlt className="text-indigo-600 text-sm" />
                  </div>
                  选择项目
                </h3>
                <div className="space-y-3">
                  {systems.map(system => (
                    <motion.div
                      key={system.id}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      className={`relative overflow-hidden cursor-pointer transition-all duration-200`}
                    >
                      <label
                        htmlFor={`system-${system.id}`}
                        className={`flex items-center p-4 ${selectedSystems.includes(system.name) 
                          ? 'bg-indigo-50 border-indigo-500 border-2' 
                          : 'bg-white border border-gray-200 hover:border-indigo-200'} 
                          rounded-lg cursor-pointer transition-all duration-200`}
                      >
                        <input
                          type="checkbox"
                          id={`system-${system.id}`}
                          className="sr-only"
                          checked={selectedSystems.includes(system.name)}
                          onChange={() => handleSystemSelect(system.name)}
                        />
                        <div className={`w-5 h-5 flex items-center justify-center mr-3 ${selectedSystems.includes(system.name) ? 'text-indigo-500' : 'text-gray-300'}`}>
                          <FaCheck className={`transition-all duration-300 ${selectedSystems.includes(system.name) ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                        </div>
                        <div className="flex-1 flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${selectedSystems.includes(system.name) ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                            {system.icon}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{system.name}</span>
                        </div>
                      </label>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* 分配角色 */}
              <div>
                <h3 className="flex items-center text-base font-medium text-gray-800 mb-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                    <FaUser className="text-indigo-600 text-sm" />
                  </div>
                  分配角色
                </h3>

                <div className="space-y-4">
                  {systemRoles.map((roleItem, index) => {
                    const system = systems.find(s => s.name === roleItem.systemName);
                    if (!system) return null;

                    return (
                      <motion.div
                        key={system.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center mr-3">
                              {system.icon}
                            </div>
                            <div>
                              <span className="font-medium text-gray-800">{roleItem.systemName}</span>
                              <p className="text-xs text-gray-500 mt-1">选择适合的角色权限</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <select
                                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 min-w-[140px]"
                                value={roleItem.role}
                                onChange={(e) => handleRoleChange(roleItem.systemName, e.target.value)}
                              >
                                {system.roles.map(role => (
                                  <option key={role}>{role}</option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <FaChevronDown className="w-4 h-4" />
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 py-2.5 px-4 rounded-lg transition-colors duration-200"
                            >
                              <FaEye className="w-4 h-4 mr-2" />
                              <span className="text-sm">权限预览</span>
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {selectedSystems.length === 0 && (
                    <div className="text-center py-10 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-600">
                      <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-3">
                        <FaInfoCircle className="text-neutral-400 dark:text-neutral-500 text-xl" />
                      </div>
                      <p className="text-neutral-500 dark:text-neutral-400 font-medium">请先选择至少一个项目系统</p>
                      <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-1">选择项目后可以分配相应的角色权限</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedSystems.length > 0 && (
                <div className="bg-info-50 dark:bg-info-900/20 border border-info-100 dark:border-info-800 rounded-lg p-4 mt-6 flex items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center mr-4">
                    <FaInfoCircle className="text-info-500 dark:text-info-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-info-800 dark:text-info-300 text-sm mb-1">权限提示</h4>
                    <p className="text-sm text-info-700 dark:text-info-400">被邀请人将获得所选系统的访问权限，请确保分配的角色符合安全策略</p>
                  </div>
                </div>
              )}

              {/* 导航按钮 */}
              <div className="flex space-x-4 mt-10 pt-4 border-t border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.02, x: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center justify-center py-3 px-6 border-2 border-indigo-500 text-indigo-600 font-medium rounded-xl transition duration-200 hover:bg-indigo-50 shadow-sm"
                >
                  <FaArrowLeft className="mr-2" /> 上一步
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendInvitation}
                  className="flex-1 flex items-center justify-center py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium rounded-xl transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedSystems.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      处理中...
                    </>
                  ) : (
                    <>
                      发送邀请 <FaArrowRight className="ml-2" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
        </div>

        {/* 成功提示 */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            >
              <div className="bg-white rounded-lg p-8 flex flex-col items-center max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <FaCheck className="text-green-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">邀请已发送</h3>
                <p className="text-gray-600 text-center mb-4">邀请链接已发送至用户邮箱，等待用户确认</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 第三步：生成邀请链接 */}
        {currentStep === 3 && (
          <AnimatePresence mode="wait">
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="px-8 pb-10 space-y-8"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">生成邀请链接</h3>
                <p className="text-gray-500 text-sm mb-4">设置邀请链接的有效期和使用限制</p>
              </div>

              {/* 权限配置区域 */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaShieldAlt className="text-blue-600 text-sm" />
                  </div>
                  <h4 className="text-base font-medium text-gray-700">权限配置</h4>
                </div>

                <div className="space-y-3 mb-2">
                  {/* 数据分析平台 */}
                  {systemRoles.some(role => role.systemName.includes('数据') || role.systemName.includes('财务')) && (
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
                      <div className="flex items-center">
                        <span className="text-sm">数据分析平台：</span>
                      </div>
                      <a href="#" className="text-indigo-600 text-sm hover:underline">[详发]</a>
                    </div>
                  )}

                  {/* 用户管理系统 */}
                  {systemRoles.some(role => role.systemName.includes('人力') || role.systemName.includes('用户')) && (
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
                      <div className="flex items-center">
                        <span className="text-sm">用户管理系统：</span>
                      </div>
                      <a href="#" className="text-indigo-600 text-sm hover:underline">[浏览者]</a>
                    </div>
                  )}

                  {/* 客户关系管理 */}
                  {systemRoles.some(role => role.systemName.includes('客户')) && (
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
                      <div className="flex items-center">
                        <span className="text-sm">客户关系管理：</span>
                      </div>
                      <a href="#" className="text-indigo-600 text-sm hover:underline">[浏览者]</a>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1">点击可修改</p>
              </div>

              <div className="border-t border-gray-200 my-2"></div>

              {/* 链接设置区域 */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaLink className="text-blue-600 text-sm" />
                  </div>
                  <h4 className="text-base font-medium text-gray-700">链接设置</h4>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* 有效期 */}
                  <div>
                    <div className="flex items-center mb-2">
                      <FaCalendarAlt className="text-indigo-500 mr-2" />
                      <label className="text-sm font-medium text-gray-600">有效期:</label>
                    </div>
                    <div className="relative">
                      <select
                        className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        value={linkSettings.validDays}
                        onChange={(e) => handleLinkSettingChange('validDays', e.target.value)}
                      >
                        <option>1 天</option>
                        <option>3 天</option>
                        <option>7 天</option>
                        <option>30 天</option>
                        <option>永久</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <FaChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* 使用次数 */}
                  <div>
                    <div className="flex items-center mb-2">
                      <FaRedo className="text-indigo-500 mr-2" />
                      <label className="text-sm font-medium text-gray-600">使用次数:</label>
                    </div>
                    <div className="relative">
                      <select
                        className="appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                        value={linkSettings.usageLimit}
                        onChange={(e) => handleLinkSettingChange('usageLimit', e.target.value)}
                      >
                        <option>单次</option>
                        <option>3次</option>
                        <option>5次</option>
                        <option>10次</option>
                        <option>不限</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                        <FaChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 my-2"></div>

              {/* 生成结果区域 */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaLink className="text-blue-600 text-sm" />
                  </div>
                  <h4 className="text-base font-medium text-gray-700">生成结果</h4>
                </div>

                <div>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
                    <p className="text-gray-700 font-mono">{generatedLink}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center justify-center py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition duration-200 shadow-sm"
                    >
                      <FaClipboard className="mr-2" /> 复制链接
                    </button>

                    <button
                      onClick={handleShareByEmail}
                      className="flex items-center justify-center py-3 px-5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition duration-200 shadow-sm"
                    >
                      <FaEnvelope className="mr-2" /> 分享到邮箱
                    </button>
                  </div>
                </div>
              </div>

              {/* 导航按钮 */}
              <div className="flex space-x-4 mt-8 pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02, x: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center justify-center py-3 px-6 border-2 border-indigo-500 text-indigo-600 font-medium rounded-xl transition duration-200 hover:bg-indigo-50 shadow-sm"
                >
                  <FaArrowLeft className="mr-2" /> 上一步
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="flex-1 flex items-center justify-center py-3 px-6 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium rounded-xl transition duration-200 shadow-md"
                >
                  完成 <FaCheck className="ml-2" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
