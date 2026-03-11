"use client";

import React, {useState} from 'react';
import TeamOverview from '../../organisms/TeamOverview';
import ActivityHeatmap from '../../organisms/ActivityHeatmap';
import DepartmentStructure from '../../organisms/DepartmentStructure';
import RecentCommunications from '../../organisms/RecentCommunications';
import {FiFilter, FiGrid, FiList, FiPlus, FiSearch} from 'react-icons/fi';
import {AnimatePresence, motion} from 'framer-motion';
import Button from '@/ui/atoms/Button';

interface TeamManagementTemplateProps {
  title?: string;
}

const TeamManagementTemplate: React.FC<TeamManagementTemplateProps> = ({ title = "团队管理" }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // 清除所有筛选
  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
    setRoleFilter('all');
  };

  return (
    <div className="w-full px-2 py-3 sm:px-3 sm:py-4">
      <div className="flex flex-col space-y-3 sm:space-y-4">
        {/* 标题和操作区 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">管理和查看您的团队信息</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="flex items-center gap-1 shadow-sm hover:shadow transition-shadow duration-300"
          >
            <FiPlus className="w-3.5 h-3.5" />
            添加成员
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-gray-50 bg-opacity-60 rounded-lg p-2 transition-all duration-300">
          <div className="flex items-center flex-wrap gap-2">
            {/* 搜索区域 */}
            <div className="relative group flex-grow max-w-[160px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-1.5 pointer-events-none">
                <FiSearch className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
              </div>
              <input
                type="text"
                placeholder="搜索成员..."
                className="block w-full pl-6 pr-6 py-1 text-sm bg-white border-0 rounded-full shadow-sm focus:ring-1 focus:ring-blue-400 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* 筛选控件组 */}
            <div className="flex items-center gap-1 ml-auto">
              {/* 布局切换按钮组 */}
              <div className="flex p-0.5 bg-white rounded-full shadow-sm border border-gray-100">
                <button
                  className={`p-1.5 rounded-full transition-colors duration-200 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  onClick={() => setViewMode('grid')}
                  title="网格视图"
                >
                  <FiGrid className="h-3 w-3" />
                </button>
                <button
                  className={`p-1.5 rounded-full transition-colors duration-200 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  onClick={() => setViewMode('list')}
                  title="列表视图"
                >
                  <FiList className="h-3 w-3" />
                </button>
              </div>

              {/* 高级筛选按钮 */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center p-2 rounded-full shadow-sm border transition-all duration-200 ${showFilters ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                title="高级筛选"
              >
                <FiFilter className="h-3 w-3" />
                {(departmentFilter !== 'all' || roleFilter !== 'all') && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border border-white">
                    {(departmentFilter !== 'all' ? 1 : 0) + (roleFilter !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 高级筛选选项 */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3 mb-1">
                    <p className="text-sm text-gray-600 font-medium">高级筛选选项</p>
                  </div>
                  {/* 部门筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
                    <select
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-full focus:ring-blue-400 focus:border-blue-400 shadow-sm"
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                      <option value="all">全部部门</option>
                      <option value="development">研发部</option>
                      <option value="design">设计部</option>
                      <option value="marketing">市场部</option>
                      <option value="operations">运营部</option>
                    </select>
                  </div>

                  {/* 角色筛选 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
                    <select
                      className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-full focus:ring-blue-400 focus:border-blue-400 shadow-sm"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="all">全部角色</option>
                      <option value="manager">管理者</option>
                      <option value="leader">团队负责人</option>
                      <option value="member">普通成员</option>
                      <option value="intern">实习生</option>
                    </select>
                  </div>

                  {/* 清除筛选按钮 */}
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-blue-600 hover:text-white hover:bg-blue-500 rounded-full transition-colors duration-200 flex items-center gap-1.5 shadow-sm"
                    >
                      清除所有筛选
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 团队信息区域 */}
        <div className={`${viewMode === 'list' ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'}`}>
          {/* 团队概览卡片 - 在两种视图中都显示，但样式不同 */}
          <div className={`${viewMode === 'list' ? 'col-span-full' : 'sm:col-span-2 lg:col-span-3'}`}>
            <TeamOverview />
          </div>

          {/* 部门结构信息 - 在两种视图中都显示 */}
          <div className={viewMode === 'list' ? '' : 'lg:col-span-1'}>
            <DepartmentStructure />
          </div>

          {/* 活动热图 - 在两种视图中都显示 */}
          <div className={viewMode === 'list' ? '' : 'lg:col-span-2'}>
            <ActivityHeatmap />
          </div>

          {/* 最近沟通 - 在两种视图中都显示 */}
          <div className={viewMode === 'list' ? '' : 'sm:col-span-2 lg:col-span-3'}>
            <RecentCommunications />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagementTemplate;
