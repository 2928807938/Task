"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiSearch, FiUser, FiX, FiLoader } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import useProjectApi from "@/hooks/use-project-hook";
import { ProjectMember } from "@/types/api-types";
import { useDebounceHook } from "@/hooks/use-debounce-hook";

// 导入项目成员类型作为用户类型UserSearchSelect
export interface User extends Omit<ProjectMember, 'avatar'> {
  id: string;
  name: string;
  avatar?: string;
}

interface UserSearchSelectProps {
  selectedUserId?: string;
  onUserSelect: (userId?: string) => void;
  placeholder?: string;
  className?: string;
  projectId?: string; // 项目ID，用于获取项目成员
}

/**
 * 用户搜索选择组件 - 苹果风格设计
 *
 * 带搜索功能的用户下拉选择组件，符合苹果设计风格
 */
const UserSearchSelect: React.FC<UserSearchSelectProps> = ({
  selectedUserId,
  onUserSelect,
  placeholder = "搜索用户...",
  className = "",
  projectId = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounceHook(searchTerm, 300);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 使用项目API Hook获取项目成员
  const { useGetProjectMembers } = useProjectApi();
  const { data: members, isLoading } = useGetProjectMembers(projectId, debouncedSearchTerm);

  // 将项目成员转换为用户对象
  const users = useMemo(() => {
    if (!members) return [];

    return members.map(member => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar || "",
      email: member.email || "",
      role: member.role || "MEMBER",
      joinedAt: member.joinedAt || new Date().toISOString(),
      taskCount: member.taskCount || 0
    }));
  }, [members]);

  // 处理点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 当选中的用户ID变化时，更新选中的用户
  useEffect(() => {
    if (selectedUserId && users.length > 0) {
      const user = users.find(user => user.id === selectedUserId);
      setSelectedUser(user);
    } else if (!selectedUserId) {
      setSelectedUser(undefined);
    }
  }, [selectedUserId, users]);

  // 选择用户
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    onUserSelect(user.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  // 清除选择
  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUser(undefined);
    onUserSelect(undefined);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`flex items-center px-3 py-1.5 border rounded-lg cursor-pointer transition-all ${
          isOpen 
            ? "border-blue-400 ring-2 ring-blue-100" 
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedUser ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              {selectedUser.avatar ? (
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiUser className="text-blue-500" size={12} />
                </div>
              )}
              <span className="text-sm">{selectedUser.name}</span>
            </div>
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={handleClearSelection}
            >
              <FiX size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center w-full text-gray-500">
            <FiSearch className="mr-2" size={14} />
            <span className="text-sm">{placeholder}</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="p-2">
              <div className="flex items-center px-3 py-2 bg-gray-50 rounded-md mb-2">
                <FiSearch className="text-gray-400 mr-2" size={14} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-sm bg-transparent outline-none"
                  placeholder="搜索用户..."
                  autoFocus
                />
              </div>

              <div className="max-h-48 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <FiLoader className="animate-spin text-blue-500 mr-2" size={16} />
                    <span className="text-sm text-gray-500">加载中...</span>
                  </div>
                ) : users.length > 0 ? (
                  users.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                      onClick={() => handleSelectUser(user)}
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <FiUser className="text-blue-500" size={12} />
                        </div>
                      )}
                      <span className="text-sm">{user.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    未找到匹配用户
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSearchSelect;
