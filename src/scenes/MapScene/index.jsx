import { useState } from "react";
import { REGIONS } from "../../db";
import { InteractiveMap } from "../../components/InteractiveMap";
import { CuentoPanel } from "../../components/CuentoPanel";

function MapScene({ cuento, onBack }) {
  const [region, setRegion] = useState(null);

  return (
    <section className="d-flex flex-column align-items-center gap-4 min-vh-100 p-3">
      <button className="btn btn-light align-self-start" onClick={onBack}>
        Volver
      </button>

      <h1 className="text-center m-0">{cuento.title}</h1>

      <InteractiveMap
        regions={REGIONS}
        activeRegion={region}
        onSelectRegion={setRegion}
      />

      {region === null && (
        <p className="text-center m-0">
          Toca una región del mapa para leer el cuento o compararlo.
        </p>
      )}

      {region !== null && (
        <CuentoPanel
          cuento={cuento}
          region={region}
          onClose={() => setRegion(null)}
        />
      )}
    </section>
  );
}

export { MapScene };