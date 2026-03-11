'use client';

import React, {useState} from 'react';
import {
    FaCalendarAlt,
    FaCheck,
    FaClipboardList,
    FaComments,
    FaEdit,
    FaFileAlt,
    FaHashtag,
    FaHistory,
    FaListAlt,
    FaUserAlt
} from 'react-icons/fa';

interface TaskDetailTemplateProps {
  taskId: string;
}

export const TaskDetailTemplate: React.FC<TaskDetailTemplateProps> = ({ taskId }) => {
  // 在实际应用中，这里会通过taskId获取任务详情数据
  const [activeTab, setActiveTab] = useState<'subtasks' | 'communication' | 'resources' | 'timeline'>('subtasks');

  return (
      <div className="w-full min-h-screen bg-background -m-2 sm:-m-3 md:-m-4">
        <div className="w-full">
          {/* 页面标题和操作区 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 bg-card-bg p-2 sm:p-3 border-b border-card-border dark:border-neutral-700">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">优化用户注册流程</h1>
              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium">
              <FaHashtag className="w-2.5 h-2.5 mr-0.5" />
              TASK-{taskId}
            </span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-2 py-1 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 text-xs font-medium transition-colors duration-200 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-600">
                <FaEdit className="w-3 h-3 mr-1" />
                编辑任务
              </button>
              <button className="flex items-center px-2 py-1 rounded-md bg-primary-600 dark:bg-primary-500 text-white text-xs font-medium hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-opacity-50">
                <FaCheck className="w-3 h-3 mr-1" />
                完成任务
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* 任务状态和负责人信息 */}
            <div className="bg-card-bg rounded-lg shadow-sm overflow-hidden border border-card-border dark:border-neutral-700">
              <div className="px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <FaClipboardList className="text-indigo-600 w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">优化用户注册流程</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                      进行中
                    </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                      <FaUserAlt className="text-gray-400 w-4 h-4 mr-2" />
                      <span className="text-sm text-gray-600">负责人: 赵明</span>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-gray-400 w-4 h-4 mr-2" />
                      <span className="text-sm text-gray-600">截止日期: 2023-08-30</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 任务描述 */}
              <div className="px-6 py-5 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                    <svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-base font-medium text-gray-700">需求</span>
                </div>
                <ul className="list-none space-y-3 pl-8">
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2 mt-0.5 text-lg">•</span>
                    <span className="text-gray-700">重新设计注册表单字段布局</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2 mt-0.5 text-lg">•</span>
                    <span className="text-gray-700">优化手机号/邮箱验证流程</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2 mt-0.5 text-lg">•</span>
                    <span className="text-gray-700">错误提示友好化</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2 mt-0.5 text-lg">•</span>
                    <span className="text-gray-700">实现表单字段实时校验</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-500 mr-2 mt-0.5 text-lg">•</span>
                    <span className="text-gray-700">增加社交媒体快速注册选项</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 标签页导航 */}
            <div className="bg-card-bg rounded-lg shadow-sm overflow-hidden border border-card-border dark:border-neutral-700">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                      onClick={() => setActiveTab('subtasks')}
                      className={`py-4 px-6 font-medium text-sm flex items-center border-b-2 ${
                          activeTab === 'subtasks'
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <FaListAlt className={`mr-2 ${activeTab === 'subtasks' ? 'text-indigo-500' : 'text-gray-400'}`} />
                    子任务
                  </button>
                  <button
                      onClick={() => setActiveTab('communication')}
                      className={`py-4 px-6 font-medium text-sm flex items-center border-b-2 ${
                          activeTab === 'communication'
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <FaComments className={`mr-2 ${activeTab === 'communication' ? 'text-indigo-500' : 'text-gray-400'}`} />
                    沟通需求
                  </button>
                  <button
                      onClick={() => setActiveTab('resources')}
                      className={`py-4 px-6 font-medium text-sm flex items-center border-b-2 ${
                          activeTab === 'resources'
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <FaFileAlt className={`mr-2 ${activeTab === 'resources' ? 'text-indigo-500' : 'text-gray-400'}`} />
                    相关资源
                  </button>
                  <button
                      onClick={() => setActiveTab('timeline')}
                      className={`py-4 px-6 font-medium text-sm flex items-center border-b-2 ${
                          activeTab === 'timeline'
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <FaHistory className={`mr-2 ${activeTab === 'timeline' ? 'text-indigo-500' : 'text-gray-400'}`} />
                    协作记录
                  </button>
                </nav>
              </div>

              <div className="px-6 py-5">
                {/* 子任务标签页内容 */}
                {activeTab === 'subtasks' && (
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                            <svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <span className="text-base font-medium text-gray-700">子任务</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">3/5</span>
                        </div>
                      </div>

                      <ul className="space-y-3 pl-8">
                        <li className="border border-gray-200 rounded-lg p-3 bg-green-50 group">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 cursor-pointer">
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-2 mr-2 text-gray-500 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="ml-1 flex-1">
                              <p className="text-sm font-medium text-gray-700">竞争对手分析</p>
                            </div>
                            <div className="ml-auto flex items-center space-x-2">
                              <span className="text-sm text-gray-500">赵明</span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                <button className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100">
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                                <button className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100">
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">)
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>

                        <li className="border border-gray-200 rounded-lg p-3 bg-green-50 group">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 cursor-pointer">
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            </div>
                            <div className="ml-2 mr-2 text-gray-500 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="ml-1 flex-1">
                              <p className="text-sm font-medium text-gray-700">表单 UI 设计</p>
                            </div>
                            <div className="ml-auto flex items-center space-x-2">
                              <span className="text-sm text-gray-500">林婷</span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                <button className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100">
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                                <button className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100">
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>

                        <li className="border border-gray-200 rounded-lg p-3 group">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 cursor-pointer">
                              <div className="w-5 h-5 border-2 border-indigo-300 rounded-full hover:border-indigo-500 transition-colors"></div>
                            </div>
                            <div className="ml-2 mr-2 text-gray-500 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="ml-1 flex-1">
                              <p className="text-sm font-medium text-gray-700">后端验证逻辑开发</p>
                            </div>
                            <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 9V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12 17.5V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            高风险
                          </span>
                              <span className="text-sm text-gray-500">王杰</span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                                <button className="p-1 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100">
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                                <button className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100">
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>

                        <li className="mt-4">
                          <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                            <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            添加子任务
                          </button>
                        </li>
                      </ul>
                    </div>
                )}

                {/* 沟通需求标签页内容 */}
                {activeTab === 'communication' && (
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                          <svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-base font-medium text-gray-700">沟通需求</span>
                      </div>

                      {/* 评论列表 */}
                      <div className="space-y-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">张</div>
                          </div>
                          <div className="ml-3 bg-gray-50 p-3 rounded-lg w-full">
                            <div className="flex items-center mb-1">
                              <span className="font-medium text-sm text-gray-800">张小明</span>
                              <span className="ml-2 text-xs text-gray-500">产品经理</span>
                              <span className="ml-auto text-xs text-gray-500">昨天 14:30</span>
                            </div>
                            <p className="text-sm text-gray-700">我们需要确保注册流程中的验证码功能正常工作，目前测试环境中偶尔会出现验证码发送失败的情况。</p>
                            <div className="mt-2 flex">
                              <button className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center">
                                <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                回复
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">王</div>
                          </div>
                          <div className="ml-3 bg-gray-50 p-3 rounded-lg w-full">
                            <div className="flex items-center mb-1">
                              <span className="font-medium text-sm text-gray-800">王杰</span>
                              <span className="ml-2 text-xs text-gray-500">后端开发</span>
                              <span className="ml-auto text-xs text-gray-500">今天 09:15</span>
                            </div>
                            <p className="text-sm text-gray-700">已经排查了验证码发送失败的问题，是短信服务提供商的API偶尔响应超时导致的。我们已经添加了重试机制，并在测试环境验证通过。</p>
                            <div className="mt-2 flex">
                              <button className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center">
                                <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                回复
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 评论输入框 */}
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">我</div>
                        </div>
                        <div className="ml-3 w-full">
                          <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                        <textarea
                            className="w-full p-3 text-sm text-gray-700 border-none focus:outline-none resize-none"
                            placeholder="输入评论或需求..."
                            rows={3}
                        ></textarea>
                            <div className="bg-gray-50 px-3 py-2 flex justify-between items-center">
                              <div className="flex space-x-2">
                                <button className="p-1 text-gray-500 hover:text-indigo-600 rounded hover:bg-gray-100">
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                                <button className="p-1 text-gray-500 hover:text-indigo-600 rounded hover:bg-gray-100">
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                                <button className="p-1 text-gray-500 hover:text-indigo-600 rounded hover:bg-gray-100">
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                                <button className="p-1 text-gray-500 hover:text-indigo-600 rounded hover:bg-gray-100">
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                              <button className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                发送
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                )}

                {/* 相关资源标签页内容 */}
                {activeTab === 'resources' && (
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                          <svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-base font-medium text-gray-700">相关资源</span>
                      </div>
                      <ul className="space-y-3 pl-8">
                        <li className="border border-gray-200 rounded-lg p-3 flex items-center hover:bg-gray-50 transition-colors duration-150">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M7 21H17C18.1046 21 19 20.1046 19 19V9.41421C19 9.149 18.8946 8.89464 18.7071 8.70711L13.2929 3.29289C13.1054 3.10536 12.851 3 12.5858 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M13 3V8C13 8.55228 13.4477 9 14 9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">用户注册流程问题报告.pdf</p>
                          </div>
                        </li>

                        <li className="border border-gray-200 rounded-lg p-3 flex items-center hover:bg-gray-50 transition-colors duration-150">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M13.8284 10.1716C12.2663 8.60948 9.73367 8.60948 8.17157 10.1716L4.17157 14.1716C2.60948 15.7337 2.60948 18.2663 4.17157 19.8284C5.73367 21.3905 8.26633 21.3905 9.82843 19.8284L10.93 18.7268" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10.1716 13.8284C11.7337 15.3905 14.2663 15.3905 15.8284 13.8284L19.8284 9.82843C21.3905 8.26633 21.3905 5.73367 19.8284 4.17157C18.2663 2.60948 15.7337 2.60948 14.1716 4.17157L13.072 5.27118" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">用户增长数据看板链接</p>
                          </div>
                        </li>

                        <li className="border border-gray-200 rounded-lg p-3 flex items-center hover:bg-gray-50 transition-colors duration-150">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-yellow-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">新版 UI 设计稿_Final.sketch</p>
                          </div>
                        </li>

                        <li className="mt-4">
                          <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                            <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            添加资源
                          </button>
                        </li>
                      </ul>
                    </div>
                )}

                {/* 协作记录标签页内容 */}
                {activeTab === 'timeline' && (
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
                          <svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 16.9706 20 12 20C10.4607 20 9.01172 19.6565 7.74467 19.0511L3 20L4.39499 16.28C3.51156 15.0423 3 13.5743 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-base font-medium text-gray-700">协作记录</span>
                      </div>
                      <div className="relative pl-8">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-100"></div>

                        <div className="relative mb-6">
                          <div className="flex items-center mb-2">
                            <div className="z-10 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium">赵</div>
                            <div className="ml-3">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-gray-800">赵明</p>
                                <span className="ml-auto text-xs text-gray-500">08-27 10:00</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-11 p-3 bg-indigo-600 text-white rounded-lg shadow-sm">
                            <p className="text-sm">@王杰 请确认接口文档</p>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="flex items-center mb-2">
                            <div className="z-10 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium">王</div>
                            <div className="ml-3">
                              <div className="flex items-center">
                                <p className="text-sm font-medium text-gray-800">王杰</p>
                                <span className="ml-auto text-xs text-gray-500">08-27 14:30</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-11 p-3 bg-indigo-600 text-white rounded-lg shadow-sm">
                            <p className="text-sm">已更新接口字段，见 API_v2.md</p>
                          </div>
                        </div>
                      </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};
