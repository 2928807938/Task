'use client';

import React from 'react';
import {FiFile, FiFileText, FiLink} from 'react-icons/fi';

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'sketch' | 'doc' | 'other';
}

interface ResourceListProps {
  resources: Resource[];
}

export const ResourceList: React.FC<ResourceListProps> = ({ resources }) => {
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FiFileText className="h-5 w-5 text-red-500" />;
      case 'link':
        return <FiLink className="h-5 w-5 text-blue-500" />;
      case 'sketch':
        return <FiFile className="h-5 w-5 text-yellow-500" />;
      case 'doc':
        return <FiFileText className="h-5 w-5 text-blue-500" />;
      default:
        return <FiFile className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">关联资源</h3>

      <div className="space-y-2">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <div className="mr-3">
              {getResourceIcon(resource.type)}
            </div>
            <span className="text-gray-700 dark:text-gray-300">{resource.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
