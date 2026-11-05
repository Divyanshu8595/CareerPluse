import React from 'react';

interface CompanyBadgeProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BRAND_PALETTES: Record<string, { bg: string; text: string; border: string }> = {
  stripe: {
    bg: 'bg-[#635BFF]/10 dark:bg-[#635BFF]/20',
    text: 'text-[#4A43D9] dark:text-[#8F88FF]',
    border: 'border-[#635BFF]/20 dark:border-[#635BFF]/30',
  },
  airbnb: {
    bg: 'bg-[#FF5A5F]/10 dark:bg-[#FF5A5F]/20',
    text: 'text-[#D93B41] dark:text-[#FF7D82]',
    border: 'border-[#FF5A5F]/20 dark:border-[#FF5A5F]/30',
  },
  linear: {
    bg: 'bg-[#5E6AD2]/10 dark:bg-[#5E6AD2]/20',
    text: 'text-[#4752B3] dark:text-[#8E99EC]',
    border: 'border-[#5E6AD2]/20 dark:border-[#5E6AD2]/30',
  },
  vercel: {
    bg: 'bg-stone-900/10 dark:bg-stone-100/10',
    text: 'text-stone-900 dark:text-stone-100',
    border: 'border-stone-900/20 dark:border-stone-100/20',
  },
  anthropic: {
    bg: 'bg-[#D97706]/10 dark:bg-[#D97706]/20',
    text: 'text-[#B45309] dark:text-[#FBBF24]',
    border: 'border-[#D97706]/20 dark:border-[#D97706]/30',
  },
  figma: {
    bg: 'bg-[#A259FF]/10 dark:bg-[#A259FF]/20',
    text: 'text-[#7B2CBF] dark:text-[#C77DFF]',
    border: 'border-[#A259FF]/20 dark:border-[#A259FF]/30',
  },
  meta: {
    bg: 'bg-[#0081FB]/10 dark:bg-[#0081FB]/20',
    text: 'text-[#0064C8] dark:text-[#52A5FF]',
    border: 'border-[#0081FB]/20 dark:border-[#0081FB]/30',
  },
  datadog: {
    bg: 'bg-[#632CA6]/10 dark:bg-[#632CA6]/20',
    text: 'text-[#632CA6] dark:text-[#9B6FD6]',
    border: 'border-[#632CA6]/20 dark:border-[#632CA6]/30',
  },
};

const FALLBACK_PALETTES = [
  { bg: 'bg-[#2E4A3B]/10 dark:bg-[#2E4A3B]/20', text: 'text-[#2E4A3B] dark:text-[#76A88E]', border: 'border-[#2E4A3B]/20' },
  { bg: 'bg-[#9C7844]/10 dark:bg-[#9C7844]/20', text: 'text-[#876534] dark:text-[#D4AF77]', border: 'border-[#9C7844]/20' },
  { bg: 'bg-[#4B6B7A]/10 dark:bg-[#4B6B7A]/20', text: 'text-[#3B5764] dark:text-[#88B1C4]', border: 'border-[#4B6B7A]/20' },
  { bg: 'bg-[#B35234]/10 dark:bg-[#B35234]/20', text: 'text-[#8C3F23] dark:text-[#E8A087]', border: 'border-[#B35234]/20' },
];

export const CompanyBadge: React.FC<CompanyBadgeProps> = ({ name, size = 'md', className = '' }) => {
  const normalized = (name || '').toLowerCase().trim();
  const matched = BRAND_PALETTES[normalized];

  // Hash fallback
  const charCode = (name && name.charCodeAt(0)) || 0;
  const fallback = FALLBACK_PALETTES[charCode % FALLBACK_PALETTES.length];
  const palette = matched || fallback;

  const letter = (name && name.charAt(0).toUpperCase()) || '?';

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px] rounded-md',
    md: 'w-8 h-8 text-xs rounded-lg',
    lg: 'w-11 h-11 text-base rounded-xl',
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center font-serif font-bold border shrink-0 select-none shadow-2xs ${sizeClasses} ${palette.bg} ${palette.text} ${palette.border} ${className}`}
      title={name}
      aria-hidden="true"
    >
      {letter}
    </div>
  );
};
