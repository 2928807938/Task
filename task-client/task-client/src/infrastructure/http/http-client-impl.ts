/**
 * HTTP请求客户端
 * 封装了基本的请求方法，处理错误和响应
 */
import {ApiResponse} from "@/types/api-types";
import Cookies from 'js-cookie';
import {clearAuthInfo} from '@/utils/auth-utils';
import {showGlobalApiNotification} from '@/utils/notification-utils';

// 默认API基础URL（不包含 /api 前缀）
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * HTTP请求选项接口
 */
interface RequestOptions {
  headers?: Record<string, string>;
  withCredentials?: boolean;
  skipAuth?: boolean; // 是否跳过添加认证令牌
  showNotification?: boolean; // 是否显示提示
  fallbackMessage?: string; // 当响应没有消息时显示的后备消息
}

type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | { [key: string]: JsonValue | undefined } | JsonValue[];

interface ErrorWithMessage {
  message?: string;
}

const XSSI_PREFIX_PATTERN = /^\)]}',?\s*/;

const normalizeJsonText = (rawText: string): string => rawText.replace(/^\uFEFF/, '').replace(XSSI_PREFIX_PATTERN, '').trim();

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isApiResponseShape = <T>(value: unknown): value is ApiResponse<T> => {
  return isObject(value)
    && typeof value.success === 'boolean'
    && typeof value.code === 'string'
    && 'data' in value
    && 'message' in value
    && typeof value.timestamp === 'string';
};

const parseJsonValueToken = (text: string, startIndex: number): number => {
  const openingChar = text[startIndex];

  if (openingChar === '{' || openingChar === '[') {
    const closingChar = openingChar === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let isEscaped = false;

    for (let index = startIndex; index < text.length; index += 1) {
      const currentChar = text[index];

      if (inString) {
        if (isEscaped) {
          isEscaped = false;
          continue;
        }

        if (currentChar === '\\') {
          isEscaped = true;
          continue;
        }

        if (currentChar === '"') {
          inString = false;
        }

        continue;
      }

      if (currentChar === '"') {
        inString = true;
        continue;
      }

      if (currentChar === openingChar) {
        depth += 1;
        continue;
      }

      if (currentChar === closingChar) {
        depth -= 1;

        if (depth === 0) {
          return index + 1;
        }
      }
    }

    return -1;
  }

  if (openingChar === '"') {
    let isEscaped = false;

    for (let index = startIndex + 1; index < text.length; index += 1) {
      const currentChar = text[index];

      if (isEscaped) {
        isEscaped = false;
        continue;
      }

      if (currentChar === '\\') {
        isEscaped = true;
        continue;
      }

      if (currentChar === '"') {
        return index + 1;
      }
    }

    return -1;
  }

  let endIndex = startIndex;

  while (endIndex < text.length && !/[\s,]/.test(text[endIndex])) {
    endIndex += 1;
  }

  return endIndex;
};

export const parseJsonResponseBody = (rawText: string): unknown => {
  const normalizedText = normalizeJsonText(rawText);

  if (!normalizedText) {
    return null;
  }

  try {
    return JSON.parse(normalizedText);
  } catch {
    const parsedValues: unknown[] = [];
    let cursor = 0;

    while (cursor < normalizedText.length) {
      while (cursor < normalizedText.length && /[\s,]/.test(normalizedText[cursor])) {
        cursor += 1;
      }

      if (cursor >= normalizedText.length) {
        break;
      }

      const endIndex = parseJsonValueToken(normalizedText, cursor);
      if (endIndex <= cursor) {
        throw new Error('INVALID_JSON_SEQUENCE');
      }

      parsedValues.push(JSON.parse(normalizedText.slice(cursor, endIndex)));
      cursor = endIndex;
    }

    if (parsedValues.length === 0) {
      return null;
    }

    return parsedValues.length === 1 ? parsedValues[0] : parsedValues;
  }
};

/**
 * 创建完整的请求URL
 */
export const createUrl = (endpoint: string): string => {
  // 确保endpoint总是以/开头
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
};

/**
 * 获取认证令牌
 */
const getAuthToken = (): string | undefined => {
  return Cookies.get('auth_token');
};

/**
 * 安全的JSON序列化函数
 * 特别处理assigneeId和conversationListId字段，确保它们以字符串形式传输避免精度丢失
 */
const safeJsonStringify = (obj: unknown): string => {
  return JSON.stringify(obj, (key, value) => {
    // 如果是assigneeId或conversationListId字段且不是undefined或null，则转换为字符串
    if ((key === 'assigneeId' || key === 'conversationListId') && value !== undefined && value !== null) {
      return String(value);
    }
    return value;
  });
};

/**
 * 创建请求头
 */
