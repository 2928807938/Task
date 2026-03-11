'use client';

import React from 'react';
import {UseFormReturn} from 'react-hook-form';
import {CreateProjectRequest} from '@/types/api-types';
import ImprovedSelector from './PriorityStatus/ImprovedSelector';

interface PriorityStatusStepProps {
  form: UseFormReturn<CreateProjectRequest>;
}

/**
 * 项目优先级和状态流程设置组件
 * 使用改进的选择器组件，展示系统内置的优先级体系和流程体系的详细内容
 */
const PriorityStatusStep: React.FC<PriorityStatusStepProps> = ({ form }) => {
  return <ImprovedSelector form={form} />;
};

export default PriorityStatusStep;
