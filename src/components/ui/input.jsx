import React from 'react';

export function Input({
  className = '',
  placeholder = '',
  type = 'text',
  disabled = false,
  ...props
}) {
  const baseStyles = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-colors';

  return (
    <input
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={`${baseStyles} ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${className}`}
      {...props}
    />
  );
}
