'use client';

import React, {useState} from 'react';
import type {IconType} from 'react-icons';
import {
  FaArrowRight,
  FaCalendarAlt,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaComments,
  FaEllipsisH,
  FaFileAlt,
  FaFlag,
  FaHashtag,
  FaHistory,
  FaLayerGroup,
  FaLink,
  FaMagic,
  FaPaperclip,
  FaPlayCircle,
  FaRocket,
  FaShieldAlt,
  FaUserAlt,
  FaUsers
} from 'react-icons/fa';

type ActiveTab = 'subtasks' | 'communication' | 'resources' | 'timeline';

interface TaskDetailTemplateProps {
  taskId: string;
}

type TaskStatus = '进行中' | '待评审' | '已完成';
type TaskPriority = 'P0 高优' | 'P1 中优' | 'P2 低优';

interface MetricItem {
  label: string;
  value: string;
  hint: string;
  icon: IconType;
}

interface SubtaskItem {
  title: string;
  owner: string;
  due: string;
  status: TaskStatus;
  priority: TaskPriority;
}

interface CommentItem {
  author: string;
  role: string;
  time: string;
  content: string;
}

interface ResourceItem {
  title: string;
  type: string;
  detail: string;
}

interface TimelineItem {
  title: string;
  time: string;
  description: string;
}

const metrics: MetricItem[] = [
  {label: '当前进度', value: '72%', hint: '已完成 8 / 11 项关键动作', icon: FaChartLine},
  {label: '协作成员', value: '06 人', hint: '产品、设计、前后端同步推进', icon: FaUsers},
  {label: '剩余工时', value: '18h', hint: '预计本周五前可进入提测', icon: FaClock},
  {label: '风险等级', value: '中等', hint: '验证码与风控联调需重点关注', icon: FaShieldAlt}
];

const subtasks: SubtaskItem[] = [
  {title: '注册路径与表单信息架构优化', owner: '林一', due: '今天 18:00', status: '已完成', priority: 'P1 中优'},
  {title: '验证码流程与错误反馈视觉统一', owner: '周舟', due: '明天 14:00', status: '进行中', priority: 'P0 高优'},
  {title: '第三方登录入口层级重构', owner: '王杰', due: '3 月 21 日', status: '进行中', priority: 'P1 中优'},
  {title: '埋点校验与转化率监控看板确认', owner: '陈果', due: '3 月 22 日', status: '待评审', priority: 'P2 低优'}
];

const comments: CommentItem[] = [
  {
    author: '赵明',
    role: '产品经理',
    time: '10:24',
    content: '首屏要突出邮箱注册主路径，手机号注册保留在次层，避免用户初见时出现选择负担。'
  },
  {
    author: '林一',
    role: '设计师',
    time: '11:10',
    content: '我会把错误提示统一成内联 + 底部 toast 双反馈，保证移动端输入时依旧看得见。'
  },
  {
    author: '王杰',
    role: '后端',
    time: '13:45',
    content: '接口字段保持不变，前端只要沿用现有注册与验证码校验 API 即可，不需要额外联调改动。'
  }
];

const resources: ResourceItem[] = [
  {title: '注册页高保真视觉稿', type: 'Figma', detail: '包含 Web / iOS / Android 三端适配规范'},
  {title: '注册流程埋点文档', type: 'Doc', detail: '追踪曝光、点击、错误、提交成功 4 类事件'},
  {title: '验证码文案资源表', type: 'Sheet', detail: '多状态文案、频控提示与异常兜底说明'},
  {title: '历史优化回顾', type: 'Notion', detail: '沉淀上个版本掉线点与用户反馈摘要'}
];

const timeline: TimelineItem[] = [
  {title: '需求冻结', time: '3 月 17 日 09:30', description: '明确只做视觉与交互层优化，保持接口、参数和数据结构不变。'},
  {title: '设计评审', time: '3 月 18 日 14:00', description: '确认新版信息层级、状态表达和移动端折叠方案。'},
  {title: '开发联调', time: '3 月 20 日 11:00', description: '前端完成样式接入，联调现有接口并检查异常场景。'},
  {title: '灰度发布', time: '3 月 22 日 17:30', description: '观察注册转化、验证码发送成功率与表单报错分布。'}
];

const tabOptions: Array<{key: ActiveTab; label: string; icon: IconType}> = [
  {key: 'subtasks', label: '执行清单', icon: FaLayerGroup},
  {key: 'communication', label: '协作沟通', icon: FaComments},
  {key: 'resources', label: '资源附件', icon: FaPaperclip},
  {key: 'timeline', label: '进度时间线', icon: FaHistory}
];

const statusTone: Record<TaskStatus, string> = {
  进行中: 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300',
  待评审: 'bg-warning-100 text-warning-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  已完成: 'bg-success-100 text-success-700 dark:bg-emerald-900/30 dark:text-emerald-300'
};

const priorityTone: Record<TaskPriority, string> = {
  'P0 高优': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'P1 中优': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'P2 低优': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
};

