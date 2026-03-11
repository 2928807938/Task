'use client';

import React from 'react';
import {motion} from 'framer-motion';
import {FiX} from 'react-icons/fi';
import {Input} from '@/ui/atoms/Input/Input';
import Button from '@/ui/atoms/Button';

interface TeamCreateFormProps {
  newTeamName: string;
  setNewTeamName: (value: string) => void;
  newTeamDescription: string;
  setNewTeamDescription: (value: string) => void;
  createTeamError: string | null;
  isCreatingTeam: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

const TeamCreateForm: React.FC<TeamCreateFormProps> = ({
  newTeamName,
  setNewTeamName,
  newTeamDescription,
  setNewTeamDescription,
  createTeamError,
  isCreatingTeam,
  onCancel,
  onSubmit
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 mb-4"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">创建新团队</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          <FiX />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
            团队名称
          </label>
          <Input
            id="teamName"
            type="text"
            value={newTeamName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTeamName(e.target.value)}
            placeholder="输入团队名称"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          />
        </div>

        <div>
          <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-1">
            团队描述 <span className="text-gray-400 font-normal">(选填)</span>
          </label>
          <Input
            id="teamDescription"
            type="text"
            value={newTeamDescription}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTeamDescription(e.target.value)}
            placeholder="描述这个团队的用途..."
            className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
          />
        </div>

        {createTeamError && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg">
            {createTeamError}
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isCreatingTeam}
            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-150"
          >
            取消
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={!newTeamName.trim() || isCreatingTeam}
            className={`px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150 ${
              isCreatingTeam ? 'relative' : ''
            }`}
          >
            {isCreatingTeam ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-opacity-50 border-t-white rounded-full animate-spin mr-2"></div>
                创建中...
              </span>
            ) : (
              '创建团队'
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamCreateForm;
