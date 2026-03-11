'use client';

import {useEffect} from 'react';
import {disableZoom} from '@/utils/disable-zoom';

/**
 * 禁止页面缩放的客户端组件
 * 在组件挂载时调用禁止缩放的函数
 */
export default function DisableZoom() {
  useEffect(() => {
    disableZoom();
  }, []);

  // 这个组件不渲染任何内容
  return null;
}
