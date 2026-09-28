// src/utils/CuentoComparer/FraseComponent.jsx
import { BtnAnim } from "../../components/BtnAnim";
import { REGION_PALETTES, REGION_ICONS } from "./constants";
import Sound from "../../assets/icons/sound";

function FraseComponent({ region, frase, audioUrl, isActive, onPlay }) {
  const palette = REGION_PALETTES[region];
  const Icon = REGION_ICONS[region] ?? null;

  return (
    <div
      className="row g-2 align-items-center rounded-3 px-3 py-2 mb-2 mx-0"
      style={{
        backgroundColor: palette.background,
        border: `1px solid ${palette.border}`,
      }}
    >
      <div className="col-auto d-flex flex-column align-items-center gap-2">
        <span aria-hidden="true">
          {Icon ? <Icon size={24} color={palette.border} /> : "NN"}
        </span>
        <BtnAnim
          color={palette.border}
          size="md"
          shadowSize={6}
          borderRadius={16}
          square={false}
          aria-label={`Escuchar la frase en ${region}`}
          onClick={() => onPlay(audioUrl)}
          padding={6}
        >
          <Sound size={16} color="#fff" />
        </BtnAnim>
      </div>
      <div className="col">
        <p className="m-0" style={{ color: palette.color }}>
          {frase}
        </p>
      </div>
    </div>
  );
}

export { FraseComponent };