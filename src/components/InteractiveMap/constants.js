import mapaUrl from "../../assets/mapa3d/regiones_colombia.glb";
import amazioniaUrl from "../../assets/mapa3d/amazionia_diffuse.png";
import andinaUrl from "../../assets/mapa3d/andina_diffuse.png";
import caribeUrl from "../../assets/mapa3d/caribe_diffuse.png";
import mapaColombiaUrl from "../../assets/mapa3d/map_colombia_diffuse.png";
import mapaMundoUrl from "../../assets/mapa3d/map_mundo_diffuse.png";
import orinquiaUrl from "../../assets/mapa3d/orinquia_diffuse.png";
import pacificoUrl from "../../assets/mapa3d/pacifico_diffuse.png";

export const MAPA_URL = mapaUrl;

// Nodos del GLB que hacen de suelo. No son interactivos.
export const BASE_MESHES = [
  { name: "BaseCol", texture: mapaColombiaUrl },
  { name: "Base_map", texture: mapaMundoUrl },
];

// El GLB trae las 5 regiones geográficas de Colombia y las 5 texturas
// coinciden una a una. `key` es la clave real dentro de
// cuento.frases[].content: si es null la región se dibuja y se resalta pero
// todavía no tiene frases, así que el clic no navega. Si `regions` no trae
// la key, la región cae en ese mismo caso.
export const REGION_MESHES = [
  { name: "Caribe", key: "costeño", label: "Costeño", texture: caribeUrl },
  { name: "Andes", key: "paisa", label: "Paisa", texture: andinaUrl },
  { name: "Orinoquia", key: "rolo", label: "Rolo", texture: orinquiaUrl },
  { name: "Amazonia", key: null, label: "Amazonia", texture: amazioniaUrl },
  { name: "Pacifico", key: null, label: "Pacífico", texture: pacificoUrl },
];

export const SOON_LABEL = "Próximamente";

// Bases y regiones en un solo arreglo. El orden es el que se le pasa a
// useTexture, y cada malla se queda con la textura de su índice.
export const MESHES = [...BASE_MESHES, ...REGION_MESHES];

// La cámara mira un punto del suelo (x, groundY, z) desde
// (x, groundY + d·sin(pitch), z + d·cos(pitch)), con el pitch siempre fijo.
// Así el arrastre mueve el punto en XZ puro y la rueda acerca la cámara a
// lo largo del eje de vista sin cambiar el ángulo.
export const CAMERA = {
  fov: 45,
  near: 0.1,
  far: 80,
  pitch: Math.PI / 4,
  startDistance: 9,
  minDistance: 4.5,
  maxDistance: 16,
};

// Límites del punto que la cámara mira. Salen de los bounds del GLB
// (x -2.30..2.03, z -3.11..3.02) con margen, para poder llevar cualquier
// borde de una región al centro de la pantalla.
export const WORLD = {
  center: { x: -0.14, z: -0.05 },
  minX: -3.4,
  maxX: 3.1,
  minZ: -4.2,
  maxZ: 4.0,
  groundY: 0,
  // Bounds reales del modelo, para calcular a qué distancia entra entero.
  model: { minX: -2.3, maxX: 2.03, minZ: -3.11, maxZ: 3.02 },
  // Holgura al encuadrar: sin ella los bordes de Colombia quedan pegados al
  // borde de la pantalla.
  fitMargin: 1.12,
};

export const CONTROLS = {
  // Suavizado exponencial: 1 - e^(-damping·dt)
  focusDamping: 12,
  zoomDamping: 10,
  keyboardSpeed: 3,
  zoomStep: 1.12,
  // Más que esto entre pointerdown y pointerup fue arrastre, no clic.
  dragThresholdPx: 6,
  maxDelta: 0.1,
};

// Un material por región, con material nuevo: el GLB viene con colores
// planos y emissiveFactor igual al baseColorFactor, lo que lavaría la
// textura si se reutilizara el del modelo.
export const TEXTURE = {
  // Las UVs del GLB están en convención glTF (origen arriba-izquierda, V
  // hacia abajo), pero TextureLoader carga con flipY = true.
  flipY: false,
  roughness: 0.85,
  metalness: 0,
  anisotropy: 4,
};

export const ANIM = {
  // Oscilación en reposo: seno con desfase por región.
  idleAmplitude: 0.035,
  idleSpeed: 1.6,
  phaseStep: 1.3,
  // Alturas que persigue el resorte. La región ya elegida se queda arriba.
  hoverLift: 0.1,
  activeLift: 0.16,
  // Resorte de 2º orden: y'' = -k·(y - target) - c·y'
  stiffness: 120,
  damping: 9,
  jumpImpulse: 3.2,
  // Sub-paso fijo: con dt de un frame perdido el integrador explícito
  // diverge y la región salta a otro lado.
  step: 1 / 120,
  // Cuánto se deja ver el rebote antes de voltear la página. Con k 120 y c 9
  // la envolvente es e^(-4.5t): a los 550 ms ya bajó al 8% de la altura.
  settleMs: 550,
};

// Luz direccional con sombra. El objetivo por defecto es el origen, y el
// modelo está centrado casi en él, así que no hace falta moverlo.
export const LIGHT = {
  position: [4, 8, 5],
  intensity: 2.2,
  ambientIntensity: 0.9,
  shadow: {
    mapSize: 1024,
    left: -4,
    right: 4,
    top: 5,
    bottom: -5,
    near: 0.5,
    far: 30,
    // Sin esto las caras del slab se sombrean solas (shadow acne).
    bias: -0.0005,
  },
};
