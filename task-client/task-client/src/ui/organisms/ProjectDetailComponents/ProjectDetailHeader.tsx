import React, {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import {motion, useScroll, useSpring, useTransform} from 'framer-motion';
import {FiChevronLeft, FiEdit2, FiShare2} from 'react-icons/fi';
import {ProjectDetailResponse} from '@/types/api-types';
import {useTheme} from '@/ui/theme';
import EditProjectModal from '@/ui/organisms/ProjectListComponents/EditProjectModal';

interface ProjectDetailHeaderProps {
  projectName: string;
  projectDescription: string;
  onAddTask: () => void;
  projectId?: string;
  projectDetail?: ProjectDetailResponse;
  onProjectUpdated?: (updatedName: string, updatedDescription: string) => void; // 更新回调函数签名
  onShare?: () => void; // 分享按钮点击回调
}

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
  const [isHovering, setIsHovering] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { isDark } = useTheme();
  const isDarkMode = isDark;
  const headerRef = useRef(null);

  // 滚动交互效果
  const { scrollY } = useScroll();
  // 增强弹性反馈，让动作更自然
  const scrollYSpring = useSpring(scrollY, { stiffness: 400, damping: 35, mass: 0.8 });

  // 缩略模式相关的动画值 - 微调滚动阈值
  const headerHeight = useTransform(scrollYSpring, [0, 50], ['auto', '48px']);
  const descriptionOpacity = useTransform(scrollYSpring, [0, 35], [1, 0]);
  const descriptionHeight = useTransform(scrollYSpring, [0, 35], ['auto', '0px']);
  const metadataOpacity = useTransform(scrollYSpring, [0, 35], [1, 0]);

  // 计算是否已滚动（用于条件渲染）
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  useEffect(() => {
    // 增强的滚动响应逻辑，更符合苹果的交互体验
    const unsubscribe = scrollY.onChange((latest) => {
      setIsScrolled(latest > 15);  // 更早地触发滚动效果
      setIsCompactMode(latest > 35); // 调整压缩模式的触发点
    });

    return () => unsubscribe();
  }, [scrollY]);

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 添加任务快捷键: ⌘+N
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        onAddTask();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAddTask]);

  return (
    <>
      <motion.div
        ref={headerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="w-full transition-all duration-300"
        style={{
          height: isCompactMode && !isHovering ? '48px' : 'auto',
          overflow: 'hidden'
        }}
        aria-label="项目详情头部"
      >
      {/* 项目导航行 - 根据滚动状态切换显示模式 */}
      <motion.div
        className="w-full px-4 lg:px-6"
        transition={{ duration: 0.2 }}
      >
        <div className="h-12 flex items-center justify-between">
          {/* 左侧：导航与项目标题 */}
          <div className="flex items-center gap-2 overflow-hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push('/projects')}
              className={`flex items-center justify-center h-8 w-8 rounded-full ${
                isDarkMode 
                  ? 'bg-gray-800/70 text-gray-200 hover:bg-gray-700/80' 
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/90'
              } transition-all duration-150 shadow-sm`}
              aria-label="返回项目列表"
            >
              <FiChevronLeft size={15} />
            </motion.button>

            <div className="flex items-center overflow-hidden">
              <h1 className={`text-base font-semibold truncate max-w-md ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {projectName}
              </h1>

              <div className="ml-3 flex items-center">
                {/* 项目状态标签 - 已归档或进行中 */}
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: projectDetail?.archived
                      ? isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)'
                      : isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                    color: projectDetail?.archived
                      ? isDarkMode ? '#F59E0B' : '#D97706'
                      : isDarkMode ? '#10B981' : '#059669'
                  }}
                >
                  <span
                    className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: projectDetail?.archived
                        ? '#F59E0B' // 已归档使用黄色
                        : '#10B981'  // 进行中使用绿色
                    }}
                  ></span>
                  {projectDetail?.archived ? '已归档' : '进行中'}
                </span>
              </div>
            </div>
          </div>

          {/* 右侧区域 - 按钮组 */}
          <div className="flex items-center space-x-2">
            {/* 编辑按钮 */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsEditModalOpen(true)}
              className={`flex items-center justify-center h-8 w-8 rounded-full ${
                isDarkMode 
                  ? 'bg-gray-800/70 text-gray-200 hover:bg-gray-700/80' 
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/90'
              } transition-all duration-150 shadow-sm`}
              aria-label="编辑项目"
              title="编辑项目"
            >
              <FiEdit2 size={15} />
            </motion.button>

            {/* 分享按钮 */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                // 调用父组件传递的分享函数
                if (onShare) {
                  onShare();
                }
              }}
              className={`flex items-center justify-center h-8 w-8 rounded-full ${
                isDarkMode 
                  ? 'bg-blue-600/90 text-white hover:bg-blue-500' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } transition-all duration-150 shadow-sm`}
              aria-label="分享项目"
              title="分享项目"
            >
              <FiShare2 size={15} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 项目描述区域 - 滚动时渐隐 */}
      <motion.div
        className="w-full px-4 lg:px-6 pb-2 overflow-hidden"
        style={{
          opacity: descriptionOpacity,
          height: isCompactMode && !isHovering ? '0px' : 'auto',
          marginTop: isCompactMode && !isHovering ? '0' : '0px'
        }}
      >
        {/* 项目描述 - 改进悬停效果和可访问性 */}
        {projectDescription && (
          <div
            className="group relative cursor-pointer"
            title="点击展开完整描述"
          >
            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-1 group-hover:line-clamp-none transition-all duration-300`}>
              {projectDescription}
            </p>
            <div className={`absolute bottom-0 right-0 w-12 h-full bg-gradient-to-l ${isDarkMode ? 'from-gray-900' : 'from-white'} to-transparent pointer-events-none group-hover:opacity-0 transition-opacity duration-300`}></div>
          </div>
        )}

        {/* 项目元数据 - 极简版本 */}
        <motion.div
          className="mt-1 flex items-center text-xs text-gray-400 dark:text-gray-500"
          style={{ opacity: metadataOpacity }}
        >
          {/* 任务进度 */}
          <span className="flex items-center">
            <span className="font-medium">{projectDetail?.completedTaskCount || 0}/{projectDetail?.taskCount || 0}</span>
          </span>

          {/* 分隔点 */}
          <span className="mx-1.5 text-gray-300 dark:text-gray-600">•</span>

          {/* 最后更新时间 */}
          <span>
            {projectDetail?.updatedAt ? (() => {
              const date = new Date(projectDetail.updatedAt);
              const now = new Date();
              const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
              if (diffDays === 0) return '今天';
              if (diffDays === 1) return '昨天';
              if (diffDays < 7) return `${diffDays}天前`;
              return `${date.getMonth() + 1}月${date.getDate()}日`;
            })() : ''}
          </span>
        </motion.div>
      </motion.div>

      </motion.div>

      {/* 编辑项目模态框放在最外层，避免被overflow:hidden影响，且不进行条件判断 */}
      {/* 编辑项目模态框使用自定义包装组件，确保展示在最顶层 */}
      <div className="relative" style={{ zIndex: 9999 }}>
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          project={projectId ? {
            id: projectId,
            name: projectName,
            description: projectDescription || ''
          } : null}
          onSuccess={(updatedName: string, updatedDescription: string) => {
            // 调用回调函数更新项目信息，传递更新后的项目名称和描述
            if (onProjectUpdated) {
              onProjectUpdated(updatedName, updatedDescription);
            }
            setIsEditModalOpen(false);
          }}
        />
      </div>
    </>
  );
};

export default ProjectDetailHeader;
