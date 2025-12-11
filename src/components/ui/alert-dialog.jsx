import React from 'react';

export function AlertDialog({ children, open, onOpenChange }) {
  return React.cloneElement(children, { open, onOpenChange });
}

export function AlertDialogTrigger({ children, onClick }) {
  return <div onClick={onClick}>{children}</div>;
}

export function AlertDialogContent({ children, open, onOpenChange }) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[100]"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[101] max-w-sm w-full mx-4 p-6">
        {children}
      </div>
    </>
  );
}

export function AlertDialogHeader({ children, className = '' }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function AlertDialogTitle({ children, className = '' }) {
  return <h2 className={`text-xl font-bold text-gray-900 ${className}`}>{children}</h2>;
}

export function AlertDialogDescription({ children, className = '' }) {
  return <p className={`text-gray-600 text-sm ${className}`}>{children}</p>;
}

export function AlertDialogFooter({ children, className = '' }) {
  return <div className={`mt-6 flex gap-4 justify-end ${className}`}>{children}</div>;
}

export function AlertDialogAction({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium ${className}`}
    >
      {children}
    </button>
  );
}

export function AlertDialogCancel({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium ${className}`}
    >
      {children}
    </button>
  );
}
