'use client';

import React, {useMemo, useState} from 'react';
import {FiArchive, FiCopy, FiEdit, FiEye, FiRefreshCw, FiTrash2, FiUsers} from 'react-icons/fi';
import {useRouter} from 'next/navigation';
import {useProjectListContext} from '@/contexts/ProjectListContext';
import {ProjectListItem} from '@/types/api-types';
import {useProjectHook} from '@/hooks/use-project-hook';
import { motion, type Variants } from 'framer-motion';
import {useToast} from '@/ui/molecules/Toast';
import ArchiveReasonModal from './ArchiveReasonModal';
import EditProjectModal from './EditProjectModal';

interface ExtendedProjectListItem extends Omit<ProjectListItem, 'status' | 'progress' | 'priority' | 'archived'> {
  status?: string;
  progress?: number;
  priority?: string;
  tags?: string[];
  dueDate?: string;
  archived: boolean;
}

interface ProjectCardMenuProps {
  project: ExtendedProjectListItem;
  onClose: () => void;
}

const ProjectCardMenu: React.FC<ProjectCardMenuProps> = ({ project, onClose }) => {
  const { setIsDeleteModalOpen, setProjectToDelete } = useProjectListContext();
  const router = useRouter();
  const { addToast } = useToast();
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { useChangeArchiveStatus, useCreateProject, useGetProjectDetail } = useProjectHook();
  const changeArchiveStatusMutation = useChangeArchiveStatus();
  const createProjectMutation = useCreateProject();
  const { data: projectDetail, isLoading: isProjectDetailLoading } = useGetProjectDetail(project.id);

  const editableProject = useMemo(() => ({
    id: String(project.id),
    name: project.name,
    description: project.description || ''
  }), [project.description, project.id, project.name]);

  const handleDuplicateProject = async () => {
    if (!projectDetail?.teamId) {
      addToast(isProjectDetailLoading ? '正在加载项目信息，请稍后再试' : '暂时无法复制该项目，请稍后重试', 'warning');
      return;
    }

    await createProjectMutation.mutateAsync({
      name: `${project.name}（副本）`,
      description: project.description || '',
      teamId: projectDetail.teamId,
      prioritySystem: 'standard',
      statusSystem: 'standard',
      customPriorityItems: [],
      customStatusItems: [],
      customStatusTransitions: []
    });

    onClose();
  };

  const handleAction = async (action: string) => {
    if (action === '查看详情') {
      router.push(`/project-detail?id=${project.id}`);
      onClose();
      return;
    }

    if (action === '编辑项目') {
      setIsEditModalOpen(true);
      return;
    }

    if (action === '成员管理') {
      router.push(`/project-detail?id=${project.id}&tab=team`);
      onClose();
      return;
    }

    if (action === '复制项目') {
      try {
        await handleDuplicateProject();
      } catch (error) {
        console.error('复制项目失败:', error);
      }
      return;
    }

    if (action === '删除项目') {
      setProjectToDelete({
        id: String(project.id),
        name: project.name
      });
      setIsDeleteModalOpen(true);
      onClose();
      return;
    }

    if (action === '归档项目' || action === '恢复项目') {
      setIsArchiveModalOpen(true);
      return;
    }
  };

  const menuVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -5 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: 'easeOut' } }
  };

  const buttonVariants = {
    hover: { backgroundColor: 'var(--theme-card-hover)' },
    tap: { scale: 0.98 }
  };

  return (
    <>
      <motion.div
        className="relative z-40 w-52 rounded-2xl border py-1.5 shadow-lg backdrop-blur-sm bg-opacity-90"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: 'var(--theme-shadow-lg)'
        }}
        variants={menuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.button
          onClick={() => void handleAction('查看详情')}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors"
          style={{ color: 'var(--foreground)' }}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--theme-primary-100)' }}>
            <FiEye className="h-3.5 w-3.5" style={{ color: 'var(--theme-primary-500)' }} />
          </span>
          <span className="font-medium">查看详情</span>
        </motion.button>

        <motion.button
          onClick={() => void handleAction('编辑项目')}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors"
          style={{ color: 'var(--foreground)' }}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--theme-success-100)' }}>
            <FiEdit className="h-3.5 w-3.5" style={{ color: 'var(--theme-success-500)' }} />
          </span>
          <span className="font-medium">编辑项目</span>
        </motion.button>

        <motion.button
          onClick={() => void handleAction('成员管理')}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors"
          style={{ color: 'var(--foreground)' }}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--theme-info-100)' }}>
            <FiUsers className="h-3.5 w-3.5" style={{ color: 'var(--theme-info-500)' }} />
          </span>
          <span className="font-medium">成员管理</span>
        </motion.button>

        <motion.button
          onClick={() => void handleAction('复制项目')}
          disabled={createProjectMutation.isPending}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          style={{ color: 'var(--foreground)' }}
          variants={buttonVariants}
          whileHover={createProjectMutation.isPending ? undefined : 'hover'}
          whileTap={createProjectMutation.isPending ? undefined : 'tap'}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--theme-primary-100)' }}>
            <FiCopy className="h-3.5 w-3.5" style={{ color: 'var(--theme-primary-500)' }} />
          </span>
          <span className="font-medium">{createProjectMutation.isPending ? '复制中...' : '复制项目'}</span>
        </motion.button>

        <motion.button
          onClick={() => {
            void handleAction(project.archived === true ? '恢复项目' : '归档项目');
          }}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors"
          style={{ color: 'var(--foreground)' }}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.2 }}
        >
          {project.archived === true ? (
            <>
              <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--theme-primary-100)' }}>
                <FiRefreshCw className="h-3.5 w-3.5" style={{ color: 'var(--theme-primary-500)' }} />
              </span>
              <span className="font-medium">恢复项目</span>
            </>
          ) : (
            <>
              <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--theme-warning-100)' }}>
                <FiArchive className="h-3.5 w-3.5" style={{ color: 'var(--theme-warning-500)' }} />
              </span>
              <span className="font-medium">归档项目</span>
            </>
          )}
        </motion.button>

        <div className="mx-2 my-1 border-t" style={{ borderColor: 'var(--theme-card-border)' }} />

        <motion.button
          onClick={() => void handleAction('删除项目')}
          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors"
          style={{ color: 'var(--theme-error-500)' }}
          variants={{
            hover: { backgroundColor: 'var(--theme-error-50)' },
            tap: { scale: 0.98 }
          }}
          whileHover="hover"
          whileTap="tap"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--theme-error-100)' }}>
            <FiTrash2 className="h-3.5 w-3.5" style={{ color: 'var(--theme-error-500)' }} />
          </span>
          <span className="font-medium">删除项目</span>
        </motion.button>
      </motion.div>

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          onClose();
        }}
        project={editableProject}
        onSuccess={() => {
          setIsEditModalOpen(false);
          onClose();
        }}
      />

      <ArchiveReasonModal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          onClose();
        }}
        onConfirm={(reason) => {
          changeArchiveStatusMutation.mutate({
            id: project.id,
            archived: !project.archived,
            reason
          });
          onClose();
        }}
        isArchiving={!project.archived}
        projectName={project.name}
      />
    </>
  );
};

export default ProjectCardMenu;
