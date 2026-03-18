"use client";

import React from 'react';
import Link from 'next/link';
import {motion} from 'framer-motion';
import {FaArrowLeft, FaMoon, FaRegChartBar, FaSun, FaTasks} from 'react-icons/fa';

import {ForgotPasswordForm} from '@/ui/organisms/ForgotPasswordForm';
import {useTheme} from '@/ui/theme';

const statItems = [
  {value: '邮箱校验', label: '身份确认'},
  {value: '验证码', label: '快速验证'},
  {value: '安全重置', label: '恢复访问'}
];

export function ForgotPasswordTemplate() {
  const {theme, isDark, toggleTheme} = useTheme();

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
                  通过邮箱验证快速找回账号访问权限，安全完成密码重置后即可继续查看项目进展与团队协作信息。
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
                  <p className="text-sm font-medium text-violet-600">账号安全</p>
                  <h2 className="mt-3 text-[2.1rem] font-semibold leading-tight" style={{color: theme.colors.foreground}}>
                    找回密码
                  </h2>
                  <p
                    className="mt-3 max-w-sm text-sm leading-6"
                    style={{color: isDark ? theme.colors.neutral[400] : theme.colors.neutral[500]}}
                  >
                    按步骤完成邮箱验证与新密码设置，恢复后可直接返回登录页继续使用 Task。
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

              <ForgotPasswordForm />

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
                      想起密码了？
                    </p>
                    <p style={{color: isDark ? theme.colors.neutral[400] : theme.colors.neutral[500]}}>
                      返回登录页后即可继续进入工作台
                    </p>
                  </div>
                  <Link href="/login" className="flex shrink-0 items-center gap-2 font-semibold text-violet-600 transition-colors hover:text-violet-500">
                    <FaArrowLeft className="h-3.5 w-3.5" />
                    返回登录
                  </Link>
                </div>
              </div>

              <div
                className="mt-5 flex items-center justify-between text-xs"
                style={{color: isDark ? theme.colors.neutral[500] : theme.colors.neutral[400]}}
              >
                <span>邮箱验证 · 安全重置 · 快速恢复</span>
                <span>身份校验后可重设密码</span>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
