import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    lucide: {
      createIcon: (name: string, options: any) => SVGElement;
    };
  }
}

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const Icon: React.FC<IconProps> = ({ name, className, size = 24, strokeWidth = 2 }) => {
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (iconRef.current && window.lucide) {
      const iconNode = window.lucide.createIcon(name, {
        width: size,
        height: size,
        'stroke-width': strokeWidth,
        class: className,
      });

      if (iconNode) {
        iconRef.current.innerHTML = '';
        iconRef.current.appendChild(iconNode);
      } else {
        // Fallback or error logging
        console.warn(`Icon "${name}" not found.`);
        iconRef.current.innerHTML = '�'; // Display a fallback character
      }
    }
  }, [name, className, size, strokeWidth]);

  // Using a span so it behaves like an inline element by default
  return <span ref={iconRef} className="lucide-icon-wrapper inline-flex items-center justify-center" />;
};

export default Icon;
