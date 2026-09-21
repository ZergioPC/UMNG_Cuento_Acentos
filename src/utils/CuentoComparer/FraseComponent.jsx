import { Button } from "../../components/AnimButton";
import { REGION_PALETTES, REGION_ICONS } from "./constants";

function FraseComponent({ region, frase, audioUrl, isActive, onPlay }) {
  const palette = REGION_PALETTES[region];
  const icon = REGION_ICONS[region] ?? "NN";

  return (
    <div
      className="row g-2 align-items-center rounded-3 px-3 py-2 mb-2 mx-0"
      style={{
        backgroundColor: palette.background,
        border: `1px solid ${palette.border}`,
      }}
    >
      <div className="col-auto d-flex flex-column align-items-center gap-2">
        <span aria-hidden="true">{icon}</span>
        <Button
          size="sm"
          aria-label={`Escuchar la frase en ${region}`}
          onClick={() => onPlay(audioUrl)}
        >
          {isActive ? "⏹" : "🔊"}
        </Button>
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