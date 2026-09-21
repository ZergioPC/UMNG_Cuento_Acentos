import { BtnAnim } from "../../components/BtnAnim";

function HomeScene({ onStart }) {
  return (
    <section className="d-flex flex-column align-items-center justify-content-center gap-4 min-vh-100 p-3 text-center">
      <h1>Proyecto de Integración Multimedia</h1>
      <BtnAnim 
        size="lg" 
        padding={10}
        borderRadius={10}
        onClick={onStart}
      >
        Seleccionar cuento
      </BtnAnim>
    </section>
  );
}

export { HomeScene };