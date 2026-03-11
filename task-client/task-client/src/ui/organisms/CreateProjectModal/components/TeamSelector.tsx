'use client';

import React, {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiChevronDown, FiChevronUp, FiLoader, FiPlus, FiSearch} from 'react-icons/fi';
import {Input} from '@/ui/atoms/Input/Input';
import Button from '@/ui/atoms/Button';
import {Tooltip} from '@/ui/atoms/Tooltip';

interface Team {
  id: string;
  name: string;
  description?: string;
}

interface TeamSelectorProps {
  teams: Team[];
  selectedTeamId: string;
  setSelectedTeamId: (id: string) => void;
  isLoadingTeams: boolean;
  isSearching: boolean;
  teamSearchTerm: string;
  onTeamSearchChange: (value: string) => void;
  onRefreshTeams: () => void;
  onCreateNewTeamClick?: () => void;
  register: any;
  errors: any;
  setValue: any;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({
  teams,
  selectedTeamId,
  setSelectedTeamId,
  isLoadingTeams,
  isSearching,
  teamSearchTerm,
  onTeamSearchChange,
  onRefreshTeams,
  onCreateNewTeamClick,
  register,
  errors,
  setValue
}) => {
  const [expandedTeamSection, setExpandedTeamSection] = useState(false);

  // 当选择了团队ID时，更新表单值
  useEffect(() => {
    if (selectedTeamId) {
      setValue('teamId', selectedTeamId);
    }
  }, [selectedTeamId, setValue]);

  return (
    <div className="space-y-3">
      <div
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer border border-gray-200 hover:bg-gray-100 transition-colors duration-150"
        onClick={() => setExpandedTeamSection(!expandedTeamSection)}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center mr-3 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          </div>
          <div>
            <div className="font-medium">所属团队</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {selectedTeamId
                ? teams.find(t => t.id === selectedTeamId)?.name || '选择团队'
                : '选择团队'}
            </div>
          </div>
        </div>
        <div>
          {expandedTeamSection ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </div>

      <AnimatePresence>
        {expandedTeamSection && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1 space-y-4">
              {/* 搜索栏 */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="搜索团队..."
                  value={teamSearchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTeamSearchChange(e.target.value)}
                  className="pl-9 pr-9 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-full transition-all duration-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FiSearch className="w-4 h-4" />
                </div>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isSearching ? (
                    <FiLoader className="w-4 h-4 text-blue-500 animate-spin" />
                  ) : (
                    <Tooltip content="刷新团队列表">
                      <button
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onRefreshTeams();
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded-md hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* 创建新团队按钮 */}
              <div>
                <Button
                  onClick={() => {
                    if (onCreateNewTeamClick) {
                      onCreateNewTeamClick();
                    }
                  }}
                  variant="outline"
                  className="w-full flex items-center justify-center py-2 space-x-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-150"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>创建新团队</span>
                </Button>
              </div>

              {/* 团队列表 */}
              <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-2">
                {isLoadingTeams ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : teams.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {teamSearchTerm ? '没有找到匹配的团队' : '暂无团队，请创建新团队'}
                  </div>
                ) : (
                  teams.map(team => (
                    <div key={team.id} className="relative">
                      <label
                        htmlFor={`team-${team.id}`}
                        className={`block p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedTeamId === team.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center mr-2 shadow-sm ${
                              selectedTeamId === team.id ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-3.5 h-3.5 ${
                                selectedTeamId === team.id ? 'text-blue-600' : 'text-gray-500'
                              }`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                              </svg>
                            </div>
                            <div className="font-medium text-gray-800 text-sm">{team.name}</div>
                          </div>
                          {selectedTeamId === team.id && (
                            <div className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded font-medium">
                              已选择
                            </div>
                          )}
                        </div>
                        {team.description && (
                          <div className="text-xs mt-2 text-gray-500 pl-9">
                            {team.description}
                          </div>
                        )}
                        <input
                          type="radio"
                          id={`team-${team.id}`}
                          name="teamId"
                          value={team.id}
                          checked={selectedTeamId === team.id}
                          onChange={() => setSelectedTeamId(team.id)}
                          className="hidden"
                          {...register('teamId')}
                        />
                      </label>
                    </div>
                  ))
                )}
              </div>

              {errors.teamId && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 text-red-500">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  {errors.teamId.message}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
