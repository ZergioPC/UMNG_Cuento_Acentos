import { useState } from "react";
import { REGIONS } from "../../db";

const REGION_LABELS = {
  paisa: "Paisa",
  rolo: "Rolo",
  costeño: "Costeño",
};

const VIEW_ORDER = ["costeño", "rolo", "paisa"];

const REGION_PALETTES = {
  paisa: { background: "#fdf3d8", border: "#e6b800", color: "#5c4d00" },
  rolo: { background: "#d9f2e4", border: "#28a745", color: "#0b3d1e" },
  costeño: { background: "#fde2e2", border: "#dc3545", color: "#4a0d0d" },
};

function FraseComponent({ region, frase }) {
  let icon = "";

  switch (region) {
    case VIEW_ORDER[0]:   // Costeño
      icon = "🔴";
      break;
    case VIEW_ORDER[1]:   // Rolo
      icon = "🟢";
      break;
    case VIEW_ORDER[2]:   // Paisa
      icon = "🟡";
      break;
    default:
      icon = "NN";
      break;
  }

  const palette = REGION_PALETTES[region];

  return (
    <div
      className="d-flex align-items-center gap-2 rounded-3 px-3 py-2 mb-2"
      style={{
        backgroundColor: palette.background,
        border: `1px solid ${palette.border}`,
      }}
    >
      <span>{icon}</span>
      <p className="m-0" style={{ color: palette.color }}>
        {frase}
      </p>
    </div>
  );
}

function CuentoComparer({ cuento }) {
  const [visible, setVisible] = useState(
    Object.fromEntries(REGIONS.map((region) => [region, true]))
  );

  function toggleRegion(region) {
    setVisible((prev) => ({ ...prev, [region]: !prev[region] }));
  }

  return (
    <article
      className="w-100 p-4 rounded-4 bg-white bg-opacity-10"
      style={{ maxWidth: 720 }}
    >
      <h2 className="text-center mb-4">{cuento.title}</h2>

      <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
        {REGIONS.map((region) => (
          <div key={region} className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id={`switch-${region}`}
              checked={visible[region]}
              onChange={() => toggleRegion(region)}
            />
            <label className="form-check-label" htmlFor={`switch-${region}`}>
              {REGION_LABELS[region]}
            </label>
          </div>
        ))}
      </div>

      <div className="d-flex flex-column gap-3">
        {cuento.frases.map((frase) => (
          <div key={frase.id}>
            {VIEW_ORDER.map(
              (region) =>
                visible[region] && (
                  <FraseComponent key={region} region={region} frase={frase.content[region]} />
                )
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

export { CuentoComparer };