import React, {useState} from 'react';
import {UseFormReturn} from 'react-hook-form';
import {CreateProjectRequest} from '@/types/api-types';
import {FiBell, FiGlobe, FiPlus, FiTag, FiUsers, FiX} from 'react-icons/fi';

interface ConfigurationStepProps {
  form: UseFormReturn<CreateProjectRequest>;
}

/**
 * 安全地解析JSON
 */
const safeParseJSON = (jsonString: string | undefined, defaultValue: any = {}) => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('解析JSON失败:', error);
    return defaultValue;
  }
};

// 项目标签类型
interface ProjectTag {
  id: string;
  name: string;
  color: string;
}

// 通知设置类型
interface NotificationSetting {
  id: string;
  type: 'email' | 'in-app' | 'push';
  enabled: boolean;
}

/**
 * 项目创建的第三步 - 高级项目配置
 */
const ConfigurationStep: React.FC<ConfigurationStepProps> = ({ form }) => {
  const { watch, setValue } = form;

  // 本地状态管理
  const [projectTags, setProjectTags] = useState<ProjectTag[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    { id: 'email', type: 'email', enabled: true },
    { id: 'in-app', type: 'in-app', enabled: true },
    { id: 'push', type: 'push', enabled: false }
  ]);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [visibility, setVisibility] = useState('team'); // 'team', 'organization', 'public'

  // 使用表单特定的代码字段存储高级配置
  // 注意：使用 watch 时指定类型为 unknown或任意字符串，避免类型错误
  const configValue = watch('additionalConfig' as any) as string | undefined;
  const currentConfig = safeParseJSON(configValue, {});

  // 添加新标签
  const addNewTag = () => {
    if (!newTagName.trim()) return;

    const newTag = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      color: `#${Math.floor(Math.random()*16777215).toString(16)}` // 随机颜色
    };

    const newTags = [...projectTags, newTag];
    setProjectTags(newTags);

    // 更新配置
    setValue('additionalConfig' as any, JSON.stringify({
      ...currentConfig,
      projectTags: newTags
    }));

    setNewTagName('');
    setShowNewTagForm(false);
  };

  // 删除标签
  const removeTag = (id: string) => {
    const newTags = projectTags.filter(tag => tag.id !== id);
    setProjectTags(newTags);

    // 更新配置
    setValue('additionalConfig' as any, JSON.stringify({
      ...currentConfig,
      projectTags: newTags
    }));
  };

  // 切换通知设置
  const toggleNotification = (id: string) => {
    const newSettings = notificationSettings.map(setting =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    );

    setNotificationSettings(newSettings);

    // 更新配置
    setValue('additionalConfig' as any, JSON.stringify({
      ...currentConfig,
      notificationSettings: newSettings
    }));
  };

  // 设置项目可见性
  const setProjectVisibility = (value: string) => {
    setVisibility(value);

    // 更新配置
    setValue('additionalConfig' as any, JSON.stringify({
      ...currentConfig,
      visibility: value
    }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">高级项目配置</h3>
      <p className="text-sm text-gray-500">配置项目的标签、通知和可见性等高级选项</p>

      {/* 项目标签管理 */}
      <div className="space-y-4">
        <div className="flex items-center">
          <FiTag className="mr-2 h-5 w-5 text-gray-400" />
          <h4 className="text-base font-medium text-gray-900">项目标签</h4>
        </div>

        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-700">添加标签以便更好地组织和筛选项目</span>
            <button
              type="button"
              className="inline-flex items-center px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
              onClick={() => setShowNewTagForm(true)}
            >
              <FiPlus className="mr-1" size={12} />
              添加标签
            </button>
          </div>

          {/* 已有标签列表 */}
          <div className="flex flex-wrap gap-2 mb-3">
            {projectTags.length > 0 ? (
              projectTags.map(tag => (
                <div key={tag.id} className="flex items-center px-2 py-1 bg-white border rounded-full shadow-sm">
                  <span
                    className="w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-xs font-medium text-gray-700">{tag.name}</span>
                  <button
                    type="button"
                    className="ml-2 text-gray-400 hover:text-red-500"
                    onClick={() => removeTag(tag.id)}
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-500 italic">暂无标签</div>
            )}
          </div>

          {/* 添加标签表单 */}
          {showNewTagForm && (
            <div className="bg-white p-3 border rounded-md shadow-sm">
              <h5 className="text-xs font-medium text-gray-700 mb-2">添加新标签</h5>
              <input
                type="text"
                placeholder="输入标签名称"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded mb-2"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                  onClick={() => setShowNewTagForm(false)}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={addNewTag}
                >
                  添加
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 项目可见性设置 */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center">
          <FiGlobe className="mr-2 h-5 w-5 text-gray-400" />
          <h4 className="text-base font-medium text-gray-900">项目可见性</h4>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div
            className={`border rounded-xl p-3 cursor-pointer transition-all ${
              visibility === 'team' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
            onClick={() => setProjectVisibility('team')}
          >
            <div className="flex items-center mb-1">
              <FiUsers className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-sm font-medium">团队可见</span>
            </div>
            <p className="text-xs text-gray-500">仅团队成员可查看和编辑</p>
          </div>

          <div
            className={`border rounded-xl p-3 cursor-pointer transition-all ${
              visibility === 'organization' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
            onClick={() => setProjectVisibility('organization')}
          >
            <div className="flex items-center mb-1">
              <FiUsers className="h-4 w-4 mr-2 text-purple-500" />
              <span className="text-sm font-medium">组织可见</span>
            </div>
            <p className="text-xs text-gray-500">组织内所有成员可查看</p>
          </div>

          <div
            className={`border rounded-xl p-3 cursor-pointer transition-all ${
              visibility === 'public' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
            }`}
            onClick={() => setProjectVisibility('public')}
          >
            <div className="flex items-center mb-1">
              <FiGlobe className="h-4 w-4 mr-2 text-green-500" />
              <span className="text-sm font-medium">公开</span>
            </div>
            <p className="text-xs text-gray-500">任何人可查看，仅团队可编辑</p>
          </div>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="space-y-4 mt-8">
        <div className="flex items-center">
          <FiBell className="mr-2 h-5 w-5 text-gray-400" />
          <h4 className="text-base font-medium text-gray-900">通知设置</h4>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="space-y-3">
            {notificationSettings.map(setting => (
              <div key={setting.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {setting.type === 'email' && '电子邮件通知'}
                  {setting.type === 'in-app' && '应用内通知'}
                  {setting.type === 'push' && '推送通知'}
                </span>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${setting.enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                  onClick={() => toggleNotification(setting.id)}
                >
                  <span
                    className={`${setting.enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationStep;
