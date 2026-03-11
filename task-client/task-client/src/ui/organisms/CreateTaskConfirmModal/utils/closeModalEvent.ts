// 关闭模态框的自定义事件
export const CLOSE_AI_ANALYSIS_MODAL_EVENT = 'closeAiAnalysisModal';

// 创建一个辅助函数，用于关闭AI分析模态框
export const closeAiAnalysisModal = () => {
  // 触发自定义事件
  window.dispatchEvent(new CustomEvent(CLOSE_AI_ANALYSIS_MODAL_EVENT));
};
