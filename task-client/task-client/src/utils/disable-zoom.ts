/**
 * 禁止页面缩放的工具函数
 * 通过监听和阻止各种可能导致缩放的事件
 */

export function disableZoom() {
  if (typeof window === 'undefined') return; // 服务器端渲染时不执行

  // 阻止双指缩放
  document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('gesturechange', function(e) {
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('gestureend', function(e) {
    e.preventDefault();
  }, { passive: false });

  // 阻止鼠标滚轮缩放
  document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  }, { passive: false });

  // 阻止键盘快捷键缩放 (Ctrl + '+', Ctrl + '-')
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '_' || e.key === '0')) {
      e.preventDefault();
    }
  }, { passive: false });

  // 设置最大缩放比例为1
  const setMaxScale = () => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  };

  // 初始设置
  setMaxScale();

  // 监听屏幕方向变化，重新设置
  window.addEventListener('orientationchange', setMaxScale);
  
  // 监听页面大小变化，重新设置
  window.addEventListener('resize', setMaxScale);
}
