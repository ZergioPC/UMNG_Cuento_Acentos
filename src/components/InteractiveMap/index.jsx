import { REGION_LABELS } from "../../db";

// Placeholder del mapa. Pendiente decidir 2D/3D:
// solo se reemplaza el interior manteniendo onSelectRegion(region).
function InteractiveMap({ regions, activeRegion, onSelectRegion }) {
  return (
    <div className="d-flex flex-wrap justify-content-center gap-3">
      {regions.map((region) => (
        <button
          key={region}
          type="button"
          className={`btn btn-lg ${
            activeRegion === region ? "btn-light" : "btn-outline-light"
          }`}
          onClick={() => onSelectRegion(region)}
        >
          {REGION_LABELS[region]}
        </button>
      ))}
    </div>
  );
}

export { InteractiveMap };