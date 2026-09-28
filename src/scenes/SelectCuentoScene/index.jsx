import { CUENTOS } from "../../db";

import { BtnAnim } from "../../components/BtnAnim";
import { BtnSimple } from "../../components/BtnSimple";
import { Papel } from "../../utils/fondo/Papel";

import BackSign from "../../assets/icons/back_sign";

// La sección solo ancla el fondo; el scroll va en el div de contenido, para
// que el papel no se vaya con la lista al desplazar.
function SelectCuentoScene({ onSelect, onBack }) {
  return (
    <section className="position-relative h-100 overflow-hidden">
      <Papel />

      <div className="d-flex flex-column align-items-center gap-4 h-100 overflow-auto p-3">
        <BtnSimple icon={BackSign} onClick={onBack}>
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
      </div>
    </section>
  );
}

export { SelectCuentoScene };