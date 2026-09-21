import { useState } from "react";
import { CuentoReader } from "../../utils/CuentoReader";
import { CuentoComparer } from "../../utils/CuentoComparer";

import { BtnSimple } from "../BtnSimple";

import ArrowBack from "../../assets/icons/ArrowBack";

const VIEWS = [
  { key: "lectura", label: "Cuento" },
  { key: "comparar", label: "Comparar" },
];

function CuentoPanel({ cuento, region, onClose }) {
  const [view, setView] = useState("lectura");

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 m-0 p-0"
      style={{ zIndex: 1050 }}
    >
      <button
        type="button"
        aria-label="Cerrar panel"
        className="position-absolute top-0 start-0 w-100 h-100 border-0 bg-dark bg-opacity-50"
        onClick={onClose}
      />

      <div
        className="position-absolute top-50 start-50 translate-middle d-flex w-100 p-3"
        style={{ maxWidth: 720 }}
      >
        <div
          className="d-flex flex-column gap-3 w-100 p-3 rounded-4 bg-dark"
          role="dialog"
          aria-modal="true"
          style={{ height: "90vh", maxHeight: "90vh" }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="btn-group" role="group" aria-label="Vista">
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

            <BtnSimple icon={ArrowBack} onClick={onClose}>
              Cerrar
            </BtnSimple>
          </div>

          <div className="flex-grow-1" style={{ overflowY: "auto", minHeight: 0 }}>
            {view === "lectura" ? (
              <CuentoReader cuento={cuento} region={region} />
            ) : (
              <CuentoComparer cuento={cuento} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { CuentoPanel };