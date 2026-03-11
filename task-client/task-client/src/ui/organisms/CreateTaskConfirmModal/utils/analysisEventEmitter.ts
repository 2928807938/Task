/**
 * 简单的事件发射器，用于跨组件通信
 * 特别是处理任务分析完成事件
 */

type EventCallback = (data?: any) => void;

class AnalysisEventEmitter {
  private events: Record<string, EventCallback[]> = {};

  /**
   * 订阅事件
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  on(eventName: string, callback: EventCallback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);

    // 返回取消订阅的函数
    return () => {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    };
  }

  /**
   * 取消订阅事件
   * @param eventName 事件名称
   * @param callback 需要移除的回调函数
   */
  off(eventName: string, callback: EventCallback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }
  }

  /**
   * 触发事件
   * @param eventName 事件名称
   * @param data 事件数据
   */
  emit(eventName: string, data?: any) {
    const callbacks = this.events[eventName];
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

// 导出单例实例
export const analysisEventEmitter = new AnalysisEventEmitter();

// 定义常量事件名
export const ANALYSIS_COMPLETE_EVENT = 'ANALYSIS_COMPLETE';
export const PROGRESS_UPDATE_EVENT = 'PROGRESS_UPDATE';
export const RESET_ANALYSIS_DATA_EVENT = 'RESET_ANALYSIS_DATA';
