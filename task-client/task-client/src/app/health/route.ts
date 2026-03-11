import { NextResponse } from 'next/server';

// 为global添加自定义属性的类型声明
declare global {
  var appStartTime: Date | undefined;
}

/**
 * 健康检查接口
 * 用于监控应用是否正常运行
 * 
 * @returns 包含应用状态信息的响应
 */
export async function GET() {
  // 获取应用启动时间（如果没有设置，则使用当前时间）
  const startTime = global.appStartTime || new Date();
  
  // 如果是第一次调用，设置应用启动时间
  if (!global.appStartTime) {
    global.appStartTime = startTime;
  }

  // 计算应用运行时间（毫秒）
  const uptime = Date.now() - startTime.getTime();
  
  // 构建状态响应
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(uptime / 1000 / 60 / 60)}h ${Math.floor(uptime / 1000 / 60) % 60}m ${Math.floor(uptime / 1000) % 60}s`,
    uptimeMs: uptime,
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '未知',
    nodeVersion: process.versions.node,
    memory: process.memoryUsage(),
  };

  return NextResponse.json(status, { status: 200 });
}
