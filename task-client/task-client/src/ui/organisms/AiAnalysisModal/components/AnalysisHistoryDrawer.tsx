"use client";

import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiChevronLeft, FiPlus, FiSearch, FiTrash2, FiX} from 'react-icons/fi';
import {useAnalysisHistory} from './AnalysisHistoryProvider';
import {AnalysisHistory, HistoryActionType} from './types/history';
import AnalysisHistoryCard from './AnalysisHistoryCard';

interface AnalysisHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHistory: (history: AnalysisHistory) => void;
  onCreateNew: () => void;
}

const AnalysisHistoryDrawer: React.FC<AnalysisHistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectHistory,
  onCreateNew,
}) => {
  const { state, dispatch } = useAnalysisHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 抽屉动画变体 - 更符合苹果设计的流畅动效
  const drawerVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 35,
        mass: 1.2
      }
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 40,
        duration: 0.3
      }
    }
  };

  // 聚焦输入框
  useEffect(() => {
    if (isOpen && searchTerm === '') {
      // 微小延迟，确保DOM已更新
      const timer = setTimeout(() => {
        const searchInput = document.getElementById('history-search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 过滤历史记录
  const filteredHistories = state.histories.filter(history =>
    history.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    history.messages.some(msg =>
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // 开始重命名
  const handleStartRename = (id: string, currentTitle: string) => {
    setRenameId(id);
    setNewTitle(currentTitle);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // 提交重命名
  const handleRenameSubmit = () => {
    if (renameId && newTitle.trim()) {
      const history = state.histories.find(h => h.id === renameId);
      if (history) {
        dispatch({
          type: HistoryActionType.UPDATE_HISTORY,
          payload: {...history, title: newTitle.trim()}
        });
      }
    }
    setRenameId(null);
  };

  // 删除历史记录
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteConfirm = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDelete = (id: string) => {
    dispatch({
      type: HistoryActionType.DELETE_HISTORY,
      payload: id
    });
    setDeleteConfirmId(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          {/* 苹果风格毛玻璃效果抽屉 */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-96 bg-white/90 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.07),0_0_0_0.5px_rgba(0,0,0,0.04)] overflow-hidden rounded-l-2xl border-l border-gray-100/50"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 抽屉头部 - iOS 风格导航栏 */}
            <div className="px-5 py-3 flex items-center justify-between sticky top-0 z-50 bg-white border-b border-gray-200/60">
              <div className="flex items-center">
                <button
                  onClick={onClose}
                  className="mr-2 flex items-center text-blue-500"
                  aria-label="返回"
                >
                  <FiChevronLeft size={16} />
                  <span className="ml-0.5 text-[15px] font-medium">返回</span>
                </button>
              </div>

              <h2 className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[17px] font-semibold text-gray-900">
                历史记录
              </h2>

              <button
                onClick={onCreateNew}
                className="text-blue-500 p-1"
                aria-label="新建"
              >
                <FiPlus size={18} />
              </button>
            </div>

            {/* 搜索框 - iOS 风格搜索框 */}
            <div className="px-4 py-2 sticky top-[49px] z-40 bg-white/95 border-b border-gray-200/60">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" size={14} />
                </div>
                <input
                  id="history-search-input"
                  type="text"
                  placeholder="搜索历史记录..."
                  className="w-full pl-8 pr-8 py-1.5 text-[15px] bg-gray-100/90 border-none rounded-lg focus:outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400"
                    onClick={() => setSearchTerm('')}
                  >
                    <div className="bg-gray-300/80 rounded-full w-4 h-4 flex items-center justify-center">
                      <FiX size={10} className="text-gray-500" />
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* 历史记录列表 - iOS样式平滑滚动 */}
            <div className="overflow-y-auto h-[calc(100vh-120px)] bg-gray-50/50">
              {/* 删除确认 - iOS风格弹窗 */}
              <AnimatePresence>
                {deleteConfirmId && (
                  <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
                    <motion.div
                      className="w-72 bg-white rounded-xl overflow-hidden"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="p-4 text-center">
                        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-50 flex items-center justify-center">
                          <FiTrash2 className="text-red-500" size={20} />
                        </div>
                        <h4 className="text-[17px] font-semibold text-gray-900 mb-1">删除记录</h4>
                        <p className="text-[13px] text-gray-500 mb-4">删除后将无法恢复此历史记录及其全部分析数据。</p>

                        <div className="border-t border-gray-200">
                          <button
                            className="w-full p-3 text-[16px] font-medium text-red-500 active:bg-gray-100"
                            onClick={() => handleDelete(deleteConfirmId)}
                          >
                            删除
                          </button>
                        </div>
                        <div className="border-t border-gray-200">
                          <button
                            className="w-full p-3 text-[16px] font-medium text-blue-500 active:bg-gray-100"
                            onClick={cancelDelete}
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {filteredHistories.length > 0 ? (
                <AnimatePresence>
                  {filteredHistories.map((history, index) => (
                    <motion.div
                      key={history.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }} // 交错动画
                    >
                      {renameId === history.id ? (
                        <div className="my-2 mx-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                          <div className="p-3 border-b border-gray-100">
                            <h4 className="text-[15px] font-medium text-gray-900">重命名记录</h4>
                          </div>
                          <div className="p-3">
                            <input
                              ref={inputRef}
                              type="text"
                              className="w-full px-3 py-2 text-[15px] bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-300 mb-3"
                              value={newTitle}
                              onChange={e => setNewTitle(e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && handleRenameSubmit()}
                              autoFocus
                              placeholder="输入新名称..."
                            />
                            <div className="flex justify-between">
                              <button
                                className="px-4 py-1.5 text-[14px] font-medium text-blue-500 border border-gray-200 rounded-lg active:bg-gray-50"
                                onClick={cancelDelete}
                              >
                                取消
                              </button>
                              <button
                                className="px-4 py-1.5 text-[14px] font-medium text-white bg-blue-500 rounded-lg active:bg-blue-600"
                                onClick={handleRenameSubmit}
                              >
                                保存
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <AnalysisHistoryCard
                          history={history}
                          isActive={state.currentHistoryId === history.id}
                          onSelectHistory={onSelectHistory}
                          onRename={() => handleStartRename(history.id, history.title)}
                          onDelete={() => handleDeleteConfirm(history.id)}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <motion.div
                  className="text-center pt-14 pb-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  {/* 精美的苹果风格插图 */}
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-50 to-gray-100/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-gray-200/10 opacity-30"></div>
                    <FiSearch className="text-gray-400/80" size={32} />
                    {/* 微妙光效 */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 rounded-full"></div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 tracking-tight mb-2">
                    {searchTerm ? '未找到相关记录' : '暂无历史记录'}
                  </h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                    {searchTerm
                      ? '请尝试使用其他关键词或检查拼写'
                      : '创建新对话并保存，将在这里显示历史记录'
                    }
                  </p>

                  {!searchTerm && (
                    <motion.button
                      className="mt-6 px-4 py-2 bg-blue-50 hover:bg-blue-100/80 active:bg-blue-200/80 text-blue-500 rounded-full text-sm font-medium transition-all duration-300 flex items-center mx-auto"
                      onClick={onCreateNew}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FiPlus size={16} className="mr-1" />
                      新建对话
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalysisHistoryDrawer;
