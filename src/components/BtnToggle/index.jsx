import "../BtnAnim/Button.css";
import "./BtnToggle.css";

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

function BtnToggle({
  active = true,
  onChange,
  onClick,
  color = "#2bb0fd",
  size = "md",
  shadowSize = 8,
  padding = 0,
  borderRadius = 28,
  children,
  type = "button",
  className = "",
  square = false,
  disabled = false,
  ...rest
}) {
  const buttonPx = typeof size === "number" ? size : SIZE_PRESETS[size] ?? 100;

  const toCss = (value) => (typeof value === "number" ? `${value}px` : value);

  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    onChange?.(!active, event);
  };

  return (
    <button
      type={type}
      role="switch"
      aria-checked={active}
      disabled={disabled}
      className={`btn-blue btn-toggle ${active ? "btn-toggle--on" : "btn-toggle--off"} ${
        square ? "btn-blue--square" : ""
      } ${className}`.trim()}
      style={{
        "--btn-color": color,
        "--btn-shadow-color": darken(color),
        "--btn-w": `${buttonPx}px`,
        "--btn-font": `${Math.round(buttonPx * 0.18)}px`,
        "--btn-shadow": `${shadowSize}px`,
        "--btn-padding": toCss(padding),
        "--btn-radius": toCss(borderRadius),
      }}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
}

export { BtnToggle };
