// src/utils/CuentoComparer/FraseComponent.jsx
import { AudioButton } from "../../components/AudioButton";
import { REGION_PALETTES, REGION_ICONS } from "./constants";
import "./FraseComponent.css";

function FraseComponent({ region, frase, audioUrl, isActive, label, onPlay }) {
  const palette = REGION_PALETTES[region];
  const Icon = REGION_ICONS[region] ?? null;

  return (
    <div
      className={`frase-component${
        isActive ? " frase-component--active" : ""
      }`}
      style={{
        "--frase-bg": palette.background,
        "--frase-border": palette.border,
        "--frase-color": palette.color,
      }}
    >
      <div className="frase-component__aside">
        <span aria-hidden="true">
          {Icon ? <Icon size={24} color={palette.border} /> : "NN"}
        </span>
        {audioUrl && (
          <AudioButton
            active={isActive}
            color={palette.border}
            label={label}
            onClick={onPlay}
          />
        )}
      </div>
      <p className="frase-component__text">{frase}</p>
    </div>
  );
}

export { FraseComponent };
