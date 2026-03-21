'use client';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {AnimatePresence, motion} from 'framer-motion';
import {
  FiBarChart2,
  FiBell,
  FiCalendar,
  FiClipboard,
  FiClock,
  FiHome,
  FiInfo,
  FiLayers,
  FiLock,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSearch,
  FiSettings,
  FiSliders,
  FiStar,
  FiSun,
  FiUser,
  FiUsers,
  FiX
} from 'react-icons/fi';
import {useCurrentUser, useLogout} from '@/hooks/use-user-hook';
import {useToast} from '@/ui/molecules/Toast';
import {useTheme} from '@/ui/theme';

interface RadialMenuItem {
  icon: React.ReactNode;
  title: string;
  path: string;
  color: string;
  action?: () => void; // 可选的自定义动作函数
  isUtility?: boolean; // 标记是否为工具类菜单项（搜索、通知、用户信息等）
  id?: string; // 菜单项ID
}

// 用户信息接口
interface UserInfo {
  name: string;
  role: string;
  avatarUrl?: string; // 可选的头像URL
}

// 定义搜索结果项接口
interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  path: string;
  category: string;
  icon: React.ReactNode;
  keywords?: string[]; // 关键词，用于提高搜索匹配度
}

interface Position {
  x: number;
  y: number;
}

// 生成头像颜色的函数 - 柔和渐变色
const generateAvatarColor = (name: string): string => {
  // 简单的哈希函数生成稳定的颜色
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // 柔和渐变色数组
  const colors = [
    'bg-gradient-to-br from-blue-400 to-blue-600',
    'bg-gradient-to-br from-indigo-400 to-indigo-600',
    'bg-gradient-to-br from-purple-400 to-purple-600',
    'bg-gradient-to-br from-pink-400 to-pink-600',
    'bg-gradient-to-br from-red-400 to-red-600',
    'bg-gradient-to-br from-orange-400 to-orange-600',
    'bg-gradient-to-br from-amber-400 to-amber-600',
    'bg-gradient-to-br from-emerald-400 to-emerald-600',
    'bg-gradient-to-br from-teal-400 to-teal-600',
    'bg-gradient-to-br from-cyan-400 to-cyan-600'
  ];

  // 使用哈希值选择颜色
  return colors[Math.abs(hash) % colors.length];
};

// 获取用户名首字母
const getInitial = (name: string): string => {
  if (!name) return '?';
  return name.charAt(0);
};

// 头像组件
interface AvatarProps {
  user: UserInfo;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Avatar: React.FC<AvatarProps> = ({ user, size = 'md' }) => {
  // 定义不同尺寸的类 - 苹果风格更注重精致的尺寸
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-2xl'
  };

  // 获取首字母和颜色
  const initial = getInitial(user.name);
  const bgColor = generateAvatarColor(user.name);

  // 如果有头像URL，显示图片
  if (user.avatarUrl) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-md ring-2 ring-white/20 backdrop-blur-sm`}>
        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
      </div>
    );
  }

  // 否则显示首字母+颜色的头像 - 阴影和边框
  return (
    <div className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-medium shadow-lg ring-2 ring-white/20 backdrop-blur-sm`}>
      {initial}
    </div>
  );
};

