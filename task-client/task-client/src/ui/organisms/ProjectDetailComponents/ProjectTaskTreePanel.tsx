import React from 'react';
import {motion} from 'framer-motion';
import {TaskTree} from '@/ui/organisms/TaskTree';
import {ProjectTask} from '@/types/api-types';

interface ProjectTaskTreePanelProps {
  tasks: ProjectTask[];
}

const ProjectTaskTreePanel: React.FC<ProjectTaskTreePanelProps> = ({
  tasks
}) => {
  return (
    <div className="mt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">任务树</h2>
          <div className="min-h-[500px] border border-gray-100 rounded-xl p-4 bg-gray-50">
            <TaskTree
              tasks={tasks}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectTaskTreePanel;
