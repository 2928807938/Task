"use client";

import React from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FieldErrors} from 'react-hook-form';
import { ThemeDefinition } from '@/ui/theme';

interface FormMessageProps {
  apiError: string | null;
  errors: FieldErrors<any>;
  registerStatus: 'idle' | 'success' | 'error';
  theme: ThemeDefinition;
  isDark: boolean;
}

export function FormMessage({
  apiError,
  errors,
  registerStatus,
  theme,
  isDark
}: FormMessageProps) {
  // 错误提示
  const hasErrors = apiError || (errors && Object.keys(errors).length > 0);

  return (
    <>
      {/* 错误提示 */}
      <div className="mb-6">
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden border rounded-xl"
            style={{
              borderColor: theme.colors.error[200],
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : theme.colors.error[50]
            }}
          >
            <div className="px-4 py-3 flex items-center space-x-3">
              <div style={{ color: theme.colors.error[500] }}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex-1 text-sm" style={{ color: theme.colors.error[700] }}>
                {apiError ? (
                  <p>{apiError}</p>
                ) : errors.terms ? (
                  <p>请同意服务条款和隐私政策</p>
                ) : errors.username ? (
                  <p>{errors.username.message as string}</p>
                ) : errors.password ? (
                  <p>{errors.password.message as string}</p>
                ) : errors.confirmPassword ? (
                  <p>{errors.confirmPassword.message as string}</p>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 注册成功提示 */}
      <div className="mb-6">
        {registerStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden border rounded-xl"
            style={{
              borderColor: theme.colors.success[200],
              backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : theme.colors.success[50]
            }}
          >
            <div className="px-4 py-3 flex items-center space-x-3">
              <div style={{ color: theme.colors.success[500] }}>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 text-sm" style={{ color: theme.colors.success[700] }}>
                <p>注册成功！正在为您跳转...</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
