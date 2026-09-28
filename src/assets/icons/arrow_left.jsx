import React from 'react';

const ArrowLeft = ({ size = 24, color = 'currentColor', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M21,9H10V7a1,1,0,0,0-1.64-.77L3.28,10.46a2,2,0,0,0,0,3.08l5.08,4.23A1,1,0,0,0,9,18a1,1,0,0,0,.42-.09A1,1,0,0,0,10,17V15H21a1,1,0,0,0,1-1V10A1,1,0,0,0,21,9Z" />
    </svg>
  );
};

export default ArrowLeft;
