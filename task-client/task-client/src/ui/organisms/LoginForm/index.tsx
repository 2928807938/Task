"use client";

import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import Link from 'next/link';
import { useTheme } from '@/ui/theme';

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export function LoginForm() {
  // 使用主题系统
  const { theme, isDark } = useTheme();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const onSubmit = (data: LoginFormData) => {
    // 这里添加登录逻辑
  };

  return (
    <div className="mt-8 space-y-6">
      <h2 
        className="text-2xl font-bold text-center"
        style={{ color: theme.colors.foreground }}
      >
        登录账号
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {/* 邮箱输入框 */}
        <div className="relative">
          <input
            {...register('email', {
              required: '请输入电子邮箱',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '请输入有效的电子邮箱'
              }
            })}
            type="email"
            placeholder="请输入电子邮箱"
            className={`w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
              errors.email 
                ? `border-red-500 focus:ring-red-200` 
                : isDark 
                  ? 'border-gray-600 focus:ring-blue-500/20 bg-gray-800 text-gray-100 placeholder-gray-400' 
                  : 'border-gray-300 focus:ring-blue-500/20 bg-white text-gray-900'
            }`}
            style={{
              backgroundColor: errors.email ? undefined : theme.colors.card.background,
              borderColor: errors.email ? theme.colors.error[500] : theme.colors.card.border,
              color: theme.colors.foreground
            }}
          />
          {errors.email && (
            <p 
              className="mt-1 text-sm"
              style={{ color: theme.colors.error[500] }}
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* 密码输入框 */}
        <div className="relative">
          <input
            {...register('password', {
              required: '请输入密码',
              minLength: {
                value: 6,
                message: '密码长度不能少于6个字符'
              }
            })}
            type={passwordVisible ? "text" : "password"}
            placeholder="请输入密码"
            className={`w-full py-2 px-3 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
              errors.password 
                ? `border-red-500 focus:ring-red-200` 
                : isDark 
                  ? 'border-gray-600 focus:ring-blue-500/20 bg-gray-800 text-gray-100 placeholder-gray-400' 
                  : 'border-gray-300 focus:ring-blue-500/20 bg-white text-gray-900'
            }`}
            style={{
              backgroundColor: errors.password ? undefined : theme.colors.card.background,
              borderColor: errors.password ? theme.colors.error[500] : theme.colors.card.border,
              color: theme.colors.foreground
            }}
          />
          <button
            type="button"
            className={`absolute right-3 top-2.5 transition-colors ${
              isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
            )}
          </button>
          {errors.password && (
            <p 
              className="mt-1 text-sm"
              style={{ color: theme.colors.error[500] }}
            >
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              {...register('rememberMe')}
              type="checkbox"
              className={`h-4 w-4 rounded border focus:ring-2 focus:ring-offset-2 ${
                isDark 
                  ? 'border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500' 
                  : 'border-gray-300 bg-white text-blue-600 focus:ring-blue-500'
              }`}
            />
            <label 
              htmlFor="remember-me" 
              className="ml-2 block text-sm"
              style={{ color: theme.colors.foreground }}
            >
              记住我
            </label>
          </div>

          <div className="text-sm">
            <Link 
              href="/forgot-password" 
              className={`hover:underline transition-colors ${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'
              }`}
            >
              忘记密码？
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 px-4 text-white font-medium rounded-md transition-colors duration-200"
            style={{
              backgroundColor: theme.colors.primary[500],
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[600];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.primary[500];
            }}
          >
            登录
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div 
              className="w-full border-t"
              style={{ borderColor: theme.colors.card.border }}
            ></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span 
              className="px-2"
              style={{ 
                backgroundColor: theme.colors.background,
                color: theme.colors.neutral[500]
              }}
            >
              或使用以下方式登录
            </span>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-6 mb-6">
          <button 
            className={`flex items-center justify-center w-1/3 py-2 border rounded-md transition-colors ${
              isDark 
                ? 'border-gray-600 hover:bg-gray-800' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
            style={{
              backgroundColor: theme.colors.card.background,
              borderColor: theme.colors.card.border
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.card.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.card.background;
            }}
          >
            <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.58,14.99c-0.5,0-0.9-0.4-0.9-0.9s0.4-0.9,0.9-0.9s0.9,0.4,0.9,0.9S9.08,14.99,8.58,14.99z M12.58,14.99 c-0.5,0-0.9-0.4-0.9-0.9s0.4-0.9,0.9-0.9s0.9,0.4,0.9,0.9S13.08,14.99,12.58,14.99z M8.58,9.99c-0.5,0-0.9-0.4-0.9-0.9 s0.4-0.9,0.9-0.9s0.9,0.4,0.9,0.9S9.08,9.99,8.58,9.99z M12.58,9.99c-0.5,0-0.9-0.4-0.9-0.9s0.4-0.9,0.9-0.9s0.9,0.4,0.9,0.9 S13.08,9.99,12.58,9.99z"></path>
            </svg>
          </button>
          <button 
            className={`flex items-center justify-center w-1/3 py-2 border rounded-md transition-colors ${
              isDark 
                ? 'border-gray-600 hover:bg-gray-800' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
            style={{
              backgroundColor: theme.colors.card.background,
              borderColor: theme.colors.card.border
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.card.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.card.background;
            }}
          >
            <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
            </svg>
          </button>
          <button 
            className={`flex items-center justify-center w-1/3 py-2 border rounded-md transition-colors ${
              isDark 
                ? 'border-gray-600 hover:bg-gray-800' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
            style={{
              backgroundColor: theme.colors.card.background,
              borderColor: theme.colors.card.border
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.card.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.card.background;
            }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" style={{ color: theme.colors.foreground }}>
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
