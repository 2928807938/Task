'use client';

import React from 'react';
import {UseFormReturn} from 'react-hook-form';
import {FiFlag, FiList} from 'react-icons/fi';
import StatusRuleInfo from './StatusRuleInfo';
import {CreateProjectRequest, PriorityItem,} from '@/types/api-types';
import usePriorityStatusStep from './usePriorityStatusStep';
import PrioritySystemSelector from './PrioritySystemSelector';
import StatusSystemSelector from './StatusSystemSelector';
import PriorityListEditor from './PriorityListEditor';
import StatusListEditor from './StatusListEditor';
import StatusTransitionMatrix from './StatusTransitionMatrix';

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
          <FiFlag className="text-blue-500 mr-2" />
          <h5 className="text-base font-medium">优先级体系</h5>
        </div>

        <div className="p-3 bg-white rounded-lg border border-gray-200">
          <h6 className="text-sm font-medium mb-2">选择优先级体系</h6>
          <PrioritySystemSelector value={ps.prioritySystem} onChange={ps.setPrioritySystem} />

          {/* 标准优先级预设 */}
          {ps.prioritySystem === 'standard' && (
            <div className="mt-4">
              <h6 className="text-sm font-medium mb-2">标准优先级</h6>
              <div className="flex space-x-3">
                <div className="px-3 py-1.5 text-xs bg-white text-red-500 border border-red-500 rounded">高优先级</div>
                <div className="px-3 py-1.5 text-xs bg-white text-yellow-500 border border-yellow-500 rounded">中优先级</div>
                <div className="px-3 py-1.5 text-xs bg-white text-blue-500 border border-blue-500 rounded">低优先级</div>
              </div>
            </div>
          )}

          {/* 高级优先级预设 */}
          {ps.prioritySystem === 'advanced' && (
            <div className="mt-4">
              <h6 className="text-sm font-medium mb-2">高级优先级</h6>
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1.5 text-xs bg-white text-red-600 border border-red-600 rounded">紧急</div>
                <div className="px-3 py-1.5 text-xs bg-white text-orange-500 border border-orange-500 rounded">重要</div>
                <div className="px-3 py-1.5 text-xs bg-white text-yellow-500 border border-yellow-500 rounded">普通</div>
                <div className="px-3 py-1.5 text-xs bg-white text-blue-500 border border-blue-500 rounded">次要</div>
                <div className="px-3 py-1.5 text-xs bg-white text-green-500 border border-green-500 rounded">低优先级</div>
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
          <FiList className="text-blue-500 mr-2" />
          <h5 className="text-base font-medium">状态流程体系</h5>
        </div>

        <div className="p-3 bg-white rounded-lg border border-gray-200">
          <h6 className="text-sm font-medium mb-2">选择状态流程体系</h6>
          <StatusSystemSelector value={ps.statusSystem} onChange={ps.setStatusSystem} />

          {/* 标准流程预设 */}
          {ps.statusSystem === 'standard' && (
            <div>
              <div className="mt-4">
                <h6 className="text-sm font-medium mb-2">标准流程</h6>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 text-xs bg-white text-purple-500 border border-purple-500 rounded">筹划中</div>
                  <div className="px-3 py-1.5 text-xs bg-white text-green-500 border border-green-500 rounded">进行中</div>
                  <div className="px-3 py-1.5 text-xs bg-white text-yellow-500 border border-yellow-500 rounded">已暂停</div>
                  <div className="px-3 py-1.5 text-xs bg-white text-blue-500 border border-blue-500 rounded">已完成</div>
                  <div className="px-3 py-1.5 text-xs bg-white text-red-500 border border-red-500 rounded">已取消</div>
                </div>
              </div>

              <div className="mt-4">
                <h6 className="text-sm font-medium mb-2">状态转换规则</h6>
                <StatusRuleInfo flowType="standard" />

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                  <div className="text-xs text-gray-600 mb-2">点击选择可以转换的状态关系</div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-2 py-2 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">从\到</th>
                          <th className="px-2 py-2 bg-gray-100 text-left text-xs font-medium" style={{color: '#9C27B0'}}>筹划中</th>
                          <th className="px-2 py-2 bg-gray-100 text-left text-xs font-medium" style={{color: '#00C853'}}>进行中</th>
                          <th className="px-2 py-2 bg-gray-100 text-left text-xs font-medium" style={{color: '#FFD600'}}>已暂停</th>
                          <th className="px-2 py-2 bg-gray-100 text-left text-xs font-medium" style={{color: '#03A9F4'}}>已完成</th>
                          <th className="px-2 py-2 bg-gray-100 text-left text-xs font-medium" style={{color: '#FF3D00'}}>已取消</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-2 py-2 whitespace-nowrap text-xs font-medium" style={{color: '#9C27B0'}}>筹划中</td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs"><div className="w-4 h-4 flex items-center justify-center text-black">-</div></td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#00C853" style={{color: '#00C853'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#FFD600" style={{color: '#FFD600'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center text-gray-300">-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#FF3D00" style={{color: '#FF3D00'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 whitespace-nowrap text-xs font-medium" style={{color: '#00C853'}}>进行中</td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#9C27B0" style={{color: '#9C27B0'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs"><div className="w-4 h-4 flex items-center justify-center text-black">-</div></td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#FFD600" style={{color: '#FFD600'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#03A9F4" style={{color: '#03A9F4'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#FF3D00" style={{color: '#FF3D00'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 whitespace-nowrap text-xs font-medium" style={{color: '#FFD600'}}>已暂停</td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#9C27B0" style={{color: '#9C27B0'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#00C853" style={{color: '#00C853'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs"><div className="w-4 h-4 flex items-center justify-center text-black">-</div></td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center text-gray-300">-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#FF3D00" style={{color: '#FF3D00'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 whitespace-nowrap text-xs font-medium" style={{color: '#03A9F4'}}>已完成</td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center text-gray-300">-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#00C853" style={{color: '#00C853'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center text-gray-300">-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs"><div className="w-4 h-4 flex items-center justify-center text-black">-</div></td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center text-gray-300">-</div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-2 whitespace-nowrap text-xs font-medium" style={{color: '#FF3D00'}}>已取消</td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#9C27B0" style={{color: '#9C27B0'}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center text-gray-300">-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center text-gray-300">-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs">
                            <div className="w-4 h-4 flex items-center justify-center text-gray-300">-</div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-xs"><div className="w-4 h-4 flex items-center justify-center text-black">-</div></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 扩展流程预设 */}
          {ps.statusSystem === 'extended' && (
            <div>
              <div className="mt-4">
                <h6 className="text-sm font-medium mb-2">扩展流程</h6>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 text-xs bg-white" style={{color: '#9C27B0', borderColor: '#9C27B0', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>筹划中</div>
                  <div className="px-3 py-1.5 text-xs bg-white" style={{color: '#5C6BC0', borderColor: '#5C6BC0', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>等待中</div>
                  <div className="px-3 py-1.5 text-xs bg-white" style={{color: '#E91E63', borderColor: '#E91E63', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>需求变更</div>
                  <div className="px-3 py-1.5 text-xs bg-white" style={{color: '#00C853', borderColor: '#00C853', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>进行中</div>
                  <div className="px-3 py-1.5 text-xs bg-white" style={{color: '#FFD600', borderColor: '#FFD600', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>已暂停</div>
                  <div className="px-3 py-1.5 text-xs bg-white" style={{color: '#03A9F4', borderColor: '#03A9F4', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>已完成</div>
                  <div className="px-3 py-1.5 text-xs bg-white" style={{color: '#FF3D00', borderColor: '#FF3D00', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.25rem'}}>已取消</div>
                </div>
              </div>

              <div className="mt-4">
                <h6 className="text-sm font-medium mb-2">状态转换规则</h6>
                <StatusRuleInfo flowType="extended" />
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mt-2">
                  <div className="text-xs text-gray-600 mb-2">点击选择可以转换的状态关系</div>

                  {/* 此处省略了扩展流程的转换矩阵表格 - 由于内容较多，可以单独创建组件或提取到数据文件 */}
                  <div className="text-xs text-gray-500">
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
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          完成此设置后，您创建的项目将使用您选择的优先级体系和状态流程。您随时可以在项目设置中修改这些配置。
        </p>
      </div>
    </div>
  );
};
