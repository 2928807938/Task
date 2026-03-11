'use client';

import React from 'react';
import {FiInfo} from 'react-icons/fi';

/**
 * 扩展流程状态转换矩阵组件
 * 展示扩展流程的状态转换规则
 */
const ExtendedFlowMatrix: React.FC = () => {
  // 扩展流程状态列表
  const statuses = [
    { id: '1', name: '筹划中', color: 'var(--theme-info-500)' },
    { id: '2', name: '等待中', color: 'var(--theme-primary-400)' },
    { id: '3', name: '需求变更', color: 'var(--theme-error-400)' },
    { id: '4', name: '进行中', color: 'var(--theme-success-500)' },
    { id: '5', name: '已暂停', color: 'var(--theme-warning-500)' },
    { id: '6', name: '已完成', color: 'var(--theme-primary-500)' },
    { id: '7', name: '已取消', color: 'var(--theme-error-500)' },
  ];

  // 预设转换规则
  const transitions = [
    { from: '1', to: '2' }, { from: '1', to: '3' }, { from: '1', to: '4' }, { from: '1', to: '5' }, { from: '1', to: '7' },
    { from: '2', to: '1' }, { from: '2', to: '3' }, { from: '2', to: '4' }, { from: '2', to: '5' }, { from: '2', to: '7' },
    { from: '3', to: '1' }, { from: '3', to: '2' }, { from: '3', to: '4' }, { from: '3', to: '5' }, { from: '3', to: '7' },
    { from: '4', to: '1' }, { from: '4', to: '2' }, { from: '4', to: '3' }, { from: '4', to: '5' }, { from: '4', to: '6' }, { from: '4', to: '7' },
    { from: '5', to: '1' }, { from: '5', to: '2' }, { from: '5', to: '3' }, { from: '5', to: '4' }, { from: '5', to: '7' },
    { from: '6', to: '3' }, { from: '6', to: '4' },
    { from: '7', to: '1' },
  ];

  // 检查是否允许转换
  const canTransition = (fromId: string, toId: string) => {
    return transitions.some(t => t.from === fromId && t.to === toId);
  };

  return (
    <div>
      <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: 'var(--theme-primary-50)' }}>
        <div className="flex items-start">
          <FiInfo className="mt-0.5 mr-2 flex-shrink-0" style={{ color: 'var(--theme-primary-500)' }} size={18} />
          <p className="text-sm" style={{ color: 'var(--theme-primary-700)' }}>
            扩展流程状态转换规则（预设）：下方显示的是系统预设的状态转换规则，不可修改。勾选的项表示允许从一个状态转换到另一个状态。
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
        <p className="text-sm mb-3" style={{ color: 'var(--theme-neutral-600)' }}>点击选择可以转换的状态关系</p>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium border" style={{ backgroundColor: 'var(--theme-neutral-50)', color: 'var(--theme-neutral-500)', borderColor: 'var(--theme-card-border)' }}>从\到</th>
                {statuses.map(status => (
                  <th
                    key={status.id}
                    className="px-3 py-2 text-center text-xs font-medium border"
                    style={{
                      backgroundColor: 'var(--theme-neutral-50)',
                      borderColor: 'var(--theme-card-border)',
                      color: status.color
                    }}
                  >
                    {status.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statuses.map(fromStatus => (
                <tr key={fromStatus.id}>
                  <td
                    className="px-3 py-2 border text-xs font-medium"
                    style={{
                      color: fromStatus.color,
                      borderColor: 'var(--theme-card-border)'
                    }}
                  >
                    {fromStatus.name}
                  </td>
                  {statuses.map(toStatus => (
                    <td
                      key={toStatus.id}
                      className="px-3 py-2 border text-center text-xs"
                      style={{ borderColor: 'var(--theme-card-border)' }}
                    >
                      {fromStatus.id === toStatus.id ? (
                        <div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--theme-neutral-500)' }}>-</div>
                      ) : (
                        <div className="w-4 h-4 flex items-center justify-center">
                          {canTransition(fromStatus.id, toStatus.id) ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke={toStatus.color}
                              style={{color: toStatus.color}}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-gray-300"></div>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 mt-3">注：扩展流程提供了更完整的项目管理流程，包括需求变更和等待审批等状态，适合复杂项目管理。</p>
      </div>
    </div>
  );
};

export default ExtendedFlowMatrix;
