import React, { useState, useRef, useEffect } from 'react';

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (child.type === DropdownMenuTrigger) {
          return React.cloneElement(child, { onClick: () => setOpen(!open), open });
        }
        if (child.type === DropdownMenuContent) {
          return React.cloneElement(child, { open, onOpenChange: setOpen });
        }
        return child;
      })}
    </div>
  );
}

export function DropdownMenuTrigger({ children, onClick, open, asChild = false }) {
  if (asChild && React.isValidElement(children)) {
    // Pass click handler to child directly (avoids nested button)
    return React.cloneElement(children, {
      onClick,
      'aria-expanded': open,
    });
  }

  return (
    <button onClick={onClick} aria-expanded={open} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children, open, onOpenChange }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOpenChange(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors flex items-center gap-2"
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="h-px bg-gray-200 my-1" />;
}
