'use client';

import { Edit2 } from 'lucide-react';

type InlineEditButtonProps = {
  onClick: () => void;
  label?: string;
  className?: string;
};

export default function InlineEditButton({ onClick, label, className = '' }: InlineEditButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-md ${className}`}
      aria-label={label || 'Edit'}
    >
      <Edit2 className="w-3.5 h-3.5" />
      {label && <span>{label}</span>}
    </button>
  );
}

