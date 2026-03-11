'use client';

import React from 'react';
import {FiCheck, FiInfo} from 'react-icons/fi';

const StandardFlowDetails: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-medium">标准流程</h3>
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <FiCheck className="text-white" size={18} />
        </div>
      </div>

      {/* 状态列表 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="px-4 py-2 rounded-md text-sm bg-white border" style={{ color: '#9C27B0', borderColor: '#9C27B0' }}>筹划中</div>
        <div className="px-4 py-2 rounded-md text-sm bg-white border" style={{ color: '#4CAF50', borderColor: '#4CAF50' }}>进行中</div>
        <div className="px-4 py-2 rounded-md text-sm bg-white border" style={{ color: '#FFC107', borderColor: '#FFC107' }}>已暂停</div>
        <div className="px-4 py-2 rounded-md text-sm bg-white border" style={{ color: '#2196F3', borderColor: '#2196F3' }}>已完成</div>
        <div className="px-4 py-2 rounded-md text-sm bg-white border" style={{ color: '#FF9800', borderColor: '#FF9800' }}>已取消</div>
      </div>

      <h4 className="text-base font-medium mb-3">状态转换规则</h4>

      {/* 规则说明 */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <div className="flex items-start">
          <FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" size={18} />
          <p className="text-sm text-blue-700">
            标准流程状态转换规则（预设）：下方显示的是系统预设的状态转换规则，不可修改。勾选的项表示允许从一个状态转换到另一个状态。
          </p>
        </div>
      </div>

      {/* 转换矩阵 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-600 mb-3">点击选择可以转换的状态关系</p>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="px-3 py-2 bg-gray-50 text-left text-xs font-medium text-gray-500 border">从\到</th>
                <th className="px-3 py-2 bg-gray-50 text-center text-xs font-medium border" style={{color: '#9C27B0'}}>筹划中</th>
                <th className="px-3 py-2 bg-gray-50 text-center text-xs font-medium border" style={{color: '#4CAF50'}}>进行中</th>
                <th className="px-3 py-2 bg-gray-50 text-center text-xs font-medium border" style={{color: '#FFC107'}}>已暂停</th>
                <th className="px-3 py-2 bg-gray-50 text-center text-xs font-medium border" style={{color: '#2196F3'}}>已完成</th>
                <th className="px-3 py-2 bg-gray-50 text-center text-xs font-medium border" style={{color: '#FF9800'}}>已取消</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border text-xs font-medium" style={{color: '#9C27B0'}}>筹划中</td>
                <td className="px-3 py-2 border text-center text-xs">-</td>
                <td className="px-3 py-2 border text-center text-xs text-green-500">✓</td>
                <td className="px-3 py-2 border text-center text-xs text-green-500">✓</td>
                <td className="px-3 py-2 border text-center text-xs">-</td>
                <td className="px-3 py-2 border text-center text-xs text-green-500">✓</td>
              </tr>
              <tr>
                <td className="px-3 py-2 border text-xs font-medium" style={{color: '#4CAF50'}}>进行中</td>
                <td className="px-3 py-2 border text-center text-xs text-green-500">✓</td>
                <td className="px-3 py-2 border text-center text-xs">-</td>
                <td className="px-3 py-2 border text-center text-xs text-green-500">✓</td>
                <td className="px-3 py-2 border text-center text-xs text-green-500">✓</td>
                <td className="px-3 py-2 border text-center text-xs text-green-500">✓</td>
              </tr>
              <tr>
                <td className="px-3 py-2 border text-xs font-medium" style={{color: '#FFC107'}}>已暂停</td>
                <td className="px-3 py-2 border text-center text-xs text-green-500">✓</td>
                <td className="px-3 py-2 border text-center text-xs text-green-500">✓</td>
                <td className="px-3 py-2 border text-center text-xs">-</td>
                <td className="px-3 py-2 border text-center text-xs">-</td>
                <td className="px-3 py-2 border text-center text-xs text-green-500">✓</td>
              </tr>
              <tr>
                <td className="px-3 py-2 border text-xs font-medium" style={{color: '#2196F3'}}>已完成</td>
                <td className="px-3 py-2 border text-center text-xs">-</td>
                <td className="px-3 py-2 border text-center text-xs text-green-500">✓</td>
                <td className="px-3 py-2 border text-center text-xs">-</td>
                <td className="px-3 py-2 border text-center text-xs">-</td>
                <td className="px-3 py-2 border text-center text-xs">-</td>
              </tr>
              <tr>
                <td className="px-3 py-2 border text-xs font-medium" style={{color: '#FF9800'}}>已取消</td>
                <td className="px-3 py-2 border text-center text-xs text-green-500">✓</td>
                <td className="px-3 py-2 border text-center text-xs">-</td>
                <td className="px-3 py-2 border text-center text-xs">-</td>
                <td className="px-3 py-2 border text-center text-xs">-</td>
                <td className="px-3 py-2 border text-center text-xs">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 mt-3">注：可以选择多个状态转换关系，默认已设置常用转换规则</p>
      </div>
    </div>
  );
};

export default StandardFlowDetails;
