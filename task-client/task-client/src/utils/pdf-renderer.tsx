import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf, Font } from '@react-pdf/renderer';
import { ExportData, ExportOptions, ReportTemplate } from '@/types/export-types';

// 注册中文字体 - 使用稳定的字体源
// 这次使用jsdelivr CDN，它更稳定
Font.register({
  family: 'NotoSansSC',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@4.5.11/files/noto-sans-sc-chinese-simplified-400-normal.woff2',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@4.5.11/files/noto-sans-sc-chinese-simplified-700-normal.woff2',
      fontWeight: 'bold',
    }
  ]
});

// 备用字体 - 如果上面的字体无法加载
Font.register({
  family: 'FallbackChinese',
  src: 'https://fonts.gstatic.com/s/notosanssc/v36/k3kXo84MPvpLmixcA63oeAL7Iqp5QPWV1pckPLAUP1fBIzJOdJ3aOJkjKWSVTWh0z0Y.woff2'
});

// 注册字体回调处理函数
Font.registerHyphenationCallback((word) => [word]);

// 创建PDF样式
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'NotoSansSC',
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    color: '#1e40af',
    fontWeight: 'bold',
    fontFamily: 'NotoSansSC',
  },
  subHeader: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#374151',
    fontFamily: 'NotoSansSC',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#1f2937',
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    paddingBottom: 5,
    fontFamily: 'NotoSansSC',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cell: {
    flex: 1,
    fontSize: 10,
    paddingHorizontal: 5,
    fontFamily: 'NotoSansSC',
  },
  cellHeader: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    fontFamily: 'NotoSansSC',
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 100,
    color: '#4b5563',
    fontFamily: 'NotoSansSC',
  },
  infoValue: {
    fontSize: 11,
    flex: 1,
    color: '#1f2937',
    fontFamily: 'NotoSansSC',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  statCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '23%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: 'NotoSansSC',
  },
  taskItem: {
    backgroundColor: '#fafafa',
    padding: 10,
    marginVertical: 3,
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#1f2937',
    fontFamily: 'NotoSansSC',
  },
  taskMeta: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 3,
    fontFamily: 'NotoSansSC',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  priorityHigh: {
    backgroundColor: '#fef2f2',
    borderLeftColor: '#ef4444',
  },
  priorityMedium: {
    backgroundColor: '#fffbeb',
    borderLeftColor: '#f59e0b',
  },
  priorityLow: {
    backgroundColor: '#f0fdf4',
    borderLeftColor: '#10b981',
  },
});

