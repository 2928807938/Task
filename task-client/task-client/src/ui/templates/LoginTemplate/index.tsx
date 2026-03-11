"use client";

import React, {useEffect, Suspense} from 'react';
import Link from 'next/link';
import {useRouter, useSearchParams} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {FaEye, FaEyeSlash} from 'react-icons/fa';

import {AnimatePresence, motion} from 'framer-motion';
import {useTheme} from '@/ui/theme';
import {useIsAuthenticated, useLogin} from '@/hooks/use-user-hook';
import {ResponseCode} from '@/types/response-code';
import {handleApiError} from '@/utils/response-utils';
import {encryptPassword} from '@/utils/crypto-utils';

type LoginFormData = {
  username: string;
  password: string;
  remember: boolean;
};

// 苹果风格按钮变体
type ButtonVariant = 'primary' | 'secondary' | 'text';

// 创建包含 useSearchParams 的子组件
function LoginContent() {
  // 使用项目的主题系统
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();

  // 从localStorage获取记住的用户名
  const [rememberedUsername, setRememberedUsername] = React.useState<string>('');

  // 页面加载时检查是否有保存的用户名
  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      setRememberedUsername(rememberedUser);
    }
  }, []);

  // 如果用户已登录，自动跳转到redirect参数指定的页面
  const { isAuthenticated, isLoading, user } = useIsAuthenticated();
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirectUrl = searchParams?.get('redirect') || '/dashboard';

      // 使用window.location.href进行跳转，更可靠
      window.location.href = redirectUrl;
    }
  }, [isLoading, isAuthenticated, searchParams, user]);

  // 使用获取到的用户名作为默认值
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      username: rememberedUsername,
      remember: !!rememberedUsername
    }
  });

  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [loginStatus, setLoginStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [apiError, setApiError] = React.useState<string | null>(null);

  // 输入框聚焦状态
  const [inputFocus, setInputFocus] = React.useState({
    username: false,
    password: false
  });

  // 添加表单验证状态
  const [formValidation, setFormValidation] = React.useState({
    username: { valid: false, touched: false },
    password: { valid: false, touched: false }
  });

  // 检查是否从注册页面跳转过来
  const justRegistered = searchParams?.get('registered') === 'true';

  // 检查是否从密码重置页面跳转过来
  const passwordReset = searchParams?.get('reset') === 'success';

  // 获取重定向URL，如果有的话
  const redirectUrl = searchParams?.get('redirect') || '/dashboard';

  // 使用登录API hook
  const { mutate: loginUser, isPending } = useLogin();

  // 表单提交处理
  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    setLoginStatus('idle');

    try {
      // 对密码进行加密
      const encryptedPassword = await encryptPassword(data.password);

      // 调用登录API
      loginUser({
        username: data.username,
        password: encryptedPassword
      }, {
      onSuccess: (response) => {
        if (response.success) {
          // 登录成功
          setLoginStatus('success');

          // 存储记住我的选项
          if (data.remember) {
            localStorage.setItem('rememberedUser', data.username);
          } else {
            localStorage.removeItem('rememberedUser');
          }

          // 确保认证状态已更新后再进行跳转
          // 使用延时确保状态已更新
          setTimeout(() => {
            // 使用replace而不是push，避免在历史记录中添加多余的条目
            window.location.href = redirectUrl;
          }, 500);
        } else {
          // 设置错误状态
          setLoginStatus('error');

          // 处理特定的错误码
          const code = parseInt(response.code);
          switch(code) {
            case ResponseCode.USER_NOT_FOUND:
            case ResponseCode.INVALID_CREDENTIALS:
            case ResponseCode.PASSWORD_ERROR:
              setApiError('用户名或密码错误');
              break;
            case ResponseCode.ACCOUNT_LOCKED:
              setApiError('账号已被锁定，请联系管理员');
              break;
            case ResponseCode.ACCOUNT_DISABLED:
              setApiError('账号已被禁用');
              break;
            default:
              // 使用通用错误处理
              setApiError(handleApiError(response));
          }
        }
      },
      onError: (error) => {
        // 网络或其他错误
        setLoginStatus('error');
        setApiError(error.message || '网络错误，请检查您的网络连接');
      }
    });
    } catch (error) {
      // 密码加密过程中出错
      setLoginStatus('error');
      setApiError('密码处理失败，请重试');
      console.error('密码加密失败:', error);
    }
  };

  // 当记住的用户名变化时，更新表单值
  React.useEffect(() => {
    if (rememberedUsername) {
      setValue('username', rememberedUsername);
      setValue('remember', true);

      // 更新验证状态
      setFormValidation(prev => ({
        ...prev,
        username: { valid: true, touched: true }
      }));
    }
  }, [rememberedUsername, setValue]);

  // 监听表单值的变化
  const watchUsername = watch('username');
  const watchPassword = watch('password');

  // 当表单值变化时更新验证状态
  React.useEffect(() => {
    // 确保返回的是布尔值
    const usernameValid = !!(watchUsername && watchUsername.length > 0);
    const passwordValid = !!(watchPassword && watchPassword.length > 0);

    setFormValidation(prev => ({
      ...prev,
      username: { ...prev.username, valid: usernameValid, touched: true },
      password: { ...prev.password, valid: passwordValid, touched: !!watchPassword }
    }));
  }, [watchUsername, watchPassword]);

  return (
    <div className="flex h-full w-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* 主题切换按钮 - 在背景上 */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full ${isDark ? 'bg-gray-800 hover:bg-gray-700 border border-gray-600' : 'bg-white hover:bg-gray-50 border border-gray-200'} transition-colors duration-300 shadow-lg`}
          aria-label="切换主题"
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className={`w-full max-w-md space-y-8 ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-8 transition-colors duration-300`}>

        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center">
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>登录</h2>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>欢迎回来，请登录您的账号</p>
        </motion.div>

        {/* 状态提示区域 - 只显示一个提示 */}
        {(() => {
          // 按优先级显示提示：成功 > 错误 > 表单验证错误 > 注册成功
          if (loginStatus === 'success') {
            return (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 mb-4 ${isDark ? 'bg-green-900/50 border-green-800' : 'bg-green-50 border-green-200'} rounded-xl flex items-start`}>
                  <svg className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-600'} mr-3 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>登录成功！正在跳转到首页...</p>
                </motion.div>
              </AnimatePresence>
            );
          } else if (loginStatus === 'error' && apiError) {
            return (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 mb-4 ${isDark ? 'bg-red-900/50 border-red-800' : 'bg-red-50 border-red-200'} rounded-xl flex items-start`}>
                  <svg className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-600'} mr-3 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{apiError}</p>
                </motion.div>
              </AnimatePresence>
            );
          } else if (Object.keys(errors).length > 0) {
            // 表单验证错误提示
            return (
              <div className="mb-6" style={{ minHeight: '64px' }}>
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={`overflow-hidden border ${isDark ? 'border-red-800/30 bg-red-950/10' : 'border-red-200 bg-red-50/60'} rounded-xl`}>
                    <div className="px-4 py-3 flex items-center space-x-3">
                      <div className={`flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                      <div className={`flex-1 text-sm ${isDark ? 'text-red-200' : 'text-red-700'}`}>
                        {errors.username && errors.password ? (
                          <p>请输入用户名和密码</p>
                        ) : errors.username ? (
                          <p>{errors.username.message}</p>
                        ) : errors.password ? (
                          <p>{errors.password.message}</p>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          } else if (justRegistered) {
            return (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 mb-4 ${isDark ? 'bg-green-900/50 border-green-800' : 'bg-green-50 border-green-200'} rounded-xl flex items-start`}>
                  <svg className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-600'} mr-3 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>注册成功，请使用您的账号密码登录</p>
                </motion.div>
              </AnimatePresence>
            );
          } else if (passwordReset) {
            return (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 mb-4 ${isDark ? 'bg-green-900/50 border-green-800' : 'bg-green-50 border-green-200'} rounded-xl flex items-start`}>
                  <svg className={`h-5 w-5 ${isDark ? 'text-green-400' : 'text-green-600'} mr-3 mt-0.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>密码重置成功，请使用新密码登录您的账号</p>
                </motion.div>
              </AnimatePresence>
            );
          }
          return null;
        })()}

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-6">
          {/* 用户名输入框 */}
          <div className="relative group">
            <div className="relative">
              <input
                {...register('username', { required: '用户名不能为空' })}
                type="text"
                id="username"
                autoFocus
                className={`w-full py-3.5 px-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.username 
                    ? 'ring-2 ring-red-500' 
                    : inputFocus.username 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                }`}
                style={{
                  backgroundColor: errors.username 
                    ? (isDark ? 'rgba(239, 68, 68, 0.1)' : theme.colors.error[50])
                    : (isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.card.background),
                  borderColor: errors.username 
                    ? theme.colors.error[500]
                    : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB'),
                  color: theme.colors.foreground
                }}
                placeholder="admin"
                onFocus={() => setInputFocus({...inputFocus, username: true})}
                onBlur={() => setInputFocus({...inputFocus, username: false})}
                aria-invalid={errors.username ? 'true' : 'false'}
              />
              {/* 错误图标 */}
              {errors.username && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.colors.error[500] }}>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* 密码输入框 */}
          <div className="relative">
            <div className="relative">
              <input
                {...register('password', {
                  required: '密码不能为空'
                })}
                id="password"
                type={passwordVisible ? "text" : "password"}
                className={`w-full py-3.5 pl-4 pr-10 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.password 
                    ? 'ring-2 ring-red-500' 
                    : inputFocus.password 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                }`}
                style={{
                  backgroundColor: errors.password 
                    ? (isDark ? 'rgba(239, 68, 68, 0.1)' : theme.colors.error[50])
                    : (isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.card.background),
                  borderColor: errors.password 
                    ? theme.colors.error[500]
                    : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB'),
                  color: theme.colors.foreground
                }}
                placeholder="••••••••"
                onFocus={() => setInputFocus({...inputFocus, password: true})}
                onBlur={() => setInputFocus({...inputFocus, password: false})}
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              <button
                type="button"
                className={`absolute right-3.5 top-1/2 transform -translate-y-1/2 ${inputFocus.password ? 'text-blue-500' : (isDark ? 'text-gray-400' : 'text-gray-500')} hover:text-blue-600 transition-colors duration-200`}
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* 记住我和忘记密码 */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <div
                className="relative inline-flex items-center group cursor-pointer"
                onClick={() => {
                  const currentValue = watch('remember');
                  setValue('remember', !currentValue);
                }}
              >
                <div className="relative">
                  <input
                    {...register('remember')}
                    type="checkbox"
                    id="remember"
                    className="sr-only" // 隐藏原生checkbox但保留功能
                  />
                  <div
                    className={`h-5 w-5 rounded-md flex items-center justify-center transition-all duration-200 border-2 ${watch('remember') 
                      ? `border-transparent shadow-sm` 
                      : `border-2`
                    }`}
                    style={{
                      backgroundColor: watch('remember') 
                        ? (isDark ? '#2563EB' : '#3B82F6')
                        : (isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.card.background),
                      borderColor: watch('remember') 
                        ? 'transparent'
                        : (isDark ? 'rgba(255, 255, 255, 0.2)' : '#D1D5DB')
                    }}
                    onMouseEnter={(e) => {
                      if (!watch('remember')) {
                        e.currentTarget.style.borderColor = '#60A5FA';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!watch('remember')) {
                        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.2)' : '#D1D5DB';
                      }
                    }}
                  >
                    {watch('remember') && (
                      <motion.svg
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="h-3.5 w-3.5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </motion.svg>
                    )}
                  </div>
                </div>
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm cursor-pointer select-none transition-colors duration-200 group-hover:text-blue-500"
                  style={{ color: theme.colors.neutral[500] }}
                >
                  记住我
                </label>
              </div>
            </div>

            <div className="text-sm">
              <Link
                href="/forgot-password"
                className={`text-blue-500 hover:text-blue-600 transition-colors duration-200 font-medium`}
              >
                忘记密码?
              </Link>
            </div>
          </div>

          {/* 登录按钮 */}
          <motion.button
            type="submit"
            disabled={isPending || loginStatus === 'success'}
            className={`w-full py-3.5 px-4 ${(isPending || loginStatus === 'success') ? 'bg-blue-400 cursor-not-allowed' : ''} text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex justify-center items-center`}
            style={{
              backgroundColor: (isPending || loginStatus === 'success') 
                ? '#60A5FA' 
                : theme.colors.primary[500]
            }}
            whileHover={{ scale: 0.99 }}
            whileTap={{ scale: 0.97 }}
          >
            {isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                登录中...
              </>
            ) : loginStatus === 'success' ? '登录成功' : '登录'}
          </motion.button>
        </motion.form>

        {/* 没有账号注册链接 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 100 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center py-2.5 px-5 rounded-xl border border-gray-300" style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB'
          }}>
            <p className="text-sm" style={{ color: theme.colors.neutral[500] }}>
              没有账号？
              <Link
                href="/register"
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200 ml-1"
              >
                立即注册
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// 主组件使用 Suspense 包装子组件
export function LoginTemplate() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">加载中...</div>}>
      <LoginContent />
    </Suspense>
  );
}
