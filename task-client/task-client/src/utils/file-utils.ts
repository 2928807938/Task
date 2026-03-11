/**
 * 文件相关工具函数
 */

// 格式化日期
export const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// 格式化文件大小
export const formatFileSize = (sizeString?: string) => {
  if (!sizeString) return '-';
  return sizeString;
};

// 获取文件扩展名
export const getFileExtension = (filename: string) => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// 根据文件类型获取样式
export const getFileIconStyle = (extension: string) => {
  switch(extension) {
    case 'pdf':
      return { bg: 'bg-red-100', text: 'text-red-500' };
    case 'doc':
    case 'docx':
      return { bg: 'bg-blue-100', text: 'text-blue-500' };
    case 'xls':
    case 'xlsx':
      return { bg: 'bg-green-100', text: 'text-green-500' };
    case 'ppt':
    case 'pptx':
      return { bg: 'bg-orange-100', text: 'text-orange-500' };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return { bg: 'bg-purple-100', text: 'text-purple-500' };
    case 'sketch':
    case 'psd':
    case 'ai':
      return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-500' };
  }
};
