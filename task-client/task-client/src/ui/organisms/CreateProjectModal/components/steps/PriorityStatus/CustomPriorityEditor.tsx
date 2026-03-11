'use client';

import React, {useState} from 'react';
import {FiEdit2, FiPlus, FiX} from 'react-icons/fi';
import {PriorityItem} from '@/types/api-types';
import {ColorPicker} from '@/ui/molecules/ColorPicker';

interface CustomPriorityEditorProps {
  items: PriorityItem[];
  onAdd: (item: PriorityItem) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, name: string, color: string, order: number) => void;
}

const CustomPriorityEditor: React.FC<CustomPriorityEditorProps> = ({
  items,
  onAdd,
  onRemove,
  onUpdate
}) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('var(--theme-primary-500)');

  // 编辑状态管理
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;

    // 计算新项的顺序值 - 获取当前最大order值并加1
    const maxOrder = items.length > 0
      ? Math.max(...items.map(item => item.order))
      : 0;

    const newItem: PriorityItem = {
      id: `priority-${Date.now()}`,
      name: name.trim(),
      color,
      order: maxOrder + 1, // 新项的顺序值
    };

    onAdd(newItem);
    setName('');
    setColor('var(--theme-primary-500)');
    setShowForm(false);
  };

  const startEditing = (item: PriorityItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
    setEditingColor(item.color);
  };

  const saveEdit = () => {
    if (!editingId || !editingName.trim()) return;

    // 找到当前编辑的项，保留其order值
    const currentItem = items.find(item => item.id === editingId);
    if (!currentItem) return;

    onUpdate(editingId, editingName.trim(), editingColor, currentItem.order);
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--theme-neutral-50)' }}>
      <div className="flex items-center justify-between mb-3">
        <h6 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>自定义优先级</h6>
        <button
          type="button"
          className="text-xs flex items-center"
          style={{ color: 'var(--theme-primary-600)' }}
          onClick={() => setShowForm(!showForm)}
        >
          <FiPlus className="w-3 h-3 mr-1" />
          添加优先级
        </button>
      </div>

      {/* 优先级列表 */}
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
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none"
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
                    <span className="text-xs" style={{ color: 'var(--foreground)' }}>{item.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      className="transition-colors"
                      style={{ color: 'var(--theme-neutral-400)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--theme-primary-500)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--theme-neutral-400)';
                      }}
                      onClick={() => startEditing(item)}
                    >
                      <FiEdit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      className="transition-colors"
                      style={{ color: 'var(--theme-neutral-400)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--theme-error-500)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--theme-neutral-400)';
                      }}
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
        <div className="text-xs text-gray-500 italic mb-4">尚未添加自定义优先级</div>
      )}

      {/* 添加优先级表单 */}
      {showForm && (
        <div className="p-3 bg-white rounded-lg border border-gray-200 mb-4">
          <div className="mb-3">
            <label className="block text-xs text-gray-700 mb-1">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入优先级名称"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="mb-3">
            <ColorPicker
              value={color}
              onChange={setColor}
              label="颜色"
              size="md"
            />
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
    </div>
  );
};

export default CustomPriorityEditor;
