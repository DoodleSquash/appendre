import React from 'react';
import { Sparkles } from 'lucide-react';

function Logo({ size = 'default', showText = true }) {
  const sizes = {
    small: { icon: 20, text: 'text-lg' },
    default: { icon: 28, text: 'text-2xl' },
    large: { icon: 40, text: 'text-4xl' }
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-xl blur-lg opacity-60" />
        <div className="relative bg-gradient-to-r from-violet-600 to-fuchsia-500 p-2 rounded-xl">
          <Sparkles className="text-white" size={icon} />
        </div>
      </div>
      {showText && (
        <span className={`${text} font-bold bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent`}>
          apprendre
        </span>
      )}
    </div>
  );
}

export default Logo;