"use client";

import React from 'react';

interface PasswordStrengthIndicatorProps {
  strength: number; // 0-4，表示密码强度
}

export function PasswordStrengthIndicator({ strength }: PasswordStrengthIndicatorProps) {
  const getColorClass = (index: number) => {
    if (index >= strength) return 'bg-gray-200';
    
    if (strength <= 1) return 'bg-red-500';
    if (strength === 2) return 'bg-yellow-500';
    if (strength === 3) return 'bg-yellow-400';
    return 'bg-green-500';
  };
  
  return (
    <div className="mt-2">
      <div className="flex space-x-1">
        {[0, 1, 2, 3].map((index) => (
          <div 
            key={index}
            className={`h-1 flex-1 rounded-full ${getColorClass(index)}`}
          />
        ))}
      </div>
    </div>
  );
}
