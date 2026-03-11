"use client";

import React from 'react';
import {motion} from 'framer-motion';
import {getPasswordStrengthColor, PasswordStrengthResult} from '@/utils/password-utils';

interface PasswordStrengthIndicatorProps {
  password: string;
  passwordStrengthResult: PasswordStrengthResult;
  colors: {
    textSecondary: string;
  };
}

export function PasswordStrengthIndicator({
  password,
  passwordStrengthResult,
  colors
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.2 }}
      className="mt-2"
    >
      <div className="flex space-x-1 h-1.5">
        <div
          className={`w-1/4 rounded-full ${password ? getPasswordStrengthColor(passwordStrengthResult.score, 1) : 'bg-gray-200'} transition-colors duration-300`}
        />
        <div
          className={`w-1/4 rounded-full ${password ? getPasswordStrengthColor(passwordStrengthResult.score, 2) : 'bg-gray-200'} transition-colors duration-300`}
        />
        <div
          className={`w-1/4 rounded-full ${password ? getPasswordStrengthColor(passwordStrengthResult.score, 3) : 'bg-gray-200'} transition-colors duration-300`}
        />
        <div
          className={`w-1/4 rounded-full ${password ? getPasswordStrengthColor(passwordStrengthResult.score, 4) : 'bg-gray-200'} transition-colors duration-300`}
        />
      </div>
      <p className={`text-xs mt-1 ${colors.textSecondary}`}>
        {passwordStrengthResult.feedback || '密码强度：' +
        (passwordStrengthResult.score === 0 ? '非常弱' :
         passwordStrengthResult.score === 1 ? '弱' :
         passwordStrengthResult.score === 2 ? '中等' :
         passwordStrengthResult.score === 3 ? '强' : '非常强')}
      </p>
    </motion.div>
  );
}
