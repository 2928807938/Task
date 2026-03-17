import {useQuery} from '@tanstack/react-query';
import {GetPrivacyUseCase} from '@/core/application/usecases/GetPrivacyUseCase';
import {PrivacyRepositoryImpl} from '@/adapters/repositories/PrivacyRepositoryImpl';
import {IHttpClient} from '@/infrastructure/http/i-http-client';

const notImplemented = async <T>(): Promise<T> => {
  throw new Error('Not implemented');
};

const httpClient: IHttpClient = {
  get: notImplemented,
  post: notImplemented,
  put: notImplemented,
  delete: notImplemented,
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
