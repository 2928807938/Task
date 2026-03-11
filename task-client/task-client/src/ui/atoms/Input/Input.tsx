import React, {forwardRef} from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', style, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${className}`}
        style={{
          borderColor: 'var(--theme-neutral-300)',
          backgroundColor: 'var(--theme-card-bg)',
          color: 'var(--foreground)',
          ...style
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--theme-primary-500)';
          e.target.style.boxShadow = `0 0 0 2px var(--theme-primary-100)`;
          if (props.onFocus) props.onFocus(e);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--theme-neutral-300)';
          e.target.style.boxShadow = 'none';
          if (props.onBlur) props.onBlur(e);
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
