

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, helperText, className, ...props }) => {
  const baseClasses = "block w-full px-3 py-2 border border-brand-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-pink focus:border-brand-pink sm:text-sm bg-white text-brand-text";
  
  // A more robust way to merge class names to prevent styles from being overwritten.
  const finalClassName = [baseClasses, className].filter(Boolean).join(' ');

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-brand-light-text mb-1">
        {label}
      </label>
      <input
        id={id}
        className={finalClassName}
        {...props}
      />
      {helperText && <p className="mt-2 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};
