'use client';

import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {AnimatePresence, motion} from 'framer-motion';
import {FiCheck, FiChevronLeft, FiChevronRight, FiX} from 'react-icons/fi';
import {CreateProjectRequest} from '@/types/api-types';
import {useProjectHook} from '@/hooks/use-project-hook';
import Button from '@/ui/atoms/Button';

// 步骤组件 - 从索引文件导入以解决模块解析问题
import {BasicInfoStep, PriorityStatusStep, TeamSelectionStep} from './components/steps';
import './styles.css';

// 动画变量
const variants = {
  enter: (direction: 'next' | 'prev') => ({
    x: direction === 'next' ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: 'next' | 'prev') => ({
    x: direction === 'next' ? -300 : 300,
    opacity: 0,
  }),
};

// 背景遮罩动画
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// 模态框动画
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.98,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};

// 创建项目模态窗口组件
export const CreateProjectModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}> = ({ isOpen, onClose, onSuccess }) => {
  // 表单状态
  const form = useForm<CreateProjectRequest>({
    defaultValues: {
      name: '',
      description: '',
      teamId: '',
      prioritySystem: 'standard',
      statusSystem: 'standard',
      customPriorityItems: [],
      customStatusItems: [],
      customStatusTransitions: []
    },
    mode: 'onChange' // 启用表单字段变更时验证
  });

  const { handleSubmit, reset, trigger, watch, formState: { errors, isValid, isDirty } } = form;

  // 多步骤状态
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const totalSteps = 3;

  // API hooks
  const { useCreateProject } = useProjectHook();
  const createProjectMutation = useCreateProject();
  const isCreatingProject = createProjectMutation.isPending;

  // 项目错误状态
  const [projectError, setProjectError] = useState<{name?: string; description?: string} | null>(null);

  // 处理步骤变更
  const handleStepChange = async (nextDirection: 'next' | 'prev') => {
    if (nextDirection === 'next') {
      // 验证当前步骤
      const fieldsToValidate = currentStep === 1
        ? ['name', 'description'] as const
        : currentStep === 2
          ? ['teamId'] as const
          : [] as const;

      if (fieldsToValidate.length > 0) {
        const isValid = await trigger(fieldsToValidate);
        if (!isValid) return;
      }

      if (currentStep < totalSteps) {
        setDirection('next');
        setCurrentStep(prev => prev + 1);
      }
    } else {
      if (currentStep > 1) {
        setDirection('prev');
        setCurrentStep(prev => prev - 1);
      }
    }
  };

  // 提交表单
  const onSubmit = async (data: CreateProjectRequest) => {
    try {
      // 准备API请求数据 - 根据新的API结构参数要求
      const prioritySystem = data.prioritySystem || 'standard';
      const statusSystem = data.statusSystem || 'standard';

      // 使用前端生成的临时ID对象
      const customPriorityItems = (data.customPriorityItems || []).map(item => ({
        ...item,
        // 确保使用现有的ID，因为状态转换规则需要引用这些ID
        id: item.id || `priority-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      }));

      // 处理自定义状态项，确保 ID 和其他属性正确
      const customStatusItems = (data.customStatusItems || []).map(item => {
        // 创建新的状态对象
        const statusItem: any = {
          ...item,
          // 确保使用现有的ID，因为状态转换规则需要引用这些ID
          id: item.id || `status-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        };

        // 添加 isTerminal 属性（后端需要的字段）
        // 使用 any 类型避免 TypeScript 类型检查错误
        // 如果已存在该属性，则使用该值，否则默认为 false
        statusItem.isTerminal = (item as any).isTerminal || false;

        return statusItem;
      });

      const customStatusTransitions = (data.customStatusTransitions || []).map(rule => ({
        fromStatusId: rule.fromStatusId,
        toStatusId: rule.toStatusId
      }));

      // 根据新的API结构创建请求对象
      const projectRequest = {
        name: data.name.trim(),
        description: data.description.trim(),
        teamId: data.teamId,
        prioritySystem: prioritySystem,
        statusSystem: statusSystem,
        customPriorityItems: customPriorityItems,
        customStatusItems: customStatusItems,
        customStatusTransitions: customStatusTransitions
      };

      const project = await createProjectMutation.mutateAsync(projectRequest);

      if (onSuccess && project?.id) {
        onSuccess(project.id);
      }

      // 重置表单并关闭模态框
      reset();
      setCurrentStep(1);
      onClose();
    } catch (error: any) {
      console.error('创建项目失败:', error);
      if (error.response?.data?.message) {
        setProjectError(error.response.data.message);
      } else if (typeof error.message === 'string') {
        setProjectError({ name: error.message });
      }
    }
  };

  // 关闭模态框时重置表单
  useEffect(() => {
    if (!isOpen) {
      reset();
      setCurrentStep(1);
      setProjectError(null);
    }
  }, [isOpen, reset]);

  // 不显示时返回 null
  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={onClose}
          />

          {/* 模态框 */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <div
              className="rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                boxShadow: 'var(--theme-shadow-lg)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--theme-card-border)' }}>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-medium" style={{ color: 'var(--foreground)' }}>创建新项目</h2>
                  <div className="flex items-center space-x-1 ml-2">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                      <div
                        key={index}
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: index + 1 === currentStep 
                            ? 'var(--theme-primary-500)' 
                            : index + 1 < currentStep 
                              ? 'var(--theme-primary-300)' 
                              : 'var(--theme-neutral-200)'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="transition-colors p-1 rounded-full"
                  style={{
                    color: 'var(--theme-neutral-500)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--theme-neutral-700)';
                    e.currentTarget.style.backgroundColor = 'var(--theme-neutral-100)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--theme-neutral-500)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* 内容 */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 }
                    }}
                  >
                    {currentStep === 1 && (
                      <BasicInfoStep
                        form={form}
                        projectError={projectError}
                      />
                    )}
                    {currentStep === 2 && (
                      <TeamSelectionStep form={form} />
                    )}
                    {currentStep === 3 && (
                      <PriorityStatusStep form={form} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* 底部按钮 */}
              <div className="px-6 py-4 border-t flex justify-between" style={{ borderColor: 'var(--theme-card-border)' }}>
                {currentStep > 1 ? (
                  <Button
                    variant="secondary"
                    onClick={() => handleStepChange('prev')}
                    className="flex items-center"
                  >
                    <FiChevronLeft className="w-4 h-4 mr-1" />
                    上一步
                  </Button>
                ) : (
                  <div></div>
                )}

                {currentStep < totalSteps ? (
                  <Button
                    variant="primary"
                    onClick={() => handleStepChange('next')}
                    className="flex items-center"
                  >
                    下一步
                    <FiChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isCreatingProject}
                    className="flex items-center"
                  >
                    {isCreatingProject ? '创建中...' : '创建项目'}
                    {!isCreatingProject && <FiCheck className="w-4 h-4 ml-1" />}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateProjectModal;
