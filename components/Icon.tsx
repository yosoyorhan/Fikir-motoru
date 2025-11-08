import React from 'react';

interface IconProps {
  icon: React.ElementType;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const Icon: React.FC<IconProps> = ({ icon: IconComponent, className, size = 24, strokeWidth = 2 }) => {
  return <IconComponent className={className} size={size} strokeWidth={strokeWidth} />;
};

export default Icon;
