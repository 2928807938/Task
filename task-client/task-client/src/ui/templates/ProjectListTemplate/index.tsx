'use client';

import React, {useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {ProjectListProvider, useProjectListContext} from '@/contexts/ProjectListContext';
import useProjectHook from '@/hooks/use-project-hook';
import CreateProjectModal from '@/ui/organisms/CreateProjectModal';
import DeleteProjectModal from '@/ui/organisms/DeleteProjectModal/index';
import EditProjectModal from '@/ui/organisms/ProjectListComponents/EditProjectModal';
import ArchiveReasonModal from '@/ui/organisms/ProjectListComponents/ArchiveReasonModal';
import GlobalStyles from '@/ui/atoms/GlobalStyles';
import {getBgColorClass, getInitials} from '@/utils/avatar-utils';

// 导入拆分出的组件
import {
    EmptyState,
    ErrorState,
    LoadingState,
    ProjectCard,
    ProjectListHeader,
    ProjectListPagination,
    ProjectListToolbar
} from '@/ui/organisms/ProjectListComponents';

// 项目排序方式
enum SortOption {
  NEWEST = '最新创建'
}

// 项目列表上下文组件
const ProjectListContextWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProjectListProvider>
      {children}
    </ProjectListProvider>
  );
};

// 项目列表模板组件
const ProjectListTemplate = () => {
  return (
    <>
      <GlobalStyles />
      <ProjectListContextWrapper>
        <ProjectListContent />
      </ProjectListContextWrapper>
    </>
  );
};

