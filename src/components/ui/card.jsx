import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return (
    <h2 className={`text-2xl font-bold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={`${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-6 pt-6 border-t border-gray-200 flex gap-4 justify-between ${className}`}>
      {children}
    </div>
  );
}
