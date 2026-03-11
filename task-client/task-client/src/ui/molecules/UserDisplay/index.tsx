"use client";

import React from "react";
import {FiUser} from "react-icons/fi";
import { useProjectMembers } from "@/hooks/use-project-members-hook";

interface UserDisplayProps {
  userId?: string;
  projectId?: string;
  className?: string;
}

/**
 * 用户信息显示组件 -
 *
 * 显示用户名和文字头像的只读组件
 */
const UserDisplay: React.FC<UserDisplayProps> = ({
  userId,
  projectId,
  className = "",
}) => {
  const { getMemberById, isLoading, members } = useProjectMembers(projectId);
  
  // 获取用户信息
  const user = getMemberById(userId);

  // 调试信息
  console.log('UserDisplay Debug:', {
    userId,
    projectId,
    user,
    membersCount: members.length,
    isLoading
  });

  // 生成首字母头像
  const getInitials = (name: string) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else {
      return name.slice(0, 1).toUpperCase();
    }
  };

  // 根据名称生成颜色
  const getColorFromName = (name: string) => {
    const colors = [
      "bg-blue-500 text-white",
      "bg-green-500 text-white",
      "bg-purple-500 text-white",
      "bg-orange-500 text-white",
      "bg-pink-500 text-white",
      "bg-indigo-500 text-white",
      "bg-red-500 text-white",
      "bg-yellow-500 text-black",
      "bg-teal-500 text-white",
      "bg-cyan-500 text-white"
    ];

    if (!name) return colors[0];

    const hash = name.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colors[hash % colors.length];
  };

  // 如果没有用户ID或项目ID，显示默认状态
  if (!userId || !projectId) {
    return (
      <div className={`flex items-center px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <span className="text-gray-500 dark:text-gray-400 text-sm">未分配责任人</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="animate-pulse flex items-center">
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 mr-2"></div>
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>
      {user ? (
        <>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-medium ${getColorFromName(user.name)}`}>
            {getInitials(user.name)}
          </div>
          <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">
            {user.name}
          </span>
        </>
      ) : (
        <div className="flex items-center text-gray-500">
          <FiUser className="mr-2" size={16} />
          <span className="text-sm">找不到用户信息 (ID: {userId})</span>
        </div>
      )}
    </div>
  );
};

export default UserDisplay;