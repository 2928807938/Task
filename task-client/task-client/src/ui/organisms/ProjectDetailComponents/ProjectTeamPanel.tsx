import React, {useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import AppleStyleProjectTeamPanel from './ProjectTeamPanelAppleStyle';
import AddMemberModal from './AddMemberModal';
import useProjectHook from '@/hooks/use-project-hook';
import {useToast} from '@/ui/molecules/Toast';
import {ProjectTask} from '@/types/api-types';
import {TaskStatusTrend} from '@/types/task-status-trend';

/**
 * 项目团队面板组件
 * 使用设计和交互
 */
interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
  department?: string;
  joinDate?: string;
  status?: 'active' | 'offline' | 'busy';
}

interface ProjectTeamPanelProps {
  members?: TeamMember[];
  tasks?: ProjectTask[];
  taskStatusTrend?: TaskStatusTrend;
  onAddMember?: () => void;
  onEditMember?: (member: TeamMember) => void;
  onRemoveMember?: (memberId: string) => void;
  onSwitchToTeamTab?: () => void;
  projectId: string; // 添加项目ID属性
}

const ProjectTeamPanel: React.FC<ProjectTeamPanelProps> = ({
  // 默认使用空数组
  members = [],
  onAddMember: externalAddMember,
  onEditMember,
  onRemoveMember: externalRemoveMember,
  onSwitchToTeamTab,
  projectId
}) => {
  // 添加成员弹窗状态
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  // 使用项目API中的移除成员功能
  const { useRemoveProjectMember } = useProjectHook();
  const removeMemberMutation = useRemoveProjectMember();
  const { addToast } = useToast();

  // 处理添加成员
  const handleAddMember = () => {
    // 打开添加成员弹窗
    setIsAddMemberModalOpen(true);
    // 如果有外部传入的处理函数，也调用它
    if (externalAddMember) {
      externalAddMember();
    }
  };

  // 使用 useQueryClient 来刷新成员列表
  const queryClient = useQueryClient();

  // 处理成员添加完成
  const handleMemberAdded = () => {
    // 主动刷新项目详情，以获取最新的成员列表
    queryClient.invalidateQueries({ queryKey: ['project', projectId] });
  };
  // 处理发送消息
  const handleSendMessage = (member: TeamMember) => {
  };

  // 处理发送邮件
  const handleSendEmail = (member: TeamMember) => {
    if (member.email) {
    }
  };

  // 处理移除成员
  const handleRemoveMember = (memberId: string) => {
    try {
      // 记录是否已经显示过提示，避免重复显示
      let toastShown = false;

      // 调用API移除成员
      removeMemberMutation.mutate(
        { projectId, memberId },
        {
          onSuccess: () => {
            // 压低冲突，如果没有外部回调才显示成功提示
            if (!externalRemoveMember) {
              addToast('成员已成功移除', 'success');
              toastShown = true;
            }

            // 刷新项目详情数据
            // 不使用第二次缓存刷新，避免触发可能的额外提示
            // queryClient.invalidateQueries({ queryKey: ['project', projectId] });

            // 如果有外部传入的处理函数，调用它
            if (externalRemoveMember) {
              // 通知外部组件只需要刷新数据，不需要再显示提示
              externalRemoveMember(memberId);
              toastShown = true; // 标记已经由外部组件处理提示
            }

            // 确保至少显示了一次成功提示
            if (!toastShown) {
              addToast('成员已成功移除', 'success');
            }
          },
          onError: (error: Error) => {
            // 显示错误提示
            addToast(error.message || '移除成员失败', 'error');
          }
        }
      );
    } catch (error) {
      console.error('移除成员时发生错误:', error);
      addToast('移除成员失败，请稍后重试', 'error');
    }
  };

  return (
    <>
      <AppleStyleProjectTeamPanel
        members={members}
        onAddMember={handleAddMember}
        onEditMember={onEditMember}
        onRemoveMember={handleRemoveMember}
        onSendMessage={handleSendMessage}
        onSendEmail={handleSendEmail}
        onSwitchToTeamTab={onSwitchToTeamTab}
        projectId={projectId}
      />

      {/* 添加成员弹窗 */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        projectId={projectId}
        onMemberAdded={handleMemberAdded}
      />
    </>
  );
};

export default ProjectTeamPanel;
