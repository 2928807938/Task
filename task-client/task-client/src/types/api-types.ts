/**
 * API响应类型定义
 * 与后端的ApiResponse对应
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  code: string;
  message: string | null;
  timestamp: string;
}

/**
 * 用户相关接口请求类型
 */
export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SendEmailVerificationCodeRequest {
  email: string;
  type: string; // 验证码类型，如'register'、'login'、'reset-password'等
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  token: string; // JWT令牌
  authorities?: { items: string[] }; // 用户权限列表
}

/**
 * 团队相关接口类型
 */
export interface CreateTeamRequest {
  name: string; // 团队名称，长度1-50个字符
  description: string; // 团队描述，最大长度200个字符
}

export interface TeamInfo {
  id: string; // 团队ID
  name: string; // 团队名称
  description: string; // 团队描述
  createdAt?: string; // 创建时间
  updatedAt?: string; // 更新时间
}

/**
 * 项目配置相关类型
 */
export interface PriorityItem {
  id: string;
  name: string;
  color: string;
  order: number; // 优先级排序值，数值越小优先级越高
}

export interface StatusItem {
  id: string;
  name: string;
  color: string;
  order: number; // 状态排序值，决定状态在流程中的先后顺序
}

// 状态转换规则类型
export interface StatusTransitionRule {
  fromStatusId: string; // 源状态ID
  toStatusId: string; // 目标状态ID
}

// 优先级体系类型
export type PrioritySystem = 'standard' | 'advanced' | 'custom';

// 状态体系类型
export type StatusSystem = 'standard' | 'extended' | 'custom';

export interface ProjectConfig {
  prioritySystem: PrioritySystem;
  statusSystem: StatusSystem;
  customPriorityItems: PriorityItem[];
  customStatusItems: StatusItem[];
  customStatusTransitions?: StatusTransitionRule[]; // 自定义状态转换规则
}

/**
 * 项目相关接口类型
 */
export interface CreateProjectRequest {
  name: string;
  description: string;
  teamId: string;
  prioritySystem: PrioritySystem;
  statusSystem: StatusSystem;
  customPriorityItems?: PriorityItem[];
  customStatusItems?: StatusItem[];
  customStatusTransitions?: StatusTransitionRule[];
}

