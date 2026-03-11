/**
 * 响应处理工具函数
 * 用于处理API响应和错误码
 */
import {ApiResponse} from '@/types/api-types';
import {ResponseCode, ResponseMessages} from '@/types/response-code';

/**
 * 获取响应码对应的消息
 * @param code 响应码
 * @returns 对应的消息文本
 */
export const getResponseMessage = (code: number | string): string => {
  // 如果code是字符串，尝试转换为数字
  const numericCode = typeof code === 'string' ? parseInt(code, 10) : code;

  // 检查是否为有效的响应码
  if (Object.values(ResponseCode).includes(numericCode)) {
    return ResponseMessages[numericCode as ResponseCode];
  }

  // 默认错误消息
  return '未知错误';
};

/**
 * 判断响应是否成功
 * @param response API响应对象
 * @returns 是否成功
 */
export const isSuccessResponse = (response: ApiResponse<any>): boolean => {
  return response.success && (
    response.code === ResponseCode.OK.toString() ||
    response.code === '200' ||
    parseInt(response.code, 10) === ResponseCode.OK
  );
};

/**
 * 处理API错误响应
 * @param response API响应对象
 * @returns 格式化的错误消息
 */
export const handleApiError = (response: ApiResponse<any>): string => {
  // 如果响应中有消息，优先使用响应消息
  if (response.message) {
    return response.message;
  }

  // 否则根据响应码获取对应的消息
  return getResponseMessage(response.code);
};
