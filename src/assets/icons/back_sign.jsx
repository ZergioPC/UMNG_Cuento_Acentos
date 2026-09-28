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
      <path d="M21,14H19V10.5a8.5,8.5,0,0,0-17,0V21a1,1,0,0,0,1,1H7a1,1,0,0,0,1-1V10.5a2.5,2.5,0,0,1,5,0V14H11a1,1,0,0,0-.77,1.64l5,6a1,1,0,0,0,1.54,0l5-6A1,1,0,0,0,21,14Z" />
    </svg>
  );
};

export default BackSign;
