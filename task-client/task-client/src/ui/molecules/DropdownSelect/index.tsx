"use client";

import React, {useEffect, useRef, useState} from 'react';
import {FiChevronDown} from 'react-icons/fi';

interface Option {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  options: Option[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  options,
  defaultValue,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(
    options.find(option => option.value === defaultValue) || options[0]
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onChange && onChange(option.value);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label}</span>
        <FiChevronDown className={`ml-2 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md py-1 text-sm ring-1 ring-black ring-opacity-5 focus:outline-none">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                selectedOption?.value === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : ''
              }`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownSelect;
