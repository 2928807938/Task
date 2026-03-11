import React from 'react';
import {FiInfo} from 'react-icons/fi';

type StatusRuleInfoProps = {
  flowType: 'standard' | 'extended';
};

/**
 * 状态规则信息提示组件
 * 用于在状态转换规则表格上方显示明确的提示，表明这些规则是预设的且不可修改
 */
const StatusRuleInfo: React.FC<StatusRuleInfoProps> = ({ flowType }) => {
  const title = flowType === 'standard' ? '标准流程' : '扩展流程';

  return (
    <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-100 flex items-start">
      <FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
      <div>
        <p className="text-xs text-blue-700">
          <strong>{title}状态转换规则（预设）</strong>：
          下方显示的是系统预设的状态转换规则，不可修改。
          勾选的项表示允许从一个状态转换到另一个状态。
        </p>
      </div>
    </div>
  );
};

export default StatusRuleInfo;
