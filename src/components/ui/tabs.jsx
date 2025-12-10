import React, { useState } from 'react';

export function Tabs({ children, defaultValue = '', onValueChange }) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (child.type === TabsList) {
          return React.cloneElement(child, { activeTab, onTabChange: handleTabChange });
        }
        if (child.type === TabsContent) {
          return React.cloneElement(child, { isActive: child.props.value === activeTab });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className = '', activeTab, onTabChange }) {
  return (
    <div className={`flex gap-4 border-b border-gray-200 ${className}`}>
      {React.Children.map(children, (child) => {
        if (child.type === TabsTrigger) {
          return React.cloneElement(child, {
            isActive: child.props.value === activeTab,
            onClick: () => onTabChange?.(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ children, isActive, onClick, value, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium transition-colors ${
        isActive
          ? 'text-violet-600 border-b-2 border-violet-600'
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, isActive, className = '' }) {
  if (!isActive) return null;

  return <div className={className}>{children}</div>;
}
