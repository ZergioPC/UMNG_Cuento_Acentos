import React from 'react';

const Slides = ({ size = 24, color = 'currentColor', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M21,3H3A1,1,0,0,0,3,5V16a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V5a1,1,0,0,0,0-2ZM12,14a3.5,3.5,0,1,1,3.5-3.5A3.5,3.5,0,0,1,12,14Zm-1.92,5-1.3,1.62A1,1,0,0,1,8,21a1,1,0,0,1-.62-.22,1,1,0,0,1-.16-1.4l.3-.38Zm6.54,1.78A1,1,0,0,1,16,21a1,1,0,0,1-.78-.38L13.92,19h2.56l.3.38A1,1,0,0,1,16.62,20.78Z" />
    </svg>
  );
};

export default Slides;
