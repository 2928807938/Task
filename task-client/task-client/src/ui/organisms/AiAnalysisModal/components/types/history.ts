import {AnalysisData, ChatMessage} from '../types';

/**
 * 分析历史记录项
 */
export interface AnalysisHistory {
  id: string;          // 唯一标识符
  title: string;       // 历史记录标题（基于第一条用户消息）
  createdAt: string;   // 创建时间ISO字符串
  messages: ChatMessage[]; // 对话消息集合
  analysisData: AnalysisData; // 分析结果数据
  projectId: string;   // 关联的项目ID
}

/**
 * 历史记录状态
 */
export interface HistoryState {
  histories: AnalysisHistory[];
  isDrawerOpen: boolean;
  currentHistoryId: string | null;
}

/**
 * 历史记录操作类型
 */
export enum HistoryActionType {
  ADD_HISTORY = 'ADD_HISTORY',
  UPDATE_HISTORY = 'UPDATE_HISTORY',
  DELETE_HISTORY = 'DELETE_HISTORY',
  TOGGLE_DRAWER = 'TOGGLE_DRAWER',
  SET_CURRENT_HISTORY = 'SET_CURRENT_HISTORY',
  LOAD_HISTORIES = 'LOAD_HISTORIES',
}

/**
 * 历史记录操作
 */
export type HistoryAction =
  | { type: HistoryActionType.ADD_HISTORY; payload: AnalysisHistory }
  | { type: HistoryActionType.UPDATE_HISTORY; payload: AnalysisHistory }
  | { type: HistoryActionType.DELETE_HISTORY; payload: string }
  | { type: HistoryActionType.TOGGLE_DRAWER; payload: boolean }
  | { type: HistoryActionType.SET_CURRENT_HISTORY; payload: string | null }
  | { type: HistoryActionType.LOAD_HISTORIES; payload: AnalysisHistory[] };
