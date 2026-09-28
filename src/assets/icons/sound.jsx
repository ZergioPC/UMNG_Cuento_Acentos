import React from 'react';

const Sound = ({ size = 24, color = 'currentColor', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <ellipse cx="6.5" cy="18" rx="4.5" ry="4" />
      <ellipse cx="17.5" cy="16" rx="4.5" ry="4" />
      <path d="M10,19a1,1,0,0,1-1-1V5a1,1,0,0,1,.82-1l11-2a1,1,0,0,1,.82.21A1,1,0,0,1,22,3V16a1,1,0,0,1-2,0V4.2L11,5.83V18A1,1,0,0,1,10,19Z" />
      <path d="M10,10a1,1,0,0,1-.18-2l11-2a1,1,0,1,1,.36,2l-11,2Z" />
    </svg>
  );
};

export default Sound;
