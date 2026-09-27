import { useMapMaterial } from "./useMapMaterial";

// El suelo y la mesa no se animan ni reciben puntero: solo necesitan su
// textura y recibir la sombra que proyectan las regiones.
function BaseMesh({ object, texture }) {
  useMapMaterial(object, texture, { cast: false });

  if (object === null) return null;

  return <primitive object={object} />;
}

export { BaseMesh };
