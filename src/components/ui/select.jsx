import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({ children, value, onValueChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelect = (selectedValue) => {
    onValueChange?.(selectedValue);
    setOpen(false);
  };

  // Extract trigger and content from children
  let trigger = null;
  let content = null;

  React.Children.forEach(children, (child) => {
    if (child?.type === SelectTrigger) {
      trigger = child;
    } else if (child?.type === SelectContent) {
      content = child;
    }
  });

  return (
    <div ref={ref} className="relative">
      {trigger && React.cloneElement(trigger, {
        value,
        open,
        onClick: () => setOpen(!open),
        content
      })}
      {open && content && React.cloneElement(content, { onSelect: handleSelect })}
    </div>
  );
}

export function SelectTrigger({ children, value, open, onClick, content, className = '' }) {
  // Find the display text for the selected value
  let displayText = value || 'Select...';

  if (content && value) {
    React.Children.forEach(content.props.children, (child) => {
      if (child?.props?.value === value) {
        displayText = child.props.children;
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-600 transition-colors ${className}`}
    >
      <span className="text-gray-900">{displayText}</span>
      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function SelectContent({ children, onSelect }) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
      {React.Children.map(children, (child) => {
        if (child?.type === SelectItem) {
          return React.cloneElement(child, { onSelect });
        }
        return child;
      })}
    </div>
  );
}

export function SelectItem({ value, children, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(value)}
      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-violet-50 hover:text-violet-900 focus:outline-none focus:bg-violet-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
    >
      {children}
    </button>
  );
}

export function SelectValue({ children }) {
  return <>{children}</>;
}
