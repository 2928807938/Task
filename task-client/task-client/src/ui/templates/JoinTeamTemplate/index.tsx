"use client";

import React, {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {FaRocket} from "react-icons/fa";
import {MdWarning} from "react-icons/md";
import Link from "next/link";

// 定义项目类型
interface Project {
  id: string;
  name: string;
  role: string;
  responsibilities: string;
}

// 定义表单数据类型
interface FormData {
  name: string;
  password: string;
  confirmPassword: string;
}

const JoinTeamTemplate: React.FC = () => {
  // 倒计时状态
  const [countdown, setCountdown] = useState({
    hours: 23,
    minutes: 41,
    seconds: 59,
  });

  // 项目列表数据
  const projects: Project[] = [
    {
      id: "1",
      name: "智慧城市数据平台",
      role: "开发者",
      responsibilities: "编写代码、平台运维、对接工作",
    },
    {
      id: "2",
      name: "物联网监控系统",
      role: "观察者",
      responsibilities: "仅查看",
    },
  ];

  // 使用 react-hook-form 处理表单
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  // 处理表单提交
  const onSubmit = (data: FormData) => {
    // 这里可以添加提交逻辑
  };

  // 实时监控密码以进行确认密码的验证
  const password = watch("password");

  // 倒计时效果
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        const { hours, minutes, seconds } = prevCountdown;

        if (hours === 0 && minutes === 0 && seconds === 0) {
          clearInterval(timer);
          return prevCountdown;
        }

        let newSeconds = seconds - 1;
        let newMinutes = minutes;
        let newHours = hours;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }

        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }

        return {
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <FaRocket className="text-indigo-600 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">加入云创科技团队</h2>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">您已被邀请加入以下项目：</p>

          {projects.map((project) => (
            <div key={project.id} className="bg-gray-50 p-4 rounded-md mb-3">
              <div className="flex items-start">
                <div className="h-4 w-4 mt-1">
                  <span className="h-4 w-4 bg-indigo-600 rounded-full block"></span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">角色：</span> {project.role}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">职责：</span> {project.responsibilities}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            账户信息（备注加入人需填写）
          </h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                姓名
              </label>
              <input
                id="name"
                type="text"
                className={`w-full px-3 py-2 border ${
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                {...register("name", { required: "姓名是必填项" })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密码
              </label>
              <input
                id="password"
                type="password"
                className={`w-full px-3 py-2 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                {...register("password", {
                  required: "密码是必填项",
                  minLength: {
                    value: 6,
                    message: "密码长度至少为6个字符",
                  },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                确认密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`w-full px-3 py-2 border ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                {...register("confirmPassword", {
                  required: "请确认密码",
                  validate: value =>
                    value === password || "两次输入的密码不匹配",
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              立即加入
            </button>
          </form>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center text-sm text-amber-600 mb-2">
            <MdWarning className="mr-1" />
            <span>
              链接有效期剩余：{countdown.hours.toString().padStart(2, "0")}小时
              {countdown.minutes.toString().padStart(2, "0")}分
              {countdown.seconds.toString().padStart(2, "0")}秒
            </span>
          </div>
          <p className="text-sm text-gray-600">
            遇到问题？{" "}
            <Link href="mailto:admin@team.com" className="text-indigo-600 hover:text-indigo-500">
              联系管理员：admin@team.com
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinTeamTemplate;
