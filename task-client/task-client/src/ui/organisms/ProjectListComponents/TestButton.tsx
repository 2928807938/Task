'use client';

import React from 'react';
import {useRouter} from 'next/navigation';

const TestButton = ({ projectId }: { projectId: string }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/project-detail?id=${projectId}`);
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-red-500 text-white rounded-md"
    >
      测试跳转
    </button>
  );
};

export default TestButton;
