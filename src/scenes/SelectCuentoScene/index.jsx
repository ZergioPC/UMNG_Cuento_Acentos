import { CUENTOS } from "../../db";

import { Button as AnimButton } from "../../components/AnimButton";
import { IconButton } from "../../components/IconButton";

import ArrowBack from "../../assets/icons/ArrowBack";

function SelectCuentoScene({ onSelect, onBack }) {
  return (
    <section className="d-flex flex-column align-items-center gap-4 min-vh-100 p-3">
      <IconButton icon={ArrowBack} onClick={onBack}>
        Volver
      </IconButton>

      <h1>Elige un cuento</h1>

      <ul className="list-unstyled d-flex flex-column gap-3 align-items-center m-0">
        {CUENTOS.map((cuento) => (
          <li key={cuento.id}>
            <AnimButton size="lg" onClick={() => onSelect(cuento)}>
              {cuento.title}
            </AnimButton>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { SelectCuentoScene };