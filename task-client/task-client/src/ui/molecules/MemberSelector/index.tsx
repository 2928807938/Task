"use client";

import React, { useState } from "react";
import { FiChevronDown, FiUser } from "react-icons/fi";
import { useProjectMembers } from "@/hooks/use-project-members-hook";
import { ProjectMember } from "@/types/api-types";

interface MemberSelectorProps {
  projectId?: string;
  selectedMemberId?: string;
  onSelectMember: (memberId: string | undefined) => void;
  className?: string;
  placeholder?: string;
}

/**
 * 项目成员选择器组件
 * 用于选择项目成员作为任务负责人
 */
const MemberSelector: React.FC<MemberSelectorProps> = ({
  projectId,
  selectedMemberId,
  onSelectMember,
  className = "",
  placeholder = "选择负责人"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { members, isLoading, getMemberById } = useProjectMembers(projectId);
  
  const selectedMember = getMemberById(selectedMemberId);

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

  const handleSelectMember = (member: ProjectMember | null) => {
    onSelectMember(member?.id);
    setIsOpen(false);
  };

  if (!projectId) {
    return (
      <div className={`px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 ${className}`}>
        <span className="text-gray-500 text-sm">无项目信息</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* 选择器按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full px-3 py-2 text-left border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {selectedMember ? (
              <>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-medium ${getColorFromName(selectedMember.name)}`}>
                  {getInitials(selectedMember.name)}
                </div>
                <span className="text-gray-800 dark:text-gray-200 text-sm">
                  {selectedMember.name}
                </span>
              </>
            ) : (
              <>
                <FiUser className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-gray-500 text-sm">{placeholder}</span>
              </>
            )}
          </div>
          <FiChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* 清除选择选项 */}
          <button
            type="button"
            onClick={() => handleSelectMember(null)}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700"
          >
            <div className="flex items-center">
              <FiUser className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-500 text-sm">未分配</span>
            </div>
          </button>

          {/* 成员列表 */}
          {isLoading ? (
            <div className="px-3 py-2">
              <div className="animate-pulse flex items-center">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 mr-2"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ) : (
            members.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleSelectMember(member)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                  selectedMemberId === member.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-medium ${getColorFromName(member.name)}`}>
                    {getInitials(member.name)}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                      {member.name}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {member.email}
                    </div>
                  </div>
                  {member.role === 'OWNER' && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      Owner
                    </span>
                  )}
                </div>
              </button>
            ))
          )}

          {!isLoading && members.length === 0 && (
            <div className="px-3 py-2 text-gray-500 text-sm">
              暂无项目成员
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default MemberSelector;