const createHeaders = (options?: RequestOptions): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers
  };

  // 如果不需要跳过认证，并且有认证令牌，则添加Authorization头
  if (!options?.skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * 处理HTTP响应
 */
const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  // 处理特殊状态码
  if (response.status === 401) {
    // 401未授权，清除认证信息并重定向到登录页面
    console.warn('认证失败，需要重新登录');
    clearAuthInfo();

    // 如果在浏览器环境中，重定向到登录页面
    if (typeof window !== 'undefined') {
      // 保存当前路径作为重定向参数
      const currentPath = window.location.pathname;
      const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;

      // 使用延时跳转，避免循环重定向
      setTimeout(() => {
        window.location.href = loginUrl;
      }, 100);
    }
  } else if (response.status === 403) {
    // 403禁止访问，可能是权限不足
    console.warn('权限不足，无法访问该资源');
  }

  // 优先读取文本，兼容 200 但空响应体的场景
  try {
    const rawText = await response.text();

    if (!rawText.trim()) {
      return {
        success: response.ok,
        data: null,
        code: response.ok ? '200' : response.status.toString(),
        message: response.ok ? null : (response.statusText || `服务器返回错误状态码: ${response.status}`),
        timestamp: Date.now().toString()
      };
    }

    const data = parseJsonResponseBody(rawText);

    // 如果不是标准ApiResponse格式，则进行包装
    if (!isApiResponseShape<T>(data)) {
      const isSuccess = response.ok;
      return {
        success: isSuccess,
        data: isSuccess ? (data as T) : null,
        code: isSuccess ? '200' : response.status.toString(),
        message: isSuccess ? null : (response.statusText || `服务器返回错误状态码: ${response.status}`),
        timestamp: Date.now().toString()
      };
    }

    // 即使后端返回了标准ApiResponse格式，也需要确保当HTTP状态码不是2xx时，success为false
    if (!response.ok && data.success) {
      data.success = false;
      if (!data.message) {
        data.message = `服务器返回错误状态码: ${response.status}`;
      }
    }

    return data;
  } catch (error) {
    console.error('响应解析失败:', error);
    // JSON解析错误，返回错误响应
    return {
      success: false,
      data: null,
      code: response.status.toString(),
      message: `响应解析失败: ${response.statusText || `HTTP状态码 ${response.status}`}`,
      timestamp: Date.now().toString()
    };
  }
};

/**
 * 处理请求错误
 */
const handleError = (error: unknown): ApiResponse<never> => {
  console.error('API请求错误:', error);

  // 如果是网络错误，可能是服务器无法连接
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      success: false,
      data: null,
      code: 'NETWORK_ERROR',
      message: '网络连接失败，请检查您的网络连接或服务器状态',
      timestamp: Date.now().toString()
    };
  }

  return {
    success: false,
    data: null,
    code: '500',
    message: (error as ErrorWithMessage)?.message || '网络请求失败',
    timestamp: Date.now().toString()
  };
};

/**
 * 发送GET请求
 */
export const get = async <T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> => {
  try {
    const url = createUrl(endpoint);
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(options),
      credentials: options?.withCredentials ? 'include' : 'same-origin'
    });

    const result = await handleResponse<T>(response);

    // 只在需要显示提示时才显示
    if (options?.showNotification) {
      showGlobalApiNotification(result, options.fallbackMessage);
    }

    return result;
  } catch (error) {
    const errorResponse = handleError(error);

    // 只在需要显示提示时才显示
    if (options?.showNotification) {
      showGlobalApiNotification(errorResponse, options.fallbackMessage);
    }

    return errorResponse;
  }
};

/**
 * 发送POST请求
 */
export const post = async <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> => {
  try {
    const url = createUrl(endpoint);
    const headers = createHeaders(options);

    // 使用安全的JSON序列化方法
    const safeBody = safeJsonStringify(body);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? safeBody : undefined,
      credentials: options?.withCredentials ? 'include' : 'same-origin'
    });

    const result = await handleResponse<T>(response);

    // 只在需要显示提示时才显示
    if (options?.showNotification) {
      showGlobalApiNotification(result, options.fallbackMessage);
    }

    return result;
  } catch (error) {
    const errorResponse = handleError(error);

    // 只在需要显示提示时才显示
    if (options?.showNotification) {
      showGlobalApiNotification(errorResponse, options.fallbackMessage);
    }

    return errorResponse;
  }
};

/**
 * 发送PUT请求
 */
export const put = async <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> => {
  try {
    const url = createUrl(endpoint);
    const headers = createHeaders(options);

    // 使用安全的JSON序列化方法
    const safeBody = safeJsonStringify(body);

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: body ? safeBody : undefined,
      credentials: options?.withCredentials ? 'include' : 'same-origin'
    });

    const result = await handleResponse<T>(response);

    // 只在需要显示提示时才显示
    if (options?.showNotification) {
      showGlobalApiNotification(result, options.fallbackMessage);
    }

    return result;
  } catch (error) {
    const errorResponse = handleError(error);

    // 只在需要显示提示时才显示
    if (options?.showNotification) {
      showGlobalApiNotification(errorResponse, options.fallbackMessage);
    }

    return errorResponse;
  }
};

/**
 * 发送DELETE请求
 */
export const del = async <T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> => {
  try {
    const url = createUrl(endpoint);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: createHeaders(options),
      credentials: options?.withCredentials ? 'include' : 'same-origin'
    });

    const result = await handleResponse<T>(response);

    // 只在需要显示提示时才显示
    if (options?.showNotification) {
      showGlobalApiNotification(result, options.fallbackMessage);
    }

    return result;
  } catch (error) {
    const errorResponse = handleError(error);

    // 只在需要显示提示时才显示
    if (options?.showNotification) {
      showGlobalApiNotification(errorResponse, options.fallbackMessage);
    }

    return errorResponse;
  }
};

/**
 * HTTP客户端对象
 */
const httpClientImpl = {
  get,
  post,
  put,
  delete: del
};

export default httpClientImpl;
