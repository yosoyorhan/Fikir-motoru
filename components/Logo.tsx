import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg 
      className="w-8 h-8 text-[var(--text-primary)]"
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M15.5 18.5c-2 0-3.5-1.5-3.5-3.5s1.5-3.5 3.5-3.5c3.5 0 3.5 5 0 7z" />
      <path d="M8.5 11.5c2 0 3.5 1.5 3.5 3.5s-1.5 3.5-3.5 3.5c-3.5 0-3.5-5 0-7z" />
      <path d="M12 11.5V3a2.5 2.5 0 0 0-5 0v3" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" />
      <path d="M12 12.5V21" />
      <path d="M18 11a2.5 2.5 0 0 0-5 0v1.5" />
      <circle cx="13" cy="12.5" r="1.5" fill="currentColor" />
      <path d="M10 17a2.5 2.5 0 0 0-5 0v1" />
      <circle cx="5" cy="18" r="1.5" fill="currentColor" />
      <path d="M14 15.5a2.5 2.5 0 0 0 5 0V14" />
      <circle cx="19" cy="14" r="1.5" fill="currentColor" />
    </svg>
    <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Cerevo</span>
  </div>
);

export default Logo;