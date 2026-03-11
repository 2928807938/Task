/**
 * 任务状态趋势数据相关类型定义
 */

// 任务状态项
export interface TaskStatusItem {
  id: string;    // 状态ID
  name: string;  // 状态名称
  color: string; // 状态颜色
}

// 任务状态趋势数据
export interface TaskStatusTrend {
  timeLabels: string[];                  // 时间标签数组（例如："12月", "1月", "2月"等）
  statusList: TaskStatusItem[];          // 状态项列表
  statusTrends: Record<string, number[]>; // 状态趋势数据：key为状态ID，value为该状态在各个时间点的任务数量
}
