"use client";

import {useQuery} from '@tanstack/react-query';
import {GetTermsUseCase} from '@/core/application/usecases/GetTermsUseCase';
import {TermsRepositoryImpl} from '@/adapters/repositories/TermsRepositoryImpl';
import {IHttpClient} from '@/infrastructure/http/i-http-client';
import httpClientImpl from '@/infrastructure/http/http-client-impl';

// 创建一个适配器，将httpClientImpl转换为符合IHttpClient接口的实现
const httpClientAdapter: IHttpClient = {
  get: async <T>(url: string): Promise<T> => {
    const response = await httpClientImpl.get<T>(url);
    if (!response.success) {
      throw new Error(response.message || '请求失败');
    }
    return response.data as T;
  },
  post: async <T, D = unknown>(url: string, data: D): Promise<T> => {
    const response = await httpClientImpl.post<T>(url, data);
    if (!response.success) {
      throw new Error(response.message || '请求失败');
    }
    return response.data as T;
  },
  put: async <T, D = unknown>(url: string, data: D): Promise<T> => {
    const response = await httpClientImpl.put<T>(url, data);
    if (!response.success) {
      throw new Error(response.message || '请求失败');
    }
    return response.data as T;
  },
  delete: async <T>(url: string): Promise<T> => {
    const response = await httpClientImpl.delete<T>(url);
    if (!response.success) {
      throw new Error(response.message || '请求失败');
    }
    return response.data as T;
  }
};

// 创建仓库和用例实例
const termsRepository = new TermsRepositoryImpl(httpClientAdapter);
const getTermsUseCase = new GetTermsUseCase(termsRepository);

/**
 * 使用条款查询钩子
 * 用于获取系统条款和协议信息
 */
export const useTermsHook = () => {
  const {data, isLoading, error} = useQuery({
    queryKey: ['terms'],
    queryFn: async () => {
      try {
        // getTermsUseCase.execute()直接返回Terms对象，没有data属性
        return await getTermsUseCase.execute();
      } catch (err) {
        console.error('获取条款信息失败:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 60, // 1小时缓存
  });

  return {
    terms: data,
    isLoading,
    error,
  };
};
