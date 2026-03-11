"use client";

import React from "react";
import { useProjectMembers } from "@/hooks/use-project-members-hook";

interface DebugUserDisplayProps {
  userId?: string;
  projectId?: string;
}

/**
 * 调试版本的UserDisplay组件
 * 用于直接显示所有调试信息
 */
const DebugUserDisplay: React.FC<DebugUserDisplayProps> = ({
  userId,
  projectId,
}) => {
  const { members, isLoading, getMemberById } = useProjectMembers(projectId);
  const user = getMemberById(userId);

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm">
      <h4 className="font-bold mb-2">UserDisplay Debug Info</h4>
      
      <div className="space-y-2">
        <div><strong>userId:</strong> {JSON.stringify(userId)} (type: {typeof userId})</div>
        <div><strong>projectId:</strong> {JSON.stringify(projectId)} (type: {typeof projectId})</div>
        <div><strong>isLoading:</strong> {JSON.stringify(isLoading)}</div>
        <div><strong>members count:</strong> {members.length}</div>
        
        <div className="mt-3">
          <strong>All Members:</strong>
          <pre className="bg-white dark:bg-gray-900 p-2 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(members.map(m => ({ id: m.id, name: m.name, idType: typeof m.id })), null, 2)}
          </pre>
        </div>
        
        <div className="mt-3">
          <strong>Found User:</strong>
          <pre className="bg-white dark:bg-gray-900 p-2 rounded text-xs">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div className="mt-3">
          <strong>Manual Match Test:</strong>
          {members.map(member => {
            const match = member.id.toString() === userId?.toString();
            return (
              <div key={member.id} className="text-xs">
                {member.name}: {member.id} === {userId} → {match ? '✅' : '❌'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DebugUserDisplay;