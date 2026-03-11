"use client";

import React, {useState} from 'react';
import {FiChevronDown, FiChevronRight, FiLayout} from 'react-icons/fi';
import {AnimatePresence, motion} from 'framer-motion';

interface Department {
  id: string;
  name: string;
  count: number;
  subDepartments?: Department[];
}

// 模拟部门数据
const departmentData: Department[] = [
  {
    id: 'research',
    name: '研发部',
    count: 45,
    subDepartments: [
      { id: 'frontend', name: '前端组', count: 15 },
      { id: 'backend', name: '后端组', count: 20 },
      { id: 'testing', name: '测试组', count: 10 },
    ]
  },
  {
    id: 'product',
    name: '产品部',
    count: 28,
  },
  {
    id: 'design',
    name: '设计部',
    count: 18,
  }
];

interface DepartmentItemProps {
  department: Department;
  level?: number;
}

const DepartmentItem: React.FC<DepartmentItemProps> = ({ department, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasSubDepartments = department.subDepartments && department.subDepartments.length > 0;

  const toggleExpand = () => {
    if (hasSubDepartments) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer mb-1.5 hover:bg-blue-50 transition-all duration-200 ${level === 0 ? 'bg-white shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.8)]' : 'bg-white bg-opacity-80'}`}
        onClick={toggleExpand}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        <div className="flex items-center">
          {hasSubDepartments && (
            <span className="mr-2 bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-blue-500">
              {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
            </span>
          )}
          <span className="text-gray-700 text-sm font-medium">{department.name}</span>
        </div>
        <span className="text-xs px-2 py-0.5 bg-blue-50 rounded-full text-blue-600 font-medium">{department.count} 人</span>
      </div>

      <AnimatePresence>
        {isExpanded && hasSubDepartments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-4 border-l-2 border-blue-100 pl-2"
          >
            {department.subDepartments?.map((subDept) => (
              <DepartmentItem
                key={subDept.id}
                department={subDept}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DepartmentStructure: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -3 }}
      className="bg-white rounded border border-gray-200 overflow-hidden hover:shadow-sm transition-all duration-200 w-full h-full"
    >
      {/* 卡片顶部彩条 */}
      <div className="h-1 w-full bg-green-500"></div>

      <div className="p-2 sm:p-3">
        <div className="flex items-center mb-4">
          <div className="bg-green-100 p-2 rounded-lg mr-3">
            <FiLayout className="text-green-500 w-4 h-4" />
          </div>
          <h2 className="text-base font-semibold text-gray-800">部门结构</h2>
        </div>
        <div className="space-y-1 pr-1 overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {departmentData.map((department) => (
            <DepartmentItem key={department.id} department={department} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DepartmentStructure;
