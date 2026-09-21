import "./IconButton.css";

function IconButton({
  icon: Icon,
  hoverColor = "#fff",
  size = 24,
  onClick,
  type = "button",
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      className={`icon-btn ${className}`.trim()}
      style={{
        "--icon-hover-color": hoverColor,
        "--icon-size": `${size}px`,
      }}
      onClick={onClick}
      {...rest}
    >
      <Icon />
    </button>
  );
}

export { IconButton };