import React, {createContext, ReactNode, useContext, useState} from 'react';

// 上下文类型定义
interface ProjectListContextType {
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (isOpen: boolean) => void;
  projectToDelete: { id: string; name: string } | null;
  setProjectToDelete: (project: { id: string; name: string } | null) => void;
}

// 创建上下文
const ProjectListContext = createContext<ProjectListContextType | undefined>(undefined);

// 上下文提供器组件
export const ProjectListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  const value = {
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    projectToDelete,
    setProjectToDelete,
  };

  return (
    <ProjectListContext.Provider value={value}>
      {children}
    </ProjectListContext.Provider>
  );
};

// 自定义Hook，用于访问上下文
export const useProjectListContext = () => {
  const context = useContext(ProjectListContext);
  if (context === undefined) {
    throw new Error('useProjectListContext must be used within a ProjectListProvider');
  }
  return context;
};
