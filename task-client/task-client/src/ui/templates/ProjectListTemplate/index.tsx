'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { ProjectListProvider, useProjectListContext } from '@/contexts/ProjectListContext';
import useProjectHook from '@/hooks/use-project-hook';
import GlobalStyles from '@/ui/atoms/GlobalStyles';
import CreateProjectModal from '@/ui/organisms/CreateProjectModal';
import DeleteProjectModal from '@/ui/organisms/DeleteProjectModal';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  ProjectCard,
  ProjectListHeader,
  ProjectListItem,
  ProjectListPagination,
  ProjectListToolbar,
} from '@/ui/organisms/ProjectListComponents';
import { getProjectProgress } from '@/ui/organisms/ProjectListComponents/project-list-utils';

const ProjectListContextWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProjectListProvider>{children}</ProjectListProvider>;
};

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [pageNum, setPageNum] = useState(1);
  const pageSize = 10;

  const { isDeleteModalOpen, setIsDeleteModalOpen, projectToDelete, setProjectToDelete } = useProjectListContext();
  const { useGetCurrentUserProjects } = useProjectHook();

  const { data, isLoading, error, refetch } = useGetCurrentUserProjects({
    pageNum,
    pageSize,
    name: searchQuery,
    sortField: 'createdAt',
    sortOrder: sortDirection,
  });

  useEffect(() => {
    setPageNum(1);
  }, [searchQuery, sortDirection]);

  const projectList = useMemo(() => {
    if (!data?.content || !Array.isArray(data.content)) {
      return [];
    }

    return data.content;
  }, [data]);

  const totalProjects = data?.total || 0;
  const totalPages = data?.pages || Math.ceil(totalProjects / pageSize) || 0;

  const filteredProjects = useMemo(() => projectList, [projectList]);

  const headerStats = useMemo(() => {
    const activeCount = filteredProjects.filter((project) => !project.archived).length;
    const archivedCount = filteredProjects.filter((project) => project.archived).length;
    const averageProgress = filteredProjects.length
      ? Math.round(filteredProjects.reduce((sum, project) => sum + getProjectProgress(project), 0) / filteredProjects.length)
      : 0;

    return [
      {
        label: '项目总数',
        value: totalProjects.toString(),
        hint: `当前页展示 ${filteredProjects.length} 个`,
      },
      {
        label: '活跃项目',
        value: activeCount.toString(),
        hint: '本页正在推进的项目',
      },
      {
        label: '已归档',
        value: archivedCount.toString(),
        hint: '本页已完成或暂停项目',
      },
      {
        label: '平均进度',
        value: `${averageProgress}%`,
        hint: '按当前页项目测算',
      },
    ];
  }, [filteredProjects, totalProjects]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortDirection('desc');
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState viewMode={viewMode} />;
    }

    if (error) {
      return <ErrorState message={error.message || '服务器发生错误，请稍后再试'} onRetry={() => refetch()} />;
    }

    if (!filteredProjects.length) {
      return <EmptyState onClearFilters={clearFilters} onCreateProject={() => setIsCreateModalOpen(true)} />;
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.28, delay: index * 0.04 }}
                className="aspect-square min-h-0"
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <AnimatePresence>
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, delay: index * 0.03 }}
            >
              <ProjectListItem project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1480px]">
      <section className="dashboard-shell rounded-[36px] p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:gap-7">
          <ProjectListHeader stats={headerStats} onCreateProject={() => setIsCreateModalOpen(true)} />

          <ProjectListToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortDirection={sortDirection}
            toggleSortDirection={() => setSortDirection((value) => (value === 'asc' ? 'desc' : 'asc'))}
            viewMode={viewMode}
            setViewMode={setViewMode}
            resultCount={filteredProjects.length}
            totalCount={totalProjects}
          />

          {renderContent()}

          <ProjectListPagination
            currentPage={pageNum}
            totalPages={totalPages}
            totalProjects={totalProjects}
            filteredCount={filteredProjects.length}
            onPageChange={setPageNum}
          />
        </div>
      </section>

      <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        project={projectToDelete}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default ProjectListTemplate;
