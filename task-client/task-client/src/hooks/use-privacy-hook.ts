import {useQuery} from '@tanstack/react-query';
import {GetPrivacyUseCase} from '@/core/application/usecases/GetPrivacyUseCase';
import {PrivacyRepositoryImpl} from '@/adapters/repositories/PrivacyRepositoryImpl';
import {IHttpClient} from '@/infrastructure/http/i-http-client';

// 创建一个模拟的HttpClient实例
// 在实际项目中，应该使用真实的HttpClient实现
const httpClient: IHttpClient = {
  get: async <T>(url: string): Promise<T> => {
    // 这里应该是真实的HTTP请求实现
    throw new Error('Not implemented');
  },
  post: async <T>(url: string, data: any): Promise<T> => {
    // 这里应该是真实的HTTP请求实现
    throw new Error('Not implemented');
  },
  put: async <T>(url: string, data: any): Promise<T> => {
    // 这里应该是真实的HTTP请求实现
    throw new Error('Not implemented');
  },
  delete: async <T>(url: string): Promise<T> => {
    // 这里应该是真实的HTTP请求实现
    throw new Error('Not implemented');
  }
};

// 创建仓库和用例实例
const privacyRepository = new PrivacyRepositoryImpl(httpClient);
const getPrivacyUseCase = new GetPrivacyUseCase(privacyRepository);

// 创建钩子函数
export const usePrivacyHook = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['privacy'],
    queryFn: () => getPrivacyUseCase.execute(),
    staleTime: 1000 * 60 * 60, // 1小时
  });

  return {
    privacy: data,
    isLoading,
    error,
  };
};
