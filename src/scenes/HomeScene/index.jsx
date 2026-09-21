import { Button } from "../../components/AnimButton";

function HomeScene({ onStart }) {
  return (
    <section className="d-flex flex-column align-items-center justify-content-center gap-4 min-vh-100 p-3 text-center">
      <h1>Proyecto de Integración Multimedia</h1>
      <Button size="lg" onClick={onStart}>
        Seleccionar cuento
      </Button>
    </section>
  );
}

export { HomeScene };