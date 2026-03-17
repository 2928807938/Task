'use client';

import React, {useState} from 'react';
import {FiArchive, FiCopy, FiEdit, FiEye, FiRefreshCw, FiTrash2, FiUsers} from 'react-icons/fi';
import {useRouter} from 'next/navigation';
import {useProjectListContext} from '@/contexts/ProjectListContext';
import {ProjectListItem} from '@/types/api-types';
import {useProjectHook} from '@/hooks/use-project-hook';
import { motion, type Variants } from 'framer-motion';
import ArchiveReasonModal from './ArchiveReasonModal';

// 扫展 ProjectListItem 类型，与 ProjectCard 组件保持一致
interface ExtendedProjectListItem extends Omit<ProjectListItem, 'status' | 'progress' | 'priority' | 'archived'> {
  status?: string; // 使用可选的status
  progress?: number; // 使用可选的progress
  priority?: string; // 使用可选的priority
  tags?: string[];
  dueDate?: string;
  archived: boolean; // 与ProjectListItem保持兼容的archived属性类型
}

interface ProjectCardMenuProps {
  project: ExtendedProjectListItem;
  onClose: () => void;
}

const ProjectCardMenu: React.FC<ProjectCardMenuProps> = ({ project, onClose }) => {
  // 获取全局状态管理函数
  const { setIsDeleteModalOpen, setProjectToDelete } = useProjectListContext();
  const router = useRouter();
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // 使用项目API钩子
  const { useChangeArchiveStatus } = useProjectHook();
  const changeArchiveStatusMutation = useChangeArchiveStatus();

  // 确保archived属性存在

  const handleAction = (action: string) => {
    // 处理各种操作
    if (action === '查看详情') {
      // 导航到项目详情页
      router.push(`/projects/${project.id}`);
    } else if (action === '删除项目') {
      // 打开全局删除模态框
      setProjectToDelete({
        id: String(project.id), // 确保 ID 是字符串类型
        name: project.name
      });
      setIsDeleteModalOpen(true);
    } else if (action === '归档项目' || action === '恢复项目') {
      // 打开归档/取消归档原因模态框
      setIsArchiveModalOpen(true);
      return; // 不要立即关闭菜单，等待模态框交互
    }

    onClose();
  };

  // 菜单动画变量
  const menuVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -5 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: 'easeOut' } }
  };

  // 按钮悬停和点击动画 - 使用主题变量
  const buttonVariants = {
    hover: { backgroundColor: 'var(--theme-card-hover)' },
    tap: { scale: 0.98 }
  };

  return (
    <>
      <motion.div
        className="absolute top-10 right-0 w-48 rounded-xl shadow-lg py-1 z-10 border backdrop-blur-sm bg-opacity-90"
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
          onClick={() => handleAction('查看详情')}
          className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
          style={{
            color: 'var(--foreground)'
          }}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--theme-primary-100)' }}>
            <FiEye className="h-3.5 w-3.5" style={{ color: 'var(--theme-primary-500)' }} />
          </span>
          <span className="font-medium">查看详情</span>
        </motion.button>
        <motion.button
          onClick={() => handleAction('编辑项目')}
          className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
          style={{
            color: 'var(--foreground)'
          }}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--theme-success-100)' }}>
            <FiEdit className="h-3.5 w-3.5" style={{ color: 'var(--theme-success-500)' }} />
          </span>
          <span className="font-medium">编辑项目</span>
        </motion.button>
        <motion.button
          onClick={() => handleAction('成员管理')}
          className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
          style={{
            color: 'var(--foreground)'
          }}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--theme-info-100)' }}>
            <FiUsers className="h-3.5 w-3.5" style={{ color: 'var(--theme-info-500)' }} />
          </span>
          <span className="font-medium">成员管理</span>
        </motion.button>
        <motion.button
          onClick={() => handleAction('复制项目')}
          className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
          style={{
            color: 'var(--foreground)'
          }}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--theme-primary-100)' }}>
            <FiCopy className="h-3.5 w-3.5" style={{ color: 'var(--theme-primary-500)' }} />
          </span>
          <span className="font-medium">复制项目</span>
        </motion.button>

        {/* 归档/恢复项目按钮 -  */}
        <motion.button
          onClick={() => {
            handleAction(project.archived === true ? '恢复项目' : '归档项目');
            // 说明：在handleAction中处理模态框的打开，不会立即关闭菜单
          }}
          className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
          style={{
            color: 'var(--foreground)'
          }}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * 4, duration: 0.2 }}
        >
          {project.archived === true ? (
            <>
              <span className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--theme-primary-100)' }}>
                <FiRefreshCw className="h-3.5 w-3.5" style={{ color: 'var(--theme-primary-500)' }} />
              </span>
              <span className="font-medium">恢复项目</span>
            </>
          ) : (
            <>
              <span className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--theme-warning-100)' }}>
                <FiArchive className="h-3.5 w-3.5" style={{ color: 'var(--theme-warning-500)' }} />
              </span>
              <span className="font-medium">归档项目</span>
            </>
          )}
        </motion.button>

        {/* 苹果风格分隔线 */}
        <div className="mx-2 my-1 border-t" style={{ borderColor: 'var(--theme-card-border)' }} />

        {/* 删除项目按钮 - 危险操作 */}
        <motion.button
          onClick={() => handleAction('删除项目')}
          className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
          style={{
            color: 'var(--theme-error-500)'
          }}
          variants={{
            hover: { backgroundColor: 'var(--theme-error-50)' },
            tap: { scale: 0.98 }
          }}
          whileHover="hover"
          whileTap="tap"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--theme-error-100)' }}>
            <FiTrash2 className="h-3.5 w-3.5" style={{ color: 'var(--theme-error-500)' }} />
          </span>
          <span className="font-medium">删除项目</span>
        </motion.button>
      </motion.div>

      {/* 归档/恢复原因模态框 */}
      <ArchiveReasonModal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          onClose(); // 关闭菜单
        }}
        onConfirm={(reason) => {
          // 调用归档/取消归档接口
          changeArchiveStatusMutation.mutate({
            id: project.id,
            archived: !project.archived,
            reason: reason
          });
          onClose(); // 关闭菜单
        }}
        isArchiving={!project.archived}
        projectName={project.name}
      />
    </>
  );
};

export default ProjectCardMenu;
