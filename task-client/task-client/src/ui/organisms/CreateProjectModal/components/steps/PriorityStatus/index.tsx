'use client';

import React from 'react';
import {UseFormReturn} from 'react-hook-form';
import {FiFlag, FiList} from 'react-icons/fi';
import {CreateProjectRequest, PriorityItem} from '@/types/api-types';
import StatusRuleInfo from '../StatusRuleInfo';

// 引入钩子和组件
import usePriorityStatusStep from './hooks/usePriorityStatusStep';
import PrioritySystemSelector from './components/PrioritySystemSelector';
import StatusSystemSelector from './components/StatusSystemSelector';
import PriorityListEditor from './components/PriorityListEditor';
import StatusListEditor from './components/StatusListEditor';
import StatusTransitionMatrix from './components/StatusTransitionMatrix';

interface PriorityStatusStepProps {
  form: UseFormReturn<CreateProjectRequest>;
}

const PriorityStatusStep: React.FC<PriorityStatusStepProps> = ({ form }) => {
  const ps = usePriorityStatusStep(form);

  const showPriorityEditor = ps.prioritySystem === 'custom';
  const showStatusEditor = ps.statusSystem === 'custom';

  return (
    <div className="space-y-6">
      {/* 优先级体系 */}
      <div>
        <div className="flex items-center mb-3">
          <FiFlag className="mr-2" style={{ color: 'var(--theme-primary-500)' }} />
          <h5 className="text-base font-medium" style={{ color: 'var(--foreground)' }}>优先级体系</h5>
        </div>

        <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
          <h6 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>选择优先级体系</h6>
          <PrioritySystemSelector value={ps.prioritySystem} onChange={ps.setPrioritySystem} />

          {/* 标准优先级预设 */}
          {ps.prioritySystem === 'standard' && (
            <div className="mt-4">
              <h6 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>标准优先级</h6>
              <div className="flex space-x-3">
                <div className="px-3 py-1.5 text-xs rounded" style={{ backgroundColor: 'var(--theme-priority-high-bg)', color: 'var(--theme-priority-high-text)', borderColor: 'var(--theme-priority-high-border)', borderWidth: '1px', borderStyle: 'solid' }}>高优先级</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ backgroundColor: 'var(--theme-priority-medium-bg)', color: 'var(--theme-priority-medium-text)', borderColor: 'var(--theme-priority-medium-border)', borderWidth: '1px', borderStyle: 'solid' }}>中优先级</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ backgroundColor: 'var(--theme-priority-low-bg)', color: 'var(--theme-priority-low-text)', borderColor: 'var(--theme-priority-low-border)', borderWidth: '1px', borderStyle: 'solid' }}>低优先级</div>
              </div>
            </div>
          )}

          {/* 高级优先级预设 */}
          {ps.prioritySystem === 'advanced' && (
            <div className="mt-4">
              <h6 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>高级优先级</h6>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 text-xs rounded" style={{ backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-error-500)', borderColor: 'var(--theme-error-500)', borderWidth: '1px', borderStyle: 'solid' }}>紧急</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-warning-500)', borderColor: 'var(--theme-warning-500)', borderWidth: '1px', borderStyle: 'solid' }}>重要</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-warning-500)', borderColor: 'var(--theme-warning-500)', borderWidth: '1px', borderStyle: 'solid' }}>普通</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-info-500)', borderColor: 'var(--theme-info-500)', borderWidth: '1px', borderStyle: 'solid' }}>次要</div>
                <div className="px-3 py-1.5 text-xs rounded" style={{ backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-success-500)', borderColor: 'var(--theme-success-500)', borderWidth: '1px', borderStyle: 'solid' }}>低优先级</div>
              </div>
            </div>
          )}

          {/* 自定义优先级编辑器 */}
          {showPriorityEditor && (
              <PriorityListEditor
                  items={ps.customPriorityItems}
                  onAdd={(item) => {
                    // 添加order属性，确保类型匹配
                    const priorityItem: PriorityItem = {
                      ...item,
                      order: ps.customPriorityItems.length // 使用当前数组长度作为顺序
                    };
                    ps.addPriority(priorityItem);
                  }}
                  onRemove={ps.removePriority}
              />
          )}
        </div>
      </div>

      {/* 状态流程体系 */}
      <div>
        <div className="flex items-center mb-3">
          <FiList className="mr-2" style={{ color: 'var(--theme-primary-500)' }} />
          <h5 className="text-base font-medium" style={{ color: 'var(--foreground)' }}>状态流程体系</h5>
        </div>

        <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
          <h6 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>选择状态流程体系</h6>
          <StatusSystemSelector value={ps.statusSystem} onChange={ps.setStatusSystem} />

          {/* 标准流程预设 */}
          {ps.statusSystem === 'standard' && (
            <div>
              <div className="mt-4">
                <h6 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>标准流程</h6>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 text-xs rounded" style={{ backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-primary-700)', borderColor: 'var(--theme-primary-700)', borderWidth: '1px', borderStyle: 'solid' }}>筹划中</div>
                  <div className="px-3 py-1.5 text-xs rounded" style={{ backgroundColor: 'var(--theme-status-inprogress-bg)', color: 'var(--theme-status-inprogress-text)', borderColor: 'var(--theme-status-inprogress-border)', borderWidth: '1px', borderStyle: 'solid' }}>进行中</div>
                  <div className="px-3 py-1.5 text-xs rounded" style={{ backgroundColor: 'var(--theme-status-waiting-bg)', color: 'var(--theme-status-waiting-text)', borderColor: 'var(--theme-status-waiting-border)', borderWidth: '1px', borderStyle: 'solid' }}>已暂停</div>
                  <div className="px-3 py-1.5 text-xs rounded" style={{ backgroundColor: 'var(--theme-status-completed-bg)', color: 'var(--theme-status-completed-text)', borderColor: 'var(--theme-status-completed-border)', borderWidth: '1px', borderStyle: 'solid' }}>已完成</div>
                  <div className="px-3 py-1.5 text-xs rounded" style={{ backgroundColor: 'var(--theme-status-overdue-bg)', color: 'var(--theme-status-overdue-text)', borderColor: 'var(--theme-status-overdue-border)', borderWidth: '1px', borderStyle: 'solid' }}>已取消</div>
                </div>
              </div>

              <div className="mt-4">
                <h6 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>状态转换规则</h6>
                <StatusRuleInfo flowType="standard" />

                <div className="p-3 rounded-lg border mt-2" style={{ backgroundColor: 'var(--theme-neutral-50)', borderColor: 'var(--theme-card-border)' }}>
                  <div className="text-xs mb-2" style={{ color: 'var(--theme-neutral-600)' }}>点击选择可以转换的状态关系</div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y" style={{ borderColor: 'var(--theme-card-border)' }}>
                      <thead>
                        <tr>
                          <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ backgroundColor: 'var(--theme-neutral-100)', color: 'var(--theme-neutral-500)' }}>从\到</th>
                          <th className="px-2 py-2 text-left text-xs font-medium" style={{ backgroundColor: 'var(--theme-neutral-100)', color: 'var(--theme-primary-700)' }}>筹划中</th>
                          <th className="px-2 py-2 text-left text-xs font-medium" style={{ backgroundColor: 'var(--theme-neutral-100)', color: 'var(--theme-success-500)' }}>进行中</th>
                          <th className="px-2 py-2 text-left text-xs font-medium" style={{ backgroundColor: 'var(--theme-neutral-100)', color: 'var(--theme-warning-500)' }}>已暂停</th>
                          <th className="px-2 py-2 text-left text-xs font-medium" style={{ backgroundColor: 'var(--theme-neutral-100)', color: 'var(--theme-info-500)' }}>已完成</th>
                          <th className="px-2 py-2 text-left text-xs font-medium" style={{ backgroundColor: 'var(--theme-neutral-100)', color: 'var(--theme-error-500)' }}>已取消</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
                        <tr>
                          <td className="px-2 py-2 whitespace-nowrap text-xs font-medium" style={{color: 'var(--theme-primary-700)'}}>筹划中</td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs"><div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--foreground)' }}>-</div></td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--theme-success-500)" style={{color: 'var(--theme-success-500)'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--theme-warning-500)" style={{color: 'var(--theme-warning-500)'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--theme-neutral-300)' }}>-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--theme-error-500)" style={{color: 'var(--theme-error-500)'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 whitespace-nowrap text-xs font-medium" style={{color: 'var(--theme-success-500)'}}>进行中</td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--theme-primary-700)" style={{color: 'var(--theme-primary-700)'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs"><div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--foreground)' }}>-</div></td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--theme-warning-500)" style={{color: 'var(--theme-warning-500)'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--theme-info-500)" style={{color: 'var(--theme-info-500)'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--theme-error-500)" style={{color: 'var(--theme-error-500)'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 whitespace-nowrap text-xs font-medium" style={{color: 'var(--theme-warning-500)'}}>已暂停</td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--theme-primary-700)" style={{color: 'var(--theme-primary-700)'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--theme-success-500)" style={{color: 'var(--theme-success-500)'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs"><div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--foreground)' }}>-</div></td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--theme-neutral-300)' }}>-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--theme-error-500)" style={{color: 'var(--theme-error-500)'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 whitespace-nowrap text-xs font-medium" style={{color: 'var(--theme-info-500)'}}>已完成</td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--theme-neutral-300)' }}>-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--theme-success-500)" style={{color: 'var(--theme-success-500)'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--theme-neutral-300)' }}>-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs"><div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--foreground)' }}>-</div></td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--theme-neutral-300)' }}>-</div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 whitespace-nowrap text-xs font-medium" style={{color: 'var(--theme-error-500)'}}>已取消</td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="var(--theme-primary-700)" style={{color: 'var(--theme-primary-700)'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--theme-neutral-300)' }}>-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--theme-neutral-300)' }}>-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--theme-neutral-300)' }}>-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs"><div className="w-4 h-4 flex items-center justify-center" style={{ color: 'var(--foreground)' }}>-</div></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-2 text-xs" style={{ color: 'var(--theme-neutral-500)' }}>注：点击单元格可以设置或取消状态转换关系</div>
                </div>
              </div>
            </div>
          )}

          {/* 扩展流程预设 */}
          {ps.statusSystem === 'extended' && (
            <div>
              <div className="mt-4">
                <h6 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>扩展流程</h6>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 text-xs" style={{backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-primary-700)', borderColor: 'var(--theme-primary-700)', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>筹划中</div>
                  <div className="px-3 py-1.5 text-xs" style={{backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-primary-600)', borderColor: 'var(--theme-primary-600)', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>等待中</div>
                  <div className="px-3 py-1.5 text-xs" style={{backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-error-500)', borderColor: 'var(--theme-error-500)', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>需求变更</div>
                  <div className="px-3 py-1.5 text-xs" style={{backgroundColor: 'var(--theme-status-inprogress-bg)', color: 'var(--theme-status-inprogress-text)', borderColor: 'var(--theme-status-inprogress-border)', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>进行中</div>
                  <div className="px-3 py-1.5 text-xs" style={{backgroundColor: 'var(--theme-status-waiting-bg)', color: 'var(--theme-status-waiting-text)', borderColor: 'var(--theme-status-waiting-border)', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>已暂停</div>
                  <div className="px-3 py-1.5 text-xs" style={{backgroundColor: 'var(--theme-status-completed-bg)', color: 'var(--theme-status-completed-text)', borderColor: 'var(--theme-status-completed-border)', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>已完成</div>
                  <div className="px-3 py-1.5 text-xs" style={{backgroundColor: 'var(--theme-status-overdue-bg)', color: 'var(--theme-status-overdue-text)', borderColor: 'var(--theme-status-overdue-border)', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>已取消</div>
                </div>
              </div>

              <div className="mt-4">
                <h6 className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>状态转换规则</h6>
                <StatusRuleInfo flowType="extended" />
                <div className="p-3 rounded-lg border mt-2" style={{ backgroundColor: 'var(--theme-neutral-50)', borderColor: 'var(--theme-card-border)' }}>
                  <div className="text-xs mb-2" style={{ color: 'var(--theme-neutral-600)' }}>点击选择可以转换的状态关系</div>

                  {/* 此处省略了扩展流程的转换矩阵表格 - 由于内容较多，可以单独创建组件或提取到数据文件 */}
                  <div className="text-xs" style={{ color: 'var(--theme-neutral-500)' }}>
                    扩展流程预设了更详细的工作流转换规则，请参考状态转换说明
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 自定义状态编辑器 */}
          {showStatusEditor && (
            <>
              <StatusListEditor
                  items={ps.customStatusItems}
                  onAdd={(item) => {
                    // 添加order属性，确保类型匹配
                    const statusItem = {
                      ...item,
                      order: ps.customStatusItems.length // 使用当前数组长度作为顺序
                    };
                    ps.addStatus(statusItem);
                  }}
                  onRemove={ps.removeStatus}
              />


              {ps.customStatusItems.length > 1 && (
                <StatusTransitionMatrix
                  items={ps.customStatusItems}
                  transitions={ps.statusTransitions}
                  onToggle={ps.toggleTransition}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* 总结信息 */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--theme-info-50)' }}>
        <p className="text-sm" style={{ color: 'var(--theme-info-700)' }}>
          完成此设置后，您创建的项目将使用您选择的优先级体系和状态流程。您随时可以在项目设置中修改这些配置。
        </p>
      </div>
    </div>
  );
};

export default PriorityStatusStep;
