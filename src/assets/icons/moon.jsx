import React from 'react';

const Moon = ({ size = 24, color = 'currentColor', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12,2h-.46a1,1,0,0,0-.9.77,1,1,0,0,0,.46,1.09A5.92,5.92,0,0,1,14,9,6,6,0,0,1,3.93,13.4a1,1,0,0,0-1.65,1A10,10,0,1,0,12,2Z" />
    </svg>
  );
};

export default Moon;
