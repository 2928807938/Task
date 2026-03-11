'use client';

import React, {useState} from 'react';
import {FiEdit2, FiInfo, FiPlus, FiX} from 'react-icons/fi';
import {StatusItem, StatusTransitionRule} from '@/types/api-types';
import {ColorPicker} from '@/ui/molecules/ColorPicker';

interface CustomStatusEditorProps {
  items: StatusItem[];
  transitions: StatusTransitionRule[];
  onAdd: (item: StatusItem) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, name: string, color: string, order: number) => void;
  onToggleTransition: (fromId: string, toId: string) => void;
}

const CustomStatusEditor: React.FC<CustomStatusEditorProps> = ({
  items,
  transitions,
  onAdd,
  onRemove,
  onUpdate,
  onToggleTransition
}) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('var(--theme-primary-500)');
  const [isTerminal, setIsTerminal] = useState(false); // 添加终止状态选项

  // 编辑状态管理
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [editingIsTerminal, setEditingIsTerminal] = useState(false); // 编辑时的终止状态选项

  const handleSubmit = () => {
    if (!name.trim()) return;

    // 计算新状态的顺序值 - 获取当前最大order值并加1
    const maxOrder = items.length > 0
      ? Math.max(...items.map(item => item.order))
      : 0;

    // 创建新状态项，使用any类型绕过TypeScript接口限制
    const newItem: any = {
      id: `status-${Date.now()}`,
      name: name.trim(),
      color,
      order: maxOrder + 1, // 新状态的顺序值
      isTerminal: isTerminal // 添加终止状态属性
    };

    onAdd(newItem);
    setName('');
    setColor('var(--theme-primary-500)');
    setIsTerminal(false); // 重置终止状态选项
    setShowForm(false);
  };

  const startEditing = (item: StatusItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setEditingColor(item.color);
    // 获取终止状态属性，使用类型断言
    setEditingIsTerminal((item as any).isTerminal || false);
  };

  const saveEdit = () => {
    if (!editingId || !editingName.trim()) return;

    // 找到当前编辑的项，保留其order值
    const currentItem = items.find(item => item.id === editingId);
    if (!currentItem) return;

    // 更新原始字段
    onUpdate(editingId, editingName.trim(), editingColor, currentItem.order);

    // 更新终止状态属性（因为onUpdate方法不支持isTerminal参数）
    // 通过直接修改数组中的对象来更新终止状态
    const itemIndex = items.findIndex(item => item.id === editingId);
    if (itemIndex >= 0) {
      (items[itemIndex] as any).isTerminal = editingIsTerminal;
    }

    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--theme-neutral-50)' }}>
      <div className="flex items-center justify-between mb-3">
        <h6 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>自定义状态</h6>
        <button
          type="button"
          className="text-xs flex items-center"
          style={{ color: 'var(--theme-primary-600)' }}
          onClick={() => setShowForm(!showForm)}
        >
          <FiPlus className="w-3 h-3 mr-1" />
          添加状态
        </button>
      </div>

      {/* 状态列表 */}
      {items.length > 0 ? (
        <div className="space-y-2 mb-4">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded border" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-card-border)' }}>
              {editingId === item.id ? (
                // 编辑模式
                <div className="flex-1 flex items-center space-x-2">
                  <ColorPicker
                    value={editingColor}
                    onChange={setEditingColor}
                    size="sm"
                  />
                  <div className="flex-1 flex flex-col space-y-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full px-2 py-1 text-xs border rounded focus:outline-none"
                      style={{
                        borderColor: 'var(--theme-neutral-300)',
                        backgroundColor: 'var(--theme-card-bg)',
                        color: 'var(--foreground)'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--theme-primary-500)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--theme-neutral-300)';
                      }}
                      autoFocus
                    />
                    <div className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        id={`terminal-${editingId}`}
                        checked={editingIsTerminal}
                        onChange={(e) => setEditingIsTerminal(e.target.checked)}
                        className="w-3 h-3 rounded"
                        style={{
                          accentColor: 'var(--theme-primary-500)',
                          borderColor: 'var(--theme-neutral-300)'
                        }}
                      />
                      <label htmlFor={`terminal-${editingId}`} className="text-xs" style={{ color: 'var(--theme-neutral-600)' }}>
                        终止状态
                      </label>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      className="transition-colors"
                      style={{ color: 'var(--theme-success-500)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--theme-success-600)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--theme-success-500)';
                      }}
                      onClick={saveEdit}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="transition-colors"
                      style={{ color: 'var(--theme-neutral-400)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--theme-neutral-500)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--theme-neutral-400)';
                      }}
                      onClick={cancelEdit}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                // 显示模式
                <>
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-3 h-3 rounded" style={{ background: item.color }}></span>
                    <span className="text-xs">{item.name}</span>
                    {(item as any).isTerminal && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded">
                        终止状态
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-blue-500"
                      onClick={() => startEditing(item)}
                    >
                      <FiEdit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => onRemove(item.id)}
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-500 italic mb-4">尚未添加自定义状态</div>
      )}

      {/* 添加状态表单 */}
      {showForm && (
        <div className="p-3 bg-white rounded-lg border border-gray-200 mb-4">
          <div className="mb-3">
            <label className="block text-xs text-gray-700 mb-1">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入状态名称"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="mb-3">
            <ColorPicker
              value={color}
              onChange={setColor}
              label="颜色"
              size="md"
              presetColors={[
                '#007AFF', // 蓝色 - 待处理
                '#34C759', // 绿色 - 进行中
                '#FF9500', // 橙色 - 审核中
                '#FF3B30', // 红色 - 已拒绝
                '#5AC8FA', // 浅蓝 - 已完成
                '#FFD60A', // 黄色 - 已暂停
                '#FF2D55', // 粉红 - 已取消
                '#5856D6', // 紫色 - 需求变更
                '#AF52DE', // 粉紫 - 待验收
                '#8E8E93'  // 灰色 - 已归档
              ]}
            />
          </div>

          <div className="mb-3">
            <div className="flex items-center mb-1">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="new-status-is-terminal"
                  checked={isTerminal}
                  onChange={(e) => setIsTerminal(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 text-blue-500 border-gray-300 rounded cursor-pointer z-50"
                  style={{ pointerEvents: 'auto' }}
                />
                <label htmlFor="new-status-is-terminal" className="text-sm text-gray-700">
                  设为终止状态
                </label>
              </div>

              <div className="relative group ml-2">
                <FiInfo className="text-gray-400 w-4 h-4 cursor-help" />
                <div className="absolute z-50 bottom-full mb-2 left-0 w-48 px-2 py-1.5 bg-gray-800 text-xs text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  终止状态是指任务流程的最终状态（如“已完成”、“已取消”），达到此状态的任务通常不再需要进一步处理或流转。
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              onClick={() => setShowForm(false)}
            >
              取消
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleSubmit}
            >
              添加
            </button>
          </div>
        </div>
      )}

      {/* 状态转换矩阵 */}
      {items.length > 1 && (
        <div>
          <h6 className="text-sm font-medium mb-2">状态转换规则</h6>
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="text-xs text-gray-600 mb-2">点击单元格设置或取消状态转换关系</div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-2 py-2 bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">从\到</th>
                    {items.map(item => (
                      <th key={item.id} className="px-2 py-2 bg-gray-100 text-center text-xs font-medium" style={{color: item.color}}>{item.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map(fromItem => (
                    <tr key={fromItem.id}>
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-medium" style={{color: fromItem.color}}>{fromItem.name}</td>
                      {items.map(toItem => (
                        <td
                          key={toItem.id}
                          className="px-2 py-2 whitespace-nowrap text-xs cursor-pointer hover:bg-gray-50"
                          onClick={() => fromItem.id !== toItem.id && onToggleTransition(fromItem.id, toItem.id)}
                        >
                          {fromItem.id === toItem.id ? (
                            <div className="w-4 h-4 flex items-center justify-center text-black">-</div>
                          ) : (
                            <div className="w-4 h-4 flex items-center justify-center">
                              {transitions.some(rule => rule.fromStatusId === fromItem.id && rule.toStatusId === toItem.id) ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke={toItem.color} style={{color: toItem.color}}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
            <p className="text-xs text-gray-500 mt-2">注：点击单元格可以设置或取消状态转换关系</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomStatusEditor;
