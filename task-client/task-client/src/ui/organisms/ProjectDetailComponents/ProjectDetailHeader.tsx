import React, {useEffect, useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import {motion} from 'framer-motion';
import {
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiEdit2,
  FiFolder,
  FiGlobe,
  FiLock,
  FiPlus,
  FiShare2,
  FiTarget,
  FiUsers
} from 'react-icons/fi';
import {ProjectDetailResponse} from '@/types/api-types';
import {useTheme} from '@/ui/theme';
import EditProjectModal from '@/ui/organisms/ProjectListComponents/EditProjectModal';

interface ProjectDetailHeaderProps {
  projectName: string;
  projectDescription: string;
  onAddTask: () => void;
  projectId?: string;
  projectDetail?: ProjectDetailResponse;
  onProjectUpdated?: (updatedName: string, updatedDescription: string) => void;
  onShare?: () => void;
}

const formatRelativeDate = (value?: string) => {
  if (!value) {
    return '刚刚更新';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '刚刚更新';
  }

  const now = Date.now();
  const diff = Math.floor((now - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diff <= 0) {
    return '今天更新';
  }

  if (diff === 1) {
    return '昨天更新';
  }

  if (diff < 7) {
    return `${diff} 天前更新`;
  }

  return `${date.getMonth() + 1} 月 ${date.getDate()} 日更新`;
};

const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = ({
  projectName,
  projectDescription,
  onAddTask,
  projectId,
  projectDetail,
  onProjectUpdated,
  onShare
}) => {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { isDark } = useTheme();
  const isDarkMode = isDark;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        onAddTask();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAddTask]);

  const completionRate = useMemo(() => {
    if (typeof projectDetail?.progress === 'number') {
      return Math.max(0, Math.min(projectDetail.progress, 100));
    }

    if (!projectDetail?.taskCount) {
      return 0;
    }

    return Math.round(((projectDetail.completedTaskCount || 0) / projectDetail.taskCount) * 100);
  }, [projectDetail?.completedTaskCount, projectDetail?.progress, projectDetail?.taskCount]);

  const summaryItems = [
    {
      label: '完成进度',
      value: `${completionRate}%`,
      icon: <FiTarget size={16} />,
      accent: isDarkMode ? 'from-blue-500/20 to-cyan-500/10' : 'from-blue-100 to-cyan-50'
    },
    {
      label: '任务数量',
      value: `${projectDetail?.completedTaskCount || 0}/${projectDetail?.taskCount || 0}`,
      icon: <FiCheckCircle size={16} />,
      accent: isDarkMode ? 'from-emerald-500/20 to-green-500/10' : 'from-emerald-100 to-green-50'
    },
    {
      label: '团队成员',
      value: `${projectDetail?.memberCount || 0} 人`,
      icon: <FiUsers size={16} />,
      accent: isDarkMode ? 'from-violet-500/20 to-fuchsia-500/10' : 'from-violet-100 to-fuchsia-50'
    },
    {
      label: '所属团队',
      value: projectDetail?.teamName || '未分组',
      icon: <FiFolder size={16} />,
      accent: isDarkMode ? 'from-amber-500/20 to-orange-500/10' : 'from-amber-100 to-orange-50'
    }
  ];

  const visibilityLabel = projectDetail?.visibility === 'PUBLIC' ? '公开项目' : '私有项目';
  const visibilityIcon = projectDetail?.visibility === 'PUBLIC' ? <FiGlobe size={14} /> : <FiLock size={14} />;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={`relative overflow-hidden rounded-[28px] border px-5 py-5 sm:px-6 sm:py-6 ${
          isDarkMode
            ? 'border-white/10 bg-slate-900/90 text-white'
            : 'border-slate-200/80 bg-white/95 text-slate-900'
        }`}
      >
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? 'bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_36%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_32%)]'
              : 'bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_34%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.10),transparent_30%)]'
          }`}
        />

        <div className="relative space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => router.push('/projects')}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    isDarkMode
                      ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FiChevronLeft size={14} />
                  返回项目
                </button>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    projectDetail?.archived
                      ? isDarkMode
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-amber-100 text-amber-700'
                      : isDarkMode
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${projectDetail?.archived ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  />
                  {projectDetail?.archived ? '已归档' : '进行中'}
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                    isDarkMode ? 'bg-white/6 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {visibilityIcon}
                  {visibilityLabel}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${
                    isDarkMode
                      ? 'border-white/10 bg-white/6 text-blue-300'
                      : 'border-blue-100 bg-blue-50 text-blue-600'
                  }`}
                >
                  <FiBriefcase size={24} />
                </div>

                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-[30px]">
                      {projectName || '未命名项目'}
                    </h1>
                  </div>

                  <p className={`max-w-3xl text-sm leading-6 sm:text-[15px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {projectDescription?.trim() || '还没有项目描述，建议补充目标、协作方式和关键里程碑。'}
                  </p>

                  <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="inline-flex items-center gap-1.5">
                      <FiUsers size={14} />
                      负责人 {projectDetail?.ownerName || '未设置'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FiFolder size={14} />
                      团队 {projectDetail?.teamName || '未分组'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FiCalendar size={14} />
                      {formatRelativeDate(projectDetail?.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditModalOpen(true)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FiEdit2 size={15} />
                编辑项目
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onShare}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isDarkMode
                    ? 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FiShare2 size={15} />
                分享
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onAddTask}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-700"
              >
                <FiPlus size={15} />
                新建任务
              </motion.button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border bg-gradient-to-br p-4 ${item.accent} ${
                  isDarkMode ? 'border-white/10' : 'border-white/80'
                }`}
              >
                <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${isDarkMode ? 'bg-white/8 text-white' : 'bg-white text-slate-700'}`}>
                  {item.icon}
                </div>
                <div className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {item.label}
                </div>
                <div className="mt-1 line-clamp-1 text-lg font-semibold">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className={`rounded-2xl border p-4 ${isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/80'}`}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  项目整体完成度
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  已完成 {projectDetail?.completedTaskCount || 0} / {projectDetail?.taskCount || 0} 个任务
                </div>
              </div>
              <div className="text-right text-2xl font-semibold tracking-tight">{completionRate}%</div>
            </div>

            <div className={`h-2 overflow-hidden rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-[9999]">
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          project={projectId ? {
            id: projectId,
            name: projectName,
            description: projectDescription || ''
          } : null}
          onSuccess={(updatedName: string, updatedDescription: string) => {
            onProjectUpdated?.(updatedName, updatedDescription);
            setIsEditModalOpen(false);
          }}
        />
      </div>
    </>
  );
};

export default ProjectDetailHeader;
