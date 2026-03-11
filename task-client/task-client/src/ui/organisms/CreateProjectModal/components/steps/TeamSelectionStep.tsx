'use client';

import React, {useState} from 'react';
import {UseFormReturn} from 'react-hook-form';
import {CreateProjectRequest, TeamInfo} from '@/types/api-types';
import {FiCheck, FiPlus, FiSearch, FiUsers} from 'react-icons/fi';
import Button from '@/ui/atoms/Button';
import {useCreateTeam, useMyTeams} from '@/hooks/use-team-hook';
import {motion} from 'framer-motion';

interface TeamSelectionStepProps {
  form: UseFormReturn<CreateProjectRequest>;
}

/**
 * 项目创建的第二步 - 团队选择
 */
const TeamSelectionStep: React.FC<TeamSelectionStepProps> = ({ form }) => {
  const { watch, setValue } = form;

  // 状态
  const [teamSearchTerm, setTeamSearchTerm] = useState('');
  const [showTeamCreateForm, setShowTeamCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // API hooks
  const { data: teams, isLoading: isLoadingTeams } = useMyTeams();
  const createTeamMutation = useCreateTeam();
  const isCreatingTeam = createTeamMutation.isPending;

  // 处理创建团队
  const handleCreateTeam = async () => {
    if (!newTeamName) {
      setErrorMessage('团队名称不能为空');
      return;
    }

    setErrorMessage('');

    try {
      const response = await createTeamMutation.mutateAsync({
        name: newTeamName,
        description: newTeamDescription
      });

      const team = response.data as TeamInfo;

      setValue('teamId', team.id);
      setShowTeamCreateForm(false);
      setNewTeamName('');
      setNewTeamDescription('');
    } catch (error) {
      console.error('创建团队失败:', error);
      setErrorMessage('创建团队失败，请重试');
    }
  };

  // 过滤团队列表
  const filteredTeams = teams && teamSearchTerm
    ? teams.filter((team: TeamInfo) =>
        team.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
        (team.description && team.description.toLowerCase().includes(teamSearchTerm.toLowerCase()))
      )
    : teams;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>团队选择</h3>
        <p className="text-sm mt-1" style={{ color: 'var(--theme-neutral-500)' }}>选择现有团队或创建新团队</p>
      </div>

      <div>
        {/* 搜索框 */}
        <div className="relative mb-4">
          <div className="absolute left-3 top-[11px]" style={{ color: 'var(--theme-neutral-400)' }}>
            <FiSearch className="h-5 w-5" />
          </div>
          <input
            type="text"
            className="w-full px-4 py-2.5 pl-10 border rounded-xl"
            style={{
              borderColor: 'var(--theme-neutral-300)',
              backgroundColor: 'var(--theme-card-bg)',
              color: 'var(--foreground)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--theme-primary-500)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--theme-neutral-300)';
            }}
            placeholder="搜索团队..."
            value={teamSearchTerm}
            onChange={(e) => setTeamSearchTerm(e.target.value)}
          />

          {/* 创建新团队按钮 */}
          <button
            type="button"
            className="absolute right-2 top-2 p-1.5 rounded-lg transition-colors"
            style={{
              color: 'var(--theme-primary-500)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--theme-primary-600)';
              e.currentTarget.style.backgroundColor = 'var(--theme-primary-50)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--theme-primary-500)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={() => setShowTeamCreateForm(!showTeamCreateForm)}
          >
            <FiPlus className="h-5 w-5" />
            <span className="sr-only">创建新团队</span>
          </button>
        </div>

        {/* 创建新团队表单 */}
        {showTeamCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 border rounded-xl"
            style={{
              borderColor: 'var(--theme-primary-300)',
              backgroundColor: 'var(--theme-card-bg)',
              boxShadow: '0 0 0 1px var(--theme-primary-200)'
            }}>
            <div className="flex items-center mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--theme-primary-50)' }}>
              <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: 'var(--theme-primary-500)' }}>
                <FiUsers className="h-4 w-4" style={{ color: '#FFFFFF' }} />
              </div>
              <h4 className="font-medium" style={{ color: 'var(--theme-primary-700)' }}>创建新团队</h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-neutral-700)' }}>
                  团队名称
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-opacity-20 focus:outline-none transition-all"
                  style={{
                    borderColor: 'var(--theme-card-border)',
                    backgroundColor: 'var(--theme-card-bg)',
                    color: 'var(--foreground)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--theme-primary-500)';
                    e.target.style.boxShadow = '0 0 0 3px var(--theme-primary-100)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--theme-card-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="输入团队名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-neutral-700)' }}>
                  团队描述 <span className="text-xs" style={{ color: 'var(--theme-neutral-500)' }}>(可选)</span>
                </label>
                <textarea
                  className="w-full px-4 py-2.5 border rounded-xl resize-none focus:ring-2 focus:ring-opacity-20 focus:outline-none transition-all"
                  style={{
                    borderColor: 'var(--theme-card-border)',
                    backgroundColor: 'var(--theme-card-bg)',
                    color: 'var(--foreground)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--theme-primary-500)';
                    e.target.style.boxShadow = '0 0 0 3px var(--theme-primary-100)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--theme-card-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  placeholder="输入团队描述"
                  rows={3}
                />
              </div>

              <div className="text-xs mt-1 h-6 flex items-center" style={{ color: 'var(--theme-error-500)' }}>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5" style={{ color: 'var(--theme-error-500)' }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                    {errorMessage}
                  </motion.div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button
                  onClick={() => setShowTeamCreateForm(false)}
                  variant="secondary"
                  className="transition-colors"
                >
                  取消
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={!newTeamName || isCreatingTeam}
                  variant="primary"
                  className="transition-colors"
                >
                  {isCreatingTeam ? '创建中...' : '创建团队'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 团队列表 */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
          {isLoadingTeams && (
            <div className="text-center py-8" style={{ color: 'var(--theme-neutral-500)' }}>
              <svg className="animate-spin h-8 w-8 mx-auto mb-2" style={{ color: 'var(--theme-primary-500)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              加载团队中...
            </div>
          )}

          {teams && teams.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 rounded-xl border"
              style={{
                color: 'var(--theme-neutral-500)',
                backgroundColor: 'var(--theme-neutral-50)',
                borderColor: 'var(--theme-neutral-100)'
              }}
            >
              <FiUsers className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--theme-neutral-300)' }} />
              <p>没有可用的团队</p>
              <button
                onClick={() => setShowTeamCreateForm(true)}
                className="mt-3 px-4 py-2 text-sm font-medium rounded-lg focus:outline-none transition-colors"
                style={{
                  color: 'var(--theme-primary-600)',
                  backgroundColor: 'var(--theme-primary-50)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-primary-100)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--theme-primary-50)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px var(--theme-primary-500)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                创建新团队
              </button>
            </motion.div>
          )}

          {filteredTeams && filteredTeams.map((team: TeamInfo) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setValue('teamId', team.id)}
              className="p-4 border rounded-xl cursor-pointer transition-all"
              style={{
                borderColor: watch('teamId') === team.id 
                  ? 'var(--theme-primary-500)' 
                  : 'var(--theme-card-border)',
                backgroundColor: watch('teamId') === team.id 
                  ? 'var(--theme-primary-100)' 
                  : 'var(--theme-card-bg)',
                boxShadow: watch('teamId') === team.id 
                  ? '0 0 0 1px var(--theme-primary-500)' 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (watch('teamId') !== team.id) {
                  e.currentTarget.style.borderColor = 'var(--theme-primary-200)';
                  e.currentTarget.style.backgroundColor = 'var(--theme-card-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (watch('teamId') !== team.id) {
                  e.currentTarget.style.borderColor = 'var(--theme-card-border)';
                  e.currentTarget.style.backgroundColor = 'var(--theme-card-bg)';
                }
              }}
            >
              <div className="flex items-center">
                <div 
                  className="h-10 w-10 rounded-full flex items-center justify-center mr-3" 
                  style={{ 
                    backgroundColor: watch('teamId') === team.id 
                      ? 'var(--theme-primary-500)' 
                      : 'var(--theme-neutral-200)', 
                    color: watch('teamId') === team.id 
                      ? '#FFFFFF' 
                      : 'var(--theme-neutral-600)' 
                  }}
                >
                  <FiUsers className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 
                    className="font-medium" 
                    style={{ 
                      color: watch('teamId') === team.id 
                        ? 'var(--theme-primary-700)' 
                        : 'var(--foreground)' 
                    }}
                  >
                    {team.name}
                  </h4>
                  {team.description && (
                    <p 
                      className="text-sm line-clamp-2 mt-0.5" 
                      style={{ 
                        color: watch('teamId') === team.id 
                          ? 'var(--theme-primary-600)' 
                          : 'var(--theme-neutral-500)' 
                      }}
                    >
                      {team.description}
                    </p>
                  )}
                </div>

                {watch('teamId') === team.id && (
                  <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--theme-primary-500)' }}>
                    <FiCheck className="h-4 w-4" style={{ color: '#FFFFFF' }} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 提示信息 */}
        <div className="rounded-xl p-4 mt-6" style={{ backgroundColor: 'var(--theme-primary-50)' }}>
          <p className="text-sm" style={{ color: 'var(--theme-primary-700)' }}>
            在下一步中，您将设置项目的优先级和状态流程体系。
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamSelectionStep;
