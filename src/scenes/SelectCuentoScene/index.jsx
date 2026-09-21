import { CUENTOS } from "../../db";

import { BtnAnim } from "../../components/BtnAnim";
import { BtnSimple } from "../../components/BtnSimple";

import ArrowBack from "../../assets/icons/ArrowBack";

function SelectCuentoScene({ onSelect, onBack }) {
  return (
    <section className="d-flex flex-column align-items-center gap-4 min-vh-100 p-3">
      <BtnSimple icon={ArrowBack} onClick={onBack}>
        Volver
      </BtnSimple>

      <h1>Elige un cuento</h1>

      <ul className="list-unstyled d-flex flex-column gap-3 align-items-center m-0">
        {CUENTOS.map((cuento) => (
          <li key={cuento.id}>
            <BtnAnim 
              size="lg" 
              padding={10}
              borderRadius={10}
              onClick={() => onSelect(cuento)}
            >
              {cuento.title}
            </BtnAnim>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { SelectCuentoScene };