const ProjectListContent = () => {
  // 状态管理
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { isDeleteModalOpen, setIsDeleteModalOpen, projectToDelete, setProjectToDelete } = useProjectListContext();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption] = useState<SortOption>(SortOption.NEWEST);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(10);
  
  // 编辑和归档模态框状态
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);

  // 当前排序字段
  const [sortField, setSortField] = useState<string>('createdAt');

  // 根据选择的排序选项映射到API排序字段
  const apiSortField = useMemo(() => {
    // 根据不同的列名映射对应的API排序字段
    switch (sortField) {
      case 'name':
        return 'name';
      case 'createdAt':
      default:
        return 'createdAt';
    }
  }, [sortField]);

  // API请求
  const { useGetCurrentUserProjects, useChangeArchiveStatus } = useProjectHook();
  const { data, isLoading, error, refetch } = useGetCurrentUserProjects({
    pageNum,
    pageSize,
    name: searchQuery,
    sortField: apiSortField,
    sortOrder: sortDirection
  });
  const changeArchiveStatusMutation = useChangeArchiveStatus();

  // 处理列排序
  const handleSort = (field: string) => {
    if (sortField === field) {
      // 如果点击的是当前排序的列，切换排序方向
      toggleSortDirection();
    } else {
      // 如果点击的是新列，设置新列为排序字段，并使用默认的升序排序
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 提取项目列表数据
  const projectList = useMemo(() => {
    // 确保数据存在且是数组
    if (!data || !data.content || !Array.isArray(data.content)) {
      return [];
    }
    return data.content;
  }, [data]);

  const totalProjects = useMemo(() => {
    return data?.total || 0;
  }, [data]);

  const totalPages = useMemo(() => {
    if (!data || typeof data.total !== 'number') return 0;
    return Math.ceil(data.total / pageSize);
  }, [data, pageSize]);

  // 根据筛选条件过滤项目列表
  const filteredProjects = useMemo(() => {
    if (!projectList.length) {
      return [];
    }
    // 直接返回原始列表，不进行筛选
    return projectList;
  }, [projectList]);

  // 切换排序方向
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // 清除所有筛选
  const clearFilters = () => {
    setSearchQuery('');
    setSortDirection('desc');
  };

  return (
    <div className="w-full px-4 py-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col space-y-6">
        {/* 标题和操作区 */}
        <ProjectListHeader onCreateProject={() => setIsCreateModalOpen(true)} />

        {/* 项目状态和搜索 */}
        <ProjectListToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortDirection={sortDirection}
          toggleSortDirection={toggleSortDirection}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* 项目列表 */}
        {isLoading ? (
          // 加载状态
          <LoadingState viewMode={viewMode} />
        ) : error ? (
          // 错误状态
          <ErrorState
            message={error?.message || '服务器发生错误，请稍后再试'}
            onRetry={() => refetch()}
          />
        ) : data && filteredProjects && filteredProjects.length > 0 ? (
          // 项目列表 - 根据视图模式切换显示
          viewMode === 'grid' ? (
            // 苹果风格网格模式
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 lg:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.05,
                      ease: [0.25, 0.1, 0.25, 1.0]
                    }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            // 表格模式
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-100/60 dark:bg-gray-800/40 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider cursor-pointer"
                          onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          <span>项目名称</span>
                        </div>
                      </th>
                      {/* 项目状态列 */}
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider">
                        状态
                      </th>
                      {/* 移除状态列 */}
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider">
                        完成进度
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider cursor-pointer"
                          onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center justify-center">
                          创建时间
                          <span className="ml-1 text-gray-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        </div>
                      </th>
                      {/* 移除成员列 */}
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    <AnimatePresence>
                      {filteredProjects.map((project, index) => {
                        // 计算项目完成进度 - 与网格视图保持完全一致的逻辑
                        const calculateProgress = () => {
                          // 如果直接有progress字段且为有效数字，使用它
                          if (typeof project.progress === 'number' && project.progress >= 0) {
                            return project.progress;
                          }
                          
                          // 否则根据任务完成情况计算进度
                          const completedTaskCount = (project as any).completedTaskCount || 0;
                          const taskCount = (project as any).taskCount || 0;
                          
                          if (taskCount > 0) {
                            return Math.round((completedTaskCount / taskCount) * 100);
                          }
                          
                          return 0;
                        };
                        
                        const progress = calculateProgress();

                        // 判断项目状态
                        let statusText = '进行中';
                        let statusColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';

                        if (progress === 100) {
                          statusText = '已完成';
                          statusColor = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                        } else if (progress === 0 && !(project as any).taskCount) {
                          statusText = '未开始';
                          statusColor = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
                        }

                        return (
                          <motion.tr
                            key={project.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                            onClick={() => window.location.href = `/projects/${project.id}`}
                          >
                            {/* 项目名称和描述 */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-medium ${getBgColorClass(project.name)}`}>
                                  {getInitials(project.name)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.name}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{project.description || '无描述'}</div>
                                </div>
                              </div>
                            </td>

                            {/* 项目状态单元格 */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {project.archived === true ? (
                                <span className="px-2 py-1 text-xs rounded-md font-medium border" style={{
                                  backgroundColor: 'var(--theme-warning-100)',
                                  color: 'var(--theme-warning-500)',
                                  borderColor: 'var(--theme-warning-200)'
                                }}>
                                  已归档
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs rounded-md font-medium border" style={{
                                  backgroundColor: 'var(--theme-success-100)',
                                  color: 'var(--theme-success-500)',
                                  borderColor: 'var(--theme-success-200)'
                                }}>
                                  活跃
                                </span>
                              )}
                            </td>

                            {/* 进度 */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                  <div className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{progress}%</span>
                              </div>
                              {/* 只有当项目有任务时才显示任务数量 */}
                              {((project as any).taskCount > 0) && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {(project as any).completedTaskCount ?? 0}/{(project as any).taskCount ?? 0} 任务
                                </div>
                              )}
                            </td>

                            {/* 创建时间 */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-400">
                              {project.createdAt ? new Date(project.createdAt).toLocaleDateString('zh-CN') : '-'}
                            </td>

                            {/* 移除成员单元格 */}

                            {/* 操作按钮 - 平铺显示 */}
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                              <div className="flex items-center justify-center gap-2">
                                {/* 查看详情 */}
                                <button
                                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                                  style={{
                                    backgroundColor: 'var(--theme-primary-100)',
                                    color: 'var(--theme-primary-600)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--theme-primary-200)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--theme-primary-100)';
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/projects/${project.id}`;
                                  }}
                                >
                                  查看
                                </button>

                                {/* 编辑项目 */}
                                <button
                                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                                  style={{
                                    backgroundColor: 'var(--theme-success-100)',
                                    color: 'var(--theme-success-600)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--theme-success-200)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--theme-success-100)';
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentProject(project);
                                    setIsEditModalOpen(true);
                                  }}
                                >
                                  编辑
                                </button>

                                {/* 归档/恢复项目 */}
                                <button
                                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                                  style={{
                                    backgroundColor: project.archived === true ? 'var(--theme-primary-100)' : 'var(--theme-warning-100)',
                                    color: project.archived === true ? 'var(--theme-primary-600)' : 'var(--theme-warning-600)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = project.archived === true ? 'var(--theme-primary-200)' : 'var(--theme-warning-200)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = project.archived === true ? 'var(--theme-primary-100)' : 'var(--theme-warning-100)';
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentProject(project);
                                    setIsArchiveModalOpen(true);
                                  }}
                                >
                                  {project.archived === true ? '恢复' : '归档'}
                                </button>

                                {/* 删除项目 */}
                                <button
                                  className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                                  style={{
                                    backgroundColor: 'var(--theme-error-100)',
                                    color: 'var(--theme-error-600)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--theme-error-200)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--theme-error-100)';
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjectToDelete(project);
                                    setIsDeleteModalOpen(true);
                                  }}
                                >
                                  删除
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )
        ) : (
          // 空状态
          <EmptyState
            onClearFilters={clearFilters}
            onCreateProject={() => setIsCreateModalOpen(true)}
          />
        )}

        {/* 分页信息和控制 */}
        <ProjectListPagination
          currentPage={pageNum}
          totalPages={totalPages}
          totalProjects={totalProjects}
          filteredCount={filteredProjects.length}
          onPageChange={setPageNum}
        />
      </div>

      {/* 创建项目模态框 */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* 删除项目模态框 */}
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        project={projectToDelete}
        onSuccess={() => {
          // 刷新项目列表
          refetch();
        }}
      />

      {/* 编辑项目模态框 */}
      {currentProject && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentProject(null);
          }}
          project={{
            id: currentProject.id,
            name: currentProject.name,
            description: currentProject.description || ''
          }}
          onSuccess={() => {
            // 刷新项目列表
            refetch();
          }}
        />
      )}

      {/* 归档/恢复项目模态框 */}
      {currentProject && (
        <ArchiveReasonModal
          isOpen={isArchiveModalOpen}
          onClose={() => {
            setIsArchiveModalOpen(false);
            setCurrentProject(null);
          }}
          onConfirm={(reason) => {
            // 调用归档/取消归档接口
            changeArchiveStatusMutation.mutate({
              id: currentProject.id,
              archived: !currentProject.archived,
              reason: reason
            });
            // 关闭模态框
            setIsArchiveModalOpen(false);
            setCurrentProject(null);
            // 刷新列表
            setTimeout(() => refetch(), 500);
          }}
          isArchiving={!currentProject.archived}
          projectName={currentProject.name}
        />
      )}
    </div>
  );
};

export default ProjectListTemplate;
