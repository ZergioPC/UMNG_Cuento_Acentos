import "./Button.css";

const SIZE_PRESETS = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

function Button({
  size = "md",
  onClick,
  children,
  type = "button",
  className = "",
  ...rest
}) {
  const isPixels = typeof size === "number";
  const presetClass = isPixels ? "" : `btn--${SIZE_PRESETS[size] || "md"}`;

  return (
    <button
      type={type}
      className={`btn ${presetClass} ${className}`.trim()}
      style={isPixels ? { "--btn-size": `${size}px` } : undefined}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

export { Button };