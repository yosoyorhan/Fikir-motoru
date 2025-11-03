import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <img 
      id="app-logo-image"
      src="https://psikominik.com/test/9980be65-439b-4908-a7b3-3c026ff24729_removalai_preview.png"
      alt="Cerevo Logo"
      className="w-8 h-8"
    />
    <span className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Cerevo</span>
  </div>
);

export default Logo;