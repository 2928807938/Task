'use client';

import React from 'react';
import {UseFormReturn} from 'react-hook-form';
import {motion} from 'framer-motion';
import {FiClipboard, FiFolder} from 'react-icons/fi';
import {Input} from '@/ui/atoms/Input/Input';
import {CreateProjectRequest} from '@/types/api-types';

interface BasicInfoStepProps {
  form: UseFormReturn<CreateProjectRequest>;
  projectError: {name?: string; description?: string} | null;
}

/**
 * 项目创建的第一步 - 基本信息
 */
const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ form, projectError }) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>项目基本信息</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--theme-neutral-500)' }}>填写项目的名称和描述</p>
      </div>

      {/* 项目名称 */}
      <div className="space-y-2">
        <div className="flex items-center">
          <FiFolder className="mr-2" style={{ color: 'var(--theme-primary-500)' }} />
          <label htmlFor="name" className="block text-sm font-medium" style={{ color: 'var(--theme-neutral-700)' }}>
            项目名称
          </label>
        </div>
        <Input
          id="name"
          type="text"
          placeholder="输入项目名称"
          className="rounded-xl"
          style={{
            borderColor: errors.name || projectError?.name ? 'var(--theme-error-200)' : undefined
          }}
          {...register('name', {
            required: '项目名称不能为空',
            minLength: {
              value: 2,
              message: '项目名称至少需要两个字'
            }
          })}
        />
        <div className="text-xs mt-1 h-6 flex items-center">
          {(errors.name || projectError?.name) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center"
              style={{ color: 'var(--theme-error-500)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5" style={{ color: 'var(--theme-error-500)' }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {projectError?.name || errors.name?.message}
            </motion.div>
          )}
        </div>
      </div>

      {/* 项目描述 */}
      <div className="space-y-2">
        <div className="flex items-center">
          <FiClipboard className="mr-2" style={{ color: 'var(--theme-primary-500)' }} />
          <label htmlFor="description" className="block text-sm font-medium" style={{ color: 'var(--theme-neutral-700)' }}>
            项目描述
          </label>
          <span className="text-xs ml-2" style={{ color: 'var(--theme-neutral-500)' }}>（选填）</span>
        </div>
        <textarea
          id="description"
          placeholder="描述这个项目的内容和目标..."
          className="w-full px-4 py-2.5 rounded-xl border min-h-[150px] resize-none focus:ring-2 focus:outline-none transition-colors"
          style={{
            borderColor: errors.description || projectError?.description ? 'var(--theme-error-200)' : 'var(--theme-neutral-300)',
            backgroundColor: 'var(--theme-card-bg)',
            color: 'var(--foreground)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = errors.description || projectError?.description ? 'var(--theme-error-500)' : 'var(--theme-primary-500)';
            e.target.style.boxShadow = `0 0 0 2px var(--theme-primary-100)`;
          }}
          {...register('description', {
            onBlur: (e) => {
              e.target.style.borderColor = errors.description || projectError?.description ? 'var(--theme-error-200)' : 'var(--theme-neutral-300)';
              e.target.style.boxShadow = 'none';
            }
          })}
        />
        <div className="text-xs mt-1 h-6 flex items-center">
          {(errors.description || projectError?.description) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center"
              style={{ color: 'var(--theme-error-500)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5" style={{ color: 'var(--theme-error-500)' }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {projectError?.description || errors.description?.message}
            </motion.div>
          )}
        </div>
      </div>

      {/* 提示信息 */}
      <div className="rounded-xl p-4 mt-4" style={{ backgroundColor: 'var(--theme-primary-50)' }}>
        <p className="text-sm" style={{ color: 'var(--theme-primary-700)' }}>
          在下一步中，您将选择团队并设置项目的优先级和状态流程体系。
        </p>
      </div>
    </div>
  );
};

export default BasicInfoStep;
