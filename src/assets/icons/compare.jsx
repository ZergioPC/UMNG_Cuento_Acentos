import React from 'react';

const Compare = ({ size = 24, color = 'currentColor', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M14,4.28V19.72A2.46,2.46,0,0,1,14,20a2,2,0,0,1-.75,1.29,2,2,0,0,1-1.23.43,2,2,0,0,1-.48-.06l-6-1.5A2,2,0,0,1,4,18.22V5.78A2,2,0,0,1,5.51,3.84l6-1.5A2,2,0,0,1,14,4,2.46,2.46,0,0,1,14,4.28Z" />
      <path d="M20,6V18a2,2,0,0,1-2,2H15a1.27,1.27,0,0,0,0-.28V4.28A1.37,1.37,0,0,0,15,4h3A2,2,0,0,1,20,6Z" />
    </svg>
  );
};

export default Compare;
