import { ExportOptions, ExportData, ExportResult, ReportTemplate, CustomFieldOptions } from '@/types/export-types';
import { exportProjectReportWithReactPDF } from './pdf-renderer';


/**
 * 生成图表数据URL
 * @param data 项目数据
 * @returns 图表数据URL数组
 */
async function generateChartImages(data: ExportData): Promise<string[]> {
  try {
    // 动态导入Chart.js和canvas相关库
    const ChartModule = await import('chart.js');
    const Chart = ChartModule.Chart;
    const registerables = ChartModule.registerables;
    Chart.register(...registerables);

    const chartImages: string[] = [];

    // 创建一个临时canvas元素
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    if (!ctx || !data.statistics) return [];

    // 1. 任务状态分布饼图
    const statusChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
        datasets: [{
          data: [
            data.statistics.completedTasks,
            data.statistics.inProgressTasks,
            data.statistics.pendingTasks,
            data.statistics.overdueTasks
          ],
          backgroundColor: [
            '#10B981', // 绿色 - 已完成
            '#3B82F6', // 蓝色 - 进行中
            '#F59E0B', // 黄色 - 待处理
            '#EF4444'  // 红色 - 逾期
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: 'Task Status Distribution',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    // 等待图表渲染完成
    await new Promise(resolve => setTimeout(resolve, 100));
    chartImages.push(canvas.toDataURL('image/png'));

    // 销毁图表
    statusChart.destroy();

    // 2. 项目进度条形图
    if (data.project) {
      const progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Project Progress'],
          datasets: [{
            label: 'Completed %',
            data: [data.project.progress],
            backgroundColor: '#10B981',
            borderColor: '#059669',
            borderWidth: 1
          }, {
            label: 'Remaining %',
            data: [100 - data.project.progress],
            backgroundColor: '#E5E7EB',
            borderColor: '#D1D5DB',
            borderWidth: 1
          }]
        },
        options: {
          responsive: false,
          scales: {
            x: { stacked: true },
            y: { 
              stacked: true,
              max: 100,
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Project Completion Progress',
              font: { size: 16, weight: 'bold' }
            }
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      chartImages.push(canvas.toDataURL('image/png'));
      progressChart.destroy();
    }

    return chartImages;
  } catch (error) {
    console.error('Chart generation error:', error);
    return [];
  }
}

/**
 * 根据自定义字段选择过滤数据
 * @param data 原始数据
 * @param customFields 自定义字段选择
 * @returns 过滤后的数据
 */
function filterDataByCustomFields(data: ExportData, customFields: CustomFieldOptions): ExportData {
  const filteredData: ExportData = {
    project: {} as any,
    tasks: data.tasks,
    members: data.members,
    statistics: data.statistics
  };

  // 过滤项目字段
  const projectFields = customFields.projectFields;
  const filteredProject: any = {};
  if (projectFields.name) filteredProject.name = data.project.name;
  if (projectFields.description) filteredProject.description = data.project.description;
  if (projectFields.progress) filteredProject.progress = data.project.progress;
  if (projectFields.taskCount) filteredProject.taskCount = data.project.taskCount;
  if (projectFields.completedTaskCount) filteredProject.completedTaskCount = data.project.completedTaskCount;
  if (projectFields.memberCount) filteredProject.memberCount = data.project.memberCount;
  if (projectFields.createdAt) filteredProject.createdAt = data.project.createdAt;
  if (projectFields.updatedAt) filteredProject.updatedAt = data.project.updatedAt;
  // 保留ID是必需的
  filteredProject.id = data.project.id;
  filteredData.project = filteredProject;

  // 过滤任务字段
  if (data.tasks && Object.values(customFields.taskFields).some(Boolean)) {
    filteredData.tasks = data.tasks.map(task => {
      const filteredTask: any = { id: task.id }; // 保留ID
      if (customFields.taskFields.title) filteredTask.title = task.title;
      if (customFields.taskFields.description) filteredTask.description = task.description;
      if (customFields.taskFields.status) filteredTask.status = task.status;
      if (customFields.taskFields.priority) filteredTask.priority = task.priority;
      if (customFields.taskFields.assignee) filteredTask.assignee = task.assignee;
      if (customFields.taskFields.createdAt) filteredTask.createdAt = task.createdAt;
      if (customFields.taskFields.dueDate) filteredTask.dueDate = task.dueDate;
      if (customFields.taskFields.completedAt) filteredTask.completedAt = task.completedAt;
      return filteredTask;
    });
  } else if (!Object.values(customFields.taskFields).some(Boolean)) {
    filteredData.tasks = [];
  }

  // 过滤团队成员字段
  if (data.members && Object.values(customFields.memberFields).some(Boolean)) {
    filteredData.members = data.members.map(member => {
      const filteredMember: any = { id: member.id }; // 保留ID
      if (customFields.memberFields.name) filteredMember.name = member.name;
      if (customFields.memberFields.role) filteredMember.role = member.role;
      if (customFields.memberFields.email) filteredMember.email = member.email;
      return filteredMember;
    });
  } else if (!Object.values(customFields.memberFields).some(Boolean)) {
    filteredData.members = [];
  }

  // 过滤统计字段
  if (data.statistics && Object.values(customFields.statisticsFields).some(Boolean)) {
    const filteredStats: any = {};
    if (customFields.statisticsFields.totalTasks) filteredStats.totalTasks = data.statistics.totalTasks;
    if (customFields.statisticsFields.completedTasks) filteredStats.completedTasks = data.statistics.completedTasks;
    if (customFields.statisticsFields.inProgressTasks) filteredStats.inProgressTasks = data.statistics.inProgressTasks;
    if (customFields.statisticsFields.pendingTasks) filteredStats.pendingTasks = data.statistics.pendingTasks;
    if (customFields.statisticsFields.overdueTasks) filteredStats.overdueTasks = data.statistics.overdueTasks;
    if (customFields.statisticsFields.completionRate) filteredStats.completionRate = data.statistics.completionRate;
    if (customFields.statisticsFields.averageCompletionTime) filteredStats.averageCompletionTime = data.statistics.averageCompletionTime;
    filteredData.statistics = filteredStats;
  } else if (!Object.values(customFields.statisticsFields).some(Boolean)) {
    filteredData.statistics = undefined;
  }

  return filteredData;
}

/**
 * 根据导出选项筛选数据
 * @param data 原始数据
 * @param options 导出选项
 * @returns 筛选后的数据
 */
function filterExportData(data: ExportData, options: ExportOptions): ExportData {
  let filteredTasks = data.tasks || [];

  // 日期范围筛选
  if (options.dateRange) {
    filteredTasks = filteredTasks.filter(task => {
      if (!task.createdAt) return false;
      const taskDate = new Date(task.createdAt);
      return taskDate >= options.dateRange!.start && taskDate <= options.dateRange!.end;
    });
  }

  // 任务状态筛选
  if (options.taskStatuses && options.taskStatuses.length > 0) {
    filteredTasks = filteredTasks.filter(task => 
      options.taskStatuses!.includes(task.status)
    );
  }

  // 任务优先级筛选
  if (options.taskPriorities && options.taskPriorities.length > 0) {
    filteredTasks = filteredTasks.filter(task => 
      options.taskPriorities!.includes(task.priority)
    );
  }

  return {
    ...data,
    tasks: filteredTasks
  };
}

/**
 * 根据自定义字段选择过滤数据
 * @param data 原始数据
 * @param customFields 自定义字段选择
 * @returns 过滤后的数据
 */
function applyCustomFieldFiltering(data: ExportData, customFields: any): ExportData {
  if (!customFields) return data;

  const filteredData = { ...data };

  // 过滤项目字段
  if (customFields.projectFields) {
    const projectFields = customFields.projectFields;
    filteredData.project = Object.keys(projectFields).reduce((acc, key) => {
      if (projectFields[key] && data.project[key as keyof typeof data.project] !== undefined) {
        acc[key as keyof typeof acc] = data.project[key as keyof typeof data.project];
      }
      return acc;
    }, {} as any);
    // 确保 id 字段总是包含（必需字段）
    filteredData.project.id = data.project.id;
  }

  // 过滤任务字段
  if (customFields.taskFields && data.tasks) {
    const taskFields = customFields.taskFields;
    filteredData.tasks = data.tasks.map(task => 
      Object.keys(taskFields).reduce((acc, key) => {
        if (taskFields[key] && task[key as keyof typeof task] !== undefined) {
          acc[key as keyof typeof acc] = task[key as keyof typeof task];
        }
        return acc;
      }, { id: task.id } as any) // 确保 id 字段总是包含
    );
  }

  // 过滤团队成员字段
  if (customFields.memberFields && data.members) {
    const memberFields = customFields.memberFields;
    filteredData.members = data.members.map(member => 
      Object.keys(memberFields).reduce((acc, key) => {
        if (memberFields[key] && member[key as keyof typeof member] !== undefined) {
          acc[key as keyof typeof acc] = member[key as keyof typeof member];
        }
        return acc;
      }, { id: member.id } as any) // 确保 id 字段总是包含
    );
  }

  // 过滤统计字段
  if (customFields.statisticsFields && data.statistics) {
    const statisticsFields = customFields.statisticsFields;
    filteredData.statistics = Object.keys(statisticsFields).reduce((acc, key) => {
      if (statisticsFields[key] && data.statistics![key as keyof typeof data.statistics] !== undefined) {
        acc[key as keyof typeof acc] = data.statistics![key as keyof typeof data.statistics];
      }
      return acc;
    }, {} as any);
  }

  return filteredData;
}

/**
 * 导出项目报告
 * @param data 项目数据
 * @param options 导出选项
 * @returns 导出结果
 */
export async function exportProjectReport(
  data: ExportData,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    // 先应用筛选
    let filteredData = filterExportData(data, options);
    
    // 应用自定义字段过滤
    if (options.customFields) {
      filteredData = applyCustomFieldFiltering(filteredData, options.customFields);
    }
    
    switch (options.format) {
      case 'pdf':
        // 使用新的React PDF渲染器，支持中文
        return await exportProjectReportWithReactPDF(filteredData, options);
      case 'excel':
        return await exportToExcel(filteredData, options);
      case 'csv':
        return await exportToCSV(filteredData, options);
      default:
        throw new Error(`不支持的导出格式: ${options.format}`);
    }
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '导出失败'
    };
  }
}

// 注意：原jsPDF导出函数已被React PDF渲染器替代，以解决中文乱码问题

/**
 * 导出为Excel格式
 */
async function exportToExcel(data: ExportData, options: ExportOptions): Promise<ExportResult> {
  try {
    // 动态导入xlsx
    const XLSX = await import('xlsx');
    
    const workbook = XLSX.utils.book_new();

    // 项目概览工作表
    const projectData = [
      ['项目名称', data.project.name],
      ['项目描述', data.project.description || ''],
      ['项目进度', `${data.project.progress.toFixed(1)}%`],
      ['总任务数', data.project.taskCount],
      ['已完成任务', data.project.completedTaskCount],
      ['团队成员数', data.project.memberCount],
      ['创建时间', data.project.createdAt ? new Date(data.project.createdAt).toLocaleDateString() : ''],
      ['更新时间', data.project.updatedAt ? new Date(data.project.updatedAt).toLocaleDateString() : '']
    ];

    const projectSheet = XLSX.utils.aoa_to_sheet(projectData);
    // 使用英文工作表名避免兼容性问题，但内容保持中文
    XLSX.utils.book_append_sheet(workbook, projectSheet, 'ProjectOverview');

    // 任务列表工作表
    if (options.includeTasks && data.tasks && data.tasks.length > 0) {
      const taskHeaders = ['序号', '任务标题', '描述', '状态', '优先级', '负责人', '创建时间', '截止时间', '完成时间'];
      const taskData = [
        taskHeaders,
        ...data.tasks.map((task, index) => [
          index + 1,
          task.title,
          task.description || '',
          task.status,
          task.priority,
          task.assignee || '',
          task.createdAt ? new Date(task.createdAt).toLocaleDateString('zh-CN') : '',
          task.dueDate ? new Date(task.dueDate).toLocaleDateString('zh-CN') : '',
          task.completedAt ? new Date(task.completedAt).toLocaleDateString('zh-CN') : ''
        ])
      ];

      const taskSheet = XLSX.utils.aoa_to_sheet(taskData);
      XLSX.utils.book_append_sheet(workbook, taskSheet, 'TaskList');
    }

    // 团队成员工作表
    if (options.includeTeamMembers && data.members && data.members.length > 0) {
      const memberHeaders = ['序号', '姓名', '角色', '邮箱'];
      const memberData = [
        memberHeaders,
        ...data.members.map((member, index) => [
          index + 1,
          member.name,
          member.role || '团队成员',
          member.email || ''
        ])
      ];

      const memberSheet = XLSX.utils.aoa_to_sheet(memberData);
      XLSX.utils.book_append_sheet(workbook, memberSheet, 'TeamMembers');
    }

    // 统计信息工作表
    if (options.includeProgress && data.statistics) {
      const statsData = [
        ['统计项目', '数值'],
        ['总任务数', data.statistics.totalTasks],
        ['已完成任务', data.statistics.completedTasks],
        ['进行中任务', data.statistics.inProgressTasks],
        ['待处理任务', data.statistics.pendingTasks],
        ['逾期任务', data.statistics.overdueTasks],
        ['完成率', `${data.statistics.completionRate.toFixed(1)}%`],
        ['平均完成时间（天）', data.statistics.averageCompletionTime?.toFixed(1) || 'N/A']
      ];

      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistics');
    }

    // 生成文件名，确保中文编码正确
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    // 对项目名称进行安全处理，保留中文但移除特殊字符
    const projectName = data.project.name
      .replace(/[<>:"/\\|?*]/g, '') // 移除Windows文件名不支持的字符
      .replace(/\s+/g, '_') // 将空格替换为下划线
      .substring(0, 50); // 限制文件名长度
    const filename = `${projectName}_项目报告_${timestamp}.xlsx`;

    // 生成blob，明确指定编码和压缩设置
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      compression: true,
      // 添加明确的编码支持
      bookSST: true, // 启用共享字符串表以更好地支持Unicode
      cellStyles: true // 启用单元格样式
    });
    
    // 确保 Excel 能正确识别 UTF-8 编码
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    return {
      success: true,
      filename,
      blob
    };
  } catch (error) {
    console.error('Excel export error:', error);
    return {
      success: false,
      error: 'Excel导出失败'
    };
  }
}

/**
 * 导出为CSV格式
 */
async function exportToCSV(data: ExportData, options: ExportOptions): Promise<ExportResult> {
  try {
    // 使用UTF-8 BOM确保中文正确显示，特别是在Excel中
    let csvContent = '\uFEFF'; // UTF-8 BOM for Chinese characters

    // 辅助函数：安全地转义CSV字段中的特殊字符，特别处理中文
    const escapeCSVField = (field: string | number | undefined | null): string => {
      if (field === undefined || field === null) return '';
      const str = String(field);
      
      // 对于中文内容，总是使用双引号包围以确保兼容性
      const hasChinese = /[\u4e00-\u9fff]/.test(str);
      const hasSpecialChars = str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r');
      
      if (hasChinese || hasSpecialChars) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // 项目基本信息
    csvContent += '项目概览\n';
    csvContent += `项目名称,${escapeCSVField(data.project.name)}\n`;
    csvContent += `项目描述,${escapeCSVField(data.project.description || '')}\n`;
    csvContent += `项目进度,${data.project.progress.toFixed(1)}%\n`;
    csvContent += `总任务数,${data.project.taskCount}\n`;
    csvContent += `已完成任务,${data.project.completedTaskCount}\n`;
    csvContent += `团队成员数,${data.project.memberCount}\n`;
    csvContent += '\n';

    // 任务列表
    if (options.includeTasks && data.tasks && data.tasks.length > 0) {
      csvContent += '任务列表\n';
      csvContent += '序号,任务标题,描述,状态,优先级,负责人,创建时间,截止时间,完成时间\n';
      
      data.tasks.forEach((task, index) => {
        const row = [
          index + 1,
          escapeCSVField(task.title),
          escapeCSVField(task.description || ''),
          escapeCSVField(task.status),
          escapeCSVField(task.priority),
          escapeCSVField(task.assignee || ''),
          task.createdAt ? new Date(task.createdAt).toLocaleDateString('zh-CN') : '',
          task.dueDate ? new Date(task.dueDate).toLocaleDateString('zh-CN') : '',
          task.completedAt ? new Date(task.completedAt).toLocaleDateString('zh-CN') : ''
        ];
        csvContent += row.join(',') + '\n';
      });
      csvContent += '\n';
    }

    // 团队成员
    if (options.includeTeamMembers && data.members && data.members.length > 0) {
      csvContent += '团队成员\n';
      csvContent += '序号,姓名,角色,邮箱\n';
      
      data.members.forEach((member, index) => {
        const row = [
          index + 1,
          escapeCSVField(member.name),
          escapeCSVField(member.role || '团队成员'),
          escapeCSVField(member.email || '')
        ];
        csvContent += row.join(',') + '\n';
      });
      csvContent += '\n';
    }

    // 统计信息
    if (options.includeProgress && data.statistics) {
      csvContent += '统计信息\n';
      csvContent += '统计项目,数值\n';
      csvContent += `总任务数,${data.statistics.totalTasks}\n`;
      csvContent += `已完成任务,${data.statistics.completedTasks}\n`;
      csvContent += `进行中任务,${data.statistics.inProgressTasks}\n`;
      csvContent += `待处理任务,${data.statistics.pendingTasks}\n`;
      csvContent += `逾期任务,${data.statistics.overdueTasks}\n`;
      csvContent += `完成率,${data.statistics.completionRate.toFixed(1)}%\n`;
      csvContent += `平均完成时间（天）,${data.statistics.averageCompletionTime?.toFixed(1) || 'N/A'}\n`;
    }

    // 生成文件名，确保中文编码正确
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    // 对项目名称进行安全处理，保留中文但移除特殊字符
    const projectName = data.project.name
      .replace(/[<>:"/\\|?*]/g, '') // 移除Windows文件名不支持的字符
      .replace(/\s+/g, '_') // 将空格替换为下划线
      .substring(0, 50); // 限制文件名长度
    const filename = `${projectName}_项目报告_${timestamp}.csv`;

    // 生成blob，明确指定编码 - 确保UTF-8 BOM存在
    // 为了更好的中文支持，我们使用 Uint8Array 来确保编码正确
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(csvContent);
    
    const blob = new Blob([encodedData], { 
      type: 'text/csv;charset=utf-8;'
    });

    return {
      success: true,
      filename,
      blob
    };
  } catch (error) {
    console.error('CSV export error:', error);
    return {
      success: false,
      error: 'CSV导出失败'
    };
  }
}

/**
 * 下载文件 - 增强的中文文件名支持
 * @param blob 文件数据
 * @param filename 文件名
 */
export function downloadFile(blob: Blob, filename: string): void {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 现代浏览器直接支持UTF-8文件名
    link.download = filename;
    
    // 确保下载属性正确设置
    link.setAttribute('download', filename);
    
    // 隐藏链接并添加到DOM
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // 触发下载
    link.click();
    
    // 延迟清理以确保下载开始
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (cleanupError) {
        console.warn('清理下载链接时出错:', cleanupError);
      }
    }, 100);
    
    console.info('文件下载已触发:', filename);
    
  } catch (error) {
    console.error('文件下载失败:', error);
    
    // 备用下载方法1：使用navigator.msSaveBlob (IE)
    if (typeof navigator !== 'undefined' && (navigator as any).msSaveBlob) {
      try {
        (navigator as any).msSaveBlob(blob, filename);
        console.info('使用IE备用下载方法成功');
        return;
      } catch (ieError) {
        console.warn('IE备用下载方法失败:', ieError);
      }
    }
    
    // 备用下载方法2：在新窗口打开
    try {
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          newWindow.close();
        }, 1000);
        console.info('使用新窗口备用下载方法');
      } else {
        throw new Error('无法打开新窗口');
      }
    } catch (fallbackError) {
      console.error('所有下载方法都失败:', fallbackError);
      
      // 最后的fallback：提示用户手动保存
      alert(`文件下载失败，请尝试以下操作：\n1. 检查浏览器是否允许下载\n2. 刷新页面后重试\n3. 尝试使用不同的浏览器\n\n文件名: ${filename}`);
    }
  }
}

/**
 * 生成项目统计数据
 * @param tasks 任务列表
 * @returns 统计数据
 */
export function generateProjectStatistics(tasks: ExportData['tasks'] = []): ExportData['statistics'] {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status?.toUpperCase() === 'COMPLETED').length;
  const inProgressTasks = tasks.filter(task => task.status?.toUpperCase() === 'IN_PROGRESS').length;
  const pendingTasks = tasks.filter(task => task.status?.toUpperCase() === 'WAITING').length;
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status?.toUpperCase() === 'COMPLETED') return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // 计算平均完成时间
  const completedTasksWithDates = tasks.filter(task => 
    task.status?.toUpperCase() === 'COMPLETED' && 
    task.createdAt && 
    task.completedAt
  );

  let averageCompletionTime: number | undefined;
  if (completedTasksWithDates.length > 0) {
    const totalCompletionTime = completedTasksWithDates.reduce((sum, task) => {
      const created = new Date(task.createdAt!);
      const completed = new Date(task.completedAt!);
      const diffInDays = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return sum + diffInDays;
    }, 0);
    averageCompletionTime = totalCompletionTime / completedTasksWithDates.length;
  }

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    overdueTasks,
    completionRate,
    averageCompletionTime
  };
}