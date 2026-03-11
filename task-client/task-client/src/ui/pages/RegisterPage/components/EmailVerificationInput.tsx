"use client";

import React, {useEffect, useState} from 'react';
import {FieldErrors, UseFormRegister} from 'react-hook-form';
import {useSendEmailVerificationCode} from '@/hooks/use-user-hook';
import {ResponseCode} from '@/types/response-code';
import {handleApiError} from '@/utils/response-utils';

// 倒计时初始时间（秒）
const COUNTDOWN_TIME = 60;

interface EmailVerificationInputProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  email: string;
  isDarkMode: boolean;
  inputFocus: {
    email: boolean;
    verificationCode: boolean;
  };
  setInputFocus: (focus: any) => void;
  colors: {
    input: string;
    inputFocus: string;
    textSecondary: string;
    buttonPrimary: string;
    buttonSecondary: string;
  };
  setApiError: (error: string | null) => void;
}

export function EmailVerificationInput({
  register,
  errors,
  email,
  inputFocus,
  setInputFocus,
  colors,
  setApiError
}: EmailVerificationInputProps) {
  const [isCounting, setIsCounting] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  // 发送邮箱验证码
  const { mutate: sendVerificationCode, isPending } = useSendEmailVerificationCode();

  // 处理发送验证码
  const handleSendVerificationCode = () => {
    // 验证邮箱格式
    if (!email) {
      setApiError('请先输入邮箱地址');
      return;
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      setApiError('请输入有效的邮箱地址');
      return;
    }

    sendVerificationCode({
      email,
      type: 'register'
    }, {
      onSuccess: (response) => {
        if (response.success) {
          // 开始倒计时
          setIsCounting(true);
          setShowVerificationInput(true);
          setApiError(null);
        } else {
          // 处理特定的错误码
          const code = parseInt(response.code);
          switch(code) {
            case ResponseCode.EMAIL_ALREADY_REGISTERED:
              setApiError('该邮箱已被注册，请尝试其他邮箱');
              break;
            case ResponseCode.EMAIL_SEND_LIMIT_EXCEEDED:
              setApiError('发送次数超过限制，请稍后再试');
              break;
            default:
              // 使用通用错误处理
              setApiError(handleApiError(response));
          }
        }
      },
      onError: (error) => {
        setApiError(error.message || '网络错误，请检查您的网络连接');
      }
    });
  };

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isCounting && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCounting(false);
      setCountdown(COUNTDOWN_TIME);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCounting, countdown]);

  return (
    <>
      {/* 邮箱输入框 */}
      <div className="relative">
        <label
          className={`block text-sm font-medium mb-1.5 ${colors.textSecondary}`}
          htmlFor="email"
        >
          邮箱
        </label>
        <div className="relative">
          <input
            id="email"
            {...register('email', {
              required: '请输入邮箱地址',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '请输入有效的邮箱地址'
              }
            })}
            type="email"
            onFocus={() => setInputFocus({...inputFocus, email: true})}
            onBlur={() => setInputFocus({...inputFocus, email: false})}
            className={`w-full py-3 px-4 ${colors.input} ${inputFocus.email ? colors.inputFocus : ''} border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${errors.email ? 'border-red-500 ring-red-200' : ''}`}
            placeholder="请输入邮箱地址"
          />
          {errors.email && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* 验证码发送按钮和输入框 */}
      <div className="relative">
        <div className="flex justify-between items-center mb-1.5">
          <label
            className={`block text-sm font-medium ${colors.textSecondary}`}
            htmlFor="verificationCode"
          >
            邮箱验证码
          </label>
          <button
            type="button"
            onClick={handleSendVerificationCode}
            disabled={isCounting || isPending}
            className={`text-xs ${
              isCounting || isPending 
                ? 'opacity-60 cursor-not-allowed' 
                : 'hover:opacity-80'
            } ${colors.buttonSecondary} py-1 px-2 rounded-lg transition-all duration-200`}
          >
            {isPending ? '发送中...' : isCounting ? `重新发送(${countdown}s)` : '获取验证码'}
          </button>
        </div>
        <div className="relative">
          <input
            id="verificationCode"
            {...register('verificationCode', {
              required: '请输入验证码',
              minLength: {
                value: 4,
                message: '验证码格式不正确'
              },
              maxLength: {
                value: 8,
                message: '验证码格式不正确'
              }
            })}
            type="text"
            onFocus={() => setInputFocus({...inputFocus, verificationCode: true})}
            onBlur={() => setInputFocus({...inputFocus, verificationCode: false})}
            className={`w-full py-3 px-4 ${colors.input} ${inputFocus.verificationCode ? colors.inputFocus : ''} border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${errors.verificationCode ? 'border-red-500 ring-red-200' : ''}`}
            placeholder="请输入邮箱验证码"
          />
          {errors.verificationCode && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
