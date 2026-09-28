import { BtnAnim } from "../../components/BtnAnim";
import { Papel } from "../../utils/fondo/Papel";

// La sección solo ancla el fondo; el scroll va en el div de contenido, para
// que el papel no se vaya con el texto al desplazar.
function HomeScene({ onStart }) {
  return (
    <section className="position-relative h-100 overflow-hidden">
      <Papel />

      <div className="d-flex flex-column align-items-center justify-content-center gap-4 h-100 overflow-auto p-3 text-center">
        <h1>Proyecto de Integración Multimedia</h1>
        <BtnAnim 
          size="lg" 
          padding={10}
          borderRadius={10}
          onClick={onStart}
        >
          Seleccionar cuento
        </BtnAnim>
      </div>
    </section>
  );
}

export { HomeScene };