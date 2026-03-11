import React from 'react';
import {motion} from 'framer-motion';
import ProjectCalendar from '@/ui/organisms/ProjectCalendar';
import {ProjectTask} from '@/types/api-types';

interface ProjectCalendarPanelProps {
  projectId: string;
  tasks: ProjectTask[];
}

const ProjectCalendarPanel: React.FC<ProjectCalendarPanelProps> = ({
  projectId,
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
          <ProjectCalendar
            projectId={projectId}
            tasks={tasks}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectCalendarPanel;
