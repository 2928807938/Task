"use client";

import React, {useMemo, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {AnimatePresence, motion} from 'framer-motion';
import {
  FaArrowRight,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaMoon,
  FaShieldAlt,
  FaSun,
  FaTasks,
  FaUserPlus
} from 'react-icons/fa';

import {useRegister} from '@/hooks/use-user-hook';
import {useTheme} from '@/ui/theme';
import {ResponseCode} from '@/types/response-code';
import {handleApiError} from '@/utils/response-utils';
import {encryptPassword} from '@/utils/crypto-utils';
import {evaluatePasswordStrength, PasswordStrength} from '@/utils/password-utils';

type RegisterFormData = {
  username: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

const statItems = [
  {value: '统一协作', label: '角色与任务清晰同步'},
  {value: '快速交付', label: '拆解目标并持续推进'},
  {value: '安全可靠', label: '从账号开始保护数据'}
];

export function RegisterTemplate() {
  const router = useRouter();
  const {theme, isDark, toggleTheme} = useTheme();
  const {mutate: registerUser, isPending} = useRegister();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [registerStatus, setRegisterStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: {errors}
  } = useForm<RegisterFormData>({
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      terms: false
    }
  });

  const watchUsername = watch('username');
  const watchPassword = watch('password');
  const watchConfirmPassword = watch('confirmPassword');
  const watchTerms = watch('terms');

  const passwordStrengthResult = useMemo(() => evaluatePasswordStrength(watchPassword || ''), [watchPassword]);

  const formReady = useMemo(
    () =>
      Boolean(watchUsername?.trim()) &&
      Boolean(watchPassword?.trim()) &&
      Boolean(watchConfirmPassword?.trim()) &&
      Boolean(watchTerms),
    [watchConfirmPassword, watchPassword, watchTerms, watchUsername]
  );

  const formMessage =
    apiError ||
    (errors.terms ? '请阅读并同意服务条款和隐私政策' : null) ||
    (errors.username?.message as string | undefined) ||
    (errors.password?.message as string | undefined) ||
    (errors.confirmPassword?.message as string | undefined) ||
    null;

  const inputBaseStyle = {
    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(248, 250, 252, 0.96)',
    borderColor: isDark ? 'rgba(129, 140, 248, 0.14)' : 'rgba(99, 102, 241, 0.10)',
    color: theme.colors.foreground
  };

  const strengthColor = useMemo(() => {
    switch (passwordStrengthResult.score) {
      case PasswordStrength.VERY_WEAK:
        return '#ef4444';
      case PasswordStrength.WEAK:
        return '#f97316';
      case PasswordStrength.MEDIUM:
        return '#f59e0b';
      case PasswordStrength.STRONG:
        return '#22c55e';
      case PasswordStrength.VERY_STRONG:
        return '#16a34a';
      default:
        return '#cbd5e1';
    }
  }, [passwordStrengthResult.score]);

  const activeStrengthCount = watchPassword ? Math.min(passwordStrengthResult.score + 1, 4) : 0;

  const passwordChecks = [
    {label: '至少 8 位字符', passed: passwordStrengthResult.isLongEnough},
    {label: '包含大小写字母', passed: passwordStrengthResult.hasLowerCase && passwordStrengthResult.hasUpperCase},
    {label: '包含数字', passed: passwordStrengthResult.hasNumber},
    {label: '包含特殊字符', passed: passwordStrengthResult.hasSpecialChar}
  ];

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    setRegisterStatus('idle');

    try {
      const encryptedPassword = await encryptPassword(data.password);

      registerUser(
        {
          username: data.username.trim(),
          password: encryptedPassword,
          confirmPassword: encryptedPassword
        },
        {
          onSuccess: (response) => {
            if (response.success) {
              setRegisterStatus('success');
              setTimeout(() => {
                router.push('/login?registered=true');
              }, 1600);
              return;
            }

            setRegisterStatus('error');
            const code = Number.parseInt(response.code, 10);
            switch (code) {
              case ResponseCode.USERNAME_ALREADY_EXISTS:
                setApiError('用户名已被注册，请尝试其他用户名');
                break;
              case ResponseCode.DATA_VALIDATION_FAILED:
              case ResponseCode.PARAM_VALIDATION_ERROR:
                setApiError('提交的信息验证失败，请检查后重试');
                break;
              default:
                setApiError(handleApiError(response));
                break;
            }
          },
          onError: (error) => {
            setRegisterStatus('error');
            setApiError(error.message || '网络错误，请检查您的网络连接');
          }
        }
      );
    } catch (error) {
      setRegisterStatus('error');
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
                  创建团队协作账号后，即可统一管理项目目标、任务拆分、责任分配与执行进度。
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
                  <p className="text-sm font-medium text-violet-600">欢迎加入</p>
                  <h2 className="mt-3 text-[2.1rem] font-semibold leading-tight" style={{color: theme.colors.foreground}}>
                    注册 Task
                  </h2>
                  <p
                    className="mt-3 max-w-sm text-sm leading-6"
                    style={{color: isDark ? theme.colors.neutral[400] : theme.colors.neutral[500]}}
                  >
                    完成基础设置后，即可开始管理团队任务、协作分工与项目节奏。
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
                  <FaUserPlus className="h-5 w-5 text-violet-500" />
                </div>
              </div>

              <AnimatePresence>
                {(formMessage || registerStatus === 'success') && (
                  <motion.div
                    initial={{opacity: 0, y: -8}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -8}}
                    className="mb-5 rounded-2xl border px-4 py-3 text-sm"
                    style={{
                      backgroundColor:
                        registerStatus === 'success'
                          ? isDark
                            ? 'rgba(6, 95, 70, 0.24)'
                            : 'rgba(236, 253, 245, 0.92)'
                          : isDark
                            ? 'rgba(127, 29, 29, 0.28)'
                            : 'rgba(254, 242, 242, 0.92)',
                      borderColor:
                        registerStatus === 'success'
                          ? isDark
                            ? 'rgba(52, 211, 153, 0.22)'
                            : 'rgba(110, 231, 183, 0.42)'
                          : isDark
                            ? 'rgba(248, 113, 113, 0.22)'
                            : 'rgba(252, 165, 165, 0.42)',
                      color:
                        registerStatus === 'success'
                          ? isDark
                            ? '#a7f3d0'
                            : '#047857'
                          : isDark
                            ? '#fecaca'
                            : '#b91c1c'
                    }}
                  >
                    {registerStatus === 'success' ? '注册成功，正在跳转到登录页。' : formMessage}
                  </motion.div>
                )}
              </AnimatePresence>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-2.5">
                  <label htmlFor="username" className="text-sm font-medium" style={{color: theme.colors.foreground}}>
                    用户名
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="请输入用户名"
                    className="h-[58px] w-full rounded-2xl border px-4 text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                    style={inputBaseStyle}
                    {...register('username', {required: '请输入用户名'})}
                  />
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="password" className="text-sm font-medium" style={{color: theme.colors.foreground}}>
                      设置密码
                    </label>
                    <span className="text-xs" style={{color: strengthColor}}>
                      {watchPassword ? passwordStrengthResult.feedback : '建议组合大小写、数字与特殊字符'}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={passwordVisible ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="请输入密码"
                      className="h-[58px] w-full rounded-2xl border px-4 pr-12 text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                      style={inputBaseStyle}
                      {...register('password', {
                        required: '请输入密码',
                        minLength: {
                          value: 8,
                          message: '密码长度不能少于8个字符'
                        },
                        validate: {
                          hasLowerCase: (value) => /[a-z]/.test(value) || '密码必须包含小写字母',
                          hasUpperCase: (value) => /[A-Z]/.test(value) || '密码必须包含大写字母',
                          hasNumber: (value) => /[0-9]/.test(value) || '密码必须包含数字',
                          hasSpecialChar: (value) => /[^A-Za-z0-9]/.test(value) || '密码必须包含特殊字符',
                          strongEnough: (value) =>
                            evaluatePasswordStrength(value).score >= PasswordStrength.MEDIUM || '密码强度不足'
                        }
                      })}
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

                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({length: 4}, (_, index) => (
                      <div
                        key={index}
                        className="h-1.5 rounded-full transition-all duration-200"
                        style={{
                          backgroundColor:
                            index < activeStrengthCount
                              ? strengthColor
                              : isDark
                                ? 'rgba(71, 85, 105, 0.7)'
                                : 'rgba(226, 232, 240, 0.95)'
                        }}
                      />
                    ))}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {passwordChecks.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 rounded-2xl px-3 py-2 text-xs"
                        style={{
                          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.42)' : 'rgba(248, 250, 252, 0.88)',
                          color: item.passed
                            ? isDark
                              ? '#a7f3d0'
                              : '#047857'
                            : isDark
                              ? theme.colors.neutral[400]
                              : theme.colors.neutral[500]
                        }}
                      >
                        {item.passed ? (
                          <FaCheckCircle className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <FaShieldAlt className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label htmlFor="confirmPassword" className="text-sm font-medium" style={{color: theme.colors.foreground}}>
                    确认密码
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={confirmPasswordVisible ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="请再次输入密码"
                      className="h-[58px] w-full rounded-2xl border px-4 pr-12 text-sm outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10"
                      style={inputBaseStyle}
                      {...register('confirmPassword', {
                        required: '请再次输入密码',
                        validate: (value) => value === getValues('password') || '两次输入的密码不一致'
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setConfirmPasswordVisible((visible) => !visible)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 transition-colors hover:text-violet-500"
                      aria-label={confirmPasswordVisible ? '隐藏确认密码' : '显示确认密码'}
                    >
                      {confirmPasswordVisible ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <label
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm"
                  style={{
                    backgroundColor: isDark ? 'rgba(15, 23, 42, 0.44)' : 'rgba(248, 250, 252, 0.86)',
                    borderColor: errors.terms
                      ? isDark
                        ? 'rgba(248, 113, 113, 0.28)'
                        : 'rgba(252, 165, 165, 0.56)'
                      : isDark
                        ? 'rgba(148, 163, 184, 0.14)'
                        : 'rgba(226, 232, 240, 0.9)',
                    color: isDark ? theme.colors.neutral[400] : theme.colors.neutral[600]
                  }}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                    {...register('terms', {required: true})}
                  />
                  <span>
                    我已阅读并同意
                    <Link href="/terms" className="mx-1 font-medium text-violet-600 transition-colors hover:text-violet-500">
                      《服务条款》
                    </Link>
                    和
                    <Link href="/privacy" className="ml-1 font-medium text-violet-600 transition-colors hover:text-violet-500">
                      《隐私政策》
                    </Link>
                  </span>
                </label>

                <motion.button
                  type="submit"
                  disabled={isPending || registerStatus === 'success' || !formReady}
                  className="flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 52%, #60a5fa 100%)',
                    boxShadow: formReady ? '0 22px 42px rgba(99, 102, 241, 0.28)' : 'none'
                  }}
                  whileHover={isPending || registerStatus === 'success' || !formReady ? undefined : {scale: 0.995}}
                  whileTap={isPending || registerStatus === 'success' || !formReady ? undefined : {scale: 0.985}}
                >
                  {isPending ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      正在创建
                    </>
                  ) : registerStatus === 'success' ? (
                    <>
                      <FaCheckCircle className="h-4 w-4" />
                      创建成功
                    </>
                  ) : (
                    <>
                      创建账号
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
                      已有账号？
                    </p>
                    <p style={{color: isDark ? theme.colors.neutral[400] : theme.colors.neutral[500]}}>
                      直接登录即可进入项目工作台
                    </p>
                  </div>
                  <Link href="/login" className="shrink-0 font-semibold text-violet-600 transition-colors hover:text-violet-500">
                    立即登录
                  </Link>
                </div>
              </div>

              <div
                className="mt-5 flex items-center justify-between text-xs"
                style={{color: isDark ? theme.colors.neutral[500] : theme.colors.neutral[400]}}
              >
                <span>账号创建 · 安全校验 · 团队协作</span>
                <span>{watchTerms ? '已确认条款' : '等待确认条款'}</span>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
