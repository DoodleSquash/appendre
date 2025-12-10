import React from 'react';

export function Textarea({
  className = '',
  placeholder = '',
  disabled = false,
  rows = 4,
  ...props
}) {
  const baseStyles = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-colors resize-none';

  return (
    <textarea
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={`${baseStyles} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${className}`}
      {...props}
    />
  );
}
