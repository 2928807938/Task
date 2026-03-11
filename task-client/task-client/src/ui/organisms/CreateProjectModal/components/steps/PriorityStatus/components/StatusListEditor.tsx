"use client";

import React, {useState} from "react";
import {FiPlus, FiX} from "react-icons/fi";
import {ColorPicker} from "@/ui/molecules/ColorPicker";
import {StatusItem} from "@/types/api-types";

interface Props {
  items: StatusItem[];
  onAdd: (item: { color: string; name: string; id: string }) => void;
  onRemove: (id: string) => void;
}

const StatusListEditor: React.FC<Props> = ({ items, onAdd, onRemove }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3B82F6");

  const handleSubmit = () => {
    if (!name.trim()) return;
    const newItem: { color: string; name: string; id: string } = {
      id: `${Date.now()}`,
      name: name.trim(),
      color,
    };
    onAdd(newItem);
    setName("");
    setColor("#3B82F6");
    setShowForm(false);
  };

  return (
    <div className="mt-4">
      <h6 className="text-sm font-medium mb-2">自定义状态</h6>

      {items.length > 0 ? (
        <div className="space-y-1">
          {items.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded border border-gray-200"
            >
              <div className="flex items-center space-x-2 text-xs">
                <span
                  className="inline-block w-3 h-3 rounded"
                  style={{ background: s.color }}
                ></span>
                <span>{s.name}</span>
              </div>
              <button
                type="button"
                className="text-gray-400 hover:text-red-500"
                onClick={() => onRemove(s.id)}
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 italic">尚未添加自定义状态</p>
      )}

      {/* 添加按钮 */}
      <button
        type="button"
        className="flex items-center text-xs text-blue-600 mt-2 hover:underline"
        onClick={() => setShowForm(!showForm)}
      >
        <FiPlus className="w-3 h-3 mr-1" />
        添加状态
      </button>

      {/* 表单 */}
      {showForm && (
        <div className="p-3 bg-white rounded-lg border border-gray-200 mt-2">
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

export default StatusListEditor;
