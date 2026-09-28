import { Suspense, lazy } from "react";

import { REGIONS } from "../../db";

import { BtnSimple } from "../../components/BtnSimple";

import BackSign from "../../assets/icons/back_sign";

import "./MapScene.css";

// three + R3F + drei pesan más que toda la app junta. Cargarlos solo cuando ya
// hay cuento elegido los saca del bundle inicial: el lazy se resuelve recién
// en el primer render con cuento, que es justo cuando se voltea a esta página.
// La escena y el PageFlip no cambian: el <div class="book-page"> lo sigue
// montando PageFlipBook y lo único que se reemplaza es su contenido.
const InteractiveMap = lazy(() =>
  import("../../components/InteractiveMap").then((module) => ({
    default: module.InteractiveMap,
  }))
);

// A pantalla completa: el mapa es el fondo y el título va encima. Sin scroll,
// porque el lienzo ya se encarga del movimiento.
function MapScene({ cuento, region, onSelectRegion, onBack }) {
  if (!cuento) return null;

  return (
    <section className="map-scene">
      <Suspense fallback={<p className="map-scene__loading">Cargando mapa…</p>}>
        <InteractiveMap
          regions={REGIONS}
          activeRegion={region}
          onSelectRegion={onSelectRegion}
        />
      </Suspense>

      <header className="map-scene__bar">
        <BtnSimple icon={BackSign} onClick={onBack} />
        <h1 className="map-scene__title">{cuento.title}</h1>
      </header>
    </section>
  );
}

export { MapScene };
