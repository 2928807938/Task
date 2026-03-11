/**
 * 全局类型声明文件
 * 用于扩展全局对象类型
 */

// 扩展Window对象接口
interface Window {
  // 全局加载指示器控制方法
  showGlobalLoading?: (actionType?: string) => void;
  hideGlobalLoading?: () => void;
}
