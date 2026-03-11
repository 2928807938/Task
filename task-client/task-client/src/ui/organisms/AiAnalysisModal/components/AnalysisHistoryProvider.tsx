"use client";

import React, {createContext, useContext, useEffect, useReducer} from 'react';
import {AnalysisHistory, HistoryAction, HistoryActionType, HistoryState} from './types/history';

// 创建上下文
const AnalysisHistoryContext = createContext<{
  state: HistoryState;
  dispatch: React.Dispatch<HistoryAction>;
} | undefined>(undefined);

// 本地存储键
const STORAGE_KEY = 'analysis_history';

// 初始状态
const initialState: HistoryState = {
  histories: [],
  isDrawerOpen: false,
  currentHistoryId: null,
};

// 历史记录reducer
function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case HistoryActionType.ADD_HISTORY:
      return {
        ...state,
        histories: [action.payload, ...state.histories], // 新记录放在最前面
      };

    case HistoryActionType.UPDATE_HISTORY:
      return {
        ...state,
        histories: state.histories.map(history =>
          history.id === action.payload.id ? action.payload : history
        ),
      };

    case HistoryActionType.DELETE_HISTORY:
      return {
        ...state,
        histories: state.histories.filter(history => history.id !== action.payload),
        currentHistoryId: state.currentHistoryId === action.payload ? null : state.currentHistoryId,
      };

    case HistoryActionType.TOGGLE_DRAWER:
      return {
        ...state,
        isDrawerOpen: action.payload,
      };

    case HistoryActionType.SET_CURRENT_HISTORY:
      return {
        ...state,
        currentHistoryId: action.payload,
      };

    case HistoryActionType.LOAD_HISTORIES:
      return {
        ...state,
        histories: action.payload,
      };

    default:
      return state;
  }
}

// Provider组件
export const AnalysisHistoryProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, dispatch] = useReducer(historyReducer, initialState);

  // 初始化时从本地存储加载历史记录
  useEffect(() => {
    try {
      const storedHistories = localStorage.getItem(STORAGE_KEY);
      if (storedHistories) {
        const histories = JSON.parse(storedHistories) as AnalysisHistory[];
        dispatch({
          type: HistoryActionType.LOAD_HISTORIES,
          payload: histories
        });
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  }, []);

  // 当历史记录变化时，保存到本地存储
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.histories));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }, [state.histories]);

  return (
    <AnalysisHistoryContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalysisHistoryContext.Provider>
  );
};

// 自定义Hook，用于在组件中访问历史记录上下文
export const useAnalysisHistory = () => {
  const context = useContext(AnalysisHistoryContext);
  if (context === undefined) {
    throw new Error('useAnalysisHistory必须在AnalysisHistoryProvider内使用');
  }
  return context;
};

// 生成唯一ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 根据消息内容生成标题
export const generateTitle = (message: string): string => {
  // 截取消息的前20个字符作为标题，如果超过20个字符，添加省略号
  return message.length > 20 ? `${message.substring(0, 20)}...` : message;
};
