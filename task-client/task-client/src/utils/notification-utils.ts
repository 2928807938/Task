/**
 * 通知工具函数
 * 用于处理API操作结果的通知提示
 */
import {ApiResponse} from '@/types/api-types';
import {isSuccessResponse} from './response-utils';
import {toast} from '@/ui/molecules/Toast';

/**
 * 显示API操作结果通知
 * @param response API响应对象
 * @param fallbackMessage 当响应没有消息时显示的后备消息（可选）
 */
export const showApiResponseNotification = (
  response: ApiResponse<any>,
  fallbackMessage?: string
): void => {
  // 检查响应是否成功
  const isSuccess = isSuccessResponse(response);

  // 确保始终有消息显示
  let messageToShow: string;

  if (response.message && response.message.trim() !== '') {
    // 优先使用API返回的消息
    messageToShow = response.message;
  } else if (fallbackMessage && fallbackMessage.trim() !== '') {
    // 其次使用传入的后备消息
    messageToShow = fallbackMessage;
  } else {
    // 最后使用默认消息
    messageToShow = isSuccess ? '操作成功' : '操作失败';
  }

  // 使用全局toast实例显示通知
  if (isSuccess) {
    toast.success(messageToShow);
  } else {
    toast.error(messageToShow);
  }
};

/**
 * 在React组件外部调用时使用的通知函数
 * 已集成全局toast实例，可以直接调用
 */

/**
 * 全局通知函数
 * 用于在非React组件环境中显示通知
 */
export const showGlobalNotification = (
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  duration = 3000
): void => {
  // 直接调用全局toast实例
  switch (type) {
    case 'success':
      toast.success(message, duration);
      break;
    case 'error':
      toast.error(message, duration);
      break;
    case 'warning':
      toast.warning(message, duration);
      break;
    case 'info':
    default:
      toast.info(message, duration);
      break;
  }
};

/**
 * 显示API操作结果的全局通知
 * 用于在非React组件环境中显示API操作结果
 */
export const showGlobalApiNotification = (
  response: ApiResponse<any>,
  fallbackMessage?: string | null
): void => {
  // 检查响应是否成功
  const isSuccess = isSuccessResponse(response);

  // 确保始终有消息显示
  let messageToShow: string;

  if (response.message && response.message.trim() !== '') {
    // 优先使用API返回的消息
    messageToShow = response.message;
  } else if (fallbackMessage && fallbackMessage.trim() !== '') {
    // 其次使用传入的后备消息
    messageToShow = fallbackMessage;
  } else {
    // 最后使用默认消息
    messageToShow = isSuccess ? '操作成功' : '操作失败';
  }

  // 根据操作结果显示成功或失败通知
  showGlobalNotification(
    messageToShow,
    isSuccess ? 'success' : 'error',
    isSuccess ? 3000 : 5000
  );
};
