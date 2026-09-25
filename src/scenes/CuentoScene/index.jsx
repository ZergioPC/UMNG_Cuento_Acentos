import { useState } from "react";
import { CuentoReader } from "../../utils/CuentoReader";
import { CuentoComparer } from "../../utils/CuentoComparer";

import { BtnSimple } from "../../components/BtnSimple";

import ArrowBack from "../../assets/icons/ArrowBack";

const VIEWS = [
  { key: "lectura", label: "Cuento" },
  { key: "comparar", label: "Comparar" },
];

function CuentoScene({ cuento, region, onBack }) {
  const [view, setView] = useState("lectura");

  if (!cuento || !region) return null;

  return (
    <section className="d-flex flex-column gap-3 h-100 overflow-hidden p-3">
      <div className="d-flex align-items-center gap-3">
        <BtnSimple icon={ArrowBack} onClick={onBack}>
          Volver
        </BtnSimple>
      </div>

      <div className="btn-group w-100" role="group" aria-label="Vista">
        {VIEWS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`btn btn-lg ${
              view === key ? "btn-light" : "btn-outline-light"
            }`}
            onClick={() => setView(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-grow-1" style={{ overflowY: "auto", minHeight: 0 }}>
        {view === "lectura" ? (
          <CuentoReader cuento={cuento} region={region} />
        ) : (
          <CuentoComparer cuento={cuento} />
        )}
      </div>
    </section>
  );
}

export { CuentoScene };
