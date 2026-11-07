const Stop = ({ size = 24, color = 'currentColor', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="5" y="5" width="14" height="14" rx="3" />
    </svg>
  );
};

export default Stop;
