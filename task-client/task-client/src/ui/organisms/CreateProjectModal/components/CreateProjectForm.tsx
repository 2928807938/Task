'use client';

import React, {useState} from 'react';
import {motion} from 'framer-motion';
import {FiClipboard, FiFlag, FiFolder, FiList, FiPlus, FiX} from 'react-icons/fi';
import {Input} from '@/ui/atoms/Input/Input';

// 自定义优先级项类型
interface PriorityItem {
  id: string;
  name: string;
  color: string;
}

// 自定义状态项类型
interface StatusItem {
  id: string;
  name: string;
  color: string;
}

// 优先级体系类型
type PrioritySystem = 'high' | 'medium' | 'low' | 'custom';

// 状态体系类型
type StatusSystem = 'standard' | 'extended' | 'custom';

interface CreateProjectFormProps {
  register: any;
  errors: any;
  nameError: string | null;
  descriptionError: string | null;
  watch?: any;
  setValue?: any;
  defaultPrioritySystem?: PrioritySystem;
  defaultStatusSystem?: StatusSystem;
  onPrioritySystemChange?: (system: PrioritySystem) => void;
  onStatusSystemChange?: (system: StatusSystem) => void;
  customPriorityItems?: PriorityItem[];
  customStatusItems?: StatusItem[];
  onAddCustomPriority?: (item: PriorityItem) => void;
  onAddCustomStatus?: (item: StatusItem) => void;
  onRemoveCustomPriority?: (id: string) => void;
  onRemoveCustomStatus?: (id: string) => void;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  register,
  errors,
  nameError,
  descriptionError,
  watch,
  setValue,
  defaultPrioritySystem = 'medium',
  defaultStatusSystem = 'standard',
  onPrioritySystemChange,
  onStatusSystemChange,
  customPriorityItems = [],
  customStatusItems = [],
  onAddCustomPriority,
  onAddCustomStatus,
  onRemoveCustomPriority,
  onRemoveCustomStatus
}) => {
  // 本地状态管理
  const [showAddPriorityForm, setShowAddPriorityForm] = useState(false);
  const [showAddStatusForm, setShowAddStatusForm] = useState(false);
  const [newPriorityName, setNewPriorityName] = useState('');
  const [newStatusName, setNewStatusName] = useState('');

  // 添加新优先级
  const handleAddPriority = () => {
    if (!newPriorityName.trim() || !onAddCustomPriority) return;

    const newItem = {
      id: `p-${Date.now()}`,
      name: newPriorityName.trim(),
      color: `#${Math.floor(Math.random()*16777215).toString(16)}` // 随机颜色
    };

    onAddCustomPriority(newItem);
    setNewPriorityName('');
    setShowAddPriorityForm(false);
  };

  // 添加新状态
  const handleAddStatus = () => {
    if (!newStatusName.trim() || !onAddCustomStatus) return;

    const newItem = {
      id: `s-${Date.now()}`,
      name: newStatusName.trim(),
      color: `#${Math.floor(Math.random()*16777215).toString(16)}` // 随机颜色
    };

    onAddCustomStatus(newItem);
    setNewStatusName('');
    setShowAddStatusForm(false);
  };
  return (
    <div className="space-y-4">
      {/* 项目名称输入框 */}
      <div>
        <div className="flex items-center mb-2">
          <FiFolder className="text-blue-500 mr-2" />
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            项目名称
          </label>
        </div>
        <Input
          id="name"
          type="text"
          placeholder="项目名称"
          className={`w-full px-4 py-2.5 rounded-xl border ${
            errors.name || nameError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
          }`}
          {...register('name', { required: '项目名称不能为空' })}
        />
        <div className="text-red-500 text-xs mt-1 h-6 flex items-center">
          {(errors.name || nameError) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 text-red-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {nameError || errors.name?.message}
            </motion.div>
          )}
        </div>
      </div>

      {/* 项目描述输入框 */}
      <div>
        <div className="flex items-center mb-2">
          <FiClipboard className="text-blue-500 mr-2" />
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            项目描述
          </label>
          <span className="text-xs text-gray-500 ml-2">（选填）</span>
        </div>
        <textarea
          id="description"
          placeholder="描述这个项目的内容和目标..."
          className={`w-full px-4 py-2.5 rounded-xl border ${
            errors.description || descriptionError ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
          } min-h-[120px] resize-none`}
          {...register('description')}
        />
        <div className="text-red-500 text-xs mt-1 h-6 flex items-center">
          {(errors.description || descriptionError) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 text-red-500">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {descriptionError || errors.description?.message}
            </motion.div>
          )}
        </div>
      </div>

      {/* 默认优先级体系 */}
      <div>
        <div className="flex items-center mb-2">
          <FiFlag className="text-blue-500 mr-2" />
          <label className="block text-sm font-medium text-gray-700">
            默认优先级体系
          </label>
          <span className="ml-2 text-gray-400 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div
            className={`border rounded-xl p-3 cursor-pointer transition-all duration-200 ${
              defaultPrioritySystem === 'high' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
            onClick={() => onPrioritySystemChange && onPrioritySystemChange('high')}
          >
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm font-medium">高优先级</span>
            </div>
            <p className="text-xs text-gray-500">适用于紧急且重要的任务</p>
          </div>

          <div
            className={`border rounded-xl p-3 cursor-pointer transition-all duration-200 ${
              defaultPrioritySystem === 'medium' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
            onClick={() => onPrioritySystemChange && onPrioritySystemChange('medium')}
          >
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm font-medium">中优先级</span>
            </div>
            <p className="text-xs text-gray-500">适用于常规性任务(默认)</p>
          </div>

          <div
            className={`border rounded-xl p-3 cursor-pointer transition-all duration-200 ${
              defaultPrioritySystem === 'low' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
            onClick={() => onPrioritySystemChange && onPrioritySystemChange('low')}
          >
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm font-medium">低优先级</span>
            </div>
            <p className="text-xs text-gray-500">适用于可延后处理的任务</p>
          </div>

          <div
            className={`border rounded-xl p-3 cursor-pointer transition-all duration-200 ${
              defaultPrioritySystem === 'custom' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
            onClick={() => onPrioritySystemChange && onPrioritySystemChange('custom')}
          >
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
              <span className="text-sm font-medium">自定义优先级</span>
            </div>
            <p className="text-xs text-gray-500">创建自定义优先级体系</p>
          </div>
        </div>

        {/* 自定义优先级体系区域 */}
        {defaultPrioritySystem === 'custom' && (
          <div className="mt-3 p-3 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">自定义优先级项</span>
              <button
                type="button"
                className="inline-flex items-center px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                onClick={() => setShowAddPriorityForm(true)}
              >
                <FiPlus className="mr-1 h-3 w-3" />
                添加
              </button>
            </div>

            {/* 现有自定义优先级项列表 */}
            <div className="flex flex-wrap gap-2 mb-2">
              {customPriorityItems.map(item => (
                <div
                  key={item.id}
                  className="px-2 py-1 text-xs rounded flex items-center gap-1"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  {item.name}
                  <button
                    type="button"
                    className="ml-1 text-gray-400 hover:text-gray-600"
                    onClick={() => onRemoveCustomPriority && onRemoveCustomPriority(item.id)}
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {customPriorityItems.length === 0 && (
                <div className="text-xs text-gray-500 italic">尚未添加自定义优先级</div>
              )}
            </div>

            {/* 添加新优先级表单 */}
            {showAddPriorityForm && (
              <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                <input
                  type="text"
                  placeholder="输入优先级名称"
                  value={newPriorityName}
                  onChange={(e) => setNewPriorityName(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded mb-2"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                    onClick={() => setShowAddPriorityForm(false)}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleAddPriority}
                  >
                    添加
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 默认状态体系 */}
      <div>
        <div className="flex items-center mb-2">
          <FiList className="text-blue-500 mr-2" />
          <label className="block text-sm font-medium text-gray-700">
            默认状态体系
          </label>
          <span className="ml-2 text-gray-400 text-xs">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div
            className={`border rounded-xl p-3 cursor-pointer transition-all duration-200 ${
              defaultStatusSystem === 'standard' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
            onClick={() => onStatusSystemChange && onStatusSystemChange('standard')}
          >
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium">标准流程</span>
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">默认</span>
            </div>
            <div className="flex gap-1 mt-2">
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">等待中</span>
              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">进行中</span>
              <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">已逾期</span>
              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">已完成</span>
            </div>
          </div>

          <div
            className={`border rounded-xl p-3 cursor-pointer transition-all duration-200 ${
              defaultStatusSystem === 'extended' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
            onClick={() => onStatusSystemChange && onStatusSystemChange('extended')}
          >
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium">扩展流程</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">等待中</span>
              <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">已计划</span>
              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">进行中</span>
              <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">审核中</span>
              <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">已逾期</span>
              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">已完成</span>
            </div>
          </div>

          <div
            className={`border rounded-xl p-3 cursor-pointer transition-all duration-200 ${
              defaultStatusSystem === 'custom' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
            onClick={() => onStatusSystemChange && onStatusSystemChange('custom')}
          >
            <div className="flex items-center mb-1">
              <span className="text-sm font-medium">自定义流程</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">自定义状态流程</span>
            </div>
          </div>
        </div>

        {/* 自定义状态流程区域 */}
        {defaultStatusSystem === 'custom' && (
          <div className="mt-3 p-3 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">自定义状态项</span>
              <button
                type="button"
                className="inline-flex items-center px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                onClick={() => setShowAddStatusForm(true)}
              >
                <FiPlus className="mr-1 h-3 w-3" />
                添加
              </button>
            </div>

            {/* 现有自定义状态项列表 */}
            <div className="flex flex-wrap gap-2 mb-2">
              {customStatusItems.map(item => (
                <div
                  key={item.id}
                  className="px-2 py-1 text-xs rounded flex items-center gap-1"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  {item.name}
                  <button
                    type="button"
                    className="ml-1 text-gray-400 hover:text-gray-600"
                    onClick={() => onRemoveCustomStatus && onRemoveCustomStatus(item.id)}
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {customStatusItems.length === 0 && (
                <div className="text-xs text-gray-500 italic">尚未添加自定义状态</div>
              )}
            </div>

            {/* 添加新状态表单 */}
            {showAddStatusForm && (
              <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                <input
                  type="text"
                  placeholder="输入状态名称"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded mb-2"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                    onClick={() => setShowAddStatusForm(false)}
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleAddStatus}
                  >
                    添加
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProjectForm;
