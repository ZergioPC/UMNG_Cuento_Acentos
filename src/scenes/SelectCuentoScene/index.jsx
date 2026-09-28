import { Fragment } from "react";

import { CUENTOS } from "../../db";

import { BtnAnim } from "../../components/BtnAnim";
import { BtnSimple } from "../../components/BtnSimple";

import BackSign from "../../assets/icons/back_sign";

import "./SelectCuentoScene.css";

// Un color por cuento: los lomos alternados son lo que hace que el estante se
// lea como una estantería y no como una lista de botones. Todos dejan el texto
// blanco por encima de 5:1 (WCAG AA para texto normal).
const COLORES_LOMO = [
  "#9c1c2e",
  "#1f6f9c",
  "#2e7d5b",
  "#a8542a",
  "#7b3fa0",
  "#7a5c12",
  "#0d6b7a",
];

// La pared hace de fondo y ancla la caja; el armario se estira con flex: 1 y
// su interior es lo único que se desplaza, para que el marco de madera y el
// título no se muevan con la lista.
function SelectCuentoScene({ onSelect, onBack }) {
  return (
    <section className="estanteria">
      <header className="estanteria__encabezado">
        <BtnSimple icon={BackSign} onClick={onBack} size={26} />
        <h1 className="estanteria__titulo">Elige un cuento</h1>
      </header>

      <div className="estanteria__armario">
        <ul className="estanteria__libros">
          {CUENTOS.map((cuento, index) => (
            <Fragment key={cuento.id}>
              <li className="estanteria__libro">
                <BtnAnim
                  color={COLORES_LOMO[index % COLORES_LOMO.length]}
                  size={90}
                  padding={12}
                  shadowSize={6}
                  borderRadius={8}
                  onClick={() => onSelect(cuento)}
                >
                  {cuento.title}
                </BtnAnim>
              </li>

              {/* La balda va entre libros, no como borde del libro. Es un <li>
                  y no un <div> porque un div dentro del <ul> no es HTML válido. */}
              {index < CUENTOS.length - 1 && (
                <li className="estanteria__balda" aria-hidden="true" />
              )}
            </Fragment>
          ))}
        </ul>
      </div>

      <div className="estanteria__suelo" aria-hidden="true" />
    </section>
  );
}

export { SelectCuentoScene };
