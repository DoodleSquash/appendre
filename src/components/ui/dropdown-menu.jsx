import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  return (
    <div className="relative inline-block">
      {React.Children.map(children, (child) => {
        if (child.type === DropdownMenuTrigger) {
          // Wrap trigger to get an anchor element for positioning
          return (
            <div ref={anchorRef} className="inline-block">
              {React.cloneElement(child, { onClick: () => setOpen(!open), open })}
            </div>
          );
        }
        if (child.type === DropdownMenuContent) {
          return React.cloneElement(child, { open, onOpenChange: setOpen, anchorRef });
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

export function DropdownMenuContent({ children, open, onOpenChange, anchorRef }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

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

  useEffect(() => {
    function updatePosition() {
      if (open && anchorRef?.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.right
        });
      }
    }

    if (open) {
      updatePosition();
      // Update position on scroll to keep dropdown fixed relative to viewport
      window.addEventListener('scroll', updatePosition, true);
      return () => window.removeEventListener('scroll', updatePosition, true);
    }
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={ref}
      style={{ 
        position: 'fixed', 
        top: `${position.top}px`, 
        left: `${position.left}px`, 
        transform: 'translateX(-100%)' 
      }}
      className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    >
      {children}
    </div>,
    document.body
  );
}

export function DropdownMenuItem({ children, onClick, asChild, className = '' }) {
  if (asChild && React.isValidElement(children)) {
    // Render Link directly with proper styling
    return React.cloneElement(children, {
      className: `w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors flex items-center gap-2 ${className}`,
    });
  }

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg transition-colors flex items-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="h-px bg-gray-200 my-1" />;
}