const RadialMenu: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  // 获取当前用户信息
  const { data: currentUserResponse, isLoading: isLoadingUser } = useCurrentUser({ enabled: true });
  const { addToast, removeToast } = useToast();
  // 获取主题相关功能
  const { isDark, toggleTheme, isSystemTheme } = useTheme();

  // 从API响应中提取用户信息，增强错误处理
  const currentUser = useMemo(() => {
    try {
      if (currentUserResponse?.success && currentUserResponse?.data) {
        return {
          name: currentUserResponse.data.username || '未知用户',
          role: (currentUserResponse.data.authorities &&
                Array.isArray(currentUserResponse.data.authorities.items) &&
                currentUserResponse.data.authorities.items.length > 0) ?
                currentUserResponse.data.authorities.items[0] : '用户',
          email: currentUserResponse.data.email || ''
        };
      }
    } catch (error) {
      console.error('处理用户数据时出错:', error);
    }
    return { name: '访客', role: '未登录', email: '' };
  }, [currentUserResponse]);

  const [isOpen, setIsOpen] = useState(false);
  // 用于跟踪菜单元素
  const menuRef = useRef<HTMLDivElement>(null);

  // 默认位置：右下角
  const defaultPosition = useRef<Position>({ x: 0, y: 0 });
  // 使用 useState 来存储位置，初始值为默认位置
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  // 在客户端环境中设置位置
  useEffect(() => {
    // 确保代码只在客户端执行
    if (typeof window !== 'undefined') {
      // 初始化位置
      setPosition({
        x: window.innerWidth - 80,
        y: window.innerHeight - 80
      });

      // 添加窗口大小变化的监听器
      const handleResize = () => {
        setPosition({
          x: window.innerWidth - 80,
          y: window.innerHeight - 80
        });
      };

      // 添加全局点击事件监听器，处理菜单的关闭
      const handleDocumentClick = (e: MouseEvent) => {
        // 如果菜单已打开，并且点击不在菜单区域内，则关闭菜单
        if (isOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
          // 检查点击的元素是否在模态框内（通过检查class名包含'modal'）
          const clickedElement = e.target as Element;
          const isModalClick = !!clickedElement.closest('[class*="modal"]') ||
                              !!clickedElement.closest('[role="dialog"]') ||
                              document.querySelector('.modal-backdrop') !== null;

          // 如果不是模态框内的点击，则关闭菜单
          if (!isModalClick) {
            setIsOpen(false);
          }
        }
      };

      // 添加事件监听器
      window.addEventListener('resize', handleResize);
      document.addEventListener('mousedown', handleDocumentClick);

      // 组件卸载时移除事件监听器
      return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('mousedown', handleDocumentClick);
      };
    }
  }, [isOpen]);

  // 按钮显示状态
  const [isButtonVisible, setIsButtonVisible] = useState(true); // 按钮可见性
  const [isButtonActive, setIsButtonActive] = useState(false); // 按钮活跃度（透明度控制）
  const [isButtonExpanded, setIsButtonExpanded] = useState(false); // 按钮是否展开

  // 引用计时器
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const expandTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 搜索、通知和用户状态
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // 处理用户活动，激活按钮
  const handleActivity = useCallback(() => {
    if (isOpen) return; // 菜单打开时不处理

    setIsButtonActive(true);
    setIsButtonVisible(true); // 始终设置按钮为可见状态

    // 清除现有计时器
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);

    // 3秒后降低按钮不透明度，但保持可见
    activityTimeoutRef.current = setTimeout(() => {
      setIsButtonActive(false);
    }, 3000);

    // 注释掉自动隐藏的代码，确保按钮始终可见
    // inactivityTimerRef.current = setTimeout(() => {
    //   if (!isButtonExpanded) { // 只在按钮未展开时隐藏
    //     setIsButtonVisible(false);
    //   }
    // }, 10000);
  }, [isOpen, isButtonExpanded]);

  // 处理按钮悬停状态
  const handleHover = (hover: boolean) => {
    // 清除展开计时器
    if (expandTimeoutRef.current) {
      clearTimeout(expandTimeoutRef.current);
    }

    if (hover) {
      // 激活按钮
      handleActivity();
      // 延迟展开，给用户感知时间
      expandTimeoutRef.current = setTimeout(() => {
        setIsButtonExpanded(true);
      }, 100);
    } else {
      // 延迟折叠，避免鼠标稍微移开就立即折叠
      expandTimeoutRef.current = setTimeout(() => {
        setIsButtonExpanded(false);
      }, 500);
    }
  };

  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // 加载最近搜索记录
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error('无法解析保存的搜索记录', e);
      }
    }
  }, []);

  // 添加全局鼠标移动事件监听器，确保按钮显示
  useEffect(() => {
    // 确保代码只在客户端执行
    if (typeof window !== 'undefined') {
      const handleMouseMove = () => {
        handleActivity();
      };

      // 添加鼠标移动事件监听器
      window.addEventListener('mousemove', handleMouseMove);

      // 组件卸载时移除事件监听器
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [handleActivity]);

  // 用户信息已从API获取，在组件顶部定义

  // 系统可搜索的功能数据 - 仅包含实际存在的页面和功能
  const searchableItems = useMemo<SearchResultItem[]>(() => [
    // 主要页面 - 基于实际项目结构
    {
      id: 'dashboard',
      title: '工作台',
      description: '查看项目概况、任务进度和团队动态',
      path: '/dashboard',
      category: '页面',
      icon: <FiHome className="text-blue-500" />,
      keywords: ['首页', '主页', '概览', '仪表板']
    },
    {
      id: 'projects',
      title: '项目列表',
      description: '浏览和管理所有项目',
      path: '/projects',
      category: '页面',
      icon: <FiLayers className="text-green-500" />,
      keywords: ['项目管理', '项目列表', '我的项目']
    },
    {
      id: 'team-management',
      title: '团队管理',
      description: '管理团队成员和权限',
      path: '/team-management',
      category: '页面',
      icon: <FiUsers className="text-purple-500" />,
      keywords: ['团队', '成员', '权限', '人员']
    },
    {
      id: 'tasks',
      title: '任务管理',
      description: '查看并管理所有任务',
      path: '/tasks',
      category: '页面',
      icon: <FiClipboard className="text-amber-500" />,
      keywords: ['任务', '待办', '工作项', '进度']
    },
    {
      id: 'project-detail',
      title: '项目详情',
      description: '查看项目的详细信息和进展',
      path: '/project-detail',
      category: '页面',
      icon: <FiInfo className="text-indigo-500" />,
      keywords: ['项目详情', '项目信息', '详情页']
    },

    // 用户身份相关页面
    {
      id: 'login',
      title: '登录',
      description: '账号登录页面',
      path: '/login',
      category: '账号',
      icon: <FiUser className="text-blue-400" />,
      keywords: ['登录', '账号', '认证']
    },
    {
      id: 'register',
      title: '注册',
      description: '创建新账号',
      path: '/register',
      category: '账号',
      icon: <FiUser className="text-green-400" />,
      keywords: ['注册', '注册账号', '新用户', '创建账号']
    },

    // 团队相关功能
    {
      id: 'join-team',
      title: '加入团队',
      description: '接受团队邀请并加入',
      path: '/join-team',
      category: '团队',
      icon: <FiUsers className="text-indigo-400" />,
      keywords: ['加入团队', '团队邀请', '加入']
    },
    {
      id: 'invite',
      title: '邀请成员',
      description: '邀请新成员加入团队',
      path: '/invite',
      category: '团队',
      icon: <FiUsers className="text-purple-400" />,
      keywords: ['邀请', '邀请成员', '邮件邀请']
    },

    // 任务详情
    {
      id: 'task-detail',
      title: '任务详情',
      description: '查看和编辑具体任务信息',
      path: '/tasks/[taskId]',
      category: '任务',
      icon: <FiClipboard className="text-amber-400" />,
      keywords: ['任务详情', '任务信息', '任务编辑']
    },
  ], []);

  // 处理搜索动作
  const handleSearch = () => {
    setIsOpen(false); // 关闭主菜单
    setIsSearchOpen(true); // 打开搜索面板
    setIsNotificationsOpen(false); // 确保通知面板关闭
    setIsUserMenuOpen(false); // 确保用户菜单关闭
    setSearchQuery(''); // 清空搜索框
    setSearchResults([]); // 清空结果
    setSelectedResultIndex(-1); // 重置选中项
  };

  // 处理搜索输入变化
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      setSelectedResultIndex(-1);
      return;
    }

    // 执行搜索逻辑
    const results = performSearch(query);
    setSearchResults(results);
    setSelectedResultIndex(results.length > 0 ? 0 : -1);
  };

  // 搜索算法 - 根据用户输入查找匹配项
  const performSearch = (query: string): SearchResultItem[] => {
    if (!query.trim()) return [];

    const normalizedQuery = query.toLowerCase().trim();

    // 计算每个项目的匹配分数
    const scoredResults = searchableItems.map(item => {
      // 初始分数
      let score = 0;

      // 标题匹配 (最高优先级)
      if (item.title.toLowerCase().includes(normalizedQuery)) {
        score += 100;
        // 标题开头匹配，额外加分
        if (item.title.toLowerCase().startsWith(normalizedQuery)) {
          score += 50;
        }
      }

      // 描述匹配
      if (item.description.toLowerCase().includes(normalizedQuery)) {
        score += 30;
      }

      // 关键词匹配
      if (item.keywords) {
        for (const keyword of item.keywords) {
          if (keyword.toLowerCase().includes(normalizedQuery)) {
            score += 40;
            // 关键词完全匹配，额外加分
            if (keyword.toLowerCase() === normalizedQuery) {
              score += 30;
            }
          }
        }
      }

      // 类别匹配
      if (item.category.toLowerCase().includes(normalizedQuery)) {
        score += 20;
      }

      // 路径匹配
      if (item.path.toLowerCase().includes(normalizedQuery)) {
        score += 10;
      }

      return { item, score };
    }).filter(({ score }) => score > 0) // 移除没有匹配的项目
      .sort((a, b) => b.score - a.score); // 按分数降序排序

    // 返回匹配项，最多10个结果
    return scoredResults.slice(0, 10).map(({ item }) => item);
  };

  // 处理搜索结果项点击
  const handleResultClick = (item: SearchResultItem) => {
    // 保存到最近搜索记录
    saveSearchQuery(item.title);

    // 关闭搜索面板
    setIsSearchOpen(false);

    // 导航到目标页面
    router.push(item.path);
  };

  // 处理键盘导航
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    const resultCount = searchResults.length;

    if (resultCount === 0) return;

    // 向下箭头：选择下一项
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResultIndex(prev => (prev + 1) % resultCount);
    }

    // 向上箭头：选择上一项
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex(prev => (prev - 1 + resultCount) % resultCount);
    }

    // 回车键：选择当前项
    else if (e.key === 'Enter' && selectedResultIndex >= 0) {
      e.preventDefault();
      const selectedItem = searchResults[selectedResultIndex];
      handleResultClick(selectedItem);
    }

    // ESC键：关闭搜索
    else if (e.key === 'Escape') {
      e.preventDefault();
      setIsSearchOpen(false);
    }
  };

  // 保存搜索记录
  const saveSearchQuery = (query: string) => {
    const updatedSearches = [query, ...recentSearches.filter(item => item !== query)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // 点击最近搜索项
  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    const results = performSearch(query);
    setSearchResults(results);
    setSelectedResultIndex(results.length > 0 ? 0 : -1);
  };

  // 处理通知动作
  const handleNotifications = () => {
    setIsOpen(false); // 关闭主菜单
    setIsNotificationsOpen(true); // 打开通知面板
    setIsSearchOpen(false); // 确保搜索面板关闭
    setIsUserMenuOpen(false); // 确保用户菜单关闭
  };

  // 处理用户菜单动作
  const handleUserMenu = () => {
    setIsOpen(false); // 关闭主菜单
    setIsUserMenuOpen(true); // 打开用户菜单
    setIsSearchOpen(false); // 确保搜索面板关闭
    setIsNotificationsOpen(false); // 确保通知面板关闭
  };

  // 注意: 已在组件顶部调用了useToast

  // 处理退出登录
  const handleLogout = () => {
    // 关闭用户菜单
    setIsUserMenuOpen(false);

    try {
      // 创建确认对话框的样式和内容
      const confirmDialog = document.createElement('div');
      confirmDialog.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
      confirmDialog.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full transform transition-all">
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-4">
              <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">确认退出登录</h3>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">确定要退出登录吗？您将需要重新登录以访问系统。</p>
          <div class="flex justify-end space-x-3">
            <button id="logout-cancel-btn" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors">
              取消
            </button>
            <button id="logout-confirm-btn" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
              确认退出
            </button>
          </div>
        </div>
      `;

      // 添加确认对话框到DOM
      document.body.appendChild(confirmDialog);

      // 定义内部添加提示的方法 - 使用应用级Toast
      const showToastMessage = (message: string, type: 'success' | 'error', duration = 3000) => {
        // 使用全局Toast组件
        addToast(message, type, duration);
      };

      // 设置取消按钮动作
      const cancelBtn = document.getElementById('logout-cancel-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          document.body.removeChild(confirmDialog);
        });
      }

      // 设置确认按钮动作
      const confirmBtn = document.getElementById('logout-confirm-btn');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          try {
            // 显示加载中状态
            if (confirmBtn instanceof HTMLButtonElement) {
              confirmBtn.disabled = true;
              confirmBtn.innerHTML = '<div class="flex items-center justify-center"><svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>退出中...</div>';
            }

            // 调用退出登录API
            logout(undefined, {
              onSuccess: (response) => {
                try {
                  // 移除对话框
                  document.body.removeChild(confirmDialog);

                  // 显示成功提示
                  showToastMessage('退出登录成功', 'success');

                  // 清理本地缓存
                  localStorage.removeItem('token');
                  localStorage.removeItem('radialMenuPosition');
                  localStorage.removeItem('recentSearches');

                  // 延迟重定向，给用户时间看到成功提示
                  setTimeout(() => {
                    router.push('/login');
                  }, 1000);
                } catch (err) {
                  console.error('处理退出登录成功回调时出错:', err);
                }
              },
              onError: (error) => {
                try {
                  console.error('退出登录失败:', error);

                  // 移除对话框
                  document.body.removeChild(confirmDialog);

                  // 显示错误提示
                  showToastMessage('退出登录失败，请重试', 'error');

                  // 强制清理本地缓存并重定向
                  localStorage.removeItem('token');
                  router.push('/login');
                } catch (err) {
                  console.error('处理退出登录失败回调时出错:', err);
                }
              }
            });
          } catch (error) {
            console.error('退出登录失败:', error);

            // 移除对话框
            document.body.removeChild(confirmDialog);

            // 显示错误提示
            showToastMessage('退出登录失败，请重试', 'error');
          }
        });
      }
    } catch (error) {
      console.error('创建退出确认对话框失败:', error);
      // 如果创建对话框失败，直接显示错误提示
      addToast('系统错误，请稍后重试', 'error', 5000);
    }
  };

  // 处理敬请期待功能点击
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<{ title: string; icon: React.ReactNode; description: string }>({
    title: '',
    icon: <></>,
    description: ''
  });

  const handleComingSoonFeature = (title: string, icon: React.ReactNode, description: string) => {
    setComingSoonFeature({ title, icon, description });
    setShowComingSoonModal(true);
    setIsOpen(false); // 关闭主菜单
  };

  // 处理主题切换
  const handleThemeToggle = () => {
    toggleTheme();
    setIsOpen(false); // 关闭主菜单
    addToast(`已切换到${isDark ? '亮色' : '暗色'}模式${isSystemTheme ? ' (跟随系统)' : ''}`, 'success', 2000);
  };

  // 定义主导航菜单项 - 渐变色
  const mainMenuItems: RadialMenuItem[] = [
    { icon: <FiHome size={22} />, title: '工作台', path: '/dashboard', color: 'bg-gradient-to-br from-blue-400 to-blue-600' },
    { icon: <FiSliders size={22} />, title: '分析偏好', path: '/dashboard/prompts', color: 'bg-gradient-to-br from-indigo-400 to-indigo-600' },
    { icon: <FiLayers size={22} />, title: '项目列表', path: '/projects', color: 'bg-gradient-to-br from-emerald-400 to-emerald-600' },
    {
      icon: <FiUsers size={22} />,
      title: '团队管理',
      path: '#',
      color: 'bg-gradient-to-br from-purple-400 to-purple-600',
      action: () => handleComingSoonFeature('团队管理', <FiUsers size={42} className="text-purple-500" />, '团队管理功能正在开发中，未来您将能够管理团队成员、分配权限和查看团队动态。')
    },
    {
      icon: <FiClipboard size={22} />,
      title: '任务管理',
      path: '#',
      color: 'bg-gradient-to-br from-amber-400 to-amber-600',
      action: () => handleComingSoonFeature('任务管理', <FiClipboard size={42} className="text-amber-500" />, '任务管理功能正在完善中，未来您将能够创建任务、跟踪进度并与团队协作。')
    },
    {
      icon: <FiBarChart2 size={22} />,
      title: '统计分析',
      path: '#',
      color: 'bg-gradient-to-br from-cyan-400 to-cyan-600',
      action: () => handleComingSoonFeature('统计分析', <FiBarChart2 size={42} className="text-cyan-500" />, '统计分析功能即将上线，它将为您提供丰富的数据可视化和项目绩效分析工具。')
    },
    {
      icon: <FiSettings size={22} />,
      title: '系统设置',
      path: '#',
      color: 'bg-gradient-to-br from-rose-400 to-rose-600',
      action: () => handleComingSoonFeature('系统设置', <FiSettings size={42} className="text-rose-500" />, '系统设置功能正在构建中，您将能够自定义界面、管理账户和配置全局偏好设置。')
    },
  ];

  // 定义工具类菜单项 (搜索、通知、主题切换、用户信息) - 苹果风格
  const utilityMenuItems: RadialMenuItem[] = [
    { icon: <FiSearch size={22} />, title: '搜索', path: '#', color: 'bg-gradient-to-br from-indigo-400 to-indigo-600', action: handleSearch, isUtility: true },
    {
      icon: <FiBell size={22} />,
      title: '通知中心',
      path: '#',
      color: 'bg-gradient-to-br from-orange-400 to-orange-600',
      action: () => handleComingSoonFeature('通知中心', <FiBell size={42} className="text-orange-500" />, '通知中心功能即将上线，它将帮助您及时了解项目动态、任务更新和系统公告。'),
      isUtility: true
    },
    {
      icon: isDark ? <FiSun size={22} /> : <FiMoon size={22} />,
      title: `${isDark ? '亮色' : '暗色'}模式${isSystemTheme ? ' (系统)' : ''}`,
      path: '#',
      color: 'bg-gradient-to-br from-slate-400 to-slate-600',
      action: handleThemeToggle,
      isUtility: true
    },
    {
      icon: <Avatar user={currentUser} size="lg" />,
      title: currentUser.name,
      path: '#',
      color: 'transparent',
      action: handleUserMenu,
      isUtility: true
    },
    {
      icon: isLoggingOut ? <div className="animate-spin h-6 w-6 border-2 border-white rounded-full border-t-transparent"></div> : <FiLogOut size={22} />,
      title: isLoggingOut ? '退出中...' : '退出登录',
      path: '#',
      color: 'bg-gradient-to-br from-red-400 to-red-600',
      action: handleLogout,
      isUtility: true
    },
  ];

  // 合并所有菜单项
  const menuItems: RadialMenuItem[] = [...mainMenuItems, ...utilityMenuItems];

  // 导航处理函数
  const handleNavigation = (item: RadialMenuItem) => {
    // 如果有自定义动作，执行它
    if (item.action) {
      item.action();
      return;
    }

    // 否则执行默认导航
    setIsOpen(false);
    router.push(item.path);
  };

  // 计算当前激活的菜单项
  const activeMenuItem = [...mainMenuItems]
    .filter((item) => pathname === item.path || pathname?.startsWith(item.path + '/'))
    .sort((left, right) => right.path.length - left.path.length)[0] || null;
  const activeItemIndex = activeMenuItem ? menuItems.findIndex((item) => item.path === activeMenuItem.path) : -1;
  const currentPageTitle = activeMenuItem ? activeMenuItem.title : '未知页面';

  // 获取菜单位置（考虑边缘检测）
  const getAdjustedPosition = () => {
    // 计算菜单半径
    const radius = typeof window !== 'undefined' ? Math.min(window.innerWidth, window.innerHeight) * 0.35 : 250;

    // 菜单中心点
    let adjustedX = position.x;
    let adjustedY = position.y;

    // 计算带有菜单卡片的边缘位置
    const leftEdge = adjustedX - radius;
    const rightEdge = adjustedX + radius;
    const topEdge = adjustedY - radius;
    const bottomEdge = adjustedY + radius;

    // 如果屏幕左边缘小于0，向右移动
    if (leftEdge < 0) {
      adjustedX = radius;
    }

    // 如果屏幕右边缘超过屏幕宽度，向左移动
    if (rightEdge > window.innerWidth) {
      adjustedX = window.innerWidth - radius;
    }

    // 如果屏幕上边缘小于0，向下移动
    if (topEdge < 0) {
      adjustedY = radius;
    }

    // 如果屏幕下边缘超过屏幕高度，向上移动
    if (bottomEdge > window.innerHeight) {
      adjustedY = window.innerHeight - radius;
    }

    return { x: adjustedX, y: adjustedY };
  };

  // 菜单位置（当菜单打开时考虑边缘检测）
  const menuPosition = isOpen ? getAdjustedPosition() : position;

  // 处理点击事件
  const handleClick = (e: React.MouseEvent) => {
    if (!isOpen) {
      setIsOpen(true);
      // 阻止事件冒泡，确保文档级别的点击事件不会立即关闭菜单
      e.stopPropagation();
    }
  };

  return (
    <>
      {/* 使用ref引用整个环形菜单容器 */}
      <div ref={menuRef}>

      {/* 敬请期待模态框 */}
      <AnimatePresence>
        {showComingSoonModal && (
          <>
            {/* 半透明背景遮罩 */}
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComingSoonModal(false)}
            />

            {/* 模态框内容 */}
            <motion.div
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md border border-gray-200/50 dark:border-gray-700/50"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* 功能图标 - 带闪光效果 */}
              <div className="relative w-full p-8 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent">
                {/* 关闭按钮 - 半透明，调整到右上角 */}
                <button
                  onClick={() => setShowComingSoonModal(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20"
                >
                  <FiX size={18} />
                </button>

                {/* 闪光效果 */}
                <motion.div
                  className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-blue-200/80 via-purple-200/80 to-pink-200/80 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                />

                {/* 功能图标 */}
                <motion.div
                  className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 shadow-lg flex items-center justify-center mb-4 border border-white/50 dark:border-gray-700/50"
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
                >
                  {comingSoonFeature.icon}
                </motion.div>

                {/* 移除角标，保持设计简洁 */}

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2 relative">
                  {comingSoonFeature.title}
                  <motion.span
                    className="absolute -top-1 -right-6 text-yellow-500"
                    animate={{ rotate: [0, 15, 0, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <FiStar size={16} />
                  </motion.span>
                </h2>
              </div>

              {/* 内容区域 */}
              <div className="p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {comingSoonFeature.description}
                </p>

                {/* 徽章 - 简化设计，只保留一个 */}
                <div className="flex justify-center mb-6">
                  <div className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                    <FiCalendar className="mr-1" size={12} />
                    即将推出
                  </div>
                </div>

                {/* 注册提醒按钮 */}
                <motion.button
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-md hover:shadow-lg transition-shadow flex items-center justify-center space-x-2"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowComingSoonModal(false)}
                >
                  <FiLock size={16} />
                  <span>知道了</span>
                </motion.button>

                {/* 底部提示 */}
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  我们正在努力开发此功能，敬请期待！
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* 搜索悬浮窗 */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* 半透明背景遮罩 */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
            />
            {/* 搜索悬浮窗 */}
            <motion.div
              className="fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* 搜索头部 */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <FiSearch className="text-gray-500 mr-3" size={20} />
                  <input
                    type="text"
                    placeholder="搜索功能、页面、设置..."
                    className="bg-transparent w-full outline-none"
                    autoFocus
                    value={searchQuery}
                    onChange={handleSearchInput}
                    onKeyDown={handleSearchKeyDown}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="ml-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>

              {/* 搜索结果区域 */}
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                {/* 最近搜索 */}
                {recentSearches.length > 0 && !searchQuery && (
                  <div className="space-y-1 mb-6">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">最近搜索</p>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item, index) => (
                        <button
                          key={`recent-${index}`}
                          onClick={() => handleRecentSearchClick(item)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full text-sm transition-colors"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 搜索结果 */}
                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">搜索结果</p>
                    {searchResults.map((item, index) => (
                      <div
                        key={item.id}
                        onClick={() => handleResultClick(item)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedResultIndex === index 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-l-4 border-transparent'}`}
                      >
                        <div className="flex items-start">
                          <div className="mr-3 mt-1">{item.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{item.title}</h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{item.category}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-1">未找到匹配结果</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">请尝试其他关键词</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-1">输入关键词开始搜索</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">可以搜索功能、页面或设置项</p>
                  </div>
                )}
              </div>

              {/* 快捷键提示 - 按键 */}
              <div className="px-4 py-3 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md text-xs text-gray-500 flex justify-between items-center border-t border-gray-200/50 dark:border-gray-700/50">
                <span>按 <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md shadow-sm text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">ESC</kbd> 关闭</span>
                <span>按 <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md shadow-sm text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">↑</kbd> <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md shadow-sm text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">↓</kbd> 导航</span>
                <span>按 <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md shadow-sm text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">Enter</kbd> 选择</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 通知面板 - 项目风格 */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            {/* 半透明背景遮罩 - 模糊效果 */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-md z-50"
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsNotificationsOpen(false)}
            />

            {/* 通知面板主体 - 半透明效果 */}
            <motion.div
              className="fixed inset-y-0 right-0 w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl z-50 overflow-hidden flex flex-col border-l border-white/20 dark:border-gray-700/30"
              initial={{ opacity: 0, x: 100, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
              animate={{
                opacity: 1,
                x: 0,
                boxShadow: "0 0 40px rgba(0,0,0,0.1)"
              }}
              exit={{ opacity: 0, x: 100 }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 250
              }}
            >
              {/* 顶部导航栏 */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 bg-white dark:bg-gray-900 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiBell className="text-gray-700 dark:text-gray-300" size={20} />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">通知中心</h2>
                    <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-medium">3</div>
                  </div>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                {/* 通知分类标签 */}
                <div className="flex flex-wrap gap-1 mt-3 pb-1 overflow-x-auto">
                  <button className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-medium whitespace-nowrap">
                    全部
                  </button>
                  <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-xs font-medium transition-colors whitespace-nowrap">
                    未读
                  </button>
                  <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-xs font-medium transition-colors whitespace-nowrap">
                    项目
                  </button>
                  <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-xs font-medium transition-colors whitespace-nowrap">
                    任务
                  </button>
                  <button className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-xs font-medium transition-colors whitespace-nowrap">
                    系统
                  </button>
                </div>
              </div>

              {/* 通知内容区域 */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 relative bg-gray-50 dark:bg-gray-900">
                {/* 今天 */}
                <div className="sticky top-0 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 py-2">
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">今天</h3>
                </div>

                {/* 未读通知 - 项目更新 (蓝色进度条) */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-sm transition-all duration-200 cursor-pointer"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* 通知类型顶部彩条 */}
                  <div className="h-1 w-full bg-blue-500"></div>

                  <div className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        项目更新通知
                        <span className="ml-2 w-2 h-2 rounded-full bg-blue-500"></span>
                      </h3>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">5分钟前</span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">项目「企业工作台」有新的更新</p>

                    {/* 标签区域 */}
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <FiLayers className="inline-block w-2 h-2 mr-0.5" />
                        项目
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        未读
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* 未读通知 - 任务提醒 (橙色进度条) */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-sm transition-all duration-200 cursor-pointer"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* 通知类型顶部彩条 */}
                  <div className="h-1 w-full bg-orange-500"></div>

                  <div className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        任务截止提醒
                        <span className="ml-2 w-2 h-2 rounded-full bg-blue-500"></span>
                      </h3>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">2小时前</span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">您有3个任务即将到期</p>

                    {/* 标签区域 */}
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                        <FiClock className="inline-block w-2 h-2 mr-0.5" />
                        紧急
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        任务
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        未读
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* 昨天 */}
                <div className="sticky top-0 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 py-2 mt-2">
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">昨天</h3>
                </div>

                {/* 已读通知 - 系统公告 (灰色进度条) */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-sm transition-all duration-200 cursor-pointer opacity-80"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* 通知类型顶部彩条 */}
                  <div className="h-1 w-full bg-gray-400"></div>

                  <div className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        系统公告
                      </h3>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">2天前</span>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">系统将于本周日进行例行维护</p>

                    {/* 标签区域 */}
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        <FiInfo className="inline-block w-2 h-2 mr-0.5" />
                        系统
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        已读
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* 底部操作区 */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex justify-between items-center">
                  <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                    清除所有通知
                  </button>
                  <button className="text-xs text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex items-center px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    通知设置
                    <FiSettings size={10} className="ml-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 用户信息面板 - 项目风格 */}
      <AnimatePresence>
        {isUserMenuOpen && (
          <>
            {/* 半透明背景遮罩 */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUserMenuOpen(false)}
            />

            {/* 用户信息面板主体 */}
            <motion.div
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-gray-50 dark:bg-gray-900 shadow-2xl z-50 overflow-hidden flex flex-col border-l border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, x: 100, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
              animate={{
                opacity: 1,
                x: 0,
                boxShadow: "0 0 40px rgba(0,0,0,0.1)"
              }}
              exit={{ opacity: 0, x: 100 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              {/* 顶部区域 - 用户信息展示 */}
              <div className="bg-white dark:bg-gray-800 shadow-sm">
                {/* 顶部彩条 */}
                <div className="h-1 w-full bg-blue-500"></div>

                {/* 关闭按钮 */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setIsUserMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                {/* 用户信息卡片 */}
                <div className="p-4 flex items-center">
                  <div className="relative mr-3">
                    <Avatar user={currentUser} size="lg" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{currentUser.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                    <div className="mt-1 flex items-center">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                        在线
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 菜单选项区域 */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 relative bg-gray-50 dark:bg-gray-900">
                {/* 账户分类 */}
                <div className="sticky top-0 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 py-2">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">账户</h4>
                </div>

                {/* 个人资料菜单项 */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-sm transition-all duration-200 cursor-pointer"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* 顶部彩条 */}
                  <div className="h-1 w-full bg-blue-500"></div>

                  <div className="p-3 flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-3">
                      <FiUser size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">个人资料</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">查看和编辑您的个人信息</p>
                    </div>
                  </div>
                </motion.div>

                {/* 账户设置菜单项 */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-sm transition-all duration-200 cursor-pointer"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* 顶部彩条 */}
                  <div className="h-1 w-full bg-purple-500"></div>

                  <div className="p-3 flex items-center">
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-3">
                      <FiSettings size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">账户设置</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">管理您的账户偏好设置</p>
                    </div>
                  </div>
                </motion.div>

                {/* 偏好设置分类 */}
                <div className="sticky top-0 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 py-2 mt-2">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">偏好设置</h4>
                </div>

                {/* 通知设置菜单项 */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-sm transition-all duration-200 cursor-pointer"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* 顶部彩条 */}
                  <div className="h-1 w-full bg-gray-400"></div>

                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 mr-3">
                        <FiBell size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">通知设置</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">管理通知偏好</p>
                      </div>
                    </div>

                    <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded-full p-0.5 cursor-pointer">
                      <div className="w-4 h-4 bg-blue-500 rounded-full transform transition-transform duration-300 translate-x-5"></div>
                    </div>
                  </div>
                </motion.div>

                {/* 支持分类 */}
                <div className="sticky top-0 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm z-10 py-2 mt-2">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 px-1">支持</h4>
                </div>

                {/* 帮助中心菜单项 */}
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-sm transition-all duration-200 cursor-pointer"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* 顶部彩条 */}
                  <div className="h-1 w-full bg-teal-500"></div>

                  <div className="p-3 flex items-center">
                    <div className="p-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 mr-3">
                      <FiInfo size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">帮助中心</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">获取帮助和支持</p>
                    </div>

                    {/* 标签区域 */}
                    <div className="flex-shrink-0">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        新
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* 底部操作区 */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <motion.button
                  className="w-full py-2 px-3 flex items-center justify-center rounded bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-sm"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                >
                  {isLoggingOut ? (
                    <>
                      <span className="mr-2 inline-block w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                      处理中...
                    </>
                  ) : (
                    <>
                      <FiLogOut className="mr-2" size={14} />
                      退出登录
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 智能触发按钮 - 仅在菜单关闭时显示 */}
      <AnimatePresence>
        {!isOpen && isButtonVisible && (
          <motion.div
            className="fixed z-50"
            style={{
              left: position.x,
              top: position.y,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: isButtonActive ? 1 : 0.9, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
            onClick={handleClick}
          >
            {/* 光晕效果背景光晕 */}
            <motion.div
              className="absolute rounded-full bg-gradient-to-r from-blue-400/40 to-purple-400/40 backdrop-blur-md dark:from-blue-500/30 dark:to-purple-500/30"
              style={{
                width: isButtonExpanded ? '5.5rem' : '4.5rem',
                height: isButtonExpanded ? '5.5rem' : '4.5rem',
                filter: 'blur(8px)',
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%',
                zIndex: -1
              }}
              animate={{
                opacity: isButtonActive ? 0.9 : 0.7,
              }}
            />

            {/* 按钮外圈呼吸动画*/}
            <motion.div
              className="absolute rounded-full border-2 border-white/20 dark:border-white/10"
              style={{
                width: isButtonExpanded ? '5.5rem' : '4.5rem',
                height: isButtonExpanded ? '5.5rem' : '4.5rem',
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%',
                zIndex: -1
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1]
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }}
            />

            {/* 菜单触发按钮 - 苹果风格版本 */}
            <motion.button
              id="radial-menu-trigger"
              className={`rounded-full text-white flex items-center justify-center ${isButtonActive 
                ? 'bg-gradient-to-br from-blue-500/90 to-blue-600/90' 
                : 'bg-gradient-to-br from-blue-400/85 to-blue-500/85'} 
                backdrop-blur-xl shadow-lg border border-white/30 dark:border-white/20 cursor-pointer`}
              style={{
                touchAction: 'none',
                boxShadow: isButtonActive
                  ? '0 4px 20px rgba(59, 130, 246, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.3)'
                  : '0 4px 15px rgba(59, 130, 246, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.2)'
              }}

              animate={{
                width: isButtonExpanded ? '4.5rem' : '3.75rem',
                height: isButtonExpanded ? '4.5rem' : '3.75rem',
              }}
              whileHover={{
                scale: 1.08,
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.6), inset 0 2px 15px rgba(255, 255, 255, 0.35)'
              }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
            >
              <AnimatePresence mode="wait">
                {isButtonExpanded ? (
                  <motion.div
                    key="menu-icon"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <FiMenu size={24} className="drop-shadow-md" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="dot-icon"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="relative"
                  >
                    <FiMenu size={22} className="drop-shadow-md" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 环形菜单 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 - 优化为径向渐变效果 */}
            <motion.div
              className="fixed inset-0 z-40"
              style={{
                background: `radial-gradient(circle at ${menuPosition.x}px ${menuPosition.y}px, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.8) 100%)`,
                backdropFilter: 'blur(8px)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* 菜单中心圆环效果 */}
            <motion.div
              className="fixed z-45"
              style={{
                top: menuPosition.y,
                left: menuPosition.x,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{
                opacity: 0,
                scale: 0
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* 中心圆环的尺寸与菜单基本半径匹配 */}
              <div className="w-[400px] h-[400px] rounded-full bg-white/10 backdrop-filter backdrop-blur-md border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
            </motion.div>

            {/* 中央关闭按钮 - 使用拖拽后的位置作为中心 */}
            <motion.div
              className="fixed z-50"
              style={{
                top: menuPosition.y,
                left: menuPosition.x,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{
                opacity: 0,
                scale: 0
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <motion.button
                  className="w-20 h-20 rounded-full bg-primary-700 text-white flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)] z-[60] border-2 border-white/30"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                >
                  <FiX size={32} />
                </motion.button>
              </div>
            </motion.div>

            {/* 菜单项 */}
            {menuItems.map((item, index) => {
              // 计算位置：均匀分布在圆周上
              const angle = (Math.PI * 2 * index) / menuItems.length;
              const radius = 180; // 半径大小 - 与 getAdjustedPosition 中的 baseRadius 保持一致

              // 计算位置
              const x = Math.sin(angle) * radius;
              const y = -Math.cos(angle) * radius; // 负号使第一个项目在上方

              const isActive = index === activeItemIndex;

              return (
                <motion.div
                  key={`menu-item-${item.id || item.path}-${index}`}
                  className="fixed z-50"
                  style={{
                    top: menuPosition.y,
                    left: menuPosition.x,
                    transform: 'translate(-50%, -50%)'
                  }}
                  initial={{
                    opacity: 0,
                    scale: 0
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: x,
                    y: y,
                    transition: {
                      delay: 0.05 * index,
                      type: 'spring',
                      stiffness: 300,
                      damping: 20
                    }
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="relative">
                    <motion.button
                      className={`w-16 h-16 rounded-full ${item.color !== 'transparent' ? item.color : ''} text-white flex items-center justify-center cursor-pointer backdrop-blur-sm ring-2 ring-white/20 ${isActive ? 'scale-125' : ''}`}
                      style={{
                        boxShadow: isActive ? `0 5px 20px rgba(255,255,255,0.25)` : '0 5px 15px rgba(0,0,0,0.3)'
                      }}
                      whileHover={{
                        scale: 1.08,
                        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.6), inset 0 2px 15px rgba(255, 255, 255, 0.35)'
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNavigation(item)}
                    >
                      {item.icon}
                    </motion.button>

                    {/* 菜单项标题 */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap">
                      {isActive && (
                        <motion.div
                          className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]"
                          layoutId="active-indicator"
                        />
                      )}
                      <motion.div
                        className="bg-gray-800/75 backdrop-blur-xl text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg ring-1 ring-white/10"
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.1 + 0.05 * index, type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        {item.title}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </AnimatePresence>
      </div>
    </>
  );
};

export default RadialMenu;
