import { useState } from "react";
import { REGIONS, REGION_LABELS } from "../../db";
import { FraseComponent } from "./FraseComponent";
import { VIEW_ORDER } from "./constants";

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