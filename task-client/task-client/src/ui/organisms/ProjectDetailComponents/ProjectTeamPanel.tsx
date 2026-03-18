import React, {useMemo, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import AppleStyleProjectTeamPanel from './ProjectTeamPanelAppleStyle';
import AddMemberModal from './AddMemberModal';
import useProjectHook from '@/hooks/use-project-hook';
import {useToast} from '@/ui/molecules/Toast';
import {ProjectTask} from '@/types/api-types';
import {TaskStatusTrend} from '@/types/task-status-trend';
import TaskTrend from '@/ui/organisms/TaskTrend';
import {useTheme} from '@/ui/theme';
import {FiActivity, FiUsers} from 'react-icons/fi';

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
  tasks = [],
  taskStatusTrend,
  onAddMember: externalAddMember,
  onEditMember,
  onRemoveMember: externalRemoveMember,
  onSwitchToTeamTab,
  projectId
}) => {
  const { isDark } = useTheme();
  const isDarkMode = isDark;
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

  const activeMembersCount = useMemo(() => members.filter((member) => member.status === 'active').length, [members]);
  const emailReadyCount = useMemo(() => members.filter((member) => Boolean(member.email)).length, [members]);
  const departmentCount = useMemo(() => new Set(members.map((member) => member.department).filter(Boolean)).size, [members]);

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
      <div className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr),minmax(360px,0.9fr)]">
        <div className={`overflow-hidden rounded-[32px] border shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)] ${isDarkMode ? 'border-white/10 bg-slate-900/85' : 'border-slate-200/80 bg-white/95'}`}>
          <div className={`border-b px-5 py-4 ${isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200/80 bg-slate-50/80'}`}>
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isDarkMode ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
              <FiActivity size={13} />
              团队趋势
            </div>
            <h3 className={`mt-3 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>把任务趋势放到团队上下文里</h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              先看团队承接了什么任务，再看每个成员是谁，会更符合协作视角。
            </p>
          </div>
          <div className="p-5">
            <TaskTrend
              tasks={tasks}
              projectId={projectId}
              taskStatusTrend={taskStatusTrend}
            />
          </div>
        </div>

        <div className={`overflow-hidden rounded-[32px] border shadow-[0_24px_60px_-32px_rgba(15,23,42,0.45)] ${isDarkMode ? 'border-white/10 bg-slate-900/85' : 'border-slate-200/80 bg-white/95'}`}>
          <div className={`border-b px-5 py-4 ${isDarkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200/80 bg-slate-50/80'}`}>
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${isDarkMode ? 'bg-violet-500/10 text-violet-300' : 'bg-violet-50 text-violet-600'}`}>
              <FiUsers size={13} />
              团队概览
            </div>
            <h3 className={`mt-3 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>成员、部门和协作准备度</h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              先看谁在线、谁可联系、覆盖了哪些部门，再进入下方完整成员列表。
            </p>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-3 xl:grid-cols-1">
            {[
              { label: '团队成员', value: members.length, hint: activeMembersCount > 0 ? `${activeMembersCount} 人在线` : '暂无在线成员' },
              { label: '可联系成员', value: emailReadyCount, hint: emailReadyCount > 0 ? '可直接发起协作' : '等待补充邮箱' },
              { label: '覆盖部门', value: departmentCount || '—', hint: departmentCount > 0 ? '协作角色更清晰' : '暂未设置部门' }
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-[24px] border p-4 ${isDarkMode ? 'border-white/10 bg-white/[0.04]' : 'border-slate-200/80 bg-slate-50/80'}`}
              >
                <div className={`text-xs font-medium uppercase tracking-[0.18em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</div>
                <div className={`mt-3 text-3xl font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.value}</div>
                <div className={`mt-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.hint}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
