"use client";

import React, {Suspense, useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {
  FaArrowRight,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaMoon,
  FaRegChartBar,
  FaSun,
  FaTasks
} from 'react-icons/fa';
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

const statItems = [
  {value: '任务拆分', label: '结构清晰'},
  {value: '合理分配', label: '责任明确'},
  {value: '进度透明', label: '协作同步'}
];

function LoginContent() {
  const {theme, isDark, toggleTheme} = useTheme();
  const searchParams = useSearchParams();
  const {isAuthenticated, isLoading} = useIsAuthenticated();
  const {mutate: loginUser, isPending} = useLogin();

  const [rememberedUsername, setRememberedUsername] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);

  const justRegistered = searchParams?.get('registered') === 'true';
  const passwordReset = searchParams?.get('reset') === 'success';
  const redirectUrl = searchParams?.get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: {errors}
  } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
      remember: false
    }
  });

  useEffect(() => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
      setRememberedUsername(rememberedUser);
    }
  }, []);

  useEffect(() => {
    if (rememberedUsername) {
      setValue('username', rememberedUsername);
      setValue('remember', true);
    }
  }, [rememberedUsername, setValue]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = redirectUrl;
    }
  }, [isAuthenticated, isLoading, redirectUrl]);

  const watchUsername = watch('username');
  const watchPassword = watch('password');
  const watchRemember = watch('remember');

  const formReady = useMemo(
    () => Boolean(watchUsername?.trim()) && Boolean(watchPassword?.trim()),
    [watchPassword, watchUsername]
  );

  const inputBaseStyle = {
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(248, 250, 252, 0.96)',
    borderColor: isDark ? 'rgba(129, 140, 248, 0.14)' : 'rgba(99, 102, 241, 0.10)',
    color: theme.colors.foreground
  };

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    setLoginStatus('idle');

    try {
      const encryptedPassword = await encryptPassword(data.password);

      loginUser(
        {
          username: data.username,
          password: encryptedPassword
        },
        {
          onSuccess: (response) => {
            if (response.success) {
              setLoginStatus('success');

              if (data.remember) {
                localStorage.setItem('rememberedUser', data.username);
              } else {
                localStorage.removeItem('rememberedUser');
              }

              setTimeout(() => {
                window.location.href = redirectUrl;
              }, 400);
              return;
            }

            setLoginStatus('error');
            const code = Number.parseInt(response.code, 10);
            switch (code) {
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
                setApiError(handleApiError(response));
                break;
            }
          },
          onError: (error) => {
            setLoginStatus('error');
            setApiError(error.message || '网络错误，请检查您的网络连接');
          }
        }
      );
    } catch (error) {
      setLoginStatus('error');
      setApiError('密码处理失败，请重试');
      console.error('密码加密失败:', error);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: isDark
          ? 'radial-gradient(circle at 12% 16%, rgba(99, 102, 241, 0.22), transparent 26%), radial-gradient(circle at 88% 86%, rgba(59, 130, 246, 0.16), transparent 28%), linear-gradient(135deg, #020617 0%, #0f172a 48%, #111827 100%)'
          : 'radial-gradient(circle at 10% 14%, rgba(196, 181, 253, 0.34), transparent 26%), radial-gradient(circle at 90% 88%, rgba(147, 197, 253, 0.28), transparent 30%), linear-gradient(135deg, #f7f9ff 0%, #f5f7fb 46%, #eef4ff 100%)'
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[-4rem] top-20 h-72 w-72 rounded-full blur-3xl"
          style={{backgroundColor: isDark ? 'rgba(99, 102, 241, 0.16)' : 'rgba(196, 181, 253, 0.28)'}}
        />
        <div
          className="absolute bottom-[-4rem] right-[-2rem] h-80 w-80 rounded-full blur-3xl"
          style={{backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(147, 197, 253, 0.22)'}}
        />
      </div>

      <div className="absolute right-5 top-5 z-20 sm:right-8 sm:top-8">
        <button
          onClick={toggleTheme}
          className="flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105"
          style={{
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.76)' : 'rgba(255, 255, 255, 0.88)',
            borderColor: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(255, 255, 255, 0.92)',
            boxShadow: isDark
              ? '0 18px 40px rgba(2, 6, 23, 0.28)'
              : '0 16px 32px rgba(99, 102, 241, 0.12)'
          }}
          aria-label="切换主题"
        >
          {isDark ? <FaSun className="h-4 w-4 text-amber-300" /> : <FaMoon className="h-4 w-4 text-slate-700" />}
        </button>
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1800px] items-center px-6 py-8 sm:px-10 lg:px-16 xl:px-20 2xl:px-24">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:gap-16 xl:gap-24 2xl:gap-28">
          <motion.section
            initial={{opacity: 0, x: -24}}
            animate={{opacity: 1, x: 0}}
            transition={{duration: 0.5, ease: 'easeOut'}}
            className="flex justify-center lg:justify-start lg:-translate-x-12 xl:-translate-x-16"
          >
            <div className="flex min-h-[500px] w-full max-w-[660px] flex-col items-center justify-center px-4 py-10 text-center sm:px-8 lg:min-h-[560px] xl:min-h-[620px]">
              <div className="relative z-10 flex max-w-[560px] flex-col items-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-[20px] text-white sm:h-20 sm:w-20"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 55%, #3b82f6 100%)',
                    boxShadow: isDark
                      ? '0 24px 50px rgba(99, 102, 241, 0.32)'
                      : '0 26px 56px rgba(139, 92, 246, 0.26)'
                  }}
                >
                  <FaTasks className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>

                <div className="mt-6 text-[2.2rem] font-semibold tracking-[-0.03em] sm:text-[2.6rem]" style={{color: isDark ? '#c4b5fd' : '#8b5cf6'}}>
                  Task
                </div>

                <p
                  className="mt-4 max-w-[520px] text-base leading-7 sm:text-[1.2rem] sm:leading-[2.2rem]"
                  style={{color: isDark ? theme.colors.neutral[400] : theme.colors.neutral[600]}}
                >
                  统一管理项目目标、任务拆分、责任分配与进度协作，让团队始终围绕同一个交付目标高效推进。
                </p>

                <div className="mt-10 grid w-full max-w-[520px] grid-cols-3 gap-3">
                  {statItems.map((item) => (
                    <div
                      key={item.value}
                      className="rounded-[22px] border px-3 py-4 sm:px-4"
                      style={{
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.44)' : 'rgba(255, 255, 255, 0.72)',
                        borderColor: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(255, 255, 255, 0.75)',
                        boxShadow: isDark
                          ? '0 18px 36px rgba(2, 6, 23, 0.14)'
                          : '0 18px 36px rgba(148, 163, 184, 0.08)'
                      }}
                    >
                      <div className="text-base font-semibold sm:text-[1.12rem]" style={{color: isDark ? '#c4b5fd' : '#4f46e5'}}>
                        {item.value}
                      </div>
                      <div
                        className="mt-1.5 text-[11px] sm:text-xs"
                        style={{color: isDark ? theme.colors.neutral[400] : theme.colors.neutral[500]}}
                      >
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.55, ease: 'easeOut', delay: 0.06}}
            className="flex justify-center lg:justify-end"
          >
            <div
              className="w-full max-w-[560px] rounded-[38px] border p-6 shadow-2xl backdrop-blur-2xl sm:p-8"
              style={{
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.88)',
                borderColor: isDark ? 'rgba(129, 140, 248, 0.14)' : 'rgba(255, 255, 255, 0.94)',
                boxShadow: isDark
                  ? '0 36px 100px rgba(2, 6, 23, 0.34)'
                  : '0 36px 100px rgba(99, 102, 241, 0.15)'
              }}
            >
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-violet-600">欢迎回来</p>
                  <h2 className="mt-3 text-[2.1rem] font-semibold leading-tight" style={{color: theme.colors.foreground}}>
                    登录 Task
                  </h2>
                  <p
                    className="mt-3 max-w-sm text-sm leading-6"
                    style={{color: isDark ? theme.colors.neutral[400] : theme.colors.neutral[500]}}
                  >
                    继续查看项目进展、任务协作与团队分配情况。
                  </p>
                </div>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(59,130,246,0.14))'
                      : 'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(96,165,250,0.14))'
                  }}
                >
                  <FaRegChartBar className="h-5 w-5 text-violet-500" />
                </div>
              </div>

              <AnimatePresence>
                {(justRegistered || passwordReset || apiError) && (
                  <motion.div
                    initial={{opacity: 0, y: -8}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -8}}
                    className="mb-5 rounded-2xl border px-4 py-3 text-sm"
                    style={{
                      backgroundColor: apiError
                        ? isDark
                          ? 'rgba(127, 29, 29, 0.28)'
                          : 'rgba(254, 242, 242, 0.92)'
                        : isDark
                          ? 'rgba(6, 95, 70, 0.24)'
                          : 'rgba(236, 253, 245, 0.92)',
                      borderColor: apiError
                        ? isDark
                          ? 'rgba(248, 113, 113, 0.22)'
                          : 'rgba(252, 165, 165, 0.42)'
                        : isDark
                          ? 'rgba(52, 211, 153, 0.22)'
                          : 'rgba(110, 231, 183, 0.42)',
                      color: apiError
                        ? isDark
                          ? '#fecaca'
                          : '#b91c1c'
                        : isDark
                          ? '#a7f3d0'
                          : '#047857'
                    }}
                  >
                    {apiError || (justRegistered ? '注册成功，请使用账号密码登录。' : '密码已重置，请重新登录。')}
                  </motion.div>
                )}
              </AnimatePresence>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2.5">
                  <label htmlFor="username" className="text-sm font-medium" style={{color: theme.colors.foreground}}>
                    用户名 / 邮箱
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="请输入用户名或邮箱"
                    className="h-[58px] w-full rounded-2xl border px-4 text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                    style={inputBaseStyle}
                    {...register('username', {required: '请输入用户名'})}
                  />
                  {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                </div>

                <div className="space-y-2.5">
                  <label htmlFor="password" className="text-sm font-medium" style={{color: theme.colors.foreground}}>
                    密码
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={passwordVisible ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="请输入密码"
                      className="h-[58px] w-full rounded-2xl border px-4 pr-12 text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                      style={inputBaseStyle}
                      {...register('password', {required: '请输入密码'})}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible((visible) => !visible)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 transition-colors hover:text-violet-500"
                      aria-label={passwordVisible ? '隐藏密码' : '显示密码'}
                    >
                      {passwordVisible ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <label
                    className="flex cursor-pointer items-center gap-3"
                    style={{color: isDark ? theme.colors.neutral[400] : theme.colors.neutral[600]}}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                      {...register('remember')}
                    />
                    记住我
                  </label>
                  <Link href="/forgot-password" className="font-medium text-violet-600 transition-colors hover:text-violet-500">
                    忘记密码？
                  </Link>
                </div>

                <motion.button
                  type="submit"
                  disabled={isPending || loginStatus === 'success' || !formReady}
                  className="flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 52%, #60a5fa 100%)',
                    boxShadow: formReady ? '0 22px 42px rgba(99, 102, 241, 0.28)' : 'none'
                  }}
                  whileHover={isPending || loginStatus === 'success' || !formReady ? undefined : {scale: 0.995}}
                  whileTap={isPending || loginStatus === 'success' || !formReady ? undefined : {scale: 0.985}}
                >
                  {isPending ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      正在登录
                    </>
                  ) : loginStatus === 'success' ? (
                    <>
                      <FaCheckCircle className="h-4 w-4" />
                      登录成功
                    </>
                  ) : (
                    <>
                      进入工作台
                      <FaArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </motion.button>
              </form>

              <div
                className="mt-6 rounded-2xl border px-4 py-4"
                style={{
                  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.44)' : 'rgba(248, 250, 252, 0.86)',
                  borderColor: isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(226, 232, 240, 0.9)'
                }}
              >
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium" style={{color: theme.colors.foreground}}>
                      还没有账号？
                    </p>
                    <p style={{color: isDark ? theme.colors.neutral[400] : theme.colors.neutral[500]}}>
                      创建账户后即可开始管理团队任务
                    </p>
                  </div>
                  <Link href="/register" className="shrink-0 font-semibold text-violet-600 transition-colors hover:text-violet-500">
                    立即注册
                  </Link>
                </div>
              </div>

              <div
                className="mt-5 flex items-center justify-between text-xs"
                style={{color: isDark ? theme.colors.neutral[500] : theme.colors.neutral[400]}}
              >
                <span>项目管理 · 任务拆分 · 协作推进</span>
                <span>{watchRemember ? '已启用记住我' : '安全登录'}</span>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

export function LoginTemplate() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">加载中...</div>}>
      <LoginContent />
    </Suspense>
  );
}
