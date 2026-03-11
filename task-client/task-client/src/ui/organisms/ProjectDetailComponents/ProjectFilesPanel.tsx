import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {
    FiClock,
    FiCornerUpLeft,
    FiDownload,
    FiEye,
    FiFile,
    FiFolder,
    FiGrid,
    FiList,
    FiMoreHorizontal,
    FiPlus,
    FiSearch,
    FiStar,
    FiTrash2,
    FiUpload,
    FiX
} from 'react-icons/fi';
import {formatDate, formatFileSize, getFileExtension, getFileIconStyle} from '@/utils/file-utils';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  uploader?: string;
  uploadDate?: string;
  icon?: string;
  extension?: string;
  starred?: boolean;
}

interface ProjectFilesPanelProps {
  files: FileItem[];
  onUploadFile: () => void;
  onCreateFolder: () => void;
}

const ProjectFilesPanel: React.FC<ProjectFilesPanelProps> = ({
  files,
  onUploadFile,
  onCreateFolder
}) => {
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<FileItem[]>([]);
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  const [starredFiles, setStarredFiles] = useState<string[]>([]);

  // 创建引用，用于聚焦搜索输入框和处理点击外部关闭菜单
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  // 处理键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 命令/Ctrl + F 聚焦搜索框
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // ESC 关闭选中的文件和菜单
      if (e.key === 'Escape') {
        setSelectedFile(null);
        setShowOptionsMenu(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 处理点击外部关闭选项菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target as Node)) {
        setShowOptionsMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 过滤文件
  const filteredFiles = useMemo(() => {
    if (!searchText.trim()) return files;

    const searchTerms = searchText.toLowerCase().split(' ').filter(Boolean);
    return files.filter(file => {
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();
      const fileUploader = (file.uploader || '').toLowerCase();

      return searchTerms.every(term =>
        fileName.includes(term) ||
        fileType.includes(term) ||
        fileUploader.includes(term)
      );
    });
  }, [files, searchText]);

  // 处理文件点击
  const handleFileClick = useCallback((file: FileItem) => {
    setSelectedFile(file);

    // 添加到最近查看
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== file.id);
      return [file, ...filtered].slice(0, 5);
    });
  }, []);

  // 收藏文件
  const toggleStarFile = useCallback((fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
    setShowOptionsMenu(null);
  }, []);

  // 渲染文件图标
  const renderFileIcon = useCallback((file: FileItem) => {
    if (file.type === 'folder') {
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <FiFolder className="text-blue-500" size={18} />
        </div>
      );
    }

    // 获取文件扩展名
    const extension = file.extension || getFileExtension(file.name);
    const { bg, text } = getFileIconStyle(extension);

    return (
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
        {['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'sketch', 'psd'].includes(extension) ? (
          <span className={`${text} font-medium text-xs`}>
            {extension.toUpperCase()}
          </span>
        ) : (
          <FiFile className={text} size={18} />
        )}
      </div>
    );
  }, []);

  // 文件操作菜单
  const renderOptionsMenu = useCallback((file: FileItem) => {
    if (showOptionsMenu !== file.id) return null;

    const options = [
      { icon: <FiDownload size={16} />, label: '下载', onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        // 下载逻辑
        setShowOptionsMenu(null);
      }},
      { icon: <FiEye size={16} />, label: '预览', onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        handleFileClick(file);
      }},
      { icon: <FiStar size={16} />,
        label: starredFiles.includes(file.id) ? '取消收藏' : '收藏',
        onClick: (e: React.MouseEvent) => toggleStarFile(file.id, e)
      },
      { icon: <FiTrash2 size={16} />, label: '删除', onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        // 删除逻辑
        setShowOptionsMenu(null);
      }, className: 'text-red-500 hover:bg-red-50' }
    ];

    return (
      <div
        ref={optionsMenuRef}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {options.map((option, index) => (
          <button
            key={index}
            className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-gray-50 transition-colors ${option.className || ''}`}
            onClick={option.onClick}
          >
            <span className="mr-2">{option.icon}</span>
            {option.label}
          </button>
        ))}
      </div>
    );
  }, [showOptionsMenu, starredFiles, handleFileClick, toggleStarFile]);

  return (
    <div className="mt-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
      >
        {/* 搜索和操作区域 */}
        <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 apple-blur-bg">
          <div className="flex items-center flex-1 min-w-[280px] max-w-md">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索文件..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
              />
              {searchText && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchText('')}
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
              >
                <FiGrid className="mr-1.5" size={14} />
                网格视图
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
              >
                <FiList className="mr-1.5" size={14} />
                列表视图
              </button>
            </div>

            <button
              onClick={onUploadFile}
              className="apple-button inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all shadow-sm"
            >
              <FiUpload className="mr-1.5" size={15} />
              上传文件
            </button>
            <button
              onClick={onCreateFolder}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              <FiPlus className="mr-1.5" size={15} />
              新建文件夹
            </button>
          </div>
        </div>

        {/* 最近访问的文件 */}
        {recentlyViewed.length > 0 && (
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center">
              <FiClock className="mr-1.5" size={12} />
              最近访问
            </h3>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {recentlyViewed.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center p-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all min-w-[180px]"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="mr-2 flex-shrink-0">
                    {renderFileIcon(file)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 文件列表区域 */}
        <div className="p-5">
          {filteredFiles.length > 0 ? (
            viewMode === 'list' ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文件名</th>
                      <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">大小</th>
                      <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上传者</th>
                      <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上传日期</th>
                      <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFiles.map((file, index) => (
                      <tr
                        key={file.id || index}
                        className="group hover:bg-gray-50 transition-colors cursor-pointer relative"
                        onClick={() => handleFileClick(file)}
                      >
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="mr-3 flex-shrink-0">
                              {renderFileIcon(file)}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {file.name}
                              </span>
                              {file.type === 'folder' && (
                                <span className="ml-2 text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                  文件夹
                                </span>
                              )}
                            </div>
                            {starredFiles.includes(file.id) && (
                              <FiStar className="ml-2 text-yellow-400" size={14} />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">{formatFileSize(file.size)}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">{file.uploader || '-'}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(file.uploadDate)}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-right text-sm relative">
                          <div className="invisible group-hover:visible">
                            <button
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                // 下载文件逻辑
                              }}
                            >
                              <FiDownload size={15} />
                            </button>
                            <button
                              className="p-1.5 text-gray-500 hover:text-yellow-500 hover:bg-gray-200 rounded-full transition-colors ml-1"
                              onClick={(e) => toggleStarFile(file.id, e)}
                            >
                              <FiStar size={15} className={starredFiles.includes(file.id) ? "text-yellow-400" : ""} />
                            </button>
                            <button
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors ml-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowOptionsMenu(showOptionsMenu === file.id ? null : file.id);
                              }}
                            >
                              <FiMoreHorizontal size={15} />
                            </button>
                          </div>
                          {renderOptionsMenu(file)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file, index) => (
                  <div
                    key={file.id || index}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-white transition-all cursor-pointer border border-gray-200 hover:shadow-md relative"
                    onClick={() => handleFileClick(file)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="mr-3 flex-shrink-0">
                          {renderFileIcon(file)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-sm text-gray-500 truncate">{file.type === 'folder' ? '文件夹' : formatFileSize(file.size)}</p>
                          {file.uploader && (
                            <p className="text-xs text-gray-400 mt-1 truncate">上传者: {file.uploader}</p>
                          )}
                        </div>
                      </div>

                      <div className="relative member-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowOptionsMenu(showOptionsMenu === file.id ? null : file.id);
                          }}
                          className="p-1.5 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
                        >
                          <FiMoreHorizontal size={15} />
                        </button>
                        {renderOptionsMenu(file)}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                      <div className="text-xs text-gray-400">
                        {file.uploadDate && `上传于 ${formatDate(file.uploadDate)}`}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-200 transition-colors text-gray-500 member-actions"
                          aria-label="下载文件"
                          onClick={(e) => {
                            e.stopPropagation();
                            // 下载文件逻辑
                          }}
                        >
                          <FiDownload size={15} />
                        </button>
                        <button
                          className="p-1.5 rounded-full hover:bg-gray-200 transition-colors text-gray-500 member-actions"
                          aria-label="收藏文件"
                          onClick={(e) => toggleStarFile(file.id, e)}
                        >
                          <FiStar size={15} className={starredFiles.includes(file.id) ? "text-yellow-400" : ""} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : searchText ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FiSearch size={24} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-800">未找到匹配的文件</p>
              <p className="text-sm mt-1 text-gray-500 max-w-md mx-auto">尝试使用其他关键词搜索，或检查拼写是否正确</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSearchText('')}
                className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors inline-flex items-center"
              >
                <FiCornerUpLeft className="mr-1.5" size={16} />
                清除搜索
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center justify-center bg-gray-50 rounded-xl p-12 cursor-pointer hover:bg-gray-100 transition-colors border-2 border-dashed border-gray-200">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="mb-6 flex justify-center"
                >
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
                    <FiUpload size={40} className="text-blue-400" />
                  </div>
                </motion.div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">拖动文件到这里上传</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">支持各种文档格式，单个文件最大50MB</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onUploadFile}
                  className="px-5 py-2.5 bg-blue-500 rounded-xl text-white hover:bg-blue-600 transition-colors inline-flex items-center shadow-sm"
                >
                  <FiUpload className="mr-2" size={16} />
                  选择文件
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* 文件详情弹窗*/}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedFile(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center mb-5">
                <div className="w-16 h-16 flex items-center justify-center mb-3">
                  {selectedFile.type === 'folder' ? (
                    <FiFolder className="text-blue-500" size={42} />
                  ) : (
                    renderFileIcon(selectedFile)
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1 text-center">{selectedFile.name}</h3>
                <p className="text-gray-500 text-sm">{formatFileSize(selectedFile.size)}</p>
                {selectedFile.uploader && (
                  <p className="text-gray-400 text-sm mt-1">上传者: {selectedFile.uploader}</p>
                )}
                {selectedFile.uploadDate && (
                  <p className="text-gray-400 text-sm">上传时间: {formatDate(selectedFile.uploadDate)}</p>
                )}
              </div>

              <div className="flex justify-center space-x-3 mt-5">
                {selectedFile.type === 'file' && (
                  <button
                    className="px-4 py-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors flex items-center shadow-sm"
                  >
                    <FiDownload className="mr-2" size={15} />
                    下载
                  </button>
                )}
                <button
                  className="px-4 py-2 bg-gray-100 rounded-full text-red-500 hover:bg-gray-200 transition-colors flex items-center"
                >
                  <FiTrash2 className="mr-2" size={15} />
                  删除
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                  className="w-full text-center text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setSelectedFile(null)}
                >
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectFilesPanel;
