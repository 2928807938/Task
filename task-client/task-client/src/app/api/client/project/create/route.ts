import {NextRequest, NextResponse} from 'next/server';
import {ProjectInfo} from '@/types/api-types';

/**
 * 创建项目API
 * 处理项目创建请求
 *
 * @param request 包含项目创建数据的请求
 * @returns 创建结果响应
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const requestData = await request.json();

    // 验证必要字段
    if (!requestData.name || !requestData.teamId) {
      return NextResponse.json({
        success: false,
        code: "400",
        message: '缺少必要的项目信息',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // TODO: 实际项目中，这里应该连接数据库或调用其他服务来创建项目

    // 模拟创建项目并返回结果
    const newProject: ProjectInfo = {
      id: `project-${Date.now()}`,
      name: requestData.name,
      description: requestData.description || '',
      teamId: requestData.teamId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 返回成功响应
    return NextResponse.json({
      success: true,
      code: "200",
      message: '项目创建成功',
      data: newProject,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('创建项目失败:', error);

    // 返回错误响应
    return NextResponse.json({
      success: false,
      code: "500",
      message: '服务器内部错误，项目创建失败',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
