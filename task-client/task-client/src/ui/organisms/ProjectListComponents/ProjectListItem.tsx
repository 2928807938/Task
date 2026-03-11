'use client';

import React, {useState} from 'react';
import {FiCalendar, FiChevronRight, FiClock, FiMoreVertical} from 'react-icons/fi';
import {motion} from 'framer-motion';
import {useRouter} from 'next/navigation';
import {ProjectListItem as ProjectListItemType} from '@/types/api-types';
import {getBgColorClass, getInitials} from '@/utils/avatar-utils';
import ProjectCardMenu from './ProjectCardMenu';

// 项目列表项属性类型
interface ProjectListItemProps {
  project: ProjectListItemType & { archived?: boolean };
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project }) => {
  project.archived = project.archived;
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // 处理点击事件 - 导航到项目详情
  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.project-menu-button') ||
        (e.target as HTMLElement).closest('.project-menu')) {
      return;
    }
    router.push(`/projects/${project.id}`);
  };

  // 格式化日期
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '未设置';
    const date = new Date(dateStr);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}.${month}.${day}`;
  };

  // 计算项目已经运行的天数
  const getProjectDuration = (createdAt: string | undefined) => {
    if (!createdAt) return 0;
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 根据项目任务完成情况计算进度百分比，与网格视图保持一致
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
  const duration = getProjectDuration(project.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-2xl cursor-pointer transition-all
        ${isHovered ? 'translate-y-[-2px]' : 'translate-y-0'}
      `}
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        boxShadow: isHovered
          ? 'var(--theme-shadow-lg)'
          : 'var(--theme-shadow-sm)',
        border: '1px solid var(--theme-card-border)',
        transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0)'
      }}
    >
      {/* 项目顶部状态指示条 */}
      <div className="relative h-1 w-full overflow-hidden">
        <div
          className="absolute inset-0 rounded-b-xl"
          style={{
            background: project.archived === true
              ? 'linear-gradient(to right, var(--theme-neutral-400), var(--theme-neutral-500))'
              : 'linear-gradient(to right, var(--theme-primary-500), var(--theme-info-400))'
          }}
        />
      </div>

      <div className="flex items-center p-5 relative">
        {/* 项目图标 */}
        <div
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-md text-white font-semibold text-base mr-4"
          style={{
            backgroundColor: getBgColorClass(project.id),
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
          }}
        >
          {getInitials(project.name)}
        </div>

        {/* 项目信息区域 */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-center">
            {/* 归档状态标签 - 已归档时显示 */}
            {project.archived === true && (
              <div
                className="absolute right-4 top-4 z-10 flex items-center px-2 py-1 rounded-md bg-[rgba(255,149,0,0.1)] border border-[rgba(255,149,0,0.2)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 mr-1"
                  style={{ color: 'var(--theme-warning-500)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span
                  className="text-[11px] font-medium"
                  style={{
                    color: 'var(--theme-warning-500)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    letterSpacing: '-0.01em'
                  }}
                >
                  已归档
                </span>
              </div>
            )}
            <div
              className="text-[16px] font-semibold truncate mr-2"
              style={{
                color: 'var(--foreground)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                letterSpacing: '-0.018em',
                lineHeight: 1.3
              }}
            >
              {project.name}
            </div>

            {/* 移除状态标签 */}
          </div>

          {/* 项目描述 */}
          <div
            className="text-[14px] mt-1"
            style={{
              color: 'var(--theme-neutral-500)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              letterSpacing: '-0.015em',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '90%'
            }}
          >
            {project.description || '无项目描述'}
          </div>
        </div>

        {/* 项目指标展示区 */}
        <div className="flex items-center gap-5 ml-auto">
          {/* 进度指示器 - 更紧凑的设计 */}
          <div className="w-32 hidden sm:block">
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-[13px] font-medium"
                style={{
                  color: 'var(--theme-neutral-500)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  letterSpacing: '-0.01em'
                }}
              >
                进度
              </span>
              <span
                className="text-[13px] font-medium"
                style={{
                  color: progress > 75 ? 'var(--theme-success-500)' : progress > 25 ? 'var(--theme-warning-500)' : 'var(--theme-error-500)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  letterSpacing: '-0.01em'
                }}
              >
                {progress}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--theme-neutral-200)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(to right, #30D158, #34C759)',
                }}
              />
            </div>
          </div>

          {/* 时长与日期 */}
          <div className="flex gap-2 mr-2">
            <div
              className="hidden sm:flex items-center px-3 py-1.5 rounded-full text-xs whitespace-nowrap"
              style={{
                backgroundColor: 'rgba(0, 122, 255, 0.08)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <FiClock className="w-3 h-3 mr-1.5" style={{ color: 'var(--theme-primary-500)' }} />
              <span
                className="font-medium"
                style={{
                  color: 'var(--theme-primary-500)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap'
                }}
              >
                {duration} 天
              </span>
            </div>

            <div
              className="hidden md:flex items-center px-3 py-1.5 rounded-full text-xs whitespace-nowrap"
              style={{
                backgroundColor: 'rgba(88, 86, 214, 0.08)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <FiCalendar className="w-3 h-3 mr-1.5" style={{ color: 'var(--theme-info-500)' }} />
              <span
                className="font-medium"
                style={{
                  color: 'var(--theme-info-500)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  letterSpacing: '-0.01em'
                }}
              >
                {formatDate(project.startDate || project.createdAt)}
              </span>
            </div>
          </div>

          {/* 移除成员数量 */}

          {/* 操作按钮 */}
          <div className="ml-1 relative">
            <button
              className="project-menu-button w-7 h-7 flex items-center justify-center rounded-full transition-colors"
              style={{
                color: 'var(--theme-neutral-400)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-neutral-100)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
            >
              <FiMoreVertical className="w-4 h-4" style={{ color: 'var(--theme-neutral-400)' }} />
            </button>

            {menuOpen && (
              <div className="project-menu absolute right-0 top-full mt-1 z-10">
                <ProjectCardMenu
                  project={project}
                  onClose={() => setMenuOpen(false)}
                />
              </div>
            )}
          </div>

          {/* 指示箭头 - 只在悬停时显示 */}
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, translateX: -5 }}
              animate={{ opacity: 1, translateX: 0 }}
              className="ml-0.5"
            >
              <FiChevronRight className="w-4 h-4" style={{ color: 'var(--theme-neutral-400)' }} />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectListItem;
