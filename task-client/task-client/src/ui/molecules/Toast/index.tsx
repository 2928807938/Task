'use client';

import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {FiAlertCircle, FiCheckCircle, FiInfo, FiX, FiXCircle} from 'react-icons/fi';

// 全局Toast函数引用，用于在组件外部调用
let globalAddToast: ((message: string, type: ToastType, duration?: number) => void) | null = null;
let toastSequence = 0;

const createToastId = () => {
  toastSequence += 1;
  return `toast-${Date.now()}-${toastSequence}`;
};

// 定义Toast类型
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// 定义Toast数据结构
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// 定义Toast上下文接口
interface ToastContextProps {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

// 创建Toast上下文
const ToastContext = createContext<ToastContextProps | undefined>(undefined);

// 创建Toast提供者组件
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // 添加Toast
  const addToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = createToastId();
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
  }, []);

  // 移除Toast
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // 在组件初始化时设置全局引用
  useEffect(() => {
    globalAddToast = addToast;

    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// 创建Toast容器组件
const ToastContainer: React.FC = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { toasts, removeToast } = context;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// 创建单个Toast项组件
const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const { message, type, duration = 3000 } = toast;

  // 自动关闭Toast
  useEffect(() => {
    if (duration !== Infinity) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // 根据类型获取图标和颜色
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: <FiCheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-500',
          textColor: 'text-white',
        };
      case 'error':
        return {
          icon: <FiXCircle className="w-5 h-5" />,
          bgColor: 'bg-red-500',
          textColor: 'text-white',
        };
      case 'warning':
        return {
          icon: <FiAlertCircle className="w-5 h-5" />,
          bgColor: 'bg-amber-500',
          textColor: 'text-white',
        };
      case 'info':
      default:
        return {
          icon: <FiInfo className="w-5 h-5" />,
          bgColor: 'bg-blue-500',
          textColor: 'text-white',
        };
    }
  };

  const { icon, bgColor, textColor } = getIconAndColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`${bgColor} ${textColor} rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-[300px] max-w-md`}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-grow">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-white/80 hover:text-white focus:outline-none transition-colors"
        aria-label="关闭"
      >
        <FiX className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

// 创建useToast钩子
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * 全局可用的Toast函数，可以在任何地方直接调用，不需要组件上下文
 * 示例: toast.success('操作成功');
 */
export const toast = {
  success: (message: string, duration = 3000) => {
    if (globalAddToast) {
      globalAddToast(message, 'success', duration);
    } else {
      console.warn('全局Toast功能未初始化，请确保 ToastProvider 已加载');
    }
  },
  error: (message: string, duration = 5000) => {
    if (globalAddToast) {
      globalAddToast(message, 'error', duration);
    } else {
      console.warn('全局Toast功能未初始化，请确保 ToastProvider 已加载');
    }
  },
  info: (message: string, duration = 3000) => {
    if (globalAddToast) {
      globalAddToast(message, 'info', duration);
    } else {
      console.warn('全局Toast功能未初始化，请确保 ToastProvider 已加载');
    }
  },
  warning: (message: string, duration = 4000) => {
    if (globalAddToast) {
      globalAddToast(message, 'warning', duration);
    } else {
      console.warn('全局Toast功能未初始化，请确保 ToastProvider 已加载');
    }
  }
};
