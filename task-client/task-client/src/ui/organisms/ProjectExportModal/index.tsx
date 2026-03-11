import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/ui/theme';
import { ExportFormat, ExportOptions, ExportData, ReportTemplate, ReportTemplateConfig, CustomFieldOptions } from '@/types/export-types';
import { exportProjectReport, downloadFile, generateProjectStatistics } from '@/utils/export-utils';
import { FiFileText, FiFile, FiDownload, FiX, FiCheck, FiLoader, FiAlertCircle, FiChevronDown, FiCalendar, FiFilter, FiEye, FiLayers, FiBarChart, FiUsers, FiTrendingUp } from 'react-icons/fi';

interface ProjectExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectData: ExportData;
}

const ProjectExportModal: React.FC<ProjectExportModalProps> = ({
  isOpen,
  onClose,
  projectData
}) => {
  const { isDark } = useTheme();
  const isDarkMode = isDark;

  // 导出状态
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // 导出选项
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    template: 'detailed',
    includeTeamMembers: true,
    includeTasks: true,
    includeProgress: true,
    includeCharts: true, // 启用图表功能
    dateRange: undefined,
    taskStatuses: [],
    taskPriorities: [],
  });

  // 筛选相关状态
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  // 预览相关状态
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<ExportData | null>(null);

  // 自定义字段选择状态
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [customFields, setCustomFields] = useState<CustomFieldOptions>({
    projectFields: {
      name: true,
      description: true,
      progress: true,
      taskCount: true,
      completedTaskCount: true,
      memberCount: true,
      createdAt: true,
      updatedAt: false
    },
    taskFields: {
      title: true,
      description: true,
      status: true,
      priority: true,
      assignee: true,
      createdAt: true,
      dueDate: true,
      completedAt: true
    },
    memberFields: {
      name: true,
      role: true,
      email: true
    },
    statisticsFields: {
      totalTasks: true,
      completedTasks: true,
      inProgressTasks: true,
      pendingTasks: true,
      overdueTasks: true,
      completionRate: true,
      averageCompletionTime: true
    }
  });

  // 格式选项配置
  const formatOptions = [
    {
      id: 'pdf' as ExportFormat,
      name: 'PDF文档',
      description: '适合打印和查看的格式',
      icon: <FiFileText size={16} />,
      color: 'text-red-500',
      bgColor: isDarkMode ? 'bg-red-500/20' : 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'excel' as ExportFormat,
      name: 'Excel表格',
      description: '适合数据分析和编辑',
      icon: <FiFile size={16} />,
      color: 'text-green-500',
      bgColor: isDarkMode ? 'bg-green-500/20' : 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'csv' as ExportFormat,
      name: 'CSV文件',
      description: '通用数据格式，兼容性好',
      icon: <FiFile size={16} />,
      color: 'text-blue-500',
      bgColor: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50',
      borderColor: 'border-blue-200'
    }
  ];

  // 模板选项配置
  const templateOptions: ReportTemplateConfig[] = [
    {
      id: 'simple',
      name: '简洁版',
      description: '仅包含项目基本信息和统计数据',
      icon: <FiLayers size={16} />,
      includeTasks: false,
      includeTeamMembers: false,
      includeProgress: true,
      includeCharts: false,
      sections: ['项目概览', '基础统计']
    },
    {
      id: 'detailed',
      name: '详细版',
      description: '包含所有项目信息、任务列表和团队成员',
      icon: <FiFileText size={16} />,
      includeTasks: true,
      includeTeamMembers: true,
      includeProgress: true,
      includeCharts: true,
      sections: ['项目概览', '详细统计', '任务列表', '团队成员', '图表分析']
    },
    {
      id: 'executive',
      name: '管理层版',
      description: '专为管理层设计，突出关键指标和图表',
      icon: <FiTrendingUp size={16} />,
      includeTasks: false,
      includeTeamMembers: true,
      includeProgress: true,
      includeCharts: true,
      sections: ['执行摘要', '关键指标', '团队概况', '可视化图表']
    },
    {
      id: 'analytics',
      name: '数据分析版',
      description: '重点展示数据分析和趋势图表',
      icon: <FiBarChart size={16} />,
      includeTasks: true,
      includeTeamMembers: false,
      includeProgress: true,
      includeCharts: true,
      sections: ['数据概览', '任务分析', '趋势图表', '性能指标']
    }
  ];

  // 处理导出
  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      // 生成统计数据
      const statistics = generateProjectStatistics(projectData.tasks);
      const dataWithStats = {
        ...projectData,
        statistics
      };

      // 执行导出
      const optionsWithCustomFields = {
        ...exportOptions,
        customFields: showCustomFields ? customFields : undefined
      };
      const result = await exportProjectReport(dataWithStats, optionsWithCustomFields);

      if (result.success && result.blob && result.filename) {
        // 下载文件
        downloadFile(result.blob, result.filename);
        setExportSuccess(true);
        
        // 2秒后自动关闭
        setTimeout(() => {
          onClose();
          setExportSuccess(false);
        }, 2000);
      } else {
        setExportError(result.error || '导出失败');
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportError(error instanceof Error ? error.message : '导出过程中发生错误');
    } finally {
      setIsExporting(false);
    }
  };

  // 处理选项变更
  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 处理模板选择
  const handleTemplateChange = (templateId: ReportTemplate) => {
    const selectedTemplate = templateOptions.find(t => t.id === templateId);
    if (selectedTemplate) {
      setExportOptions(prev => ({
        ...prev,
        template: templateId,
        includeTasks: selectedTemplate.includeTasks,
        includeTeamMembers: selectedTemplate.includeTeamMembers,
        includeProgress: selectedTemplate.includeProgress,
        includeCharts: selectedTemplate.includeCharts
      }));
    }
  };

  // 处理日期范围变更
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    
    // 如果两个日期都有值，更新导出选项
    if (newDateRange.start && newDateRange.end) {
      setExportOptions(prev => ({
        ...prev,
        dateRange: {
          start: new Date(newDateRange.start),
          end: new Date(newDateRange.end)
        }
      }));
    } else {
      setExportOptions(prev => ({
        ...prev,
        dateRange: undefined
      }));
    }
  };

  // 处理任务状态筛选
  const handleTaskStatusChange = (status: string, checked: boolean) => {
    setExportOptions(prev => {
      const newStatuses = checked 
        ? [...(prev.taskStatuses || []), status]
        : (prev.taskStatuses || []).filter(s => s !== status);
      return {
        ...prev,
        taskStatuses: newStatuses
      };
    });
  };

  // 处理任务优先级筛选
  const handleTaskPriorityChange = (priority: string, checked: boolean) => {
    setExportOptions(prev => {
      const newPriorities = checked 
        ? [...(prev.taskPriorities || []), priority]
        : (prev.taskPriorities || []).filter(p => p !== priority);
      return {
        ...prev,
        taskPriorities: newPriorities
      };
    });
  };

  // 获取项目中的所有状态和优先级
  const availableStatuses = [...new Set(projectData.tasks?.map(task => task.status).filter(Boolean) || [])];
  const availablePriorities = [...new Set(projectData.tasks?.map(task => task.priority).filter(Boolean) || [])];

  // 处理预览
  const handlePreview = () => {
    // 应用筛选生成预览数据
    let filteredTasks = projectData.tasks || [];

    // 日期范围筛选
    if (exportOptions.dateRange) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.createdAt) return false;
        const taskDate = new Date(task.createdAt);
        return taskDate >= exportOptions.dateRange!.start && taskDate <= exportOptions.dateRange!.end;
      });
    }

    // 任务状态筛选
    if (exportOptions.taskStatuses && exportOptions.taskStatuses.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        exportOptions.taskStatuses!.includes(task.status)
      );
    }

    // 任务优先级筛选
    if (exportOptions.taskPriorities && exportOptions.taskPriorities.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        exportOptions.taskPriorities!.includes(task.priority)
      );
    }

    const filteredData = {
      ...projectData,
      tasks: filteredTasks,
      statistics: generateProjectStatistics(filteredTasks)
    };

    setPreviewData(filteredData);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  // 处理自定义字段选择
  const handleCustomFieldChange = (
    category: keyof CustomFieldOptions,
    field: string,
    checked: boolean
  ) => {
    setCustomFields(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: checked
      }
    }));
  };

  // 重置状态
  const handleClose = () => {
    setExportSuccess(false);
    setExportError(null);
    setIsExporting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* 背景遮罩 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* 模态框 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className={`relative w-full max-w-4xl max-h-[90vh] mx-4 rounded-2xl shadow-2xl border overflow-hidden ${
            isDarkMode 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}
        >
          {/* 头部 */}
          <div className={`flex items-center justify-between p-3 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div>
              <h2 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                导出项目报告
              </h2>
              <p className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                选择导出格式和内容选项
              </p>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiX size={16} />
            </button>
          </div>

          {/* 内容 */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* 第一列：格式选择 */}
              <div>
                {/* 格式选择 */}
                <div>
                  <h3 className={`text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    选择导出格式
                  </h3>
                  <div className="space-y-2">
                    {formatOptions.map((format) => (
                      <label
                        key={format.id}
                        className={`flex items-center p-2 rounded-lg border cursor-pointer transition-all ${
                          exportOptions.format === format.id
                            ? isDarkMode
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-blue-500 bg-blue-50'
                            : isDarkMode
                              ? 'border-gray-700 hover:border-gray-600'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="format"
                          value={format.id}
                          checked={exportOptions.format === format.id}
                          onChange={(e) => handleOptionChange('format', e.target.value)}
                          className="sr-only"
                        />
                        <div className={`flex items-center justify-center w-6 h-6 rounded-lg mr-2 ${format.bgColor}`}>
                          <span className={format.color}>
                            {format.id === 'pdf' && <FiFileText size={16} />}
                            {format.id === 'excel' && <FiFile size={16} />}
                            {format.id === 'csv' && <FiFile size={16} />}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {format.name}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {format.description}
                          </div>
                        </div>
                        {exportOptions.format === format.id && (
                          <FiCheck className="text-blue-500" size={16} />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* 第二列：报告模板选择 */}
              <div>
                <h3 className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  选择报告模板
                </h3>
                <div className="space-y-2">
                  {templateOptions.map((template) => (
                    <label
                      key={template.id}
                      className={`flex items-start p-2 rounded-lg border cursor-pointer transition-all ${
                        exportOptions.template === template.id
                          ? isDarkMode
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-blue-500 bg-blue-50'
                          : isDarkMode
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="template"
                        value={template.id}
                        checked={exportOptions.template === template.id}
                        onChange={(e) => handleTemplateChange(e.target.value as ReportTemplate)}
                        className="sr-only"
                      />
                      <div className={`flex items-center justify-center w-6 h-6 rounded-lg mr-2 ${
                        isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>
                          {template.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {template.name}
                          </div>
                          {exportOptions.template === template.id && (
                            <FiCheck className="text-blue-500" size={16} />
                          )}
                        </div>
                        <div className={`text-xs mb-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {template.description}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {template.sections?.slice(0, 3).map((section, index) => (
                            <span
                              key={index}
                              className={`inline-block px-2 py-0.5 text-xs rounded ${
                                isDarkMode 
                                  ? 'bg-gray-700 text-gray-300' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {section}
                            </span>
                          ))}
                          {template.sections && template.sections.length > 3 && (
                            <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              +{template.sections.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 第三列：内容选项 */}
              <div className="space-y-4">
                {/* 内容选项 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      包含内容
                    </h3>
                    {exportOptions.template && (
                      <span className={`text-xs ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        已配置
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { key: 'includeTasks', label: '任务列表', description: '包含项目中的所有任务信息' },
                      { key: 'includeTeamMembers', label: '团队成员', description: '包含项目团队成员信息' },
                      { key: 'includeProgress', label: '进度统计', description: '包含项目进度和统计数据' },
                      { key: 'includeCharts', label: '数据图表', description: '包含任务趋势图、进度饼图等可视化图表' }
                    ].map((option) => {
                      const isDisabled = exportOptions.template !== undefined;
                      const isChecked = exportOptions[option.key as keyof ExportOptions] as boolean;
                      
                      return (
                        <label
                          key={option.key}
                          className={`flex items-start p-2 rounded-lg border transition-all ${
                            isDisabled 
                              ? isDarkMode
                                ? 'border-gray-700 bg-gray-800/30 cursor-not-allowed'
                                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                              : isDarkMode
                                ? 'border-gray-700 hover:border-gray-600 cursor-pointer'
                                : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleOptionChange(option.key as keyof ExportOptions, e.target.checked)}
                            disabled={isDisabled}
                            className={`mt-0.5 mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                              isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          />
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${
                              isDisabled 
                                ? isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                : isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {option.label}
                              {isDisabled && isChecked && (
                                <span className={`ml-2 text-xs ${
                                  isDarkMode ? 'text-green-400' : 'text-green-600'
                                }`}>
                                  ✓
                                </span>
                              )}
                            </div>
                            <div className={`text-xs ${
                              isDisabled 
                                ? isDarkMode ? 'text-gray-600' : 'text-gray-400'
                                : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {option.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  
                  {/* 自定义选项按钮 */}
                  <div className="mt-2 space-y-1">
                    {exportOptions.template && (
                      <div>
                        <button
                          onClick={() => setExportOptions(prev => ({ ...prev, template: undefined }))}
                          className={`text-xs ${
                            isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                          } transition-colors`}
                        >
                          + 自定义内容选项
                        </button>
                      </div>
                    )}
                    
                    {/* 自定义字段选择按钮 */}
                    <div>
                      <button
                        onClick={() => setShowCustomFields(!showCustomFields)}
                        className={`text-xs flex items-center ${
                          isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                        } transition-colors`}
                      >
                        <FiEye className="mr-1" size={12} />
                        {showCustomFields ? '隐藏字段选择' : '自定义字段选择'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 高级筛选选项 - 全宽 */}
            <div className="col-span-1 lg:col-span-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-medium ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  高级筛选
                </h3>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`flex items-center text-sm ${
                    isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                  } transition-colors`}
                >
                  <FiFilter className="mr-1" size={14} />
                  {showAdvancedFilters ? '收起' : '展开'}
                  <FiChevronDown 
                    className={`ml-1 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}
                    size={14}
                  />
                </button>
              </div>

              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* 日期范围筛选 */}
                      <div className={`p-2 rounded-lg border ${
                        isDarkMode
                          ? 'border-gray-700 bg-gray-800/50'
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-center mb-2">
                          <FiCalendar className={`mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} size={14} />
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            日期范围
                          </span>
                        </div>
                        <div className="space-y-2">
                          <input
                            type="date"
                            placeholder="开始日期"
                            value={dateRange.start}
                            onChange={(e) => handleDateRangeChange('start', e.target.value)}
                            className={`w-full px-2 py-1 rounded text-xs border ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          />
                          <input
                            type="date"
                            placeholder="结束日期"
                            value={dateRange.end}
                            onChange={(e) => handleDateRangeChange('end', e.target.value)}
                            className={`w-full px-2 py-1 rounded text-xs border ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500'
                                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                            } focus:outline-none focus:ring-1 focus:ring-blue-500`}
                          />
                        </div>
                      </div>

                      {/* 任务状态筛选 */}
                      {availableStatuses.length > 0 && (
                        <div className={`p-3 rounded-lg border ${
                          isDarkMode
                            ? 'border-gray-700 bg-gray-800/50'
                            : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className={`text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            任务状态
                          </div>
                          <div className="space-y-1">
                            {availableStatuses.map((status) => {
                              const statusLabel = (() => {
                                switch(status.toUpperCase()) {
                                  case 'WAITING': return '待处理';
                                  case 'IN_PROGRESS': return '进行中';
                                  case 'BLOCKED': return '已阻塞';
                                  case 'COMPLETED': return '已完成';
                                  case 'CANCELLED': return '已取消';
                                  case 'OVERDUE': return '已过期';
                                  default: return status;
                                }
                              })();

                              return (
                                <label key={status} className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={(exportOptions.taskStatuses || []).includes(status)}
                                    onChange={(e) => handleTaskStatusChange(status, e.target.checked)}
                                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className={`text-xs ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                  }`}>
                                    {statusLabel}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 任务优先级筛选 */}
                      {availablePriorities.length > 0 && (
                        <div className={`p-2 rounded-lg border ${
                          isDarkMode
                            ? 'border-gray-700 bg-gray-800/50'
                            : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className={`text-sm font-medium mb-2 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            任务优先级
                          </div>
                          <div className="space-y-1">
                            {availablePriorities.map((priority) => {
                              const priorityLabel = (() => {
                                switch(priority.toUpperCase()) {
                                  case 'HIGH': return '高优先级';
                                  case 'MEDIUM': return '中优先级';
                                  case 'LOW': return '低优先级';
                                  default: return priority;
                                }
                              })();

                              return (
                                <label key={priority} className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={(exportOptions.taskPriorities || []).includes(priority)}
                                    onChange={(e) => handleTaskPriorityChange(priority, e.target.checked)}
                                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className={`text-xs ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                  }`}>
                                    {priorityLabel}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 自定义字段选择 - 全宽 */}
            <AnimatePresence>
              {showCustomFields && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="col-span-1 lg:col-span-3 mt-4 overflow-hidden"
                >
                  <div className={`p-3 rounded-lg border ${
                    isDarkMode
                      ? 'border-gray-700 bg-gray-800/50'
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <h3 className={`text-sm font-medium mb-3 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      自定义字段选择
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* 项目字段 */}
                      <div>
                        <h4 className={`text-xs font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          项目信息
                        </h4>
                        <div className="space-y-1">
                          {Object.entries({
                            name: '项目名称',
                            description: '项目描述',
                            progress: '项目进度',
                            taskCount: '总任务数',
                            completedTaskCount: '已完成任务',
                            memberCount: '团队成员数',
                            createdAt: '创建时间',
                            updatedAt: '更新时间'
                          }).map(([key, label]) => (
                            <label key={key} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={customFields.projectFields[key as keyof typeof customFields.projectFields]}
                                onChange={(e) => handleCustomFieldChange('projectFields', key, e.target.checked)}
                                className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className={`text-xs ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* 任务字段 */}
                      <div>
                        <h4 className={`text-xs font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          任务信息
                        </h4>
                        <div className="space-y-1">
                          {Object.entries({
                            title: '任务标题',
                            description: '任务描述',
                            status: '任务状态',
                            priority: '优先级',
                            assignee: '负责人',
                            createdAt: '创建时间',
                            dueDate: '截止时间',
                            completedAt: '完成时间'
                          }).map(([key, label]) => (
                            <label key={key} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={customFields.taskFields[key as keyof typeof customFields.taskFields]}
                                onChange={(e) => handleCustomFieldChange('taskFields', key, e.target.checked)}
                                className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className={`text-xs ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* 团队成员字段 */}
                      <div>
                        <h4 className={`text-xs font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          团队成员
                        </h4>
                        <div className="space-y-1">
                          {Object.entries({
                            name: '成员姓名',
                            role: '成员角色',
                            email: '邮箱地址'
                          }).map(([key, label]) => (
                            <label key={key} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={customFields.memberFields[key as keyof typeof customFields.memberFields]}
                                onChange={(e) => handleCustomFieldChange('memberFields', key, e.target.checked)}
                                className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className={`text-xs ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* 统计信息字段 */}
                      <div>
                        <h4 className={`text-xs font-medium mb-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          统计数据
                        </h4>
                        <div className="space-y-1">
                          {Object.entries({
                            totalTasks: '总任务数',
                            completedTasks: '已完成',
                            inProgressTasks: '进行中',
                            pendingTasks: '待处理',
                            overdueTasks: '逾期任务',
                            completionRate: '完成率',
                            averageCompletionTime: '平均完成时间'
                          }).map(([key, label]) => (
                            <label key={key} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={customFields.statisticsFields[key as keyof typeof customFields.statisticsFields]}
                                onChange={(e) => handleCustomFieldChange('statisticsFields', key, e.target.checked)}
                                className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span className={`text-xs ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 快速操作按钮 */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const allFields = {
                              projectFields: Object.keys(customFields.projectFields).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
                              taskFields: Object.keys(customFields.taskFields).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
                              memberFields: Object.keys(customFields.memberFields).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
                              statisticsFields: Object.keys(customFields.statisticsFields).reduce((acc, key) => ({ ...acc, [key]: true }), {})
                            };
                            setCustomFields(allFields as CustomFieldOptions);
                          }}
                          className={`text-xs px-2 py-1 rounded ${
                            isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          } transition-colors`}
                        >
                          全选
                        </button>
                        <button
                          onClick={() => {
                            const noFields = {
                              projectFields: Object.keys(customFields.projectFields).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
                              taskFields: Object.keys(customFields.taskFields).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
                              memberFields: Object.keys(customFields.memberFields).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
                              statisticsFields: Object.keys(customFields.statisticsFields).reduce((acc, key) => ({ ...acc, [key]: false }), {})
                            };
                            setCustomFields(noFields as CustomFieldOptions);
                          }}
                          className={`text-xs px-2 py-1 rounded ${
                            isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          } transition-colors`}
                        >
                          全不选
                        </button>
                      </div>
                      <span className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        选择需要导出的具体字段
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 底部 */}
          <div className={`flex items-center justify-between p-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            {/* 状态提示 */}
            <div className="flex-1">
              {exportError && (
                <div className="flex items-center text-red-500 text-sm">
                  <FiAlertCircle size={16} className="mr-2" />
                  <span>{exportError}</span>
                </div>
              )}
              {exportSuccess && (
                <div className="flex items-center text-green-500 text-sm">
                  <FiCheck size={16} className="mr-2" />
                  <span>导出成功！</span>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClose}
                disabled={isExporting}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } disabled:opacity-50`}
              >
                取消
              </button>
              <button
                onClick={handlePreview}
                disabled={isExporting}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/30'
                    : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200'
                } disabled:opacity-50`}
              >
                <FiEye className="mr-1.5" size={14} />
                预览
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || exportSuccess}
                className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  isExporting || exportSuccess
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isExporting ? (
                  <>
                    <FiLoader className="animate-spin mr-1.5" size={14} />
                    导出中...
                  </>
                ) : exportSuccess ? (
                  <>
                    <FiCheck className="mr-1.5" size={14} />
                    已完成
                  </>
                ) : (
                  <>
                    <FiDownload className="mr-1.5" size={14} />
                    开始导出
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 预览弹窗 */}
      {showPreview && previewData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClosePreview}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-4xl max-h-[90vh] mx-4 rounded-2xl shadow-2xl border overflow-hidden ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            {/* 预览头部 */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div>
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  报告预览
                </h2>
                <p className={`text-sm mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {previewData.tasks?.length || 0} 个任务，{previewData.members?.length || 0} 个成员
                </p>
              </div>
              <button
                onClick={handleClosePreview}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* 预览内容 */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* 项目基本信息 */}
                <div>
                  <h3 className={`text-lg font-medium mb-3 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    项目概览
                  </h3>
                  <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                  }`}>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {previewData.project.progress.toFixed(1)}%
                      </div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        项目进度
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {previewData.project.taskCount}
                      </div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        总任务数
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        isDarkMode ? 'text-purple-400' : 'text-purple-600'
                      }`}>
                        {previewData.project.completedTaskCount}
                      </div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        已完成
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        isDarkMode ? 'text-orange-400' : 'text-orange-600'
                      }`}>
                        {previewData.project.memberCount}
                      </div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        团队成员
                      </div>
                    </div>
                  </div>
                </div>

                {/* 统计信息 */}
                {exportOptions.includeProgress && previewData.statistics && (
                  <div>
                    <h3 className={`text-lg font-medium mb-3 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      统计信息
                    </h3>
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                    }`}>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>完成率: {previewData.statistics.completionRate.toFixed(1)}%</div>
                        <div>进行中: {previewData.statistics.inProgressTasks}</div>
                        <div>待处理: {previewData.statistics.pendingTasks}</div>
                        <div>逾期任务: {previewData.statistics.overdueTasks}</div>
                        <div>平均完成时间: {previewData.statistics.averageCompletionTime?.toFixed(1) || 'N/A'} 天</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 任务列表预览 */}
                {exportOptions.includeTasks && previewData.tasks && previewData.tasks.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-medium mb-3 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      任务列表 ({previewData.tasks.length} 个)
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {previewData.tasks.slice(0, 10).map((task, index) => (
                        <div
                          key={task.id}
                          className={`p-3 rounded-lg border ${
                            isDarkMode 
                              ? 'border-gray-700 bg-gray-800/30' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className={`text-sm mt-1 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {task.description.length > 100 
                                    ? `${task.description.substring(0, 100)}...` 
                                    : task.description
                                  }
                                </p>
                              )}
                              <div className="flex items-center mt-2 space-x-4 text-xs">
                                <span className={`px-2 py-1 rounded ${
                                  task.status === 'COMPLETED' 
                                    ? 'bg-green-100 text-green-800' 
                                    : task.status === 'IN_PROGRESS'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {task.status}
                                </span>
                                <span className={`px-2 py-1 rounded ${
                                  task.priority === 'HIGH' 
                                    ? 'bg-red-100 text-red-800' 
                                    : task.priority === 'MEDIUM'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {task.priority}
                                </span>
                                {task.assignee && (
                                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                    负责人: {task.assignee}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {previewData.tasks.length > 10 && (
                        <div className={`text-center py-2 text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          还有 {previewData.tasks.length - 10} 个任务...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 团队成员预览 */}
                {exportOptions.includeTeamMembers && previewData.members && previewData.members.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-medium mb-3 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      团队成员 ({previewData.members.length} 人)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {previewData.members.slice(0, 8).map((member, index) => (
                        <div
                          key={member.id}
                          className={`flex items-center p-3 rounded-lg ${
                            isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 ${
                            isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                          }`}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {member.name}
                            </div>
                            <div className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {member.role || '团队成员'}
                            </div>
                          </div>
                        </div>
                      ))}
                      {previewData.members.length > 8 && (
                        <div className={`text-center py-2 text-sm col-span-full ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          还有 {previewData.members.length - 8} 个成员...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 筛选条件说明 */}
                {(exportOptions.dateRange || 
                  (exportOptions.taskStatuses && exportOptions.taskStatuses.length > 0) ||
                  (exportOptions.taskPriorities && exportOptions.taskPriorities.length > 0)) && (
                  <div>
                    <h3 className={`text-lg font-medium mb-3 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      应用的筛选条件
                    </h3>
                    <div className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50'
                    }`}>
                      <div className="space-y-2 text-sm">
                        {exportOptions.dateRange && (
                          <div>
                            日期范围: {exportOptions.dateRange.start.toLocaleDateString()} - {exportOptions.dateRange.end.toLocaleDateString()}
                          </div>
                        )}
                        {exportOptions.taskStatuses && exportOptions.taskStatuses.length > 0 && (
                          <div>
                            任务状态: {exportOptions.taskStatuses.join(', ')}
                          </div>
                        )}
                        {exportOptions.taskPriorities && exportOptions.taskPriorities.length > 0 && (
                          <div>
                            任务优先级: {exportOptions.taskPriorities.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 预览底部按钮 */}
            <div className={`flex items-center justify-end p-6 border-t space-x-3 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={handleClosePreview}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                关闭预览
              </button>
              <button
                onClick={() => {
                  handleClosePreview();
                  handleExport();
                }}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <FiDownload className="mr-2" size={16} />
                确认导出
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectExportModal;