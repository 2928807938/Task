/**
 * 加载状态工具函数
 * 提供全局加载状态控制的简便方法
 */

/**
 * 显示全局加载状态
 * @param actionType 加载提示文本，默认为"处理中"
 */
export const showLoading = (actionType: string = '处理中') => {
  if (typeof window !== 'undefined' && window.showGlobalLoading) {
    window.showGlobalLoading(actionType);
  }
};

/**
 * 隐藏全局加载状态
 */
export const hideLoading = () => {
  if (typeof window !== 'undefined' && window.hideGlobalLoading) {
    window.hideGlobalLoading();
  }
};

/**
 * 包装异步函数，自动处理加载状态
 * @param asyncFn 需要执行的异步函数
 * @param actionType 加载提示文本
 * @returns 包装后的异步函数
 */
export const withLoading = <T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  actionType: string = '处理中'
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      showLoading(actionType);
      const result = await asyncFn(...args);
      hideLoading();
      return result;
    } catch (error) {
      hideLoading();
      throw error;
    }
  };
};

/**
 * 在组件中使用的预加载装饰器
 * 可以用于包装按钮点击事件，提前显示加载状态
 * @param actionType 加载提示文本
 * @returns 装饰后的事件处理函数
 */
export const preloadOnClick = <T extends (...args: any[]) => any>(
  fn: T,
  actionType: string = '页面准备中'
): ((...args: Parameters<T>) => ReturnType<T>) => {
  return (...args: Parameters<T>): ReturnType<T> => {
    showLoading(actionType);
    return fn(...args);
  };
};
