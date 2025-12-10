import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function Select({ children, value, onValueChange }) {
  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
}

export function SelectTrigger({ children, value, onValueChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-600 ${className}`}
      >
        <SelectValue value={value} />
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>
      {open && <SelectContent>{children}</SelectContent>}
    </div>
  );
}

export function SelectContent({ children }) {
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
      {children}
    </div>
  );
}

export function SelectItem({ value, children, onSelect }) {
  return (
    <button
      onClick={() => {
        onSelect?.(value);
      }}
      className="w-full px-4 py-2 text-left hover:bg-violet-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
    >
      {children}
    </button>
  );
}

export function SelectValue({ value }) {
  return <span>{value || 'Select...'}</span>;
}
