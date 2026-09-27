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
// `outline` es el color del borde toon que se dibuja sobre la cara superior de
// la región. Va en un solo valor compartido porque es el mismo para las cinco:
// duplicado cinco veces se desincroniza en cuanto alguien cambia uno.
const OUTLINE_COLOR = "#000000";

export const REGION_MESHES = [
  {
    name: "Caribe",
    key: "costeño",
    label: "Costeño",
    texture: caribeUrl,
    outline: OUTLINE_COLOR,
  },
  {
    name: "Andes",
    key: "paisa",
    label: "Paisa",
    texture: andinaUrl,
    outline: OUTLINE_COLOR,
  },
  {
    name: "Orinoquia",
    key: "rolo",
    label: "Rolo",
    texture: orinquiaUrl,
    outline: OUTLINE_COLOR,
  },
  {
    name: "Amazonia",
    key: null,
    label: "Amazonia",
    texture: amazioniaUrl,
    outline: OUTLINE_COLOR,
  },
  {
    name: "Pacifico",
    key: null,
    label: "Pacífico",
    texture: pacificoUrl,
    outline: OUTLINE_COLOR,
  },
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

// Mar de fondo: un plano grande puesto por debajo de la base del GLB, con un
// shader cartoon (ver waterShader.js). El mapa queda como una isla y el agua
// se ve alrededor.
export const WATER = {
  // A 16 de distancia y con el pitch a 45° el encuadre más ancho resuelve
  // ~6 unidades, así que 80 deja mar hasta el borde en cualquier posición de
  // la cámara.
  size: 80,
  // Separación entre el fondo de la base y la superficie del mar. El nivel se
  // saca del Box3 real de las bases, así que esto es holgura y no altura
  // absoluta: el agua nunca queda por encima del slab.
  drop: 0.12,
  // Semiejes de la isla para deformar la costa. Un 62% del ancho/entrada del
  // modelo: lo justo para que la orilla y los rompientes caigan en el agua y
  // no sobre el mapa. Colombia es larga en Z, así que la costa no puede ser
  // un círculo: se usa una elipse.
  island: {
    x: (WORLD.model.maxX - WORLD.model.minX) * 0.62,
    z: (WORLD.model.maxZ - WORLD.model.minZ) * 0.62,
  },
  // Rango de "cercanía a la costa" en unidades de elipse (1 = borde de la
  // isla): dentro de `near` el agua es clara, fuera de `far` es profunda.
  shore: { near: 0.75, far: 1.35 },
  deep: "#14609f",
  shallow: "#78d9e6",
  foam: "#f4fdff",
  // Franjas de color del oleaje. 4 escalones se lee como pintado a brocha
  // gorda; más y se ve degradado, menos y se ve escalonado.
  bands: 4,
  // Cuánta espuma (crestas + rompientes) y cuánto brillan los destellos.
  foamStrength: 0.55,
  sparkle: 0.35,
  // Multiplicador del tiempo del shader.
  speed: 1,
};

// Nubes: pocos quads con shader propio (ver cloudShader.js) que se arrastran
// lentamente detrás de la isla. No hay cielo ni horizonte: el fondo sigue
// siendo el mar, así que las nubes son un detalle de horizonte y no una capa
// de cielo que tape el cuento.
//
// La banda arranca justo detrás del fin del modelo (con 0.04 de holgura, que es
// lo que mide la línea toon de la región) para que la nube más cercana nunca se
// monte sobre el mapa.
const CLOUDS_EDGE = WORLD.model.minZ - 1;
const CLOUDS_DEPTH = 40;

export const CLOUDS = {
  // Cuántas hay. Pocas a propósito: con muchas se vuelven ruido de fondo y
  // roban atención al mapa. Con 15 el fondo se ve poblado en el encuadre de
  // escritorio sin que se lean como manchas.
  count: 15,
  // Altura sobre el suelo. Con el pitch a 45° y fov 45, un punto de altura y a
  // distancia horizontal hd de la cámara está en cuadro si
  //   (H - y) * 0.41 <= hd <= (H - y) * 2.41   (H = distancia·sin45)
  // porque el eje de vista entra a hd = H (mira un punto del suelo), así que
  // lo que está más lejos que el centro sale en la parte alta de la pantalla.
  // Medido con height y area como están: en el encuadre de un celular (d 12.7)
  // las nubes entran entre el 77% y el 98% de la altura, con el borde lejano
  // del mapa en el 70%; en uno de escritorio (d 5.9) el mapa llena el cuadro y
  // solo se asoman las del fondo; con la cámara en minDistance (4.5) no se ve
  // ninguna. Ojo: el rectángulo de deriva se centra en CLOUDS_EDGE, así que
  // también cubre CLOUDS_DEPTH/2 unidades hacia la cámara; esas no se ven
  // porque quedan fuera del cono (hd < H) y por eso el area no necesita
  // sesgarse hacia atrás, pero si se sube `depth` hay que revisar el
  // solapamiento con la isla.
  height: { min: 0.9, max: 2.6 },
  size: { min: 1.4, max: 3.2 },
  // Ancho entre alto del quad. Las nubes se dibujan acostadas, como en un
  // dibujo a mano.
  aspect: 2.4,
  // Deriva en X dentro de un rectángulo de CLOUDS_EDGE (detrás del modelo) de
  // CLOUDS_DEPTH de profundidad, centrado en esa misma arista.
  area: { x: 9, z: CLOUDS_DEPTH, centerZ: CLOUDS_EDGE },
  // Unidades de mundo por segundo.
  speed: { min: 0.12, max: 0.3 },
  // Tapa clara y base gris: dos tonos, como las bandas del oleaje.
  top: "#ffffff",
  bottom: "#cfe3f2",
  // Escalones del degradado de la nube. Pocos: más y se ve un degradado.
  bands: 3,
  opacity: 0.9,
  // Semilla del PRNG que reparte las posiciones: fija para que las nubes
  // salgan siempre en el mismo sitio al remontar el canvas (PageFlip los
  // desmonta y los vuelve a montar al volver a la página del mapa). El valor
  // está elegido a ojo: con esta semilla las nubes del fondo entran en cuadro
  // en el encuadre de celular y quedan repartidas en X (si se cambia, hay que
  // volver a mirar cuántas se ven, ver la fórmula de arriba).
  seed: 1029,
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
  // La misma textura también como emissiveMap, y es el canal que dibuja la
  // región: el material se ilumina por dentro con su propio color, sin
  // cuantizar la luz (no hay parche toon, ver más abajo). Con intensidad 1 el
  // emissiveMap entrega el color de la textura tal cual; la luz directa solo
  // suma encima, así que las zonas claras pueden pasar de 1 y las comprime el
  // tone mapping ACES de R3F.
  emissive: { color: "#ffffff", intensity: 1 },
};

// Borde toon de cada región: una línea alrededor de la cara superior (ver
// regionOutline.js y RegionMesh.jsx). El color no vive aquí sino en
// REGION_MESHES[].outline, que hoy es el mismo negro para las cinco.
export const OUTLINE = {
  // Grosor en píxeles (Line2 los cuenta en pantalla, no en unidades de mundo).
  lineWidth: 1.5,
  // Ángulo de dihedral mínimo (grados) para que una arista sea borde. Con 25
  // solo entran los quiebres de verdad: la costa, el bisel y las paredes del
  // slab. Las aristas coplanares del interior de la cara se descartan solas.
  threshold: 25,
  // Franja de altura, como fracción del grosor del slab, que se dibuja: solo
  // la cara superior. La costa del GLB cae en el 96.8% del grosor, así que
  // 0.15 deja margen sin empezar a comerse el bisel inferior.
  band: 0.15,
  // Suavizado Douglas-Peucker del borde, como fracción de la diagonal de la
  // región. La costa trae ~470 aristas de ~1 px con un serrucho del orden del
  // grosor del trazo, y a esa escala el borde se lee como turbulencia en vez
  // de como línea (se reportó como "ruido" del color del borde). Esto se queda
  // con los accidentes grandes de la costa. Poner 0 deja el borde crudo.
  smooth: 0.003,
  opacity: 0.5,
};

export const ANIM = {
  // Oscilación en reposo: seno con desfase por región.
  idleAmplitude: 0.01,
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