// PDF文档组件
const ProjectReportDocument: React.FC<{
  data: ExportData;
  options: ExportOptions;
}> = ({ data, options }) => {
  // 获取报告标题
  const getReportTitle = () => {
    const templateNames = {
      simple: '项目简报',
      detailed: '项目详细报告',
      executive: '项目执行报告',
      analytics: '项目数据分析报告'
    };
    return templateNames[options.template || 'detailed'] || '项目报告';
  };

  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '未设置';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 获取任务状态文本
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'WAITING': '待处理',
      'IN_PROGRESS': '进行中', 
      'COMPLETED': '已完成',
      'BLOCKED': '已阻塞',
      'CANCELLED': '已取消',
      'OVERDUE': '已过期'
    };
    return statusMap[status?.toUpperCase()] || status;
  };

  // 获取优先级文本
  const getPriorityText = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      'HIGH': '高',
      'MEDIUM': '中',
      'LOW': '低'
    };
    return priorityMap[priority?.toUpperCase()] || priority;
  };

  // 获取任务样式
  const getTaskStyle = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return [styles.taskItem, styles.priorityHigh];
      case 'MEDIUM': return [styles.taskItem, styles.priorityMedium];
      case 'LOW': return [styles.taskItem, styles.priorityLow];
      default: return styles.taskItem;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 标题部分 */}
        <Text style={styles.header}>{getReportTitle()}</Text>
        <Text style={styles.subHeader}>{data.project.name}</Text>
        
        {/* 项目概览 */}
        <Text style={styles.sectionTitle}>项目概览</Text>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>项目名称：</Text>
            <Text style={styles.infoValue}>{data.project.name}</Text>
          </View>
          {data.project.description && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>项目描述：</Text>
              <Text style={styles.infoValue}>{data.project.description}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>创建时间：</Text>
            <Text style={styles.infoValue}>{formatDate(data.project.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>更新时间：</Text>
            <Text style={styles.infoValue}>{formatDate(data.project.updatedAt)}</Text>
          </View>
        </View>

        {/* 统计信息 */}
        {options.includeProgress && data.statistics && (
          <>
            <Text style={styles.sectionTitle}>项目统计</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{data.project.progress.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>项目进度</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{data.statistics.totalTasks}</Text>
                <Text style={styles.statLabel}>总任务数</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{data.statistics.completedTasks}</Text>
                <Text style={styles.statLabel}>已完成</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{data.statistics.completionRate.toFixed(1)}%</Text>
                <Text style={styles.statLabel}>完成率</Text>
              </View>
            </View>
            
            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>进行中任务：</Text>
                <Text style={styles.infoValue}>{data.statistics.inProgressTasks} 个</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>待处理任务：</Text>
                <Text style={styles.infoValue}>{data.statistics.pendingTasks} 个</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>逾期任务：</Text>
                <Text style={styles.infoValue}>{data.statistics.overdueTasks} 个</Text>
              </View>
              {data.statistics.averageCompletionTime && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>平均完成时间：</Text>
                  <Text style={styles.infoValue}>{data.statistics.averageCompletionTime.toFixed(1)} 天</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* 任务列表 */}
        {options.includeTasks && data.tasks && data.tasks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>任务列表</Text>
            {data.tasks.slice(0, 20).map((task, index) => (
              <View key={task.id} style={getTaskStyle(task.priority)}>
                <Text style={styles.taskTitle}>
                  {index + 1}. {task.title}
                </Text>
                {task.description && (
                  <Text style={styles.taskMeta}>
                    描述: {task.description.length > 80 ? `${task.description.substring(0, 80)}...` : task.description}
                  </Text>
                )}
                <Text style={styles.taskMeta}>
                  状态: {getStatusText(task.status)} | 优先级: {getPriorityText(task.priority)}
                  {task.assignee && ` | 负责人: ${task.assignee}`}
                  {task.dueDate && ` | 截止时间: ${formatDate(task.dueDate)}`}
                </Text>
              </View>
            ))}
            {data.tasks.length > 20 && (
              <Text style={styles.taskMeta}>
                还有 {data.tasks.length - 20} 个任务未显示...
              </Text>
            )}
          </>
        )}

        {/* 团队成员 */}
        {options.includeTeamMembers && data.members && data.members.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>团队成员</Text>
            <View style={styles.infoBox}>
              {data.members.map((member, index) => (
                <View key={member.id} style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{index + 1}. {member.name}</Text>
                  <Text style={styles.infoValue}>
                    {member.role || '团队成员'}
                    {member.email && ` (${member.email})`}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* 页脚 */}
        <View style={styles.footer}>
          <Text>生成时间: {new Date().toLocaleString('zh-CN')}</Text>
          <Text>报告版本: V1.0</Text>
        </View>
      </Page>
    </Document>
  );
};

// 导出函数 - 专注中文字体支持
export async function exportProjectReportWithReactPDF(
  data: ExportData,
  options: ExportOptions
): Promise<{ success: boolean; blob?: Blob; filename?: string; error?: string }> {
  try {
    console.log('开始生成PDF报告，等待中文字体加载...');
    
    // 给字体足够时间加载
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 验证数据完整性并处理中文字符
    const processedData = {
      ...data,
      project: {
        ...data.project,
        name: data.project.name || '未命名项目',
        description: data.project.description || '暂无描述'
      },
      tasks: data.tasks?.map(task => ({
        ...task,
        title: task.title || '未命名任务',
        description: task.description || '暂无描述'
      })) || [],
      members: data.members?.map(member => ({
        ...member,
        name: member.name || '未命名成员',
        role: member.role || '团队成员'
      })) || []
    };
    
    console.log('开始生成PDF，使用中文字体渲染...');
    
    // 生成PDF文档
    const doc = <ProjectReportDocument data={processedData} options={options} />;
    
    // 使用更长的超时时间以确保字体加载完成
    const blob = await Promise.race([
      pdf(doc).toBlob(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('PDF生成超时')), 30000)
      )
    ]);
    
    // 生成文件名 - 正确处理中文编码
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    // 安全处理项目名称，保持中文字符并确保UTF-8编码
    const safeName = processedData.project.name
      .replace(/[<>:"/\\|?*]/g, '') // 移除文件系统不支持的字符
      .replace(/\s+/g, '_') // 空格替换为下划线
      .trim() // 移除首尾空格
      .substring(0, 30); // 限制长度避免文件名过长
    
    // 使用UTF-8安全的文件名
    const filename = `${safeName || 'Project'}_项目报告_${timestamp}.pdf`;
    
    console.log('PDF生成成功，文件名:', filename);
    
    return {
      success: true,
      blob,
      filename
    };
  } catch (error) {
    console.error('React PDF export error:', error);
    
    // 提供更详细的错误信息
    let errorMessage = 'PDF导出失败';
    if (error instanceof Error) {
      if (error.message.includes('font')) {
        errorMessage = '中文字体加载失败，请检查网络连接后重试';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'PDF生成超时，请稍后重试';
      } else {
        errorMessage = `PDF导出错误: ${error.message}`;
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}