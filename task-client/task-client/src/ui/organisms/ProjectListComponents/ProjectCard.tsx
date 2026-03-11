'use client';

import React, {useEffect, useRef, useState} from 'react';
import {FiCalendar, FiChevronRight, FiEdit2, FiMoreVertical, FiRefreshCw, FiTrash2} from 'react-icons/fi';
import {useProjectHook} from '@/hooks/use-project-hook';
import {motion} from 'framer-motion';
import {useRouter} from 'next/navigation';
import {ProjectListItem} from '@/types/api-types';
import {useProjectListContext} from '@/contexts/ProjectListContext';
import {getBgColorClass, getInitials} from '@/utils/avatar-utils';
import ArchiveReasonModal from './ArchiveReasonModal';
import EditProjectModal from './EditProjectModal';

// 项目卡片属性类型
interface ProjectCardProps {
  project: Omit<ProjectListItem, 'archived'> & { archived: boolean };
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  // 确保archived属性存在
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 使用项目API钩子
  const { useChangeArchiveStatus } = useProjectHook();
  const changeArchiveStatusMutation = useChangeArchiveStatus();

  // 使用项目列表上下文
  const { setProjectToDelete, setIsDeleteModalOpen } = useProjectListContext();

  // 处理卡片点击事件 - 导航到项目详情页
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.project-menu-button') ||
        (e.target as HTMLElement).closest('.project-menu')) {
      return;
    }
    router.push(`/projects/${project.id}`);
  };

  // 处理点击外部关闭菜单
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  };

  // 添加和移除事件监听器
  useEffect(() => {
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  // 格式化日期
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '未设置';
    const date = new Date(dateStr);

    // 更紧凑的日期格式
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}.${month}.${day}`;
  };

  // 移除计算项目运行天数的函数

  // 根据项目任务完成情况计算进度百分比，与列表视图保持一致
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

  // 项目进度
  const progress = calculateProgress();

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={handleCardClick}
        className="relative overflow-hidden rounded-2xl cursor-pointer transition-all transform"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          boxShadow: isHovered
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid var(--theme-card-border)',
          transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1.0)',
          transform: isHovered ? 'scale(1.01)' : 'scale(1)',
          willChange: 'transform, box-shadow'
        }}
      >
        {/* 移除右上角多余的菜单按钮 */}
        {/* 苹果风格的顶部装饰条 */}
        <div className="relative h-1 w-full overflow-hidden">
          <div
            className="absolute inset-0 rounded-b-lg"
            style={{
              background: project.archived === true
                ? 'linear-gradient(135deg, var(--theme-warning-400), var(--theme-warning-500))'
                : 'linear-gradient(135deg, var(--theme-primary-400), var(--theme-primary-600))',
              opacity: 0.9
            }}
          />
        </div>

        <div className="p-5">
          {/* 归档状态标签 - 更精致的苹果风格 */}
          {project.archived === true && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute right-4 top-4 z-10"
            >
              <div
                className="flex items-center px-2.5 py-1 rounded-full shadow-sm"
                style={{
                  backgroundColor: 'var(--theme-warning-100)',
                  border: '1px solid var(--theme-warning-200)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 mr-1.5"
                  style={{ color: 'var(--theme-warning-600)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span
                  className="text-[11px] font-semibold"
                  style={{
                    color: 'var(--theme-warning-600)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    letterSpacing: '-0.02em'
                  }}
                >
                  已归档
                </span>
              </div>
            </motion.div>
          )}

          {/* 项目头部 - 苹果风格重新设计 */}
          <div className="flex items-start justify-between mb-4">
            {/* 左侧：项目图标和标题 */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-white font-medium text-sm ${getBgColorClass(project.name)}`}
              >
                {getInitials(project.name)}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <h3
                  className="text-[17px] font-semibold truncate mb-1"
                  style={{
                    color: 'var(--foreground)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    letterSpacing: '-0.022em',
                    lineHeight: '1.2'
                  }}
                >
                  {project.name}
                </h3>
                <p
                  className="text-[13px] leading-tight"
                  style={{
                    color: 'var(--theme-neutral-500)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    letterSpacing: '-0.008em',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {project.description || '暂无项目描述'}
                </p>
              </div>
            </div>

            {/* 右侧：更精致的菜单按钮 */}
            <div className="relative flex-shrink-0">
              <button
                className="project-menu-button w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
                style={{
                  color: 'var(--theme-neutral-400)',
                  backgroundColor: isHovered ? 'var(--theme-neutral-100)' : 'transparent',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-neutral-100)';
                  e.currentTarget.style.borderColor = 'var(--theme-neutral-200)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isHovered ? 'var(--theme-neutral-100)' : 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
              >
                <FiMoreVertical className="w-4 h-4" style={{ color: 'var(--theme-neutral-500)' }} />
              </button>

              {menuOpen && (
                <div
                  ref={menuRef}
                  className="project-menu absolute right-0 top-8 z-50 w-48 rounded-xl overflow-hidden shadow-xl border"
                  style={{
                    backgroundColor: 'var(--theme-card-bg)',
                    borderColor: 'var(--theme-card-border)',
                    boxShadow: 'var(--theme-shadow-lg)'
                  }}
                >
                  {/* 编辑项目 */}
                  <button
                    className="w-full flex items-center px-4 py-2.5 text-[14px] transition-colors"
                    style={{
                      color: 'var(--foreground)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--theme-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditModalOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full mr-3" style={{ backgroundColor: 'var(--theme-primary-100)' }}>
                      <FiEdit2 className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary-500)' }} />
                    </span>
                    <span className="font-medium">编辑项目</span>
                  </button>

                  {/* 归档/恢复项目 - 苹果菜单记录样式 */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center px-4 py-2.5 text-[14px] transition-colors"
                    style={{
                      color: 'var(--foreground)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--theme-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // 打开归档/取消归档原因模态框
                      setIsArchiveModalOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    {project.archived === true ? (
                      <>
                        <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full mr-3" style={{ backgroundColor: 'var(--theme-primary-100)' }}>
                          <FiRefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary-500)' }} />
                        </span>
                        <span className="font-medium">恢复项目</span>
                      </>
                    ) : (
                      <>
                        <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full mr-3" style={{ backgroundColor: 'var(--theme-warning-100)' }}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3.5 h-3.5"
                            style={{ color: 'var(--theme-warning-500)' }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </span>
                        <span className="font-medium">归档项目</span>
                      </>
                    )}
                  </motion.button>

                  {/* 分隔线*/}
                  <div className="border-t my-1" style={{ borderColor: 'var(--theme-card-border)' }}></div>

                  {/* 删除项目按钮 - 危险操作 */}
                  <button
                    className="w-full flex items-center px-4 py-2.5 text-[14px] transition-colors"
                    style={{
                      color: 'var(--theme-error-500)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--theme-error-50)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(project);
                      setIsDeleteModalOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full mr-3" style={{ backgroundColor: 'var(--theme-error-100)' }}>
                      <FiTrash2 className="w-3.5 h-3.5" style={{ color: 'var(--theme-error-500)' }} />
                    </span>
                    <span className="font-medium">删除项目</span>
                  </button>
                </div>
              )}
            </div>
          </div>


          {/* 项目指标区域 - 苹果风格重新设计 */}
          <div className="space-y-4">
            {/* 进度区域 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[13px] font-medium"
                  style={{
                    color: 'var(--theme-neutral-600)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    letterSpacing: '-0.01em'
                  }}
                >
                  完成进度
                </span>
                <span
                  className="text-[13px] font-semibold px-2 py-0.5 rounded-md"
                  style={{
                    color: progress >= 100 ? 'var(--theme-success-600)' : progress >= 50 ? 'var(--theme-primary-600)' : 'var(--theme-warning-600)',
                    backgroundColor: progress >= 100 ? 'var(--theme-success-100)' : progress >= 50 ? 'var(--theme-primary-100)' : 'var(--theme-warning-100)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {progress}%
                </span>
              </div>

              {/* 苹果风格进度条 */}
              <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-neutral-200)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                  className="h-full rounded-full relative overflow-hidden"
                  style={{
                    background: progress >= 100 
                      ? 'linear-gradient(90deg, var(--theme-success-500), var(--theme-success-400))' 
                      : progress >= 50 
                        ? 'linear-gradient(90deg, var(--theme-primary-500), var(--theme-primary-400))'
                        : 'linear-gradient(90deg, var(--theme-warning-500), var(--theme-warning-400))'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                </motion.div>
              </div>
            </div>

            {/* 项目信息标签 */}
            <div className="flex items-center justify-between">
              <div
                className="flex items-center px-2.5 py-1.5 rounded-lg text-xs"
                style={{
                  backgroundColor: 'var(--theme-info-100)',
                  border: '1px solid var(--theme-info-200)'
                }}
              >
                <FiCalendar className="w-3 h-3 mr-1.5" style={{ color: 'var(--theme-info-600)' }} />
                <span
                  className="font-medium"
                  style={{
                    color: 'var(--theme-info-600)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {formatDate(project.startDate || project.createdAt)}
                </span>
              </div>

              {/* 项目状态指示器 */}
              <div
                className="flex items-center px-2.5 py-1.5 rounded-lg text-xs"
                style={{
                  backgroundColor: project.archived ? 'var(--theme-warning-100)' : 'var(--theme-success-100)',
                  border: `1px solid ${project.archived ? 'var(--theme-warning-200)' : 'var(--theme-success-200)'}`
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{
                    backgroundColor: project.archived ? 'var(--theme-warning-500)' : 'var(--theme-success-500)'
                  }}
                />
                <span
                  className="font-medium"
                  style={{
                    color: project.archived ? 'var(--theme-warning-600)' : 'var(--theme-success-600)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {project.archived ? '已归档' : '活跃'}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* 苹果风格底部操作区 */}
        <div
          className="px-5 py-4 border-t"
          style={{
            borderColor: 'var(--theme-card-border)',
            backgroundColor: 'var(--theme-neutral-50)'
          }}
        >
          <button
            className="w-full flex items-center justify-center text-[14px] font-semibold rounded-xl py-3 transition-all duration-200 group"
            style={{
              backgroundColor: 'var(--theme-primary-500)',
              color: 'white',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              letterSpacing: '-0.016em',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              transform: 'translateY(0)',
              transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1.0)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-primary-600)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--theme-primary-500)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
            }}
            onClick={handleCardClick}
          >
            <span>查看项目详情</span>
            <motion.div
              className="ml-2"
              initial={{ x: 0 }}
              animate={{ x: isHovered ? 3 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiChevronRight className="w-4 h-4" />
            </motion.div>
          </button>
        </div>
      </div>

      {/* 归档/恢复项目原因模态框 */}
      <ArchiveReasonModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={(reason) => {
          // 调用归档/取消归档接口
          changeArchiveStatusMutation.mutate({
            id: project.id,
            archived: !project.archived,
            reason: reason
          });
        }}
        isArchiving={!project.archived}
        projectName={project.name}
      />

      {/* 编辑项目模态框 */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={{
          id: project.id,
          name: project.name,
          description: project.description || ''
        }}
        onSuccess={() => {
          // 刷新项目列表
          window.location.reload();
        }}
      />
    </motion.div>
  );
};

export default ProjectCard;
