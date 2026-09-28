import { useState } from "react";
import { CuentoReader } from "../../utils/CuentoReader";
import { CuentoComparer } from "../../utils/CuentoComparer";

import { BtnSimple } from "../../components/BtnSimple";

import ArrowBack from "../../assets/icons/ArrowBack";
import User1 from "../../assets/icons/user1";
import User2 from "../../assets/icons/user2";
import User3 from "../../assets/icons/user3";

import { useReducedMotion } from "../../hooks/useReducedMotion";

import "./CuentoScene.css";

function CuentoScene({ cuento, region, onBack }) {
  const [isCompare, setIsCompare] = useState(false);
  const reduced = useReducedMotion();

  if (!cuento || !region) return null;

  return (
    <section
      className={`cuento-scene d-flex flex-column gap-3 h-100 overflow-hidden p-3${
        reduced ? " cuento-scene--reduced" : ""
      }`}
    >
      <div className="d-flex align-items-center gap-3">
        <BtnSimple icon={ArrowBack} onClick={onBack}>
          Volver
        </BtnSimple>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isCompare}
        aria-label="Comparar"
        title="Comparar"
        className={`cuento-scene__switch${
          isCompare ? " cuento-scene__switch--on" : ""
        }`}
        onClick={() => setIsCompare((prev) => !prev)}
      >
        <span className="cuento-scene__switch-thumb" aria-hidden="true">
          <span className="cuento-scene__switch-icons">
            {/* El primero está siempre: no se apaga nunca al cambiar de estado. */}
            <User2
              className={`cuento-scene__switch-icon${
                isCompare ? " cuento-scene__switch-icon--on" : ""
              }`}
            />
            <User1 className="cuento-scene__switch-icon cuento-scene__switch-icon--static" />
            <User3
              className={`cuento-scene__switch-icon${
                isCompare ? " cuento-scene__switch-icon--on" : ""
              }`}
            />
          </span>
        </span>
      </button>

      <div className="flex-grow-1" style={{ overflowY: "auto", minHeight: 0 }}>
        {isCompare ? (
          <CuentoComparer cuento={cuento} />
        ) : (
          <CuentoReader cuento={cuento} region={region} />
        )}
      </div>
    </section>
  );
}

export { CuentoScene };
