import React from 'react';

const BackSign = ({ size = 24, color = 'currentColor', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M10,3V5H13.5a8.5,8.5,0,0,1,0,17H3a1,1,0,0,1-1,-1V17a1,1,0,0,1,1,-1H13.5a2.5,2.5,0,0,0,0,-5H10V13a1,1,0,0,1-1.64,.77l-6,-5a1,1,0,0,1,0-1.54l6,-5A1,1,0,0,1,10,3Z" />
    </svg>
  );
};

export default BackSign;
