"use client";

import React, {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {SubmitHandler, useForm} from 'react-hook-form';
import {motion} from 'framer-motion';
import {useRegister} from '@/hooks/use-user-hook';
import {ResponseCode} from '@/types/response-code';
import {handleApiError} from '@/utils/response-utils';
import {encryptPassword} from '@/utils/crypto-utils';
import {evaluatePasswordStrength} from '@/utils/password-utils';
import {
    FormHeader,
    FormMessage,
    PasswordInput,
    TermsAndConditions,
    UsernameInput
} from '@/ui/pages/RegisterPage/components';
import { useTheme } from '@/ui/theme';

// 定义表单数据类型
type RegisterFormData = {
  username: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

export function RegisterTemplate() {
  const router = useRouter();
  // 使用项目的主题系统
  const { theme, isDark, toggleTheme } = useTheme();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // 输入框聚焦状态
  const [inputFocus, setInputFocus] = useState({
    username: false,
    password: false,
    confirmPassword: false
  });

  const password = watch('password', '');

  // 评估密码强度
  const passwordStrengthResult = React.useMemo(() => {
    return evaluatePasswordStrength(password);
  }, [password]);

  // 注册状态管理
  const [registerStatus, setRegisterStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 使用注册API hook
  const { mutate: registerUser, isPending } = useRegister();

  // 表单提交处理
  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    setApiError(null); // 清除之前的错误
    setRegisterStatus('idle'); // 重置状态

    try {
      // 对密码进行加密
      const encryptedPassword = await encryptPassword(data.password);

      // 调用注册API
      registerUser({
        username: data.username,
        password: encryptedPassword,
        confirmPassword: encryptedPassword
      }, {
        onSuccess: (response) => {
          if (response.success) {
            // 注册成功
            setRegisterStatus('success');
            // 2秒后跳转到登录页
            setTimeout(() => {
              router.push('/login?registered=true');
            }, 2000);
          } else {
            // 设置错误状态
            setRegisterStatus('error');

            // 处理特定的错误码
            const code = parseInt(response.code);
            switch(code) {
              case ResponseCode.USERNAME_ALREADY_EXISTS:
                setApiError('用户名已被注册，请尝试其他用户名');
                break;
              case ResponseCode.DATA_VALIDATION_FAILED:
              case ResponseCode.PARAM_VALIDATION_ERROR:
                setApiError('提交的数据验证失败，请检查输入');
                break;
              default:
                // 使用通用错误处理
                setApiError(handleApiError(response));
            }
          }
        },
        onError: (error) => {
          // 网络或其他错误
          setRegisterStatus('error');
          setApiError(error.message || '网络错误，请检查您的网络连接');
        }
      });
    } catch (error) {
      // 密码加密失败
      setRegisterStatus('error');
      setApiError('密码加密失败，请重试');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* 主题切换按钮 - 在背景上 */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full transition-colors duration-300 shadow-lg border"
          style={{
            backgroundColor: theme.colors.card.background,
            borderColor: theme.colors.card.border
          }}
          aria-label="切换主题"
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: theme.colors.foreground }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="w-full max-w-md space-y-8 rounded-2xl shadow-lg border p-8 transition-colors duration-300"
        style={{
          backgroundColor: theme.colors.card.background,
          borderColor: theme.colors.card.border
        }}
      >

        <FormHeader />

        <FormMessage
          apiError={apiError}
          errors={errors}
          registerStatus={registerStatus}
          theme={theme}
          isDark={isDark}
        />

        <motion.form
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* 用户名输入框 */}
          <UsernameInput
            register={register}
            errors={errors}
            inputFocus={inputFocus}
            setInputFocus={setInputFocus}
            theme={theme}
            isDark={isDark}
          />

          {/* 密码输入框 */}
          <PasswordInput
            register={register}
            errors={errors}
            password={password}
            isDarkMode={isDark}
            passwordVisible={passwordVisible}
            setPasswordVisible={setPasswordVisible}
            confirmPasswordVisible={confirmPasswordVisible}
            setConfirmPasswordVisible={setConfirmPasswordVisible}
            inputFocus={{
              password: inputFocus.password,
              confirmPassword: inputFocus.confirmPassword
            }}
            setInputFocus={setInputFocus}
            colors={{
              input: isDark ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300',
              inputFocus: isDark ? 'ring-blue-500 border-blue-500' : 'ring-blue-300 border-blue-500',
              textSecondary: isDark ? 'text-gray-300' : 'text-gray-600'
            }}
            passwordStrengthResult={passwordStrengthResult}
          />

          {/* 服务条款和隐私政策 */}
          <TermsAndConditions
            register={register}
            errors={errors}
            theme={theme}
            isDark={isDark}
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending || registerStatus === 'success'}
              className="w-full flex justify-center items-center py-3 px-4 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.colors.primary[500]
              }}
              onMouseEnter={(e) => {
                if (!isPending && registerStatus !== 'success') {
                  e.currentTarget.style.backgroundColor = theme.colors.primary[600];
                }
              }}
              onMouseLeave={(e) => {
                if (!isPending && registerStatus !== 'success') {
                  e.currentTarget.style.backgroundColor = theme.colors.primary[500];
                }
              }}
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  注册中...
                </>
              ) : "创建账号"}
            </button>
          </div>

          {/* 登录链接 */}
          <div className="text-center">
            <p className="text-sm" style={{ color: theme.colors.neutral[500] }}>
              已有账号？{' '}
              <Link
                href="/login"
                className="font-medium transition-colors duration-200 hover:underline"
                style={{ color: theme.colors.primary[500] }}
              >
                立即登录
              </Link>
            </p>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
