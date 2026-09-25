import { REGIONS } from "../../db";
import { InteractiveMap } from "../../components/InteractiveMap";

function MapScene({ cuento, region, onSelectRegion, onBack }) {
  return (
    <section className="d-flex flex-column align-items-center gap-4 min-vh-100 p-3">
      <button className="btn btn-light align-self-start" onClick={onBack}>
        Volver
      </button>

      <h1 className="text-center m-0">{cuento.title}</h1>

      <InteractiveMap
        regions={REGIONS}
        activeRegion={region}
        onSelectRegion={onSelectRegion}
      />

      <p className="text-center m-0">
        Toca una región del mapa para leer el cuento o compararlo.
      </p>
    </section>
  );
}

export { MapScene };
