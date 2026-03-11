'use client';

import {PriorityItem} from '@/types/api-types';

/**
 * 标准优先级体系
 * 包含高、中、低三个优先级
 */
export const STANDARD_PRIORITY_ITEMS: PriorityItem[] = [
  {
    id: 'priority-high',
    name: '高优先级',
    color: '#F44336', // 红色
    order: 1
  },
  {
    id: 'priority-medium',
    name: '中优先级',
    color: '#FF9800', // 橙色
    order: 2
  },
  {
    id: 'priority-low',
    name: '低优先级',
    color: '#2196F3', // 蓝色
    order: 3
  }
];

/**
 * 高级优先级体系
 * 包含紧急、重要、普通、次要、低优先级五个级别
 */
export const ADVANCED_PRIORITY_ITEMS: PriorityItem[] = [
  {
    id: 'priority-urgent',
    name: '紧急',
    color: '#F44336', // 红色
    order: 1
  },
  {
    id: 'priority-important',
    name: '重要',
    color: '#E91E63', // 深粉色
    order: 2
  },
  {
    id: 'priority-normal',
    name: '普通',
    color: '#FF9800', // 橙色
    order: 3
  },
  {
    id: 'priority-minor',
    name: '次要',
    color: '#2196F3', // 蓝色
    order: 4
  },
  {
    id: 'priority-low',
    name: '低优先级',
    color: '#4CAF50', // 绿色
    order: 5
  }
];

/**
 * 根据优先级体系类型获取对应的优先级项列表
 */
export const getPriorityItemsBySystem = (system: string): PriorityItem[] => {
  switch (system) {
    case 'standard':
      return STANDARD_PRIORITY_ITEMS;
    case 'advanced':
      return ADVANCED_PRIORITY_ITEMS;
    default:
      return [];
  }
};
