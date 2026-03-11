import {NextRequest, NextResponse} from 'next/server';

/**
 * 编辑任务API
 * 处理任务编辑请求
 * 
 * @param request 包含任务编辑数据的请求
 * @returns 编辑结果响应
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const requestData = await request.json();

    // 验证必要字段
    if (!requestData.taskId) {
      return NextResponse.json({
        success: false,
        code: "400",
        message: '缺少任务ID',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    if (!requestData.title) {
      return NextResponse.json({
        success: false,
        code: "400", 
        message: '缺少任务标题',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // 验证其他必要字段
    const requiredFields = ['statusId', 'priorityId', 'assigneeId', 'dueDate'];
    for (const field of requiredFields) {
      if (!requestData[field]) {
        return NextResponse.json({
          success: false,
          code: "400",
          message: `缺少必要字段: ${field}`,
          timestamp: new Date().toISOString()
        }, { status: 400 });
      }
    }

    // TODO: 实际项目中，这里应该连接数据库来更新任务信息
    // 例如：await taskService.updateTask(requestData.taskId, requestData);

    // 模拟更新任务并返回结果
    const updatedTask = {
      id: requestData.taskId,
      title: requestData.title,
      description: requestData.description || '',
      statusId: requestData.statusId,
      priorityId: requestData.priorityId,
      assigneeId: requestData.assigneeId,
      dueDate: requestData.dueDate,
      updatedAt: new Date().toISOString()
    };

    // 返回成功响应
    return NextResponse.json({
      success: true,
      code: "200",
      message: '任务编辑成功',
      data: updatedTask,
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('编辑任务失败:', error);

    // 返回错误响应
    return NextResponse.json({
      success: false,
      code: "500", 
      message: '服务器内部错误，任务编辑失败',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}