export interface ProjectInfo {
  id: string;
  name: string;
  description: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 项目列表相关接口类型
 */
export interface ProjectPageRequest {
  pageNum: number; // 页码，从1开始
  pageSize: number; // 每页记录数
  name?: string; // 搜索项目名称
  sortField?: string; // 排序字段，如createdAt
  sortOrder?: 'asc' | 'desc'; // 排序方向，asc升序或desc降序
}

export interface ProjectListItem {
  id: string; // 项目ID
  name: string; // 项目名称
  description: string; // 项目描述
  status: string; // 项目状态
  progress: number; // 项目进度（百分比）
  startDate: string; // 项目开始日期
  archived: boolean; // 是否归档
  ownerId: string; // 项目所有者ID
  ownerName: string; // 项目所有者名称
  memberCount: number; // 项目成员数量
  createdAt: string; // 项目创建时间
  updatedAt: string; // 项目最后更新时间
}

export interface ProjectPageResponse {
  content: ProjectListItem[]; // 项目列表数据
  total: number; // 总记录数
  pages: number; // 总页数
}

/**
 * 项目详情响应类型
 */
export interface ProjectDetailResponse {
  id: string; // 项目ID
  name: string; // 项目名称
  description: string; // 项目描述
  visibility: 'PUBLIC' | 'PRIVATE'; // 项目可见性
  teamId: string; // 所属团队ID
  teamName: string; // 所属团队名称
  ownerId: string; // 项目所有者ID
  ownerName: string; // 项目所有者名称
  ownerAvatar: string; // 项目所有者头像URL
  memberCount: number; // 项目成员数量
  taskCount: number; // 项目任务总数
  completedTaskCount: number; // 项目已完成任务数
  progress: number; // 项目整体进度（百分比）
  archived: boolean; // 是否已归档
  taskStatusTrend: {
    timeLabels: string[]; // 时间标签数组（例如：月份标签"12月", "1月", "2月"等）
    statusList: {
      id: string; // 状态ID
      name: string; // 状态名称
      color: string; // 状态颜色
    }[]; // 状态列表数组
    statusTrends: Record<string, number[]>; // 状态趋势数据：key为状态ID，value为该状态在各个时间点的任务数量
  };
  createdAt: string; // 项目创建时间
  updatedAt: string; // 项目最后更新时间
  tasks: ProjectTask[]; // 项目任务列表
  members: ProjectMember[]; // 项目成员列表
}

/**
 * 项目任务类型
 */
export interface ProjectTask {
  id: string; // 任务ID
  title: string; // 任务标题
  description: string; // 任务描述
  status: 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'WAITING'; // 任务状态
  statusId?: string; // 任务状态ID，用于关联状态列
  statusColor: string; // 任务状态颜色
  priority: 'HIGH' | 'MEDIUM' | 'LOW'; // 任务优先级
  priorityColor: string; // 任务优先级颜色
  assigneeId: string; // 任务负责人ID
  assignee: string; // 任务负责人姓名
  assigneeAvatar: string; // 任务负责人头像URL
  progress: number; // 任务进度（百分比）
  createdAt: string; // 任务创建时间
  startTime: string; // 任务开始时间
  dueDate: string; // 任务截止日期
  completedAt: string | null; // 任务完成时间
  parentId: string | null; // 父任务ID，如果为null则表示是主任务（旧版API字段）
  parentTaskId: string | null; // 父任务ID，如果为null则表示是主任务（新版API字段）
  subTasks?: ProjectTask[]; // 子任务列表
}

/**
 * 任务及其子任务详细信息接口
 */
export interface TaskWithSubtasks {
  mainTask: ProjectTask; // 主任务信息
  subTasks: ProjectTask[]; // 子任务列表
  totalTaskCount: number; // 任务总数（主任务+子任务）
  completedTaskCount: number; // 已完成任务数量
  overallProgress: number; // 总体进度（0-100）
}

/**
 * 项目成员类型
 */
export interface ProjectMember {
  id: string; // 成员ID
  name: string; // 成员名称
  email: string; // 成员邮箱
  avatar: string; // 成员头像URL
  role: 'OWNER' | 'ADMIN' | 'MEMBER'; // 成员角色
  joinedAt: string; // 加入时间
  taskCount: number; // 成员负责的任务数量
}

/**
 * 项目角色类型
 */
export interface ProjectRoleItem {
  id: string;
  name: string;
  description: string;
  system: boolean; // 是否为系统预设的管理员角色，这类角色不可被修改或删除
  [key: string]: any; // 允许其他属性
}

/**
 * 添加项目成员请求类型
 */
export interface AddProjectMemberRequest {
  projectId: string; // 项目ID
  userId?: string; // 用户ID（通过ID添加现有用户）
  email?: string; // 邮箱地址（通过邮箱邀请新用户）
  role: string; // 成员角色ID
}

/**
 * 用户搜索结果中的用户项
 */
export interface UserSearchItem {
  id: string;          // 用户ID
  name: string;        // 用户名称
  email: string;       // 用户邮箱
  avatar?: string;     // 用户头像
  department?: string; // 用户部门
  isSelf: boolean;     // 是否为当前登录用户
  isInProject: boolean; // 是否已在项目中
}

/**
 * 用户搜索结果
 */
export interface UserSearchResult {
  items: UserSearchItem[]; // 用户列表
}

/**
 * 任务分布统计数据类型
 */
export interface TaskCompletionData {
  completionPercent: number; // 完成度百分比
  completed: number; // 已完成任务数
  total: number; // 总任务数
}

export interface PriorityItem {
  id: string;
  name: string;
  color: string;
  order: number; // 优先级排序值，数值越小优先级越高
}

/**
 * 任务分布中的优先级项
 */
export interface PriorityDistributionItem {
  id: string; // 优先级ID
  name: string; // 优先级名称
  color: string; // 优先级颜色
  level: number; // 优先级等级
  score?: number; // 优先级分数(0-100)
  count: number; // 任务数量
  percent: number; // 任务占比(百分比)
}

export interface PriorityDistributionData {
  items: PriorityDistributionItem[]; // 优先级列表
  totalCount: number; // 总任务数量
}

export interface StatusItem {
  id: string;
  name: string;
  color: string;
  order: number; // 状态排序值，决定状态在流程中的先后顺序
}

/**
 * 任务分布中的状态项
 */
export interface StatusDistributionItem {
  id: string; // 状态ID
  name: string; // 状态名称
  color: string; // 状态颜色
  terminal: boolean; // 是否为终止状态
  count: number; // 任务数量
  percent: number; // 任务占比(百分比)
}

export interface StatusDistributionData {
  items: StatusDistributionItem[]; // 状态列表
  totalCount: number; // 总任务数量
}

export interface TaskDistributionData {
  completed: number; // 已完成任务数
  total: number; // 总任务数
  priorityDistribution: PriorityDistributionData;
  statusDistribution: StatusDistributionData;
}

/**
 * 创建任务接口类型
 */
export interface SubTaskItem {
  name: string; // 子任务名称
  description: string; // 子任务描述
  assigneeId: string; // 负责人ID
  hours: number; // 工时
  priorityScore: number; // 优先级分数(0-100)
  dependencies: string[]; // 依赖任务名称列表
}

export interface MainTask {
  name: string; // 任务名称
  description: string; // 任务描述
  assigneeId: string; // 负责人ID
  totalHours: number; // 总工时
  priorityScore: number; // 优先级分数(0-100)
  endTime?: string; // 截止时间 (ISO-8601格式)
}

export interface CreateTaskRequest {
  projectId: string; // 项目ID
  mainTask: MainTask; // 主任务信息
  subTasks?: SubTaskItem[]; // 子任务列表
}

export interface CreateTaskResponse {
  taskId: string; // 创建的主任务ID
  subTaskIds: string[]; // 创建的子任务ID列表
}

/**
 * 编辑任务接口类型
 */
export interface EditTaskRequest {
  taskId: string;      // 任务ID
  title: string;       // 任务标题
  description: string; // 任务描述
  statusId: string;    // 任务状态ID
  priorityId: string;  // 任务优先级ID
  assigneeId: string;  // 任务负责人ID
  dueDate: string;     // 任务截止日期
}
/**
 * 任务状态列表响应类型
 * 注意：API直接返回状态列表数组，而不是包含items字段的对象
 */
export type TaskStatusesResponse = StatusItem[]; // 任务可用的状态列表

/**
 * 任务评论相关类型定义
 */
export interface TaskComment {
  id: string; // 评论ID
  content: string; // 评论内容
  taskId: string; // 所属任务ID
  authorId: string; // 作者ID
  authorName: string; // 作者名称
  authorAvatar?: string; // 作者头像
  parentId?: string | null; // 父评论ID，null表示顶级评论
  level: number; // 评论层级，0为顶级评论
  mentionedUserIds: string[]; // @提及的用户ID列表
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
  replies?: TaskComment[]; // 子回复列表
  replyCount?: number; // 回复数量
}

/**
 * 评论树结构响应
 */
export interface TaskCommentsResponse {
  comments: TaskComment[]; // 评论树列表
  total: number; // 评论总数
  hasMore: boolean; // 是否有更多评论
}

/**
 * 创建评论请求
 */
export interface CreateCommentRequest {
  taskId: string; // 任务ID
  content: string; // 评论内容
  parentId?: string | null; // 父评论ID，可选
  mentionedUserIds?: string[]; // @提及的用户ID列表，可选
}

/**
 * 更新评论请求
 */
export interface UpdateCommentRequest {
  content: string; // 更新后的评论内容
  mentionedUserIds?: string[]; // @提及的用户ID列表，可选
}

/**
 * 评论统计信息
 */
export interface CommentStats {
  total: number; // 评论总数
  byLevel: Record<string, number>; // 按层级统计
  recent24h: number; // 最近24小时评论数
}

/**
 * 评论搜索请求
 */
export interface CommentSearchRequest {
  taskId: string; // 任务ID
  keyword?: string; // 搜索关键词
  authorId?: string; // 作者ID筛选
  startDate?: string; // 开始日期
  endDate?: string; // 结束日期
  page?: number; // 页码，从0开始
  size?: number; // 每页大小
}

/**
 * 用户@提及建议
 */
export interface UserMentionSuggestion {
  id: string; // 用户ID
  name: string; // 用户名称
  avatar?: string; // 用户头像
  email: string; // 用户邮箱
}

/**
 * @提及通知
 */
export interface MentionNotification {
  id: string; // 通知ID
  commentId: string; // 评论ID
  taskId: string; // 任务ID
  taskTitle: string; // 任务标题
  mentionerId: string; // 提及者ID
  mentionerName: string; // 提及者名称
  commentContent: string; // 评论内容片段
  createdAt: string; // 创建时间
  isRead: boolean; // 是否已读
}
