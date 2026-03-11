"use client";

import React from 'react';
import {FieldErrors, UseFormRegister} from 'react-hook-form';
import {FaEye, FaEyeSlash} from 'react-icons/fa';
import {evaluatePasswordStrength, PasswordStrength} from '@/utils/password-utils';

interface PasswordInputProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  password: string;
  isDarkMode: boolean;
  passwordVisible: boolean;
  setPasswordVisible: (visible: boolean) => void;
  confirmPasswordVisible: boolean;
  setConfirmPasswordVisible: (visible: boolean) => void;
  inputFocus: {
    password: boolean;
    confirmPassword: boolean;
  };
  setInputFocus: (focus: any) => void;
  colors: {
    input: string;
    inputFocus: string;
    textSecondary: string;
  };
  passwordStrengthResult: any;
}

export function PasswordInput({
  register,
  errors,
  password,
  isDarkMode,
  passwordVisible,
  setPasswordVisible,
  confirmPasswordVisible,
  setConfirmPasswordVisible,
  inputFocus,
  setInputFocus,
  colors,
  passwordStrengthResult
}: PasswordInputProps) {
  return (
    <>
      {/* 密码输入框 */}
      <div className="space-y-2">
        <label
          className={`block text-sm font-medium mb-1.5 ${colors.textSecondary}`}
          htmlFor="password"
        >
          密码
        </label>
        <div className="relative">
          <input
            id="password"
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
                strongEnough: (value) => evaluatePasswordStrength(value).score >= PasswordStrength.MEDIUM || '密码强度不足'
              }
            })}
            type={passwordVisible ? "text" : "password"}
            onFocus={() => setInputFocus({...inputFocus, password: true})}
            onBlur={() => setInputFocus({...inputFocus, password: false})}
            className={`w-full py-3 px-4 ${colors.input} ${inputFocus.password ? colors.inputFocus : ''} border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${errors.password ? 'border-red-500 ring-red-200' : ''}`}
            placeholder="请输入密码"
          />
          <button
            type="button"
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:text-gray-600`}
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
          </button>
          {errors.password && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-red-500">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          )}
        </div>

        {/* 密码强度和提示 -  */}
        <div className="mt-3">
          {/* 密码强度进度条 */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <p className={`text-xs ${colors.textSecondary}`}>密码强度</p>
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

          {/* 密码规则提示 - 初始状态或有未满足的条件时显示 */}
          {(!password || (password && !
            (passwordStrengthResult.isLongEnough &&
            passwordStrengthResult.hasLowerCase &&
            passwordStrengthResult.hasUpperCase &&
            passwordStrengthResult.hasNumber &&
            passwordStrengthResult.hasSpecialChar))) && (
            <div className="mt-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <p className={`text-xs font-medium mb-1.5 ${colors.textSecondary}`}>请满足以下条件：</p>
              <div className="space-y-1">
                {/* 只显示未满足的条件 */}
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

          {/* 当密码达到最低要求但强度还不够时显示提示 */}
          {password &&
           passwordStrengthResult.isLongEnough &&
           passwordStrengthResult.hasLowerCase &&
           passwordStrengthResult.hasUpperCase &&
           passwordStrengthResult.hasNumber &&
           passwordStrengthResult.hasSpecialChar &&
           passwordStrengthResult.score < 3 && (
            <div className="mt-2 text-xs text-center text-yellow-600 dark:text-yellow-400 font-medium">
              密码满足基本要求，增加长度可提高安全性
            </div>
          )}

          {/* 当密码非常强时显示积极反馈 */}
          {password && passwordStrengthResult.score >= 4 && (
            <div className="mt-2 text-xs text-center text-green-600 dark:text-green-400 font-medium">
              恭喜！您创建了一个非常强的密码
            </div>
          )}
        </div>
      </div>

      {/* 确认密码输入框 */}
      <div className="relative">
        <label
          className={`block text-sm font-medium mb-1.5 ${colors.textSecondary}`}
          htmlFor="confirmPassword"
        >
          确认密码
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            {...register('confirmPassword', {
              required: '请再次输入密码',
              validate: (value, formValues) => {
                // 使用表单对象获取当前密码值
                const currentPassword = formValues?.password;
                return value === currentPassword || '两次输入的密码不一致';
              }
            })}
            type={confirmPasswordVisible ? "text" : "password"}
            onFocus={() => setInputFocus({...inputFocus, confirmPassword: true})}
            onBlur={() => setInputFocus({...inputFocus, confirmPassword: false})}
            className={`w-full py-3 px-4 ${colors.input} ${inputFocus.confirmPassword ? colors.inputFocus : ''} border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${errors.confirmPassword ? 'border-red-500 ring-red-200' : ''}`}
            placeholder="请再次输入密码"
          />
          <button
            type="button"
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:text-gray-600`}
            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            {confirmPasswordVisible ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
          </button>
          {errors.confirmPassword && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-red-500">
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
