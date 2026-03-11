import {useState} from 'react';

/**
 * 分析面板控制Hook
 * 用于管理多个面板的展开/折叠状态，确保同时只有一个面板处于展开状态
 */
export function useAnalysisPanelsHook() {
  // 当前活动面板的ID，null表示所有面板都折叠
  const [activePanelId, setActivePanelId] = useState<string | null>(null);

  /**
   * 处理面板展开/折叠的函数
   * @param panelId 要切换状态的面板ID
   */
  const handlePanelToggle = (panelId: string) => {
    // 如果点击的是当前展开的面板，则折叠它
    if (activePanelId === panelId) {
      setActivePanelId(null); // 关闭当前面板
    } else {
      // 否则关闭所有其他面板，只展开点击的面板
      setActivePanelId(panelId);
    }
  };

  /**
   * 检查指定面板是否处于活动状态
   * @param panelId 要检查的面板ID
   * @returns 如果面板处于活动状态则返回true，否则返回false
   */
  const isPanelActive = (panelId: string) => activePanelId === panelId;

  return { activePanelId, handlePanelToggle, isPanelActive };
}
