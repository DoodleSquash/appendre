import React, { useState } from 'react';
import { X } from 'lucide-react';

export function Sheet({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (child.type === SheetTrigger) {
          return React.cloneElement(child, { onClick: () => setOpen(true) });
        }
        if (child.type === SheetContent) {
          return React.cloneElement(child, { open, onOpenChange: setOpen });
        }
        return child;
      })}
    </div>
  );
}

export function SheetTrigger({ children, onClick }) {
  return <div onClick={onClick}>{children}</div>;
}

export function SheetContent({ children, open, onOpenChange }) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-lg z-50 overflow-y-auto">
        <div className="p-6">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          {children}
        </div>
      </div>
    </>
  );
}

export function SheetHeader({ children, className = '' }) {
  return <div className={`mb-6 ${className}`}>{children}</div>;
}

export function SheetTitle({ children, className = '' }) {
  return <h2 className={`text-2xl font-bold ${className}`}>{children}</h2>;
}
