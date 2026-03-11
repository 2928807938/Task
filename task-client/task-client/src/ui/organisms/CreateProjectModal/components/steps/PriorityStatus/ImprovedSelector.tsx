'use client';

import React from 'react';
import {UseFormReturn} from 'react-hook-form';
import {FiInfo} from 'react-icons/fi';
import {CreateProjectRequest} from '@/types/api-types';
import usePriorityStatusStep from './hooks/usePriorityStatusStep';
import ExtendedFlowMatrix from './ExtendedFlowMatrix';
import CustomStatusEditor from './CustomStatusEditor';
import CustomPriorityEditor from './CustomPriorityEditor';

interface ImprovedSelectorProps {
  form: UseFormReturn<CreateProjectRequest>;
}

const ImprovedSelector: React.FC<ImprovedSelectorProps> = ({ form }) => {
  const ps = usePriorityStatusStep(form);

  return (
    <div className="space-y-8 px-2">
      {/* 优先级体系选择器 */}
      <div>
        <h6 className="text-base font-medium mb-3" style={{ color: 'var(--foreground)' }}>选择优先级体系</h6>
        <div className="flex space-x-4">
          <button
            type="button"
            className="px-6 py-2 rounded-md text-sm border"
            style={{
              backgroundColor: ps.prioritySystem === 'standard' 
                ? 'var(--theme-primary-500)' 
                : 'var(--theme-card-bg)',
              color: ps.prioritySystem === 'standard' 
                ? 'white' 
                : 'var(--theme-neutral-700)',
              borderColor: ps.prioritySystem === 'standard' 
                ? 'var(--theme-primary-500)' 
                : 'var(--theme-neutral-300)'
            }}
            onClick={() => ps.setPrioritySystem('standard')}
          >
            标准
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded-md text-sm border"
            style={{
              backgroundColor: ps.prioritySystem === 'advanced' 
                ? 'var(--theme-primary-500)' 
                : 'var(--theme-card-bg)',
              color: ps.prioritySystem === 'advanced' 
                ? 'white' 
                : 'var(--theme-neutral-700)',
              borderColor: ps.prioritySystem === 'advanced' 
                ? 'var(--theme-primary-500)' 
                : 'var(--theme-neutral-300)'
            }}
            onClick={() => ps.setPrioritySystem('advanced')}
          >
            高级
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded-md text-sm border"
            style={{
              backgroundColor: ps.prioritySystem === 'custom' 
                ? 'var(--theme-primary-500)' 
                : 'var(--theme-card-bg)',
              color: ps.prioritySystem === 'custom' 
                ? 'white' 
                : 'var(--theme-neutral-700)',
              borderColor: ps.prioritySystem === 'custom' 
                ? 'var(--theme-primary-500)' 
                : 'var(--theme-neutral-300)'
            }}
            onClick={() => ps.setPrioritySystem('custom')}
          >
            自定义
          </button>
        </div>

        {/* 标准优先级详情 */}
        {ps.prioritySystem === 'standard' && (
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--theme-neutral-50)' }}>
            <h6 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>标准优先级</h6>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-error-500)', border: '1px solid var(--theme-error-500)', backgroundColor: 'var(--theme-card-bg)' }}>高优先级</div>
              <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-warning-500)', border: '1px solid var(--theme-warning-500)', backgroundColor: 'var(--theme-card-bg)' }}>中优先级</div>
              <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-info-500)', border: '1px solid var(--theme-info-500)', backgroundColor: 'var(--theme-card-bg)' }}>低优先级</div>
            </div>
          </div>
        )}

        {/* 高级优先级详情 */}
        {ps.prioritySystem === 'advanced' && (
          <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--theme-neutral-50)' }}>
            <h6 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>高级优先级</h6>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-error-700)', border: '1px solid var(--theme-error-700)', backgroundColor: 'var(--theme-card-bg)' }}>紧急</div>
              <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-error-500)', border: '1px solid var(--theme-error-500)', backgroundColor: 'var(--theme-card-bg)' }}>重要</div>
              <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-warning-500)', border: '1px solid var(--theme-warning-500)', backgroundColor: 'var(--theme-card-bg)' }}>普通</div>
              <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-info-500)', border: '1px solid var(--theme-info-500)', backgroundColor: 'var(--theme-card-bg)' }}>次要</div>
              <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-success-500)', border: '1px solid var(--theme-success-500)', backgroundColor: 'var(--theme-card-bg)' }}>低优先级</div>
            </div>
          </div>
        )}

        {/* 自定义优先级详情 */}
        {ps.prioritySystem === 'custom' && (
          <CustomPriorityEditor
            items={ps.customPriorityItems}
            onAdd={ps.addPriority}
            onRemove={ps.removePriority}
            onUpdate={ps.updatePriority}
          />
        )}
      </div>

      {/* 状态流程体系选择器 */}
      <div>
        <h6 className="text-base font-medium mb-3" style={{ color: 'var(--foreground)' }}>选择状态流程体系</h6>
        <div className="flex space-x-4">
          <button
            type="button"
            className="px-6 py-2 rounded-md text-sm border"
            style={{
              backgroundColor: ps.statusSystem === 'standard' 
                ? 'var(--theme-primary-500)' 
                : 'var(--theme-card-bg)',
              color: ps.statusSystem === 'standard' 
                ? 'white' 
                : 'var(--theme-neutral-700)',
              borderColor: ps.statusSystem === 'standard' 
                ? 'var(--theme-primary-500)' 
                : 'var(--theme-neutral-300)'
            }}
            onClick={() => ps.setStatusSystem('standard')}
          >
            标准
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded-md text-sm border"
            style={{
              backgroundColor: ps.statusSystem === 'extended' 
                ? 'var(--theme-primary-500)' 
                : 'var(--theme-card-bg)',
              color: ps.statusSystem === 'extended' 
                ? 'white' 
                : 'var(--theme-neutral-700)',
              borderColor: ps.statusSystem === 'extended' 
                ? 'var(--theme-primary-500)' 
                : 'var(--theme-neutral-300)'
            }}
            onClick={() => ps.setStatusSystem('extended')}
          >
            扩展
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded-md text-sm border"
            style={{
              backgroundColor: ps.statusSystem === 'custom' 
                ? 'var(--theme-primary-500)' 
                : 'var(--theme-card-bg)',
              color: ps.statusSystem === 'custom' 
                ? 'white' 
                : 'var(--theme-neutral-700)',
              borderColor: ps.statusSystem === 'custom' 
                ? 'var(--theme-primary-500)' 
                : 'var(--theme-neutral-300)'
            }}
            onClick={() => ps.setStatusSystem('custom')}
          >
            自定义
          </button>
        </div>

        {/* 自定义状态流程详情 */}
        {ps.statusSystem === 'custom' && (
          <CustomStatusEditor
            items={ps.customStatusItems}
            transitions={ps.statusTransitions}
            onAdd={ps.addStatus}
            onRemove={ps.removeStatus}
            onUpdate={ps.updateStatus}
            onToggleTransition={ps.toggleTransition}
          />
        )}

        {/* 标准流程详情 */}
        {ps.statusSystem === 'standard' && (
          <div className="mt-4">
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--theme-neutral-50)' }}>
              <h6 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>标准流程</h6>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-info-500)', border: '1px solid var(--theme-info-500)', backgroundColor: 'var(--theme-card-bg)' }}>筹划中</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-success-500)', border: '1px solid var(--theme-success-500)', backgroundColor: 'var(--theme-card-bg)' }}>进行中</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-warning-500)', border: '1px solid var(--theme-warning-500)', backgroundColor: 'var(--theme-card-bg)' }}>已暂停</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-primary-500)', border: '1px solid var(--theme-primary-500)', backgroundColor: 'var(--theme-card-bg)' }}>已完成</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-error-500)', border: '1px solid var(--theme-error-500)', backgroundColor: 'var(--theme-card-bg)' }}>已取消</div>
              </div>
            </div>

            <h6 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>状态转换规则</h6>

            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: 'var(--theme-primary-50)' }}>
              <div className="flex items-start">
                <FiInfo className="mt-0.5 mr-2 flex-shrink-0" style={{ color: 'var(--theme-primary-500)' }} size={18} />
                <p className="text-sm" style={{ color: 'var(--theme-primary-700)' }}>
                  标准流程状态转换规则（预设）：下方显示的是系统预设的状态转换规则，不可修改。勾选的项表示允许从一个状态转换到另一个状态。
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
                      <th className="px-3 py-2 text-center text-xs font-medium border" style={{ backgroundColor: 'var(--theme-neutral-50)', color: 'var(--theme-info-500)', borderColor: 'var(--theme-card-border)' }}>筹划中</th>
                      <th className="px-3 py-2 text-center text-xs font-medium border" style={{ backgroundColor: 'var(--theme-neutral-50)', color: 'var(--theme-success-500)', borderColor: 'var(--theme-card-border)' }}>进行中</th>
                      <th className="px-3 py-2 text-center text-xs font-medium border" style={{ backgroundColor: 'var(--theme-neutral-50)', color: 'var(--theme-warning-500)', borderColor: 'var(--theme-card-border)' }}>已暂停</th>
                      <th className="px-3 py-2 text-center text-xs font-medium border" style={{ backgroundColor: 'var(--theme-neutral-50)', color: 'var(--theme-primary-500)', borderColor: 'var(--theme-card-border)' }}>已完成</th>
                      <th className="px-3 py-2 text-center text-xs font-medium border" style={{ backgroundColor: 'var(--theme-neutral-50)', color: 'var(--theme-error-500)', borderColor: 'var(--theme-card-border)' }}>已取消</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border text-xs font-medium" style={{ color: 'var(--theme-info-500)', borderColor: 'var(--theme-card-border)' }}>筹划中</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)' }}>-</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-success-500)' }}>✓</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-success-500)' }}>✓</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)' }}>-</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-success-500)' }}>✓</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border text-xs font-medium" style={{ color: 'var(--theme-success-500)', borderColor: 'var(--theme-card-border)' }}>进行中</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-success-500)' }}>✓</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)' }}>-</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-success-500)' }}>✓</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-success-500)' }}>✓</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-success-500)' }}>✓</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border text-xs font-medium" style={{ color: 'var(--theme-warning-500)', borderColor: 'var(--theme-card-border)' }}>已暂停</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-success-500)' }}>✓</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-success-500)' }}>✓</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)' }}>-</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)' }}>-</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-success-500)' }}>✓</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border text-xs font-medium" style={{ color: 'var(--theme-primary-500)', borderColor: 'var(--theme-card-border)' }}>已完成</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)' }}>-</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-success-500)' }}>✓</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)' }}>-</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)' }}>-</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)' }}>-</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border text-xs font-medium" style={{ color: 'var(--theme-error-500)', borderColor: 'var(--theme-card-border)' }}>已取消</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-success-500)' }}>✓</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)' }}>-</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)' }}>-</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)' }}>-</td>
                      <td className="px-3 py-2 border text-center text-xs" style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-neutral-500)' }}>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs mt-3" style={{ color: 'var(--theme-neutral-500)' }}>注：可以选择多个状态转换关系，默认已设置常用转换规则</p>
            </div>
          </div>
        )}

        {/* 扩展流程详情 */}
        {ps.statusSystem === 'extended' && (
          <div className="mt-4">
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--theme-neutral-50)' }}>
              <h6 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>扩展流程</h6>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-info-500)', border: '1px solid var(--theme-info-500)', backgroundColor: 'var(--theme-card-bg)' }}>筹划中</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-primary-400)', border: '1px solid var(--theme-primary-400)', backgroundColor: 'var(--theme-card-bg)' }}>等待中</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-error-400)', border: '1px solid var(--theme-error-400)', backgroundColor: 'var(--theme-card-bg)' }}>需求变更</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-success-500)', border: '1px solid var(--theme-success-500)', backgroundColor: 'var(--theme-card-bg)' }}>进行中</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-warning-500)', border: '1px solid var(--theme-warning-500)', backgroundColor: 'var(--theme-card-bg)' }}>已暂停</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-primary-500)', border: '1px solid var(--theme-primary-500)', backgroundColor: 'var(--theme-card-bg)' }}>已完成</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ color: 'var(--theme-error-500)', border: '1px solid var(--theme-error-500)', backgroundColor: 'var(--theme-card-bg)' }}>已取消</div>
              </div>
            </div>

            {/* 使用ExtendedFlowMatrix组件显示扩展流程的转换规则 */}
            <ExtendedFlowMatrix />
          </div>
        )}
      </div>

      {/* 总结信息 */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--theme-primary-50)' }}>
        <p className="text-sm" style={{ color: 'var(--theme-primary-700)' }}>
          完成此设置后，您创建的项目将使用您选择的优先级体系和状态流程。您随时可以在项目设置中修改这些配置。
        </p>
      </div>
    </div>
  );
};

export default ImprovedSelector;
