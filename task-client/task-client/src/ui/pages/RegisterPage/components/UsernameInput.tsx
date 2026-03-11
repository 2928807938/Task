"use client";

import React from 'react';
import {FieldErrors, UseFormRegister} from 'react-hook-form';
import { ThemeDefinition } from '@/ui/theme';

interface UsernameInputProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  inputFocus: {
    username: boolean;
  };
  setInputFocus: (focus: any) => void;
  theme: ThemeDefinition;
  isDark: boolean;
}

export function UsernameInput({
  register,
  errors,
  inputFocus,
  setInputFocus,
  theme,
  isDark
}: UsernameInputProps) {
  return (
    <div className="relative">
      <label
        className="block text-sm font-medium mb-1.5"
        htmlFor="username"
        style={{ color: theme.colors.neutral[500] }}
      >
        用户名
      </label>
      <div className="relative">
        <input
          id="username"
          {...register('username', { required: '请输入用户名' })}
          type="text"
          onFocus={() => setInputFocus({...inputFocus, username: true})}
          onBlur={() => setInputFocus({...inputFocus, username: false})}
          className={`w-full py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
            errors.username 
              ? 'ring-2 ring-red-500' 
              : inputFocus.username 
                ? 'ring-2 ring-blue-500' 
                : ''
          }`}
          style={{
            backgroundColor: errors.username 
              ? (isDark ? 'rgba(239, 68, 68, 0.1)' : theme.colors.error[50])
              : theme.colors.card.background,
            borderColor: errors.username 
              ? theme.colors.error[500]
              : theme.colors.card.border,
            color: theme.colors.foreground
          }}
          placeholder="请输入用户名"
        />
        {errors.username && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.colors.error[500] }}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
