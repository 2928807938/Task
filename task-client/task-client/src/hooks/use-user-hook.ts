/**
 * 用户API相关的React Query钩子
 * 用于在组件中方便地使用用户相关API
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { api } from '@/adapters/api';
import { ApiResponse, LoginRequest, RegisterRequest, SendEmailVerificationCodeRequest, UserInfo, UserSearchItem } from '@/types/api-types';
import { setAuthInfo, clearAuthInfo } from '@/utils/auth-utils';

type SearchableUserData = Partial<UserSearchItem> & {
    self?: boolean;
    inProject?: boolean;
};

/**
 * 用户API相关缓存键
 */
export const userQueryKeys = {
    all: ['user'] as const,
    current: () => [...userQueryKeys.all, 'current'] as const,
    search: (param: string, projectId?: string) => [...userQueryKeys.all, 'search', param, projectId] as const,
};

/**
 * 注册用户钩子
 */
export const useRegister = () => {
    return useMutation<ApiResponse<void>, Error, RegisterRequest>({
        mutationFn: (data) => api.user.register(data),
        onError: (error) => {
            console.error('注册失败:', error);
        },
    });
};

/**
 * 登录用户钩子
 */
export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<UserInfo>, Error, LoginRequest>({
        mutationFn: (data) => api.user.login(data),
        onSuccess: (data) => {
            // 登录成功后更新当前用户查询缓存
            if (data.success && data.data) {
                // 设置认证cookie
                setAuthInfo(data.data);

                // 更新React Query缓存
                queryClient.setQueryData(userQueryKeys.current(), {
                    success: true,
                    data: data.data,
                    code: data.code,
                    message: data.message,
                    timestamp: data.timestamp
                });
            }
        },
        onError: (error) => {
            console.error('登录失败:', error);
        },
    });
};

/**
 * 登出用户钩子
 * 注意：Toast提示由调用组件处理，这里只处理数据和缓存
 */
export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse<void>, Error>({
        mutationFn: () => api.user.logout(),
        onSuccess: () => {
            // 登出成功后清除用户缓存和认证cookie
            clearAuthInfo();
            queryClient.invalidateQueries({ queryKey: userQueryKeys.current() });
        },
        onError: (error) => {
            console.error('登出失败:', error);
            // 即使API调用失败，也清除本地认证信息
            clearAuthInfo();
            queryClient.invalidateQueries({ queryKey: userQueryKeys.current() });
        },
    });
};

/**
 * 获取当前用户信息钩子
 * 注意：当前暂时禁用了自动调用current接口
 */
export const useCurrentUser = (options?: { enabled?: boolean }) => {
    return useQuery<ApiResponse<UserInfo>, Error>({
        queryKey: userQueryKeys.current(),
        queryFn: () => api.user.getCurrentUser(),
        // 默认禁用自动调用，除非显式启用
        enabled: options?.enabled === true,
        // 5分钟后重新获取
        staleTime: 5 * 60 * 1000,
        // 如果组件卸载后重新挂载，从缓存中读取而不是重新获取
        refetchOnMount: false,
    });
};

/**
 * 用户是否已登录钩子
 */
export const useIsAuthenticated = () => {
    const { data, isLoading } = useCurrentUser();
    return {
        isAuthenticated: !isLoading && data?.success === true && !!data?.data,
        isLoading,
        user: data?.data || null,
    };
};

/**
 * 发送邮箱验证码钩子
 */
export const useSendEmailVerificationCode = () => {
    return useMutation<ApiResponse<void>, Error, SendEmailVerificationCodeRequest>({
        mutationFn: (data) => api.user.sendEmailVerificationCode(data),
        onError: (error) => {
            console.error('发送邮箱验证码失败:', error);
        },
    });
};

/**
 * 根据邮箱或用户名查找用户钩子
 * 当搜索用户添加到项目时使用
 * @param initialParam
 * @param initialProjectId
 */
export const useFindUsers = (initialParam: string = '', initialProjectId?: string) => {
    // 创建可变参数状态
    const [param, setParam] = useState(initialParam);
    const [projectId, setProjectId] = useState(initialProjectId);

    const queryKey = [...userQueryKeys.all, 'search', param, projectId];

    // 定义一个转换函数，将后端返回的数据转换为我们需要的UserSearchItem形式
    const convertToUserSearchItem = (userData: SearchableUserData): UserSearchItem => {
        // 将后端返回的self和inProject字段映射到前端的isSelf和isInProject字段
        return {
            id: userData.id || '',
            name: userData.name || '',
            email: userData.email || '',
            avatar: userData.avatar,
            department: userData.department,
            // 注意字段名称映射，后端用self，前端用isSelf
            isSelf: userData.self !== undefined ? !!userData.self : false,
            // 注意字段名称映射，后端用inProject，前端用isInProject
            isInProject: userData.inProject !== undefined ? !!userData.inProject : false
        };
    };

    const result = useQuery<UserSearchItem[], Error>({
        queryKey,
        queryFn: async () => {
            // 如果搜索参数为空或者太短，不进行请求
            if (!param || param.length < 2) {
                return [];
            }

            const response = await api.user.findUserByEmailOrUsername(param, projectId);

            if (!response.success) {
                throw new Error(response.message || '搜索用户失败');
            }

            // 根据接口文档处理数据结构
            if (response.data) {
                // 处理data.items对象
                if (response.data.items) {

                    // 确保返回的是数组
                    const userItems = Array.isArray(response.data.items)
                        ? response.data.items
                        : [response.data.items];

                    return userItems.map(item => convertToUserSearchItem(item));
                }

                // 如果有data是数组格式
                if (Array.isArray(response.data)) {
                    return response.data.map(item => convertToUserSearchItem(item));
                }

                return [];
            }
            return [];
        },
        enabled: false, // 默认不自动请求，需要手动触发
        staleTime: 1000 * 60, // 1分钟内不重新获取
        retry: 1, // 仅重试1次
    });

    const searchUsers = useCallback((newParam: string, newProjectId?: string) => {
        setParam(newParam);
        if (newProjectId !== undefined) {
            setProjectId(newProjectId);
        }
        return result.refetch();
    }, [result]);

    return {
        ...result,
        searchUsers,
    };
};
