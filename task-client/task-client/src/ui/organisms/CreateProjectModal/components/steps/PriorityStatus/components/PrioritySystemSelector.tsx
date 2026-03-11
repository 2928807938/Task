"use client";

import React from "react";
import {PrioritySystem} from "@/types/api-types";

interface Props {
  value: PrioritySystem;
  onChange: (v: PrioritySystem) => void;
}

const options: { label: string; value: PrioritySystem }[] = [
  { label: "标准", value: "standard" },
  { label: "高级", value: "advanced" },
  { label: "自定义", value: "custom" },
];

const PrioritySystemSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="flex space-x-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`px-3 py-1.5 text-xs rounded border transition-colors duration-150 ${
            value === opt.value
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default PrioritySystemSelector;
