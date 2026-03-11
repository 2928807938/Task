'use client';

import {StatusItem, StatusTransitionRule} from '@/types/api-types';

/**
 * 标准状态流程体系
 * 包含筹划中、进行中、已暂停、已完成、已取消五个状态
 */
export const STANDARD_STATUS_ITEMS: StatusItem[] = [
  {
    id: 'status-planning',
    name: '筹划中',
    color: '#9C27B0', // 紫色
    order: 1
  },
  {
    id: 'status-in-progress',
    name: '进行中',
    color: '#4CAF50', // 绿色
    order: 2
  },
  {
    id: 'status-paused',
    name: '已暂停',
    color: '#FFC107', // 黄色
    order: 3
  },
  {
    id: 'status-completed',
    name: '已完成',
    color: '#2196F3', // 蓝色
    order: 4
  },
  {
    id: 'status-cancelled',
    name: '已取消',
    color: '#FF9800', // 橙色
    order: 5
  }
];

/**
 * 标准状态流程的转换规则
 */
export const STANDARD_STATUS_TRANSITIONS: StatusTransitionRule[] = [
  // 从筹划中可以转换到：进行中、已暂停、已取消
  { fromStatusId: 'status-planning', toStatusId: 'status-in-progress' },
  { fromStatusId: 'status-planning', toStatusId: 'status-paused' },
  { fromStatusId: 'status-planning', toStatusId: 'status-cancelled' },

  // 从进行中可以转换到：已暂停、已完成、已取消
  { fromStatusId: 'status-in-progress', toStatusId: 'status-paused' },
  { fromStatusId: 'status-in-progress', toStatusId: 'status-completed' },
  { fromStatusId: 'status-in-progress', toStatusId: 'status-cancelled' },

  // 从已暂停可以转换到：进行中、已取消
  { fromStatusId: 'status-paused', toStatusId: 'status-in-progress' },
  { fromStatusId: 'status-paused', toStatusId: 'status-cancelled' },

  // 从已完成可以转换到：进行中
  { fromStatusId: 'status-completed', toStatusId: 'status-in-progress' },

  // 从已取消可以转换到：筹划中
  { fromStatusId: 'status-cancelled', toStatusId: 'status-planning' }
];

/**
 * 扩展状态流程体系
 * 包含筹划中、等待中、需求变更、进行中、已暂停、已完成、已取消七个状态
 */
export const EXTENDED_STATUS_ITEMS: StatusItem[] = [
  {
    id: 'status-planning',
    name: '筹划中',
    color: '#9C27B0', // 紫色
    order: 1
  },
  {
    id: 'status-waiting',
    name: '等待中',
    color: '#5C6BC0', // 靛蓝色
    order: 2
  },
  {
    id: 'status-requirement-change',
    name: '需求变更',
    color: '#E91E63', // 粉色
    order: 3
  },
  {
    id: 'status-in-progress',
    name: '进行中',
    color: '#4CAF50', // 绿色
    order: 4
  },
  {
    id: 'status-paused',
    name: '已暂停',
    color: '#FFC107', // 黄色
    order: 5
  },
  {
    id: 'status-completed',
    name: '已完成',
    color: '#2196F3', // 蓝色
    order: 6
  },
  {
    id: 'status-cancelled',
    name: '已取消',
    color: '#FF9800', // 橙色
    order: 7
  }
];

/**
 * 扩展状态流程的转换规则（复杂矩阵）
 */
export const EXTENDED_STATUS_TRANSITIONS: StatusTransitionRule[] = [
  // 从筹划中可以转换到：等待中、需求变更、进行中、已取消
  { fromStatusId: 'status-planning', toStatusId: 'status-waiting' },
  { fromStatusId: 'status-planning', toStatusId: 'status-requirement-change' },
  { fromStatusId: 'status-planning', toStatusId: 'status-in-progress' },
  { fromStatusId: 'status-planning', toStatusId: 'status-cancelled' },

  // 从等待中可以转换到：筹划中、需求变更、进行中、已取消
  { fromStatusId: 'status-waiting', toStatusId: 'status-planning' },
  { fromStatusId: 'status-waiting', toStatusId: 'status-requirement-change' },
  { fromStatusId: 'status-waiting', toStatusId: 'status-in-progress' },
  { fromStatusId: 'status-waiting', toStatusId: 'status-cancelled' },

  // 从需求变更可以转换到：筹划中、等待中、进行中、已取消
  { fromStatusId: 'status-requirement-change', toStatusId: 'status-planning' },
  { fromStatusId: 'status-requirement-change', toStatusId: 'status-waiting' },
  { fromStatusId: 'status-requirement-change', toStatusId: 'status-in-progress' },
  { fromStatusId: 'status-requirement-change', toStatusId: 'status-cancelled' },

  // 从进行中可以转换到：需求变更、已暂停、已完成、已取消
  { fromStatusId: 'status-in-progress', toStatusId: 'status-requirement-change' },
  { fromStatusId: 'status-in-progress', toStatusId: 'status-paused' },
  { fromStatusId: 'status-in-progress', toStatusId: 'status-completed' },
  { fromStatusId: 'status-in-progress', toStatusId: 'status-cancelled' },

  // 从已暂停可以转换到：进行中、已取消
  { fromStatusId: 'status-paused', toStatusId: 'status-in-progress' },
  { fromStatusId: 'status-paused', toStatusId: 'status-cancelled' },

  // 从已完成可以转换到：需求变更
  { fromStatusId: 'status-completed', toStatusId: 'status-requirement-change' },

  // 从已取消可以转换到：筹划中
  { fromStatusId: 'status-cancelled', toStatusId: 'status-planning' }
];

/**
 * 根据状态流程体系类型获取对应的状态项列表
 */
export const getStatusItemsBySystem = (system: string): StatusItem[] => {
  switch (system) {
    case 'standard':
      return STANDARD_STATUS_ITEMS;
    case 'extended':
      return EXTENDED_STATUS_ITEMS;
    default:
      return [];
  }
};

/**
 * 根据状态流程体系类型获取对应的状态转换规则
 */
export const getStatusTransitionsBySystem = (system: string): StatusTransitionRule[] => {
  switch (system) {
    case 'standard':
      return STANDARD_STATUS_TRANSITIONS;
    case 'extended':
      return EXTENDED_STATUS_TRANSITIONS;
    default:
      return [];
  }
};