const avatarPalette = [
  'from-violet-500 to-fuchsia-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500'
];

const cardTitleClass = 'text-base font-semibold text-neutral-900 dark:text-neutral-100';
const cardDescClass = 'text-sm leading-6 text-neutral-500 dark:text-neutral-400';

function DetailCard({
  title,
  description,
  action,
  children,
  className = ''
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface-card p-5 sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className={cardTitleClass}>{title}</h2>
          {description ? <p className={`${cardDescClass} mt-1`}>{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export const TaskDetailTemplate: React.FC<TaskDetailTemplateProps> = ({ taskId }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('subtasks');
  const progress = 72;

  return (
    <div className="dashboard-shell min-h-screen w-full -m-2 px-3 py-4 sm:-m-3 sm:px-4 sm:py-5 md:-m-4 md:px-6 md:py-6">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <section className="surface-card-strong relative overflow-hidden p-5 sm:p-7">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-primary-300/20 blur-3xl dark:bg-primary-500/20" />
            <div className="absolute right-0 top-8 h-44 w-44 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/20" />
          </div>

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 dark:bg-slate-900/60">
                  <FaHashtag className="text-[11px]" /> TASK-{taskId}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                  <FaPlayCircle className="text-[11px]" /> 进行中
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                  <FaFlag className="text-[11px]" /> P0 高优
                </span>
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                  优化用户注册流程
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 dark:text-neutral-300 sm:text-base">
                  重构任务详情的信息层级，让状态、负责人、排期、子任务与协作内容一屏可读；本次仅调整前端视觉与交互表现，后端接口、字段与请求流程全部保持不变。
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-2 dark:border-slate-700/70 dark:bg-slate-900/60">
                  <FaUserAlt className="text-primary-500" /> 负责人：赵明
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-2 dark:border-slate-700/70 dark:bg-slate-900/60">
                  <FaCalendarAlt className="text-primary-500" /> 截止：2026 年 3 月 22 日
                </span>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-4 py-2 dark:border-slate-700/70 dark:bg-slate-900/60">
                  <FaRocket className="text-primary-500" /> 所属项目：增长体验优化
                </span>
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 xl:max-w-md">
              <div className="grid grid-cols-2 gap-3">
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-700">
                  <FaMagic className="text-sm" /> 更新视觉稿
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-card-border bg-white/80 px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/70 dark:text-neutral-200 dark:hover:bg-slate-900">
                  <FaCheckCircle className="text-sm text-emerald-500" /> 标记完成
                </button>
              </div>

              <div className="rounded-[24px] border border-white/60 bg-white/80 p-4 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">完成进度</p>
                    <p className="mt-2 text-3xl font-semibold text-neutral-900 dark:text-white">{progress}%</p>
                  </div>
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(var(--theme-primary-500) ${progress * 3.6}deg, rgba(148, 163, 184, 0.16) 0deg)`
                    }}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-semibold text-neutral-800 dark:bg-slate-950 dark:text-neutral-100">
                      {progress}
                    </div>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-sky-500" style={{width: `${progress}%`}} />
                </div>
                <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                  当前处于 UI 收敛阶段，接下来重点处理错误反馈一致性与移动端可读性。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({label, value, hint, icon: Icon}) => (
            <div key={label} className="surface-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{value}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                  <Icon className="text-base" />
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{hint}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_380px]">
          <div className="space-y-6">
            <DetailCard
              title="任务概览"
              description="将任务详情重构为更接近产品工作台的阅读方式，把关键上下文放在首屏。"
              action={
                <button className="inline-flex items-center gap-2 rounded-full border border-card-border px-3 py-1.5 text-xs font-semibold text-neutral-500 transition hover:text-neutral-800 dark:border-slate-700 dark:text-neutral-400 dark:hover:text-neutral-100">
                  查看原型 <FaArrowRight className="text-[10px]" />
                </button>
              }
            >
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.9fr)]">
                <div className="rounded-[22px] bg-neutral-50 p-5 dark:bg-slate-900/70">
                  <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-300">
                    当前页面的主要问题是信息分散、层级不清、视觉重点不足。新版方案会把任务标题、状态、进度、排期和协作成员放到统一头部区域，正文采用卡片化结构来收纳描述、子任务、附件和时间线，提升扫描效率。
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {['首屏展示核心决策信息', '子任务与进度统一表达', '沟通与附件改为工作区布局', '支持桌面端与移动端同构阅读'].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:text-neutral-200"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <FaCheckCircle className="text-xs" />
                        </span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[22px] bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 p-5 text-white shadow-lg shadow-slate-900/20">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">体验目标</p>
                  <ul className="mt-4 space-y-4 text-sm leading-6 text-white/85">
                    <li className="flex gap-3">
                      <FaMagic className="mt-1 text-primary-300" />
                      让负责人和截止时间在首屏 3 秒内可识别。
                    </li>
                    <li className="flex gap-3">
                      <FaLayerGroup className="mt-1 text-sky-300" />
                      用一致的卡片视觉承载不同类型的信息块。
                    </li>
                    <li className="flex gap-3">
                      <FaLink className="mt-1 text-emerald-300" />
                      保持现有接口结构不变，避免联动后端改造成本。
                    </li>
                  </ul>
                </div>
              </div>
            </DetailCard>

            <DetailCard
              title="执行工作区"
              description="围绕子任务、沟通、资源和时间线组织同一块内容区域。"
              action={
                <div className="app-segmented">
                  {tabOptions.map(({key, label, icon: Icon}) => {
                    const isActive = activeTab === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`app-segmented-item ${isActive ? 'app-segmented-item-active' : ''}`}
                        type="button"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon className="text-[12px]" />
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              }
            >
              {activeTab === 'subtasks' && (
                <div className="space-y-3">
                  {subtasks.map((item, index) => (
                    <div
                      key={item.title}
                      className="flex flex-col gap-4 rounded-[22px] border border-card-border/70 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/70 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-semibold text-white dark:bg-primary-500">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</h3>
                          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            负责人 {item.owner} · 截止 {item.due}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone[item.status]}`}>
                          {item.status}
                        </span>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityTone[item.priority]}`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'communication' && (
                <div className="space-y-4">
                  {comments.map((item, index) => (
                    <div key={`${item.author}-${item.time}`} className="flex gap-4 rounded-[22px] bg-neutral-50 p-4 dark:bg-slate-900/70">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarPalette[index % avatarPalette.length]} text-sm font-semibold text-white`}>
                        {item.author.slice(0, 1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{item.author}</span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">{item.role}</span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">{item.time}</span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-neutral-600 dark:text-neutral-300">{item.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="grid gap-3 md:grid-cols-2">
                  {resources.map((item) => (
                    <div key={item.title} className="rounded-[22px] border border-dashed border-card-border p-4 dark:border-slate-700">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                            <FaFileAlt />
                          </span>
                          <div>
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</h3>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.type}</p>
                          </div>
                        </div>
                        <button className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-slate-800 dark:hover:text-neutral-200">
                          <FaEllipsisH className="text-xs" />
                        </button>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{item.detail}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-5">
                  {timeline.map((item, index) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                          <FaHistory className="text-sm" />
                        </span>
                        {index !== timeline.length - 1 ? <span className="mt-2 h-full w-px bg-card-border dark:bg-slate-700" /> : null}
                      </div>
                      <div className="flex-1 rounded-[22px] bg-neutral-50 p-4 dark:bg-slate-900/70">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</h3>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">{item.time}</span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-neutral-600 dark:text-neutral-300">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DetailCard>
          </div>

          <div className="space-y-6">
            <DetailCard title="任务信息" description="保留原有数据语义，只提升展示密度与识别效率。">
              <div className="space-y-4">
                {[
                  ['任务类型', '体验优化 / 主任务'],
                  ['当前阶段', '设计定稿 → 开发还原'],
                  ['排期周期', '2026.03.17 - 2026.03.22'],
                  ['关联模块', '登录注册、验证码、埋点分析'],
                  ['依赖项', '验证码组件样式统一、文案资源确认']
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 border-b border-dashed border-card-border pb-4 last:border-b-0 last:pb-0 dark:border-slate-700">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
                    <span className="max-w-[220px] text-right text-sm font-medium text-neutral-800 dark:text-neutral-200">{value}</span>
                  </div>
                ))}
              </div>
            </DetailCard>

            <DetailCard title="协作成员" description="快速查看当前参与者与职责边界。">
              <div className="space-y-3">
                {[
                  ['赵明', '产品负责人', '需求优先级 / 排期协调'],
                  ['林一', '视觉设计', '界面结构 / 视觉稿输出'],
                  ['周舟', '前端开发', '样式实现 / 交互细节落地'],
                  ['王杰', '后端支持', '接口确认 / 联调答疑']
                ].map(([name, role, desc], index) => (
                  <div key={name} className="flex gap-3 rounded-[20px] bg-neutral-50 p-3 dark:bg-slate-900/70">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarPalette[index % avatarPalette.length]} text-sm font-semibold text-white`}>
                      {name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{name}</span>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">{role}</span>
                      </div>
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DetailCard>

            <DetailCard title="设计备注" description="本次改造边界和落地方向统一收口。">
              <div className="rounded-[22px] bg-gradient-to-br from-primary-50 via-white to-sky-50 p-4 text-sm leading-7 text-neutral-600 dark:from-primary-950/30 dark:via-slate-950 dark:to-sky-950/20 dark:text-neutral-300">
                页面会优先强化视觉层次、卡片节奏和重点信息的露出方式，不变更任何接口调用、字段映射与后端数据处理逻辑。后续如果你希望，我也可以继续把这里的静态占位内容替换成真实接口数据绑定，但那会只做前端消费层，不改后端。
              </div>
            </DetailCard>
          </div>
        </section>
      </div>
    </div>
  );
};
