import React from 'react';
import {Input} from '@/ui/atoms/Input/Input';
import {Text} from '@/ui/atoms/Typography/Text';

interface FormFieldProps {
  label?: string;
  name: string;
  error?: string;
  register: any; // 这里应该使用React Hook Form的类型
  type?: string;
  placeholder?: string;
  className?: string;
}

export function FormField({
  label,
  name,
  error,
  register,
  type = 'text',
  placeholder = '',
  className = ''
}: FormFieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={name}>
          {label}
        </label>
      )}
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
      />
      {error && (
        <Text variant="error" size="sm" className="mt-1">
          {error}
        </Text>
      )}
    </div>
  );
}
