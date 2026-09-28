import { useState } from "react";
import { CuentoReader } from "../../utils/CuentoReader";
import { CuentoComparer } from "../../utils/CuentoComparer";

import { BtnSimple } from "../../components/BtnSimple";

import ArrowBack from "../../assets/icons/ArrowBack";
import User1 from "../../assets/icons/user1";
import User2 from "../../assets/icons/user2";
import User3 from "../../assets/icons/user3";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { Papel } from "../../utils/fondo/Papel";

import "./CuentoScene.css";

function CuentoScene({ cuento, region, onBack }) {
  const [isCompare, setIsCompare] = useState(false);
  const reduced = useReducedMotion();

  if (!cuento || !region) return null;

  return (
    <section
      className={`cuento-scene position-relative d-flex flex-column gap-3 h-100 overflow-hidden p-3${
        reduced ? " cuento-scene--reduced" : ""
      }`}
    >
      <Papel />

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
            {/* User1 acompaña siempre al cuento, así que no entra ni sale. */}
            <User2
              className={`cuento-scene__switch-icon cuento-scene__switch-icon--step1${
                isCompare ? " cuento-scene__switch-icon--on" : ""
              }`}
            />
            <User1 className="cuento-scene__switch-icon cuento-scene__switch-icon--static" />
            <User3
              className={`cuento-scene__switch-icon cuento-scene__switch-icon--step2${
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
