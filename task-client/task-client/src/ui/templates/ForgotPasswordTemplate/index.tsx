"use client";

import React from 'react';
import Link from 'next/link';
import {motion} from 'framer-motion';
import {useTheme} from '@/ui/theme';
import {ForgotPasswordForm} from '@/ui/organisms/ForgotPasswordForm';

export function ForgotPasswordTemplate() {
  // 使用统一主题系统
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.mode === 'dark';

  return (
    <div className="relative flex h-full w-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8" style={{ backgroundColor: theme.colors.background }}>
      {/* 主题切换按钮 - 放在外层容器 */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-10 p-2 rounded-full shadow-md border transition-all duration-300"
        style={{
          backgroundColor: theme.colors.card.background,
          borderColor: theme.colors.card.border,
          color: theme.colors.foreground
        }}
        aria-label="切换主题"
      >
        {isDark ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="w-full max-w-md space-y-8 rounded-2xl shadow-lg border p-8 transition-colors duration-300"
        style={{
          backgroundColor: theme.colors.card.background,
          borderColor: theme.colors.card.border
        }}>

        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center">
          <h2 className="text-3xl font-bold mb-2" style={{ color: theme.colors.foreground }}>找回密码</h2>
          <p className="mt-2 text-sm" style={{ color: theme.colors.neutral[500] }}>输入您的邮箱，我们将发送重置密码的链接</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}>
          <ForgotPasswordForm />
        </motion.div>

        {/* 返回登录链接 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center py-2.5 px-5 rounded-xl border" style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
            borderColor: theme.colors.card.border
          }}>
            <p className="text-sm" style={{ color: theme.colors.neutral[500] }}>
              记起密码了？
              <Link
                href="/login"
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200 ml-1"
              >
                返回登录
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
