import "./Button.css";

const SIZE_PRESETS = { sm: 40, md: 80, lg: 140 };

function darken(hex, amount = 0.7) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  const r = Math.round(((num >> 16) & 255) * amount);
  const g = Math.round(((num >> 8) & 255) * amount);
  const b = Math.round((num & 255) * amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function Button({
  color = "#2bb0fd",
  size = "md",
  shadowSize = 8,
  padding = 0,
  borderRadius = 28,
  onClick,
  children,
  type = "button",
  className = "",
  ...rest
}) {
  const buttonPx = typeof size === "number" ? size : SIZE_PRESETS[size] ?? 100;

  const toCss = (value) => (typeof value === "number" ? `${value}px` : value);

  return (
    <button
      type={type}
      className={`btn-blue ${className}`.trim()}
      style={{
        "--btn-color": color,
        "--btn-shadow-color": darken(color),
        "--btn-w": `${buttonPx}px`,
        "--btn-font": `${Math.round(buttonPx * 0.18)}px`,
        "--btn-shadow": `${shadowSize}px`,
        "--btn-padding": toCss(padding),
        "--btn-radius": toCss(borderRadius),
      }}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

export { Button };