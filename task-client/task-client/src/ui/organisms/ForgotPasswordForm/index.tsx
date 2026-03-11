"use client";

import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaLock} from 'react-icons/fa';
import {AnimatePresence, motion} from 'framer-motion';
import {useTheme} from '@/ui/theme';
import {useRouter} from 'next/navigation';
import {userApi} from '@/adapters/api/user-api';
import {evaluatePasswordStrength, PasswordStrength} from '@/utils/password-utils';
import {encryptPassword} from '@/utils/crypto-utils';

type ForgotPasswordFormData = {
  email: string;
  verificationCode: string;
  newPassword: string;
  confirmPassword: string;
};

export function ForgotPasswordForm() {
  // 使用统一主题系统
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const router = useRouter();

  // 表单步骤
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const { register, handleSubmit, watch, formState: { errors }, getValues, reset, trigger } = useForm<ForgotPasswordFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 验证码倒计时
  const [countdown, setCountdown] = useState(0);

  // 密码可见性状态
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // 输入框聚焦状态
  const [inputFocus, setInputFocus] = useState({
    email: false,
    verificationCode: false,
    newPassword: false,
    confirmPassword: false
  });

  // 添加表单验证状态
  const [formValidation, setFormValidation] = useState({
    email: { valid: false, touched: false },
    verificationCode: { valid: false, touched: false },
    newPassword: { valid: false, touched: false },
    confirmPassword: { valid: false, touched: false }
  });

  // 监听表单字段
  const watchEmail = watch('email');
  const watchVerificationCode = watch('verificationCode');
  const watchNewPassword = watch('newPassword');
  const watchConfirmPassword = watch('confirmPassword');

  // 密码强度评估
  const [passwordStrengthResult, setPasswordStrengthResult] = useState(evaluatePasswordStrength(''));

  // 倒计时处理
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  // 当表单值变化时更新验证状态
  useEffect(() => {
    // 验证邮箱格式
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const emailValid = !!(watchEmail && emailRegex.test(watchEmail));

    setFormValidation(prev => ({
      ...prev,
      email: { ...prev.email, valid: emailValid, touched: !!watchEmail }
    }));
  }, [watchEmail]);

  // 验证码验证
  useEffect(() => {
    const codeValid = !!(watchVerificationCode && watchVerificationCode.length === 6 && /^\d+$/.test(watchVerificationCode));

    setFormValidation(prev => ({
      ...prev,
      verificationCode: { ...prev.verificationCode, valid: codeValid, touched: !!watchVerificationCode }
    }));
  }, [watchVerificationCode]);

  // 密码验证
  useEffect(() => {
    // 评估密码强度
    const strengthResult = evaluatePasswordStrength(watchNewPassword || '');
    setPasswordStrengthResult(strengthResult);

    // 密码验证条件: 至少中等强度
    const passwordValid = !!(watchNewPassword &&
      strengthResult.isLongEnough &&
      strengthResult.hasLowerCase &&
      strengthResult.hasUpperCase &&
      strengthResult.hasNumber &&
      strengthResult.hasSpecialChar &&
      strengthResult.score >= PasswordStrength.MEDIUM);

    setFormValidation(prev => ({
      ...prev,
      newPassword: { ...prev.newPassword, valid: passwordValid, touched: !!watchNewPassword }
    }));
  }, [watchNewPassword]);

  // 发送验证码
  const sendVerificationCode = async () => {
    if (!formValidation.email.valid || countdown > 0) return;

    setIsSubmitting(true);
    setApiError(null);
    setStatus('idle');

    try {
      const response = await userApi.sendEmailVerificationCode({
        email: getValues('email'),
        type: 'change_password'
      });

      if (response.success) {
        setCountdown(60); // 开始60秒倒计时
        setStatus('success');
        setStep(2); // 进入验证码输入步骤
      } else {
        setStatus('error');
        setApiError(response.message || '发送验证码失败');
      }
    } catch (error) {
      setStatus('error');
      setApiError('网络错误，请稍后再试');
      console.error('发送验证码错误:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 验证码输入后前进到密码重置页面
  const verifyCodeAndContinue = async () => {
    const isValid = await trigger('verificationCode');
    if (isValid && formValidation.verificationCode.valid) {
      setStep(3); // 进入设置新密码步骤
    }
  };

  // 表单提交
  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (step === 1) {
      sendVerificationCode();
      return;
    }

    if (step === 2) {
      verifyCodeAndContinue();
      return;
    }

    // 最终提交修改密码
    setIsSubmitting(true);
    setApiError(null);
    setStatus('idle');

    try {
      // 在提交前加密密码，与注册页面保持一致
      const encryptedPassword = await encryptPassword(data.newPassword);

      const response = await userApi.changePassword(
        data.email,
        data.verificationCode,
        encryptedPassword  // 使用加密后的密码
      );

      if (response.success) {
        setSuccess(true);
        setStatus('success');

        // 设置一个短暂延迟后跳转到登录页面，给用户时间看到成功提示
        setTimeout(() => {
          // 跳转到登录页面并带上自定义提示信息
          router.push('/login?reset=success');
        }, 2000);
      } else {
        setStatus('error');
        setApiError(response.message || '修改密码失败');
      }
    } catch (error) {
      setStatus('error');
      setApiError('网络错误，请稍后再试');
      console.error('修改密码错误:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 space-y-6"
    >
      {/* 步骤指示器 */}
      <div className="flex justify-between items-center mb-6">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors duration-300 ${
              step >= stepNumber 
                ? (isDark ? 'bg-blue-600' : 'bg-blue-500') 
                : (isDark ? 'bg-gray-700' : 'bg-gray-200')
            }`} style={{ color: theme.colors.foreground }}>
              {step > stepNumber ? (
                <FaCheck className="h-4 w-4" />
              ) : (
                <span>{stepNumber}</span>
              )}
            </div>
            <span className="text-xs" style={{ 
              color: step >= stepNumber ? theme.colors.foreground : theme.colors.neutral[500] 
            }}>
              {stepNumber === 1 ? '输入邮箱' : stepNumber === 2 ? '验证' : '重置密码'}
            </span>
          </div>
        ))}
      </div>

      {/* 第一步：邮箱输入 */}
      {step === 1 && (
        <div className="relative group">
          <div className="relative">
            <input
              {...register('email', {
                required: '邮箱不能为空',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: '请输入有效的邮箱地址'
                }
              })}
              type="email"
              id="email"
              autoFocus
              className={`w-full py-3.5 pl-10 pr-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.email 
                  ? 'ring-2 ring-red-500' 
                  : inputFocus.email 
                    ? 'ring-2 ring-blue-500' 
                    : ''
              }`}
              style={{
                backgroundColor: errors.email 
                  ? (isDark ? 'rgba(239, 68, 68, 0.1)' : theme.colors.error[50])
                  : (isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.card.background),
                borderColor: errors.email 
                  ? theme.colors.error[500]
                  : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB'),
                color: theme.colors.foreground
              }}
              placeholder="请输入您的邮箱地址"
              onFocus={() => setInputFocus({...inputFocus, email: true})}
              onBlur={() => setInputFocus({...inputFocus, email: false})}
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaEnvelope className="h-4 w-4" />
            </span>

            {/* 错误图标 */}
            {errors.email && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: theme.colors.error[500] }}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
            )}

            {/* 有效性指示器 - 当没有错误时显示 */}
            {!errors.email && formValidation.email.touched && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute right-3.5 top-1/2 transform -translate-y-1/2 ${formValidation.email.valid ? 'text-green-500' : 'text-gray-300'}`}
              >
                {formValidation.email.valid && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </motion.div>
            )}
          </div>

          {/* 错误消息 */}
          <div className="mt-1.5" style={{ minHeight: '20px' }}>
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm px-1"
                  style={{ color: theme.colors.error[500] }}
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* 第二步：验证码输入 */}
      {step === 2 && (
        <>
          <div className="relative group">
            <div className="relative">
              <input
                {...register('verificationCode', {
                  required: '验证码不能为空',
                  minLength: {
                    value: 6,
                    message: '验证码长度不正确'
                  },
                  pattern: {
                    value: /^\d+$/,
                    message: '验证码必须是数字'
                  }
                })}
                type="text"
                id="verificationCode"
                autoFocus
                maxLength={6}
                className={`w-full py-3.5 pl-10 pr-24 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.verificationCode 
                    ? 'ring-2 ring-red-500' 
                    : inputFocus.verificationCode 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                }`}
                style={{
                  backgroundColor: errors.verificationCode 
                    ? (isDark ? 'rgba(239, 68, 68, 0.1)' : theme.colors.error[50])
                    : (isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.card.background),
                  borderColor: errors.verificationCode 
                    ? theme.colors.error[500]
                    : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB'),
                  color: theme.colors.foreground
                }}
                placeholder="请输入6位验证码"
                onFocus={() => setInputFocus({...inputFocus, verificationCode: true})}
                onBlur={() => setInputFocus({...inputFocus, verificationCode: false})}
                aria-invalid={errors.verificationCode ? 'true' : 'false'}
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaCheck className="h-4 w-4" />
              </span>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <button
                  type="button"
                  onClick={sendVerificationCode}
                  disabled={!formValidation.email.valid || countdown > 0}
                  className={`text-sm px-3 py-1 rounded-lg ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:text-blue-600'}`}
                >
                  {countdown > 0 ? `重新发送(${countdown}s)` : '重新发送'}
                </button>
              </div>
            </div>

            {/* 错误消息 */}
            <div className="mt-1.5" style={{ minHeight: '20px' }}>
              <AnimatePresence>
                {errors.verificationCode && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm px-1"
                    style={{ color: theme.colors.error[500] }}
                  >
                    {errors.verificationCode.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="text-sm text-center">
            <p style={{ color: theme.colors.neutral[500] }}>
              我们已向 <span className="font-medium">{watchEmail}</span> 发送了验证码
            </p>
          </div>
        </>
      )}

      {/* 第三步：密码设置 */}
      {step === 3 && (
        <>
          {/* 新密码输入框 */}
          <div className="relative group">
            <div className="relative">
              <input
                {...register('newPassword', {
                  required: '新密码不能为空',
                  minLength: {
                    value: 8,
                    message: '密码至少需要8个字符'
                  }
                })}
                type={passwordVisible ? "text" : "password"}
                id="newPassword"
                autoFocus
                className={`w-full py-3.5 pl-10 pr-10 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.newPassword 
                    ? 'ring-2 ring-red-500' 
                    : inputFocus.newPassword 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                }`}
                style={{
                  backgroundColor: errors.newPassword 
                    ? (isDark ? 'rgba(239, 68, 68, 0.1)' : theme.colors.error[50])
                    : (isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.card.background),
                  borderColor: errors.newPassword 
                    ? theme.colors.error[500]
                    : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB'),
                  color: theme.colors.foreground
                }}
                placeholder="请输入新密码"
                onFocus={() => setInputFocus({...inputFocus, newPassword: true})}
                onBlur={() => setInputFocus({...inputFocus, newPassword: false})}
                aria-invalid={errors.newPassword ? 'true' : 'false'}
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaLock className="h-4 w-4" />
              </span>
              <button
                type="button"
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gray-600`}
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
              </button>
            </div>

            {/* 密码强度指示器 */}
            {watchNewPassword && (
              <div className="mt-3 mb-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs" style={{ color: theme.colors.neutral[500] }}>密码强度</p>
                  <p className={`text-xs font-medium ${passwordStrengthResult.score <= 1 ? 'text-red-500' : passwordStrengthResult.score === 2 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {passwordStrengthResult.score === 0 ? '非常弱' :
                     passwordStrengthResult.score === 1 ? '弱' :
                     passwordStrengthResult.score === 2 ? '中等' :
                     passwordStrengthResult.score === 3 ? '强' : '非常强'}
                  </p>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ease-out ${passwordStrengthResult.score === 0 ? 'w-1/5 bg-red-500' : 
                                                                                     passwordStrengthResult.score === 1 ? 'w-2/5 bg-orange-500' : 
                                                                                     passwordStrengthResult.score === 2 ? 'w-3/5 bg-yellow-500' : 
                                                                                     passwordStrengthResult.score === 3 ? 'w-4/5 bg-green-500' : 
                                                                                     'w-full bg-green-500'}`}
                  ></div>
                </div>
              </div>
            )}

            {/* 密码规则提示 */}
            {watchNewPassword && !(
              passwordStrengthResult.isLongEnough &&
              passwordStrengthResult.hasLowerCase &&
              passwordStrengthResult.hasUpperCase &&
              passwordStrengthResult.hasNumber &&
              passwordStrengthResult.hasSpecialChar
            ) && (
              <div className="mb-4 p-2.5 rounded-lg border" style={{
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB'
              }}>
                <p className="text-xs font-medium mb-1.5" style={{ color: theme.colors.neutral[500] }}>请满足以下条件：</p>
                <div className="space-y-1">
                  {!passwordStrengthResult.isLongEnough && (
                    <div className="flex items-center text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                      </svg>
                      <span className="text-xs">至少8个字符</span>
                    </div>
                  )}

                  {!passwordStrengthResult.hasLowerCase && (
                    <div className="flex items-center text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                      </svg>
                      <span className="text-xs">至少一个小写字母 (a-z)</span>
                    </div>
                  )}

                  {!passwordStrengthResult.hasUpperCase && (
                    <div className="flex items-center text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                      </svg>
                      <span className="text-xs">至少一个大写字母 (A-Z)</span>
                    </div>
                  )}

                  {!passwordStrengthResult.hasNumber && (
                    <div className="flex items-center text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                      </svg>
                      <span className="text-xs">至少一个数字 (0-9)</span>
                    </div>
                  )}

                  {!passwordStrengthResult.hasSpecialChar && (
                    <div className="flex items-center text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                      </svg>
                      <span className="text-xs">至少一个特殊字符 (!@#$%^&*)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 错误消息 */}
            <div className="mt-1.5" style={{ minHeight: '20px' }}>
              <AnimatePresence>
                {errors.newPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm px-1"
                    style={{ color: theme.colors.error[500] }}
                  >
                    {errors.newPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 确认密码输入框 */}
          <div className="relative group">
            <div className="relative">
              <input
                {...register('confirmPassword', {
                  required: '请确认新密码',
                  validate: {
                    matchesPassword: (value) => {
                      const password = getValues('newPassword');
                      return value === password || '两次输入的密码不一致';
                    }
                  }
                })}
                type={confirmPasswordVisible ? "text" : "password"}
                id="confirmPassword"
                className={`w-full py-3.5 pl-10 pr-10 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.confirmPassword 
                    ? 'ring-2 ring-red-500' 
                    : inputFocus.confirmPassword 
                      ? 'ring-2 ring-blue-500' 
                      : ''
                }`}
                style={{
                  backgroundColor: errors.confirmPassword 
                    ? (isDark ? 'rgba(239, 68, 68, 0.1)' : theme.colors.error[50])
                    : (isDark ? 'rgba(255, 255, 255, 0.05)' : theme.colors.card.background),
                  borderColor: errors.confirmPassword 
                    ? theme.colors.error[500]
                    : (isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E7EB'),
                  color: theme.colors.foreground
                }}
                placeholder="请再次输入新密码"
                onFocus={() => setInputFocus({...inputFocus, confirmPassword: true})}
                onBlur={() => setInputFocus({...inputFocus, confirmPassword: false})}
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FaLock className="h-4 w-4" />
              </span>
              <button
                type="button"
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'} hover:text-gray-600`}
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                {confirmPasswordVisible ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
              </button>
            </div>

            {/* 错误消息 */}
            <div className="mt-1.5" style={{ minHeight: '20px' }}>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm px-1"
                    style={{ color: theme.colors.error[500] }}
                  >
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}

      {/* 状态提示区域 */}
      {(() => {
        if (status === 'success' && step === 3 && success) {
          return (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 mb-4 rounded-xl flex items-start border"
                style={{
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : theme.colors.success[50],
                  borderColor: theme.colors.success[500]
                }}>
                <svg className="h-5 w-5 mr-3 mt-0.5" style={{ color: theme.colors.success[500] }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm" style={{ color: theme.colors.success[500] }}>密码修改成功，请使用新密码登录</p>
              </motion.div>
            </AnimatePresence>
          );
        } else if (status === 'success' && step === 2) {
          return (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 mb-4 rounded-xl flex items-start border"
                style={{
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : theme.colors.success[50],
                  borderColor: theme.colors.success[500]
                }}>
                <svg className="h-5 w-5 mr-3 mt-0.5" style={{ color: theme.colors.success[500] }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm" style={{ color: theme.colors.success[500] }}>验证码已发送，请查收邮件</p>
              </motion.div>
            </AnimatePresence>
          );
        } else if (status === 'error' && apiError) {
          return (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 mb-4 rounded-xl flex items-start border"
                style={{
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : theme.colors.error[50],
                  borderColor: theme.colors.error[500]
                }}>
                <svg className="h-5 w-5 mr-3 mt-0.5" style={{ color: theme.colors.error[500] }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm" style={{ color: theme.colors.error[500] }}>{apiError}</p>
              </motion.div>
            </AnimatePresence>
          );
        }
        return null;
      })()}

      {/* 操作按钮 */}
      <motion.button
        type="submit"
        disabled={isSubmitting || (step === 3 && success)}
        className={`w-full py-3.5 px-4 ${(isSubmitting || (step === 3 && success)) ? 'bg-blue-400 cursor-not-allowed' : (isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600')} text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex justify-center items-center`}
        whileHover={{ scale: 0.99 }}
        whileTap={{ scale: 0.97 }}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            处理中...
          </>
        ) : step === 1 ?
            '发送验证码' :
            step === 2 ?
            '验证并继续' :
            (status === 'success' && success) ?
            '密码修改成功' :
            '确认修改密码'}
      </motion.button>

      {/* 如果不是第一步，提供返回按钮 */}
      {step > 1 && (
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setStep(prev => (prev > 1 ? prev - 1 : prev) as 1 | 2 | 3)}
            className="text-sm hover:underline"
            style={{ color: theme.colors.neutral[500] }}
          >
            返回上一步
          </button>
        </div>
      )}
    </motion.form>
  );
}
