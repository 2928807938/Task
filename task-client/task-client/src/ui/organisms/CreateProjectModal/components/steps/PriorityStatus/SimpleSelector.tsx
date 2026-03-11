'use client';

import React from 'react';
import {UseFormReturn} from 'react-hook-form';
import {CreateProjectRequest} from '@/types/api-types';
import usePriorityStatusStep from './hooks/usePriorityStatusStep';

interface SimpleSelectorProps {
  form: UseFormReturn<CreateProjectRequest>;
}

const SimpleSelector: React.FC<SimpleSelectorProps> = ({ form }) => {
  const ps = usePriorityStatusStep(form);

  return (
    <div className="space-y-8 px-2">
      <div>
        <h6 className="text-base font-medium mb-3">选择优先级体系</h6>
        <div className="flex space-x-4">
          <button
            type="button"
            className={`px-6 py-2 rounded-md text-sm ${
              ps.prioritySystem === 'standard' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => ps.setPrioritySystem('standard')}
          >
            标准
          </button>
          <button
            type="button"
            className={`px-6 py-2 rounded-md text-sm ${
              ps.prioritySystem === 'advanced' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => ps.setPrioritySystem('advanced')}
          >
            高级
          </button>
          <button
            type="button"
            className={`px-6 py-2 rounded-md text-sm ${
              ps.prioritySystem === 'custom' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => ps.setPrioritySystem('custom')}
          >
            自定义
          </button>
        </div>
      </div>

      <div>
        <h6 className="text-base font-medium mb-3">选择状态流程体系</h6>
        <div className="flex space-x-4">
          <button
            type="button"
            className={`px-6 py-2 rounded-md text-sm ${
              ps.statusSystem === 'standard' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => ps.setStatusSystem('standard')}
          >
            标准
          </button>
          <button
            type="button"
            className={`px-6 py-2 rounded-md text-sm ${
              ps.statusSystem === 'extended' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => ps.setStatusSystem('extended')}
          >
            扩展
          </button>
          <button
            type="button"
            className={`px-6 py-2 rounded-md text-sm ${
              ps.statusSystem === 'custom' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
            onClick={() => ps.setStatusSystem('custom')}
          >
            自定义
          </button>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 mt-6">
        <p className="text-sm text-blue-700">
          完成此设置后，您创建的项目将使用您选择的优先级体系和状态流程。您随时可以在项目设置中修改这些配置。
        </p>
      </div>
    </div>
  );
};

export default SimpleSelector;
