import React from 'react';

const variants = {
  default: 'bg-violet-100 text-violet-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-amber-100 text-amber-800',
};

export function Badge({ children, variant = 'default', className = '' }) {
  const variantStyles = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
}
